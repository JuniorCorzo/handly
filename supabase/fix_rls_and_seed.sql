-- =========================================================================
-- 1. Habilitar RLS y crear políticas de lectura/escritura seguras (Sin Recursión)
-- =========================================================================

-- Funciones Auxiliares SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_auth_user_org_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT org_id FROM public.org_members WHERE auth_user_id = (SELECT auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members 
    WHERE org_id = p_org_id 
      AND auth_user_id = (SELECT auth.uid()) 
      AND role = 'admin'
  );
$$;

-- Tabla: org_members
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_read_own_membership" ON public.org_members;
DROP POLICY IF EXISTS "allow_read_org_members" ON public.org_members;
CREATE POLICY "allow_read_org_members" ON public.org_members
  FOR SELECT TO authenticated
  USING (
    auth_user_id = (SELECT auth.uid()) 
    OR org_id IN (SELECT public.get_auth_user_org_ids())
  );

DROP POLICY IF EXISTS "allow_insert_own_membership" ON public.org_members;
CREATE POLICY "allow_insert_own_membership" ON public.org_members
  FOR INSERT TO authenticated
  WITH CHECK (auth_user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "allow_admins_manage_org_members" ON public.org_members;
CREATE POLICY "allow_admins_manage_org_members" ON public.org_members
  FOR ALL TO authenticated
  USING (public.is_org_admin(org_id))
  WITH CHECK (public.is_org_admin(org_id));

-- Tabla: organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_members_read_org" ON public.organizations;
CREATE POLICY "allow_members_read_org" ON public.organizations
  FOR SELECT TO authenticated
  USING (id IN (SELECT public.get_auth_user_org_ids()));

-- Tabla: campaign
ALTER TABLE public.campaign ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_campaign" ON public.campaign;
CREATE POLICY "allow_public_read_campaign" ON public.campaign
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "allow_members_read_campaign" ON public.campaign;
CREATE POLICY "allow_members_read_campaign" ON public.campaign
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT public.get_auth_user_org_ids()));

DROP POLICY IF EXISTS "allow_members_insert_campaign" ON public.campaign;
CREATE POLICY "allow_members_insert_campaign" ON public.campaign
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT public.get_auth_user_org_ids()));

-- Tabla: collection_points
ALTER TABLE public.collection_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_collection_points" ON public.collection_points;
CREATE POLICY "allow_public_read_collection_points" ON public.collection_points
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "allow_members_read_collection_points" ON public.collection_points;
CREATE POLICY "allow_members_read_collection_points" ON public.collection_points
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT public.get_auth_user_org_ids()));

DROP POLICY IF EXISTS "allow_members_insert_collection_points" ON public.collection_points;
CREATE POLICY "allow_members_insert_collection_points" ON public.collection_points
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT public.get_auth_user_org_ids()));

-- Tabla: need_items
ALTER TABLE public.need_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_need_items" ON public.need_items;
CREATE POLICY "allow_public_read_need_items" ON public.need_items
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "allow_members_read_need_items" ON public.need_items;
CREATE POLICY "allow_members_read_need_items" ON public.need_items
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "allow_members_insert_need_items" ON public.need_items;
CREATE POLICY "allow_members_insert_need_items" ON public.need_items
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "allow_members_update_need_items" ON public.need_items;
CREATE POLICY "allow_members_update_need_items" ON public.need_items
  FOR UPDATE TO authenticated
  USING (true);

-- Tabla: need_items_collection_points
ALTER TABLE public.need_items_collection_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_need_items_cp" ON public.need_items_collection_points;
CREATE POLICY "allow_public_read_need_items_cp" ON public.need_items_collection_points
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "allow_all_need_items_cp" ON public.need_items_collection_points;
CREATE POLICY "allow_all_need_items_cp" ON public.need_items_collection_points
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Tabla: organization_invitations
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_admins_manage_invitations" ON public.organization_invitations;
CREATE POLICY "allow_admins_manage_invitations" ON public.organization_invitations
  FOR ALL TO authenticated
  USING (public.is_org_admin(org_id))
  WITH CHECK (public.is_org_admin(org_id));

DROP POLICY IF EXISTS "allow_users_read_own_invitations" ON public.organization_invitations;
CREATE POLICY "allow_users_read_own_invitations" ON public.organization_invitations
  FOR SELECT TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid())));

-- =========================================================================
-- 2. Asegurar que tu usuario tenga Organización, Campañas y Centros de Acopio
-- =========================================================================

DO $$
DECLARE
  v_user_id UUID := '9f0595fd-e977-4555-9a49-a11013c4ce68';
  v_org_id UUID;
  v_campaign_1_id UUID := gen_random_uuid();
  v_cp_1_id UUID := gen_random_uuid();
  v_cp_2_id UUID := gen_random_uuid();
BEGIN
  -- Verificar si el usuario ya tiene organización
  SELECT org_id INTO v_org_id 
  FROM public.org_members 
  WHERE auth_user_id = v_user_id 
  LIMIT 1;

  -- Si no tiene, crear una organización y vincularlo como admin
  IF v_org_id IS NULL THEN
    INSERT INTO public.organizations (id, name, email, phone, zone_code)
    VALUES (
      gen_random_uuid(), 
      'Cruz Roja Argentina - Filial Central', 
      'contacto@cruzroja.org.ar', 
      '+541149520000', 
      'CABA'
    )
    RETURNING id INTO v_org_id;

    INSERT INTO public.org_members (auth_user_id, org_id, role)
    VALUES (v_user_id, v_org_id, 'admin');
  END IF;

  -- Crear campañas de prueba si no existen
  IF NOT EXISTS (SELECT 1 FROM public.campaign WHERE organization_id = v_org_id) THEN
    INSERT INTO public.campaign (id, name, organization_id)
    VALUES 
      (v_campaign_1_id, 'Emergencia Inundaciones 2026', v_org_id),
      (gen_random_uuid(), 'Campaña Refugio Invernal', v_org_id);
  END IF;

  -- Crear centros de acopio si no existen
  IF NOT EXISTS (SELECT 1 FROM public.collection_points WHERE organization_id = v_org_id) THEN
    INSERT INTO public.collection_points (id, location_adress, organization_id, open_time, close_time)
    VALUES 
      (v_cp_1_id, 'Av. Santa Fe 3200, Palermo, CABA', v_org_id, '08:00:00', '20:00:00'),
      (v_cp_2_id, 'Calle 50 N° 750, La Plata, Buenos Aires', v_org_id, '09:00:00', '18:00:00');
  END IF;

  RAISE NOTICE 'Organización %, Campañas y Centros de Acopio listos para el usuario %', v_org_id, v_user_id;
END $$;
