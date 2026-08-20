-- =========================================================================
-- Migración 20260820175800: Políticas de lectura para organizations y función atómica de creación
-- =========================================================================

-- 1. Permitir lectura de organizaciones a usuarios autenticados y anónimos (públicas para catálogo y para el RETURNING de INSERT)
DROP POLICY IF EXISTS "allow_members_read_org" ON public.organizations;
CREATE POLICY "allow_members_read_org" ON public.organizations
  FOR SELECT TO anon, authenticated
  USING (true);

-- 2. Asegurar la política de creación para usuarios autenticados
DROP POLICY IF EXISTS "allow_create_organization" ON public.organizations;
CREATE POLICY "allow_create_organization" ON public.organizations
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 3. Crear función atómica SECURITY DEFINER (crea la organización y asigna al creador como admin en una sola transacción)
CREATE OR REPLACE FUNCTION public.create_organization_with_admin(
  p_name VARCHAR(255),
  p_phone VARCHAR(50),
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
