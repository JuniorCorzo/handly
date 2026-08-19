-- =========================================================================
-- Migración Inicial: Esquema de Tablas, Tipos e Índices para Handly
-- =========================================================================

-- 1. Tipos personalizados / Enums
DO $$ BEGIN
  CREATE TYPE public.urgency_level AS ENUM ('critical_4h', 'urgent_12h', 'standard_24h');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.need_status AS ENUM ('active', 'fulfilled', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.pledge_status AS ENUM ('pending', 'received', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Tabla de Organizaciones
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    zone_code VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabla de Miembros de Organización
CREATE TABLE IF NOT EXISTS public.org_members (
    auth_user_id UUID NOT NULL,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (auth_user_id, org_id)
);

-- 4. Tabla de Campañas
CREATE TABLE IF NOT EXISTS public.campaign (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tabla de Ítems Necesitados
CREATE TABLE IF NOT EXISTS public.need_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaign(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    target_quantity INT4 NOT NULL CHECK (target_quantity > 0),
    unit VARCHAR(50) NOT NULL,
    urgency public.urgency_level NOT NULL DEFAULT 'standard_24h',
    status public.need_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Tabla de Puntos de Acopio / Recolección
CREATE TABLE IF NOT EXISTS public.collection_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    location_adress TEXT NOT NULL,
    latitude FLOAT8,
    longitude FLOAT8,
    open_time TIME,
    close_time TIME,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Tabla Pivote (Muchos a Muchos entre need_items y collection_points)
CREATE TABLE IF NOT EXISTS public.need_items_collection_points (
    need_item_id UUID NOT NULL REFERENCES public.need_items(id) ON DELETE CASCADE,
    collection_point_id UUID NOT NULL REFERENCES public.collection_points(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (need_item_id, collection_point_id)
);

-- 8. Tabla de Compromisos / Promesas de Donación (Pledges)
CREATE TABLE IF NOT EXISTS public.pledges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    need_item_id UUID NOT NULL REFERENCES public.need_items(id) ON DELETE CASCADE,
    short_code VARCHAR(50) UNIQUE NOT NULL,
    donor_name VARCHAR(255) NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    donor_phone VARCHAR(50),
    quantity INT4 NOT NULL CHECK (quantity > 0),
    status public.pledge_status NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_need_items_campaign ON public.need_items(campaign_id);
CREATE INDEX IF NOT EXISTS idx_need_items_status ON public.need_items(status, urgency);
CREATE INDEX IF NOT EXISTS idx_pledges_need_item ON public.pledges(need_item_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_pledges_short_code ON public.pledges(short_code);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.org_members(auth_user_id);
