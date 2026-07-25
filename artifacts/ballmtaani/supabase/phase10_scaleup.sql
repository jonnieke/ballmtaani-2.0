-- BallMtaani Edge Phase 10 Database Schema Migration
-- Advanced Ensemble Modelling, Automated Drift Monitoring, Telecom Distribution & Commercial Scale-Up

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. FEATURE STORE & IMMUTABLE DATASETS
CREATE TABLE IF NOT EXISTS public.feature_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_key TEXT UNIQUE NOT NULL, -- e.g. 'elo_diff_v1', 'xg_form_5m_v1'
    name TEXT NOT NULL,
    feature_group TEXT NOT NULL, -- 'team_strength', 'recent_performance', 'schedule', 'squad', 'competition', 'market'
    data_type TEXT NOT NULL DEFAULT 'numeric',
    version INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.feature_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_definition_id UUID NOT NULL REFERENCES public.feature_definitions(id) ON DELETE CASCADE,
    fixture_id TEXT NOT NULL,
    value NUMERIC NOT NULL,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.training_datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_tag TEXT UNIQUE NOT NULL, -- e.g. 'dataset-epl-2024-2026-v1'
    fixture_count INTEGER NOT NULL,
    data_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MODEL EXPERIMENTS & ENSEMBLE DEFINITIONS
CREATE TABLE IF NOT EXISTS public.model_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_key TEXT UNIQUE NOT NULL,
    model_family TEXT NOT NULL, -- 'dixon_coles', 'lightgbm', 'elo', 'logistic_regression'
    target_market TEXT NOT NULL, -- '1X2', 'OU25', 'BTTS'
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.model_experiment_trials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID NOT NULL REFERENCES public.model_experiments(id) ON DELETE CASCADE,
    trial_number INTEGER NOT NULL,
    brier_score NUMERIC NOT NULL,
    log_loss NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ensemble_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ensemble_key TEXT UNIQUE NOT NULL, -- e.g. 'epl_1x2_ensemble_v1'
    competition_id TEXT NOT NULL,
    market TEXT NOT NULL,
    weights JSONB NOT NULL, -- e.g. {"dixon_coles": 0.35, "lightgbm": 0.35, "elo": 0.20, "logistic": 0.10}
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CHAMPION / CHALLENGER & SHADOW PREDICTIONS
CREATE TABLE IF NOT EXISTS public.shadow_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fixture_id TEXT NOT NULL,
    champion_version TEXT NOT NULL,
    challenger_version TEXT NOT NULL,
    champion_home_prob NUMERIC NOT NULL,
    challenger_home_prob NUMERIC NOT NULL,
    settled_actual_outcome TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AUTOMATED DRIFT MONITORING
CREATE TABLE IF NOT EXISTS public.model_monitoring_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_version TEXT NOT NULL,
    sample_count INTEGER NOT NULL,
    brier_score_rolling NUMERIC NOT NULL,
    ece_rolling NUMERIC NOT NULL,
    status TEXT DEFAULT 'normal', -- 'normal', 'drift_warning', 'rollback_triggered'
    run_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.model_drift_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_version TEXT NOT NULL,
    drift_type TEXT NOT NULL, -- 'brier_drift', 'calibration_drift', 'data_quality_degradation'
    severity TEXT DEFAULT 'warning', -- 'warning', 'critical'
    details JSONB DEFAULT '{}'::jsonb,
    detected_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TELECOM DISTRIBUTION & SPONSORED ACCESS
CREATE TABLE IF NOT EXISTS public.telecom_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- e.g. 'Safaricom Telecom'
    partner_key TEXT UNIQUE NOT NULL,
    country_code TEXT NOT NULL DEFAULT 'KE',
    revenue_share_rate NUMERIC DEFAULT 0.30, -- 30% revenue share
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.partner_subscriber_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telecom_partner_id UUID NOT NULL REFERENCES public.telecom_partners(id) ON DELETE CASCADE,
    subscriber_hash TEXT UNIQUE NOT NULL, -- SHA-256 hashed MSISDN
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sponsored_access_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telecom_partner_id UUID NOT NULL REFERENCES public.telecom_partners(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration_hours INTEGER DEFAULT 24,
    budget_limit NUMERIC DEFAULT 10000,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sponsored_entitlement_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES public.sponsored_access_programs(id) ON DELETE CASCADE,
    subscriber_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.partner_billing_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telecom_partner_id UUID NOT NULL REFERENCES public.telecom_partners(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'charge_successful', 'sponsored_grant', 'refund'
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'KES',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.partner_settlement_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telecom_partner_id UUID NOT NULL REFERENCES public.telecom_partners(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    gross_revenue NUMERIC NOT NULL,
    platform_net NUMERIC NOT NULL,
    partner_share NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COMMERCIAL COST RECORDS & PRICING EXPERIMENTS
CREATE TABLE IF NOT EXISTS public.commercial_cost_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cost_category TEXT NOT NULL, -- 'football_data', 'cloud_compute', 'notifications', 'payment_fees'
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    period_month DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.commercial_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_key TEXT UNIQUE NOT NULL, -- e.g. 'weekly_pass_pricing_v1'
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- 'draft', 'active', 'completed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.commercial_experiment_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID NOT NULL REFERENCES public.commercial_experiments(id) ON DELETE CASCADE,
    variant_key TEXT NOT NULL, -- 'control_kes99', 'variant_kes129'
    price_amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.commercial_experiment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID NOT NULL REFERENCES public.commercial_experiments(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.commercial_experiment_variants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(experiment_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.commercial_experiment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID NOT NULL REFERENCES public.commercial_experiments(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL, -- 'conversion_rate', 'arpu', 'churn_rate'
    value NUMERIC NOT NULL,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);
