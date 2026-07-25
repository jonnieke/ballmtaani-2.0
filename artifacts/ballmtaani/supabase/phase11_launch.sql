-- BallMtaani Edge Phase 11 Database Schema Migration
-- Market Launch, Compliance Review, Growth Operations, Profitability & Investor Readiness

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. LAUNCH PROGRAMMES & CHECKLISTS
CREATE TABLE IF NOT EXISTS public.launch_programmes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL, -- e.g. 'kenya_paid_launch_v1'
    name TEXT NOT NULL,
    market TEXT NOT NULL DEFAULT 'KE',
    launch_stage TEXT DEFAULT 'paid_beta', -- 'internal_alpha', 'closed_beta', 'paid_beta', 'limited_public_launch', 'market_launch', 'scaled_launch'
    status TEXT DEFAULT 'active', -- 'planning', 'readiness_review', 'approved', 'active', 'paused', 'rolled_back'
    subscriber_limit INTEGER DEFAULT 50000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.launch_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    launch_programme_id UUID NOT NULL REFERENCES public.launch_programmes(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'model', 'data', 'payment', 'entitlement', 'security', 'support', 'compliance', 'financial'
    item TEXT NOT NULL,
    status TEXT DEFAULT 'completed', -- 'pending', 'in_review', 'completed', 'blocked'
    blocker_severity TEXT DEFAULT 'high', -- 'low', 'medium', 'high', 'critical'
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COMPLIANCE REGISTRY & LEGAL DOCUMENTS
CREATE TABLE IF NOT EXISTS public.compliance_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market TEXT NOT NULL DEFAULT 'KE',
    category TEXT NOT NULL, -- 'consumer_protection', 'data_privacy', 'responsible_use', 'telecom'
    title TEXT NOT NULL,
    status TEXT DEFAULT 'implemented', -- 'under_review', 'implemented', 'exception_required'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.compliance_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_id UUID NOT NULL REFERENCES public.compliance_requirements(id) ON DELETE CASCADE,
    control_key TEXT NOT NULL,
    implementation_reference TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL, -- 'terms_of_use', 'privacy_policy', 'responsible_use_policy'
    title TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT 'v1.0',
    status TEXT DEFAULT 'active', -- 'draft', 'active', 'retired'
    effective_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_legal_acceptances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES public.legal_documents(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    accepted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, document_id, version)
);

CREATE TABLE IF NOT EXISTS public.marketing_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    asset_type TEXT NOT NULL, -- 'social_post', 'banner', 'influencer_script', 'sms'
    content TEXT NOT NULL,
    status TEXT DEFAULT 'approved', -- 'draft', 'compliance_review', 'approved', 'rejected'
    reviewer TEXT DEFAULT 'compliance_officer',
    reviewed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GROWTH OPERATIONS & ACQUISITION ATTRIBUTION
CREATE TABLE IF NOT EXISTS public.acquisition_touchpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    channel TEXT NOT NULL, -- 'organic', 'social', 'telecom_bundle', 'referral', 'b2b_widget'
    campaign TEXT,
    occurred_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.acquisition_attributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    attributed_channel TEXT NOT NULL,
    attribution_model TEXT DEFAULT 'last_touch',
    converted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.growth_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    budget_kes NUMERIC DEFAULT 500000,
    status TEXT DEFAULT 'active', -- 'planning', 'active', 'paused', 'completed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.campaign_performance_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.growth_campaigns(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    impressions INTEGER DEFAULT 0,
    registrations INTEGER DEFAULT 0,
    payments INTEGER DEFAULT 0,
    revenue_kes NUMERIC DEFAULT 0,
    spend_kes NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FINANCIAL LEDGER & PROFITABILITY CONTROLS
CREATE TABLE IF NOT EXISTS public.financial_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status TEXT DEFAULT 'open', -- 'open', 'reviewing', 'closed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.financial_ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id UUID REFERENCES public.financial_periods(id) ON DELETE SET NULL,
    entry_type TEXT NOT NULL, -- 'revenue', 'data_cost', 'payment_fee', 'messaging_cost', 'partner_share', 'refund'
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'KES',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profitability_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period DATE NOT NULL DEFAULT CURRENT_DATE,
    gross_revenue_kes NUMERIC NOT NULL,
    variable_cost_kes NUMERIC NOT NULL,
    contribution_margin_kes NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.operational_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT UNIQUE NOT NULL, -- 'football_data', 'cloud_compute', 'marketing', 'sms'
    soft_limit NUMERIC NOT NULL,
    hard_limit NUMERIC NOT NULL,
    current_spend NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'normal', -- 'normal', 'soft_limit_reached', 'hard_limit_exceeded'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INVESTOR DATA ROOM & GOVERNANCE
CREATE TABLE IF NOT EXISTS public.data_room_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, -- 'corporate', 'product', 'model', 'commercial', 'financial', 'legal'
    title TEXT NOT NULL,
    version TEXT DEFAULT 'v1.0',
    file_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.data_room_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viewer_email TEXT NOT NULL,
    granted_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.data_room_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viewer_email TEXT NOT NULL,
    document_id UUID REFERENCES public.data_room_documents(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'view', 'download'
    occurred_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.governance_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    context TEXT NOT NULL,
    decision TEXT NOT NULL,
    owner TEXT NOT NULL,
    effective_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.strategic_risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, -- 'model', 'data', 'regulatory', 'payment', 'competition'
    title TEXT NOT NULL,
    mitigation TEXT NOT NULL,
    risk_score INTEGER DEFAULT 3, -- 1-5 score
    status TEXT DEFAULT 'mitigating',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customer_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL, -- 1-5 stars
    message TEXT NOT NULL,
    category TEXT DEFAULT 'product_clarity',
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
