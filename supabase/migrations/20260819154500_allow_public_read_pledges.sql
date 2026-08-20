-- =========================================================================
-- Migración: Permitir lectura pública de compromisos para catálogo en vivo
-- =========================================================================

DROP POLICY IF EXISTS "allow_public_read_pledges" ON public.pledges;
CREATE POLICY "allow_public_read_pledges" ON public.pledges
  FOR SELECT TO anon, authenticated
  USING (true);
