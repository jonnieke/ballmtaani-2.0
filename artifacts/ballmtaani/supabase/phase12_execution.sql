-- BallMtaani Edge Phase 12 Database Schema Migration
-- Controlled Public Launch, Strategic Partnerships & Expansion Decisions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. LAUNCH WAVES & SUBSCRIBER CEILINGS
CREATE TABLE IF NOT EXISTS public.launch_waves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    launch_programme_id UUID REFERENCES public.launch_programmes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    stage TEXT NOT NULL DEFAULT 'closed_paid_beta', -- 'employee_internal', 'invited_testers', 'closed_paid_beta', 'limited_public_paid', 'national_public_launch', 'scaled_commercial_launch'
    status TEXT DEFAULT 'active', -- 'draft', 'scheduled', 'active', 'paused', 'completed', 'rolled_back'
    subscriber_limit INTEGER DEFAULT 50000,
    start_at TIMESTAMPTZ DEFAULT NOW(),
    end_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.launch_wave_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    launch_wave_id UUID NOT NULL REFERENCES public.launch_waves(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    eligibility_source TEXT DEFAULT 'invitation', -- 'invitation', 'campaign', 'referral', 'telecom'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(launch_wave_id, user_id)
);

-- 2. CAMPAIGN BRIEFS & SOCIAL CARDS
CREATE TABLE IF NOT EXISTS public.campaign_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    primary_message TEXT NOT NULL,
    budget_kes NUMERIC DEFAULT 100000,
    status TEXT DEFAULT 'approved', -- 'draft', 'approved', 'paused', 'completed'
    stop_conditions TEXT DEFAULT 'pause_if_refunds_exceed_5_percent',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.social_prediction_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fixture_id TEXT NOT NULL,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    home_prob NUMERIC NOT NULL,
    draw_prob NUMERIC NOT NULL,
    away_prob NUMERIC NOT NULL,
    confidence TEXT NOT NULL,
    disclaimer TEXT DEFAULT 'Informational probabilities only. No guaranteed outcomes.',
    card_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STRATEGIC PARTNERSHIPS & PROPOSALS
CREATE TABLE IF NOT EXISTS public.partnership_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_name TEXT NOT NULL,
    partner_type TEXT NOT NULL, -- 'telecom', 'media_publisher', 'creator', 'super_app'
    opportunity_stage TEXT DEFAULT 'qualified', -- 'identified', 'qualified', 'proposal', 'pilot', 'active'
    strategic_score INTEGER DEFAULT 85,
    estimated_monthly_revenue_kes NUMERIC DEFAULT 500000,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.commercial_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES public.partnership_opportunities(id) ON DELETE CASCADE,
    version TEXT DEFAULT 'v1.0',
    proposed_price_kes NUMERIC NOT NULL,
    revenue_share_percentage NUMERIC DEFAULT 20.0,
    status TEXT DEFAULT 'accepted', -- 'draft', 'sent', 'accepted', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.partner_pilots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES public.partnership_opportunities(id) ON DELETE CASCADE,
    users_provisioned INTEGER DEFAULT 1000,
    pilot_contribution_margin_kes NUMERIC DEFAULT 350000,
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'scaled', 'terminated'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SUBSCRIBER ACTIVATION & HEALTH
CREATE TABLE IF NOT EXISTS public.subscriber_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    viewed_first_premium_match BOOLEAN DEFAULT TRUE,
    saved_first_team BOOLEAN DEFAULT TRUE,
    enabled_first_alert BOOLEAN DEFAULT TRUE,
    activated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriber_health_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    health_score_category TEXT DEFAULT 'engaged', -- 'new', 'activated', 'engaged', 'at_risk', 'expired'
    score INTEGER DEFAULT 85,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EXPANSION SCORECARDS & POST-LAUNCH REVIEWS
CREATE TABLE IF NOT EXISTS public.expansion_scorecards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expansion_type TEXT NOT NULL, -- 'competition', 'country', 'channel'
    target_name TEXT NOT NULL, -- e.g. 'French Ligue 1' or 'Tanzania'
    audience_score INTEGER DEFAULT 80,
    model_score INTEGER DEFAULT 85,
    compliance_score INTEGER DEFAULT 90,
    overall_score INTEGER DEFAULT 85,
    decision TEXT DEFAULT 'approve_pilot', -- 'approve_pilot', 'defer', 'reject'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_market_fit_scorecards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_name TEXT NOT NULL,
    status TEXT DEFAULT 'demonstrated_in_one_segment',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.launch_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_type TEXT NOT NULL, -- '24_hour', '7_day', '30_day', '90_day'
    summary TEXT NOT NULL,
    action_items TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_learning_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL, -- 'user_feedback', 'support_ticket', 'model_drift'
    problem TEXT NOT NULL,
    proposed_action TEXT NOT NULL,
    status TEXT DEFAULT 'planned',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
