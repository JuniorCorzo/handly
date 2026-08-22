-- =========================================================================
-- 1. Eliminar columna email de organizations y definir RLS sin recursión
-- =========================================================================

ALTER TABLE public.organizations DROP COLUMN IF EXISTS email;

-- Funciones Auxiliares SECURITY DEFINER
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

-- Tabla: organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_members_read_org" ON public.organizations;
CREATE POLICY "allow_members_read_org" ON public.organizations
  FOR SELECT TO authenticated
  USING (id IN (SELECT public.get_auth_user_org_ids()));

DROP POLICY IF EXISTS "allow_create_organization" ON public.organizations;
CREATE POLICY "allow_create_organization" ON public.organizations
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "allow_admins_modify_org" ON public.organizations;
CREATE POLICY "allow_admins_modify_org" ON public.organizations
  FOR ALL TO authenticated
  USING (id IN (SELECT public.get_auth_user_org_ids()) AND public.is_org_admin(id))
  WITH CHECK (id IN (SELECT public.get_auth_user_org_ids()) AND public.is_org_admin(id));

-- Tabla: org_members
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

-- Tabla: campaign
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

-- Tabla: collection_points
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

-- Tabla: pledges
ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_pledges" ON public.pledges;
DROP POLICY IF EXISTS "allow_members_read_pledges" ON public.pledges;
CREATE POLICY "allow_public_read_pledges" ON public.pledges
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "allow_org_members_update_pledges" ON public.pledges;
CREATE POLICY "allow_org_members_update_pledges" ON public.pledges
  FOR UPDATE TO authenticated
  USING (
    need_item_id IN (
      SELECT ni.id FROM public.need_items ni
      JOIN public.campaign c ON c.id = ni.campaign_id
      WHERE c.organization_id IN (SELECT public.get_auth_user_org_ids())
    )
  )
  WITH CHECK (
    need_item_id IN (
      SELECT ni.id FROM public.need_items ni
      JOIN public.campaign c ON c.id = ni.campaign_id
      WHERE c.organization_id IN (SELECT public.get_auth_user_org_ids())
    )
  );

DROP POLICY IF EXISTS "allow_org_members_insert_pledges" ON public.pledges;
CREATE POLICY "allow_org_members_insert_pledges" ON public.pledges
  FOR INSERT TO authenticated
  WITH CHECK (
    need_item_id IN (
      SELECT ni.id FROM public.need_items ni
      JOIN public.campaign c ON c.id = ni.campaign_id
      WHERE c.organization_id IN (SELECT public.get_auth_user_org_ids())
    )
  );

