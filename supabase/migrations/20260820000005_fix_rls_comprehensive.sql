-- =========================================================================
-- Migración 20260820000005: Corrección Integral Definitiva de Políticas RLS
-- =========================================================================

-- 1. Función para obtener las organizaciones del usuario autenticado (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_auth_user_org_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT org_id FROM public.org_members WHERE auth_user_id = auth.uid();
$$;

-- 2. Función para chequear si el usuario autenticado es admin
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

-- 3. Tabla: org_members
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_read_own_membership" ON public.org_members;
DROP POLICY IF EXISTS "allow_read_org_members" ON public.org_members;
DROP POLICY IF EXISTS "allow_insert_own_membership" ON public.org_members;
DROP POLICY IF EXISTS "allow_admins_manage_org_members" ON public.org_members;
DROP POLICY IF EXISTS "allow_manage_org_members" ON public.org_members;

-- Lectura: Leer su propia membresía o las membresías de las organizaciones a las que pertenece
CREATE POLICY "allow_read_org_members" ON public.org_members
  FOR SELECT TO authenticated
  USING (
    auth_user_id = auth.uid() 
    OR org_id IN (SELECT public.get_auth_user_org_ids())
  );

-- Inserción / Creación: El usuario puede auto-vincularse o los admins pueden agregar miembros
CREATE POLICY "allow_insert_org_members" ON public.org_members
  FOR INSERT TO authenticated
  WITH CHECK (
    auth_user_id = auth.uid()
    OR org_id IN (SELECT public.get_auth_user_org_ids())
  );

-- Modificación / Eliminación: Admins o el propio usuario saliendo
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

-- 4. Tabla: organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_members_read_org" ON public.organizations;
CREATE POLICY "allow_members_read_org" ON public.organizations
  FOR SELECT TO authenticated
  USING (
    id IN (SELECT public.get_auth_user_org_ids())
    OR email = (SELECT auth.jwt() ->> 'email')
  );

-- 5. Tabla: campaign
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

-- 6. Tabla: collection_points
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

-- 7. Tabla: organization_invitations
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
