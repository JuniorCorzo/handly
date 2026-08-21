-- =========================================================================
-- Migración Definitiva: Unificación de create_pledge_tx y Permisos RLS
-- =========================================================================

-- 1. Eliminar firmas previas para evitar conflictos de overload en PostgREST
DROP FUNCTION IF EXISTS public.create_pledge_tx(UUID, VARCHAR, VARCHAR, INT4);
DROP FUNCTION IF EXISTS public.create_pledge_tx(UUID, VARCHAR, VARCHAR, INT4, public.pledge_status, VARCHAR);
DROP FUNCTION IF EXISTS public.create_pledge_tx(UUID, VARCHAR, VARCHAR, INT4, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS public.receive_pledge_tx(UUID);

-- 2. Función Unificada: create_pledge_tx (Soporta 'pending' online y 'received' en puerta)
CREATE OR REPLACE FUNCTION public.create_pledge_tx(
  p_need_item_id UUID,
  p_donor_name VARCHAR(255),
  p_donor_email VARCHAR(255),
  p_quantity INT4,
  p_status VARCHAR(50) DEFAULT 'pending',
  p_donor_phone VARCHAR(50) DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
  v_committed INT4;
  v_available INT4;
  v_ttl INTERVAL;
  v_expires_at TIMESTAMPTZ;
  v_short_code VARCHAR(50);
  v_chars TEXT := '23456789ABCDEFGHJKMNPQRSTVWXYZ';
  v_pledge_id UUID;
  v_tries INT := 0;
  v_donor_name VARCHAR(255);
  v_donor_email VARCHAR(255);
  v_status public.pledge_status;
BEGIN
  -- Convertir status seguro
  v_status := COALESCE(NULLIF(TRIM(p_status), ''), 'pending')::public.pledge_status;

  -- 1. Bloqueo de fila para evitar sobre-asignación concurrente
  SELECT id, item_name, unit, target_quantity, urgency, status
  INTO v_item
  FROM public.need_items
  WHERE id = p_need_item_id
  FOR UPDATE;

  IF NOT FOUND OR v_item.status != 'active' THEN
    RAISE EXCEPTION 'ITEM_NOT_AVAILABLE' USING ERRCODE = 'P0001';
  END IF;

  -- 2. Validar cantidad
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'INVALID_QUANTITY' USING ERRCODE = 'P0002';
  END IF;

  -- 3. Calcular cupo actualmente comprometido (recibido o pendiente no vencido)
  SELECT COALESCE(SUM(quantity), 0)
  INTO v_committed
  FROM public.pledges
  WHERE need_item_id = p_need_item_id
    AND (status = 'received' OR (status = 'pending' AND expires_at > NOW()));

  v_available := v_item.target_quantity - v_committed;

  -- Para promesas online pendientes, validar no exceder el cupo
  IF v_status = 'pending' AND p_quantity > v_available THEN
    RAISE EXCEPTION 'INSUFFICIENT_QUOTA_AVAILABLE' USING ERRCODE = 'P0002';
  END IF;

  -- 4. Calcular expiración
  IF v_status = 'received' THEN
    v_expires_at := NOW();
  ELSE
    IF v_item.urgency = 'critical_4h' THEN
      v_ttl := INTERVAL '4 hours';
    ELSIF v_item.urgency = 'urgent_12h' THEN
      v_ttl := INTERVAL '12 hours';
    ELSE
      v_ttl := INTERVAL '24 hours';
    END IF;
    v_expires_at := NOW() + v_ttl;
  END IF;

  v_donor_name := COALESCE(NULLIF(TRIM(p_donor_name), ''), 'Donante Anónimo');
  v_donor_email := COALESCE(NULLIF(TRIM(p_donor_email), ''), 'direct-intake@acopio.local');

  -- 5. Generación garantizada de código único SOS-XXXX
  LOOP
    v_tries := v_tries + 1;
    v_short_code := 'SOS-' || 
      substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1) ||
      substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1) ||
      substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1) ||
      substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);

    BEGIN
      INSERT INTO public.pledges (
        id,
        need_item_id,
        short_code,
        donor_name,
        donor_email,
        donor_phone,
        quantity,
        status,
        expires_at,
        created_at
      )
      VALUES (
        gen_random_uuid(),
        p_need_item_id,
        v_short_code,
        v_donor_name,
        v_donor_email,
        p_donor_phone,
        p_quantity,
        v_status,
        v_expires_at,
        NOW()
      )
      RETURNING id INTO v_pledge_id;

      EXIT; -- Éxito
    EXCEPTION WHEN unique_violation THEN
      IF v_tries >= 10 THEN
        RAISE EXCEPTION 'COULD_NOT_GENERATE_UNIQUE_CODE';
      END IF;
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'id', v_pledge_id,
    'short_code', v_short_code,
    'need_item_id', p_need_item_id,
    'item_name', v_item.item_name,
    'unit', v_item.unit,
    'donor_name', v_donor_name,
    'donor_email', v_donor_email,
    'donor_phone', p_donor_phone,
    'quantity', p_quantity,
    'status', v_status::text,
    'expires_at', v_expires_at,
    'available_quota_remaining', GREATEST(0, v_available - p_quantity)
  );
