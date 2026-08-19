-- =========================================================================
-- Políticas de Seguridad de Fila (Row Level Security - RLS)
-- =========================================================================

-- Tabla: org_members
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_read_own_membership" ON public.org_members;
CREATE POLICY "allow_read_own_membership" ON public.org_members
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "allow_insert_own_membership" ON public.org_members;
CREATE POLICY "allow_insert_own_membership" ON public.org_members
  FOR INSERT TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Tabla: organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_members_read_org" ON public.organizations;
CREATE POLICY "allow_members_read_org" ON public.organizations
  FOR SELECT TO authenticated
  USING (id IN (SELECT org_id FROM public.org_members WHERE auth_user_id = auth.uid()));

-- Tabla: campaign
ALTER TABLE public.campaign ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_campaign" ON public.campaign;
CREATE POLICY "allow_public_read_campaign" ON public.campaign
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "allow_members_insert_campaign" ON public.campaign;
CREATE POLICY "allow_members_insert_campaign" ON public.campaign
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT org_id FROM public.org_members WHERE auth_user_id = auth.uid()));

-- Tabla: collection_points
ALTER TABLE public.collection_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_collection_points" ON public.collection_points;
CREATE POLICY "allow_public_read_collection_points" ON public.collection_points
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "allow_members_insert_collection_points" ON public.collection_points;
CREATE POLICY "allow_members_insert_collection_points" ON public.collection_points
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT org_id FROM public.org_members WHERE auth_user_id = auth.uid()));

-- Tabla: need_items
ALTER TABLE public.need_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_need_items" ON public.need_items;
CREATE POLICY "allow_public_read_need_items" ON public.need_items
  FOR SELECT TO anon, authenticated
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

-- Tabla: pledges
ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_members_read_pledges" ON public.pledges;
CREATE POLICY "allow_members_read_pledges" ON public.pledges
  FOR SELECT TO authenticated
  USING (true);
