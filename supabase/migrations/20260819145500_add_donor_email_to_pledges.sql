-- =========================================================================
-- Migración: Incorporar donor_email para envío de notificaciones al donante
-- =========================================================================

-- 1. Agregar columna donor_email y hacer donor_phone opcional en pledges
ALTER TABLE public.pledges 
  ADD COLUMN IF NOT EXISTS donor_email VARCHAR(255);

ALTER TABLE public.pledges 
  ALTER COLUMN donor_phone DROP NOT NULL;

-- 2. Actualizar la función transaccional create_pledge_tx para registrar donor_email
CREATE OR REPLACE FUNCTION public.create_pledge_tx(
  p_need_item_id UUID,
  p_donor_name VARCHAR(255),
  p_donor_email VARCHAR(255),
  p_quantity INT4
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
BEGIN
  -- 1. Bloqueo de fila sobre need_items para evitar sobre-asignación concurrente
  SELECT id, target_quantity, unit, urgency, status
  INTO v_item
  FROM public.need_items
  WHERE id = p_need_item_id
  FOR UPDATE;

  IF NOT FOUND OR v_item.status != 'active' THEN
    RAISE EXCEPTION 'ITEM_NOT_AVAILABLE' USING ERRCODE = 'P0001';
  END IF;

  -- 2. Calcular cupo actualmente comprometido (recibido o pendiente no vencido)
  SELECT COALESCE(SUM(quantity), 0)
  INTO v_committed
  FROM public.pledges
  WHERE need_item_id = p_need_item_id
    AND (status = 'received' OR (status = 'pending' AND expires_at > NOW()));

  v_available := v_item.target_quantity - v_committed;

  IF p_quantity <= 0 OR p_quantity > v_available THEN
    RAISE EXCEPTION 'INSUFFICIENT_QUOTA_AVAILABLE' USING ERRCODE = 'P0002';
  END IF;

  -- 3. Calcular TTL dinámico según la urgencia del ítem
  IF v_item.urgency = 'critical_4h' THEN
    v_ttl := INTERVAL '4 hours';
  ELSIF v_item.urgency = 'urgent_12h' THEN
    v_ttl := INTERVAL '12 hours';
  ELSE
    v_ttl := INTERVAL '24 hours';
  END IF;

  v_expires_at := NOW() + v_ttl;

  -- 4. Generación garantizada de código único SOS-XXXX con reintento ante colisión
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
        quantity,
        status,
        expires_at,
        created_at
      )
      VALUES (
        gen_random_uuid(),
        p_need_item_id,
        v_short_code,
        p_donor_name,
        p_donor_email,
        p_quantity,
        'pending'::pledge_status,
        v_expires_at,
        NOW()
      )
      RETURNING id INTO v_pledge_id;

      EXIT; -- Inserción exitosa
    EXCEPTION WHEN unique_violation THEN
      IF v_tries >= 10 THEN
        RAISE EXCEPTION 'COULD_NOT_GENERATE_UNIQUE_CODE';
      END IF;
    END;
  END LOOP;

  -- 5. Retornar payload estructurado para confirmación inmediata y despacho de emails
  RETURN jsonb_build_object(
    'id', v_pledge_id,
    'short_code', v_short_code,
    'need_item_id', p_need_item_id,
    'donor_name', p_donor_name,
    'donor_email', p_donor_email,
    'quantity', p_quantity,
    'status', 'pending',
    'expires_at', v_expires_at,
    'available_quota_remaining', v_available - p_quantity
  );
END;
$$;

-- Permisos de ejecución
GRANT EXECUTE ON FUNCTION public.create_pledge_tx(UUID, VARCHAR, VARCHAR, INT4) TO anon, authenticated;
