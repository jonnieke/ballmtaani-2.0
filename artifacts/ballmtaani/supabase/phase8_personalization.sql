-- BallMtaani Edge Phase 8 Database Schema Migration
-- Personalization, Kiswahili/Sheng Intelligence, Referrals & B2B Widgets

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER EDGE PREFERENCES
CREATE TABLE IF NOT EXISTS public.user_edge_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_language TEXT NOT NULL DEFAULT 'en', -- 'en', 'sw', 'sh'
    preferred_analysis_style TEXT DEFAULT 'standard', -- 'concise', 'standard', 'detailed'
    preferred_markets JSONB DEFAULT '["1X2", "OU25", "BTTS"]'::jsonb,
    preferred_competitions JSONB DEFAULT '[]'::jsonb,
    muted_competitions JSONB DEFAULT '[]'::jsonb,
    muted_teams JSONB DEFAULT '[]'::jsonb,
    recommendation_enabled BOOLEAN DEFAULT TRUE,
    personalization_level TEXT DEFAULT 'standard', -- 'minimal', 'standard', 'highly_personalized'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER CONTENT INTERACTIONS
CREATE TABLE IF NOT EXISTS public.user_content_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    event_type TEXT NOT NULL, -- 'viewed', 'saved', 'followed', 'muted', 'changed_language'
    fixture_id UUID REFERENCES public.fixtures(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
    occurred_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RECOMMENDATION RUNS & ITEMS
CREATE TABLE IF NOT EXISTS public.recommendation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_version TEXT DEFAULT 'v1',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    candidate_count INTEGER DEFAULT 0,
    returned_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recommendation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_run_id UUID NOT NULL REFERENCES public.recommendation_runs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fixture_id UUID NOT NULL REFERENCES public.fixtures(id) ON DELETE CASCADE,
    score NUMERIC NOT NULL,
    rank INTEGER NOT NULL,
    recommendation_reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MULTILINGUAL PREDICTION EXPLANATIONS
CREATE TABLE IF NOT EXISTS public.prediction_explanations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id UUID NOT NULL REFERENCES public.predictions(id) ON DELETE CASCADE,
    prediction_revision INTEGER DEFAULT 1,
    language TEXT NOT NULL, -- 'en', 'sw', 'sh'
    summary TEXT NOT NULL,
    detailed_explanation TEXT NOT NULL,
    confidence_explanation TEXT,
    risk_explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(prediction_id, prediction_revision, language)
);

-- 5. REFERRAL PROGRAMS & CODES
CREATE TABLE IF NOT EXISTS public.referral_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- 'draft', 'active', 'paused'
    reward_type TEXT DEFAULT 'access_extension', -- 'access_extension', 'fixed_partner_commission'
    referrer_reward_hours INTEGER DEFAULT 24, -- 24 bonus hours per qualified referral
    qualification_delay_hours INTEGER DEFAULT 24,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    partner_id UUID,
    code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referral_attributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
    referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'visited', -- 'visited', 'registered', 'payment_pending', 'qualified', 'rejected'
    attributed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referral_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_attribution_id UUID NOT NULL REFERENCES public.referral_attributions(id) ON DELETE CASCADE,
    recipient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_type TEXT DEFAULT 'access_extension',
    reward_value NUMERIC DEFAULT 24, -- 24 bonus hours
    status TEXT DEFAULT 'granted', -- 'eligible', 'granted', 'reversed'
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referral_fraud_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_attribution_id UUID NOT NULL REFERENCES public.referral_attributions(id) ON DELETE CASCADE,
    flag_type TEXT NOT NULL, -- 'self_referral', 'duplicate_payment_identity', 'suspicious_volume'
    severity TEXT DEFAULT 'high',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. B2B PARTNERS & CAMPAIGNS
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    partner_type TEXT DEFAULT 'publisher', -- 'creator', 'publisher', 'media_house'
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. B2B API CLIENTS & KEYS
CREATE TABLE IF NOT EXISTS public.api_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    allowed_origins JSONB DEFAULT '["*"]'::jsonb,
    rate_limit_per_minute INTEGER DEFAULT 60,
    daily_request_limit INTEGER DEFAULT 10000,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_client_id UUID NOT NULL REFERENCES public.api_clients(id) ON DELETE CASCADE,
    key_prefix TEXT NOT NULL,
    key_hash TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active',
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.api_usage_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_client_id UUID NOT NULL REFERENCES public.api_clients(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    request_count INTEGER DEFAULT 0,
    successful_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(api_client_id, date)
);
