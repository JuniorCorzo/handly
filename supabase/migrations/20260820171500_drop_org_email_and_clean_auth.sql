-- =========================================================================
-- Migración 20260820171500: Eliminar campo email de organizations y RLS canónico
-- =========================================================================

-- 1. Preservar datos existentes: Auto-vincular como admin a los usuarios cuyos correos
-- coincidían con el correo de la organización antes de remover la columna.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'organizations' 
      AND column_name = 'email'
  ) THEN
    INSERT INTO public.org_members (auth_user_id, org_id, role)
    SELECT u.id, o.id, 'admin'::public.org_member_role
    FROM auth.users u
    JOIN public.organizations o ON LOWER(TRIM(u.email)) = LOWER(TRIM(o.email))
    ON CONFLICT (auth_user_id, org_id) DO NOTHING;
  END IF;
END $$;

-- 2. Eliminar las políticas previas que dependen de la columna 'email' en organizations
DROP POLICY IF EXISTS "allow_members_read_org" ON public.organizations;
DROP POLICY IF EXISTS "allow_create_organization" ON public.organizations;
DROP POLICY IF EXISTS "allow_admins_modify_org" ON public.organizations;

-- 3. Eliminar la columna email de organizations de forma segura
ALTER TABLE public.organizations DROP COLUMN IF EXISTS email CASCADE;

-- 4. Funciones Auxiliares SECURITY DEFINER para evitar recursión en RLS
CREATE OR REPLACE FUNCTION public.get_auth_user_org_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT org_id FROM public.org_members WHERE auth_user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members 
    WHERE org_id = p_org_id 
      AND auth_user_id = auth.uid() 
      AND role = 'admin'
  );
$$;

-- Función atómica para crear organización y asignar admin
CREATE OR REPLACE FUNCTION public.create_organization_with_admin(
  p_name VARCHAR(255),
  p_phone VARCHAR(50) DEFAULT NULL,
  p_zone_code VARCHAR(50) DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  INSERT INTO public.organizations (name, phone, zone_code)
  VALUES (p_name, p_phone, p_zone_code)
  RETURNING id INTO v_org_id;

  INSERT INTO public.org_members (auth_user_id, org_id, role)
  VALUES (auth.uid(), v_org_id, 'admin');

  RETURN v_org_id;
END;
$$;

-- 5. Políticas RLS para organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_members_read_org" ON public.organizations;
CREATE POLICY "allow_members_read_org" ON public.organizations
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "allow_create_organization" ON public.organizations;
CREATE POLICY "allow_create_organization" ON public.organizations
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "allow_admins_modify_org" ON public.organizations;
CREATE POLICY "allow_admins_modify_org" ON public.organizations
  FOR ALL TO authenticated
  USING (id IN (SELECT public.get_auth_user_org_ids()) AND public.is_org_admin(id))
  WITH CHECK (id IN (SELECT public.get_auth_user_org_ids()) AND public.is_org_admin(id));

-- 6. Políticas RLS para org_members
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_read_own_membership" ON public.org_members;
DROP POLICY IF EXISTS "allow_read_org_members" ON public.org_members;
DROP POLICY IF EXISTS "allow_insert_own_membership" ON public.org_members;
DROP POLICY IF EXISTS "allow_admins_manage_org_members" ON public.org_members;
DROP POLICY IF EXISTS "allow_manage_org_members" ON public.org_members;
DROP POLICY IF EXISTS "allow_insert_org_members" ON public.org_members;
DROP POLICY IF EXISTS "allow_modify_org_members" ON public.org_members;

CREATE POLICY "allow_read_org_members" ON public.org_members
  FOR SELECT TO authenticated
  USING (
    auth_user_id = auth.uid() 
    OR org_id IN (SELECT public.get_auth_user_org_ids())
  );

CREATE POLICY "allow_insert_org_members" ON public.org_members
  FOR INSERT TO authenticated
  WITH CHECK (
    auth_user_id = auth.uid()
    OR public.is_org_admin(org_id)
  );

CREATE POLICY "allow_modify_org_members" ON public.org_members
  FOR ALL TO authenticated
  USING (
    auth_user_id = auth.uid()
    OR public.is_org_admin(org_id)
  )
  WITH CHECK (
    auth_user_id = auth.uid()
    OR public.is_org_admin(org_id)
  );

-- 7. Políticas RLS para campaign
ALTER TABLE public.campaign ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_campaign" ON public.campaign;
CREATE POLICY "allow_public_read_campaign" ON public.campaign
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "allow_members_read_campaign" ON public.campaign;
DROP POLICY IF EXISTS "allow_members_insert_campaign" ON public.campaign;
CREATE POLICY "allow_members_insert_campaign" ON public.campaign
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT public.get_auth_user_org_ids()));

-- 8. Políticas RLS para collection_points
ALTER TABLE public.collection_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_collection_points" ON public.collection_points;
CREATE POLICY "allow_public_read_collection_points" ON public.collection_points
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "allow_members_read_collection_points" ON public.collection_points;
DROP POLICY IF EXISTS "allow_members_insert_collection_points" ON public.collection_points;
CREATE POLICY "allow_members_insert_collection_points" ON public.collection_points
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT public.get_auth_user_org_ids()));

-- 9. Políticas RLS para need_items
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

-- 10. Políticas RLS para need_items_collection_points
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

-- 11. Políticas RLS para organization_invitations
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_members_read_invitations" ON public.organization_invitations;
CREATE POLICY "allow_members_read_invitations" ON public.organization_invitations
  FOR SELECT TO authenticated
  USING (
    org_id IN (SELECT public.get_auth_user_org_ids())
    OR email = (SELECT auth.jwt() ->> 'email')
  );

DROP POLICY IF EXISTS "allow_manage_invitations" ON public.organization_invitations;
CREATE POLICY "allow_manage_invitations" ON public.organization_invitations
  FOR ALL TO authenticated
  USING (
    org_id IN (SELECT public.get_auth_user_org_ids())
    OR email = (SELECT auth.jwt() ->> 'email')
  )
  WITH CHECK (
    org_id IN (SELECT public.get_auth_user_org_ids())
    OR email = (SELECT auth.jwt() ->> 'email')
  );
