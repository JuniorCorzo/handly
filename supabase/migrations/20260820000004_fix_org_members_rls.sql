-- =========================================================================
-- Migración: Corrección Integral de Políticas RLS para org_members y organizations
-- =========================================================================

-- 1. Función para obtener las organizaciones del usuario (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_auth_user_org_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT org_id FROM public.org_members WHERE auth_user_id = (SELECT auth.uid());
$$;

-- 2. Función para verificar si el usuario es admin (SECURITY DEFINER)
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
      AND auth_user_id = (SELECT auth.uid()) 
      AND role = 'admin'
  );
$$;

-- 3. Asegurar columna created_at en org_members
ALTER TABLE public.org_members 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 4. Políticas en org_members
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_read_own_membership" ON public.org_members;
DROP POLICY IF EXISTS "allow_read_org_members" ON public.org_members;
DROP POLICY IF EXISTS "allow_admins_manage_org_members" ON public.org_members;
DROP POLICY IF EXISTS "allow_insert_own_membership" ON public.org_members;

-- Lectura: El usuario puede ver su propia membresía o las de su misma organización
CREATE POLICY "allow_read_org_members" ON public.org_members
  FOR SELECT TO authenticated
  USING (
    auth_user_id = (SELECT auth.uid()) 
    OR org_id IN (SELECT public.get_auth_user_org_ids())
  );

-- Inserción / Gestión: Admins de la organización o el propio usuario
CREATE POLICY "allow_manage_org_members" ON public.org_members
  FOR ALL TO authenticated
  USING (
    auth_user_id = (SELECT auth.uid())
    OR public.is_org_admin(org_id)
  )
  WITH CHECK (
    auth_user_id = (SELECT auth.uid())
    OR public.is_org_admin(org_id)
  );

-- 4. Políticas en organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_members_read_org" ON public.organizations;
CREATE POLICY "allow_members_read_org" ON public.organizations
  FOR SELECT TO authenticated
  USING (
    id IN (SELECT public.get_auth_user_org_ids())
  );
