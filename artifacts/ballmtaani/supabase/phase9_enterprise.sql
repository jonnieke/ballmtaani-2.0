-- BallMtaani Edge Phase 9 Database Schema Migration
-- Mobile Apps, African League Expansion, Multi-Tenant White-Label & Enterprise Operations

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. MOBILE DEVICES & APP VERSIONS
CREATE TABLE IF NOT EXISTS public.mobile_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- 'android', 'ios'
    device_token TEXT NOT NULL,
    app_version TEXT NOT NULL,
    os_version TEXT,
    device_model TEXT,
    push_enabled BOOLEAN DEFAULT TRUE,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mobile_app_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL, -- 'android', 'ios'
    latest_version TEXT NOT NULL,
    minimum_supported_version TEXT NOT NULL,
    force_update_enabled BOOLEAN DEFAULT FALSE,
    release_notes TEXT,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AFRICAN COMPETITION ONBOARDING & READINESS
CREATE TABLE IF NOT EXISTS public.competition_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_name TEXT NOT NULL,
    provider_id INTEGER NOT NULL,
    country TEXT NOT NULL,
    region TEXT DEFAULT 'East Africa',
    status TEXT DEFAULT 'discovered', -- 'discovered', 'data_review', 'historical_import', 'model_training', 'backtesting', 'supported', 'paused'
    readiness_score INTEGER DEFAULT 0, -- 0-100 readiness score
    seasons_available INTEGER DEFAULT 0,
    data_quality_avg NUMERIC DEFAULT 0,
    model_brier_score NUMERIC,
    model_accepted BOOLEAN DEFAULT FALSE,
    activated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REGIONAL SUPPORTED MARKETS
CREATE TABLE IF NOT EXISTS public.supported_markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code TEXT UNIQUE NOT NULL, -- 'KE', 'TZ', 'UG', 'ZA', 'NG', 'EG', 'MA'
    country_name TEXT NOT NULL,
    currency TEXT NOT NULL, -- 'KES', 'TZS', 'UGX', 'ZAR', 'NGN', 'EGP', 'MAD'
    default_timezone TEXT NOT NULL DEFAULT 'Africa/Nairobi',
    payment_providers JSONB DEFAULT '["mpesa"]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MULTI-TENANT WHITE-LABEL SCHEMAS
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL, -- e.g. 'standard_media'
    name TEXT NOT NULL,
    tenant_type TEXT DEFAULT 'publisher', -- 'publisher', 'broadcaster', 'club', 'enterprise'
    status TEXT DEFAULT 'active', -- 'onboarding', 'active', 'suspended'
    primary_domain TEXT NOT NULL,
    branding_config JSONB DEFAULT '{"primaryColor": "#00A859", "logoUrl": ""}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'analyst', -- 'owner', 'admin', 'editor', 'analyst', 'developer', 'finance', 'viewer'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.tenant_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    domain TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'verified', -- 'pending', 'verified', 'revoked'
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tenant_feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, feature_key)
);

CREATE TABLE IF NOT EXISTS public.tenant_match_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    fixture_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ENTERPRISE AUDIT & CONTRACTS
CREATE TABLE IF NOT EXISTS public.enterprise_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.enterprise_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    contract_reference TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active', -- 'draft', 'active', 'expired'
    monthly_fee NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SERVICE LEVEL AGREEMENTS & MEASUREMENTS
CREATE TABLE IF NOT EXISTS public.service_level_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    availability_target NUMERIC DEFAULT 99.9, -- 99.9% uptime target
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sla_measurements_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    availability_percentage NUMERIC DEFAULT 100.0,
    incident_count INTEGER DEFAULT 0,
    target_met BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PLATFORM INCIDENTS & MODEL RELEASES
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    severity TEXT DEFAULT 'low', -- 'low', 'warning', 'high', 'critical'
    status TEXT DEFAULT 'resolved', -- 'investigating', 'identified', 'monitoring', 'resolved'
    summary TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.model_release_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_version TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- 'candidate', 'active', 'rolled_back'
    brier_score NUMERIC NOT NULL,
    released_by TEXT DEFAULT 'system',
    released_at TIMESTAMPTZ DEFAULT NOW()
);
