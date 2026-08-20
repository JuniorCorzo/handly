-- =========================================================================
-- Migración: Corrección Definitiva RLS para Invitaciones a Organizaciones
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

-- 2. Habilitar RLS en organization_invitations
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas previas
DROP POLICY IF EXISTS "allow_admins_manage_invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "allow_users_read_own_invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "allow_members_read_invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "allow_manage_invitations" ON public.organization_invitations;

-- Política 1: Lectura de invitaciones
-- Permite ver invitaciones a los miembros de la organización o al destinatario por su email del JWT
CREATE POLICY "allow_members_read_invitations" ON public.organization_invitations
  FOR SELECT TO authenticated
  USING (
    org_id IN (SELECT public.get_auth_user_org_ids())
    OR email = (SELECT auth.jwt() ->> 'email')
  );

-- Política 2: Creación, actualización y cancelación de invitaciones por miembros de la org
CREATE POLICY "allow_manage_invitations" ON public.organization_invitations
  FOR ALL TO authenticated
  USING (
    org_id IN (SELECT public.get_auth_user_org_ids())
  )
  WITH CHECK (
    org_id IN (SELECT public.get_auth_user_org_ids())
  );