END;
$$;

-- 3. Función Transaccional para confirmar recepción física de promesa existente
CREATE OR REPLACE FUNCTION public.receive_pledge_tx(
  p_pledge_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pledge RECORD;
  v_item RECORD;
BEGIN
  -- 1. Bloquear y verificar compromiso
  SELECT p.id, p.need_item_id, p.short_code, p.donor_name, p.donor_email, p.quantity, p.status, p.expires_at
  INTO v_pledge
  FROM public.pledges p
  WHERE p.id = p_pledge_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PLEDGE_NOT_FOUND' USING ERRCODE = 'P0001';
  END IF;

  IF v_pledge.status = 'received' THEN
    RAISE EXCEPTION 'PLEDGE_ALREADY_RECEIVED' USING ERRCODE = 'P0003';
  END IF;

  -- 2. Actualizar estado a received
  UPDATE public.pledges
  SET status = 'received'::public.pledge_status
  WHERE id = p_pledge_id;

  -- 3. Obtener datos del ítem
  SELECT item_name, unit
  INTO v_item
  FROM public.need_items
  WHERE id = v_pledge.need_item_id;

  RETURN jsonb_build_object(
    'id', v_pledge.id,
    'short_code', v_pledge.short_code,
    'need_item_id', v_pledge.need_item_id,
    'item_name', v_item.item_name,
    'unit', v_item.unit,
    'donor_name', v_pledge.donor_name,
    'donor_email', v_pledge.donor_email,
    'quantity', v_pledge.quantity,
    'status', 'received',
    'updated_at', NOW()
  );
END;
$$;

-- 4. Otorgar permisos de ejecución de funciones
GRANT EXECUTE ON FUNCTION public.create_pledge_tx(UUID, VARCHAR, VARCHAR, INT4, VARCHAR, VARCHAR) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.receive_pledge_tx(UUID) TO anon, authenticated, service_role;

-- 5. Configurar RLS sobre tabla pledges
ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_pledges" ON public.pledges;
DROP POLICY IF EXISTS "allow_members_read_pledges" ON public.pledges;
DROP POLICY IF EXISTS "allow_org_members_update_pledges" ON public.pledges;
DROP POLICY IF EXISTS "allow_org_members_insert_pledges" ON public.pledges;
DROP POLICY IF EXISTS "allow_all_for_authenticated_pledges" ON public.pledges;

-- Lectura pública para catálogo en vivo y operadores
CREATE POLICY "allow_public_read_pledges" ON public.pledges
  FOR SELECT TO anon, authenticated
  USING (true);

-- Permitir a usuarios autenticados miembros u operadores actualizar pledges
CREATE POLICY "allow_org_members_update_pledges" ON public.pledges
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Permitir a usuarios autenticados insertar pledges directos
CREATE POLICY "allow_org_members_insert_pledges" ON public.pledges
  FOR INSERT TO authenticated
  WITH CHECK (true);
