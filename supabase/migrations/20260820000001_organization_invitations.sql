-- =========================================================================
-- Migración: Gestión de Invitaciones a Organizaciones con RLS No Recursivo
-- =========================================================================

-- 1. Tipo Enum para roles de miembros de organización
DO $$ BEGIN
  CREATE TYPE public.org_member_role AS ENUM ('admin', 'operator');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Tabla de Invitaciones
CREATE TABLE IF NOT EXISTS public.organization_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role public.org_member_role NOT NULL DEFAULT 'operator',
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_org_invitations_lookup ON public.organization_invitations(email, status);
CREATE INDEX IF NOT EXISTS idx_org_invitations_org ON public.organization_invitations(org_id);

-- 4. Funciones Auxiliares SECURITY DEFINER para evitar recursión en RLS
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

-- 5. Políticas de Seguridad RLS en organization_invitations
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

-- 6. Actualizar Políticas de Seguridad RLS en org_members (sin recursión)
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

-- 7. Actualizar Políticas de Seguridad RLS en organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_members_read_org" ON public.organizations;
CREATE POLICY "allow_members_read_org" ON public.organizations
  FOR SELECT TO authenticated
  USING (id IN (SELECT public.get_auth_user_org_ids()));
