-- =========================================================================
-- Public Campaign View — acceso anónimo de solo lectura para la vista
-- pública de campaña (app/campaign/[id]).
--
-- Alcance:
--   1. Habilita SELECT para el rol `anon` sobre las tablas que alimentan la
--      vista pública: campaign, organizations, need_items,
--      need_items_collection_points, collection_points.
--   2. Exposición de columnas: el donante invitado ve la dirección exacta
--      del punto de acopio (para elegir el más cercano), sus horarios y los
--      medios de contacto de la organización (email, teléfono). Se mantienen
--      privadas las coordenadas lat/lng (no hay mapa en el MVP).
--
-- Importante: no se crea una tabla `pledges` (fuera de alcance) y no se
-- asumen columnas inexistentes en el schema real (ej. campaign.status).
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. RLS y políticas de lectura para el rol anónimo (guest donor)
-- -------------------------------------------------------------------------
-- La vista pública es de acceso público: `anon` solo puede leer. Los roles
-- autenticados conservan sus políticas existentes (ver docs/fix_rls_and_seed.sql).

-- campaign — anon puede leer (id, name, organization_id).
ALTER TABLE public.campaign ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_public_read_campaign" ON public.campaign;
CREATE POLICY "allow_public_read_campaign" ON public.campaign
  FOR SELECT TO anon USING (true);

-- need_items — anon puede leer; la vista filtra status = 'active' en la query.
ALTER TABLE public.need_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_public_read_need_items" ON public.need_items;
CREATE POLICY "allow_public_read_need_items" ON public.need_items
  FOR SELECT TO anon USING (true);

-- need_items_collection_points — anon puede leer los vínculos.
ALTER TABLE public.need_items_collection_points ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_public_read_need_items_cp" ON public.need_items_collection_points;
CREATE POLICY "allow_public_read_need_items_cp" ON public.need_items_collection_points
  FOR SELECT TO anon USING (true);

-- collection_points — anon ve dirección exacta + horarios (para elegir el
-- punto más cercano). Coordenadas lat/lng se mantienen privadas (sin mapa en MVP).
ALTER TABLE public.collection_points ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_public_read_collection_points" ON public.collection_points;
CREATE POLICY "allow_public_read_collection_points" ON public.collection_points
  FOR SELECT TO anon USING (true);

REVOKE SELECT ON public.collection_points FROM anon;
GRANT SELECT (id, organization_id, location_adress, open_time, close_time)
  ON public.collection_points TO anon;

-- organizations — identidad pública + medios de contacto (id, nombre, zona,
-- email, teléfono) para que el donante pueda contactar a la organización.
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_public_read_organizations" ON public.organizations;
CREATE POLICY "allow_public_read_organizations" ON public.organizations
  FOR SELECT TO anon USING (true);

REVOKE SELECT ON public.organizations FROM anon;
GRANT SELECT (id, name, zone_code, email, phone)
  ON public.organizations TO anon;
