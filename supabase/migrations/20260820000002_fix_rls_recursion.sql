-- =========================================================================
-- Migración Incremental: Corrección de Políticas RLS y Funciones SECURITY DEFINER
-- =========================================================================

-- 1. Asegurar tipo de enum org_member_role
DO $$ BEGIN
  CREATE TYPE public.org_member_role AS ENUM ('admin', 'operator');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Funciones SECURITY DEFINER para romper recursión RLS
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

-- 3. Reemplazar políticas de org_members (sin recursión)
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_read_own_membership" ON public.org_members;
DROP POLICY IF EXISTS "allow_read_org_members" ON public.org_members;
CREATE POLICY "allow_read_org_members" ON public.org_members
  FOR SELECT TO authenticated
  USING (
    auth_user_id = (SELECT auth.uid()) 
    OR org_id IN (SELECT public.get_auth_user_org_ids())
  );

DROP POLICY IF EXISTS "allow_admins_manage_org_members" ON public.org_members;
CREATE POLICY "allow_admins_manage_org_members" ON public.org_members
  FOR ALL TO authenticated
  USING (public.is_org_admin(org_id))
  WITH CHECK (public.is_org_admin(org_id));

-- 4. Reemplazar políticas de organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_members_read_org" ON public.organizations;
CREATE POLICY "allow_members_read_org" ON public.organizations
  FOR SELECT TO authenticated
  USING (id IN (SELECT public.get_auth_user_org_ids()));

-- 5. Reemplazar políticas de organization_invitations
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
