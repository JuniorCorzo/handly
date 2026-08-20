-- =========================================================================
-- Migración 20260820183500: RPC para obtener perfiles completos de miembros
-- =========================================================================

CREATE OR REPLACE FUNCTION public.get_org_member_profiles(p_org_id UUID)
RETURNS TABLE (
  auth_user_id UUID,
  email VARCHAR,
  full_name TEXT,
  phone TEXT,
  job_title TEXT,
  role public.org_member_role
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT 
    m.auth_user_id,
    u.email::VARCHAR,
    (u.raw_user_meta_data ->> 'full_name')::TEXT AS full_name,
    (u.raw_user_meta_data ->> 'phone')::TEXT AS phone,
    (u.raw_user_meta_data ->> 'job_title')::TEXT AS job_title,
    m.role
  FROM public.org_members m
  LEFT JOIN auth.users u ON u.id = m.auth_user_id
  WHERE m.org_id = p_org_id
    AND (
      EXISTS (
        SELECT 1 FROM public.org_members 
        WHERE org_id = p_org_id AND auth_user_id = auth.uid()
      )
    );
$$;
