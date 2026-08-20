-- BallMtaani Edge Phase 6 Database Schema Migration
-- Subscriptions, M-Pesa Payments, Premium Entitlements, Reconciliations & Audit Logs

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SUBSCRIPTION PLANS TABLE
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- 'free', 'matchday_pass', 'weekly_edge', 'edge_pro'
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price_amount NUMERIC NOT NULL CHECK (price_amount >= 0),
    currency TEXT NOT NULL DEFAULT 'KES',
    duration_hours INTEGER, -- null for perpetual free plan
    billing_type TEXT NOT NULL DEFAULT 'one_time', -- 'free', 'one_time', 'recurring_manual'
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    renewal_allowed BOOLEAN DEFAULT TRUE,
    grace_period_hours INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    entitlement_keys JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    retired_at TIMESTAMPTZ
);

-- 2. ENTITLEMENTS DEFINITION TABLE
CREATE TABLE IF NOT EXISTS public.entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'edge',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PLAN ENTITLEMENTS MAPPING
CREATE TABLE IF NOT EXISTS public.plan_entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
    entitlement_id UUID REFERENCES public.entitlements(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(plan_id, entitlement_id)
);

-- 4. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'grace', 'expired', 'cancelled', 'suspended', 'refunded', 'payment_failed'
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    grace_ends_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    auto_renew BOOLEAN DEFAULT FALSE,
    renewal_source TEXT DEFAULT 'manual',
    original_payment_id UUID,
    latest_payment_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON public.subscriptions(expires_at);

-- 5. USER ENTITLEMENTS (Manual grants, promotions, support adjustments)
CREATE TABLE IF NOT EXISTS public.user_entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entitlement_id UUID NOT NULL REFERENCES public.entitlements(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL DEFAULT 'subscription', -- 'subscription', 'promotion', 'admin', 'campaign', 'compensation', 'test'
    source_id TEXT,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'active',
    granted_by UUID REFERENCES auth.users(id),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PAYMENTS TABLE (M-Pesa transaction ledger)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    provider TEXT NOT NULL DEFAULT 'mpesa', -- 'mpesa', 'mock', 'card'
    payment_type TEXT NOT NULL DEFAULT 'stk_push',
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'KES',
    status TEXT NOT NULL DEFAULT 'initiated', -- 'initiated', 'pending', 'processing', 'successful', 'failed', 'cancelled', 'timed_out', 'reversed', 'refunded', 'requires_reconciliation'
    internal_reference TEXT UNIQUE NOT NULL,
    provider_request_id TEXT,
    provider_checkout_request_id TEXT UNIQUE,
    provider_transaction_id TEXT UNIQUE,
    phone_number_masked TEXT,
    phone_number_hash TEXT,
    initiated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_code TEXT,
    failure_reason TEXT,
    callback_received_at TIMESTAMPTZ,
    raw_callback_reference TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(internal_reference);

-- 7. PAYMENT ATTEMPTS
CREATE TABLE IF NOT EXISTS public.payment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
    attempt_number INTEGER DEFAULT 1,
    provider TEXT NOT NULL DEFAULT 'mpesa',
    request_payload_reference TEXT,
    response_code TEXT,
    response_description TEXT,
    provider_request_id TEXT,
    provider_checkout_request_id TEXT,
    initiated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PAYMENT CALLBACKS AUDIT
CREATE TABLE IF NOT EXISTS public.payment_callbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    provider TEXT NOT NULL DEFAULT 'mpesa',
    callback_type TEXT DEFAULT 'stk_push_result',
    provider_request_id TEXT,
    provider_checkout_request_id TEXT,
    provider_transaction_id TEXT,
    callback_signature TEXT,
    payload_hash TEXT,
    processing_status TEXT DEFAULT 'processed', -- 'processed', 'duplicate', 'error', 'quarantined'
    processing_error TEXT,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PAYMENT RECONCILIATIONS
CREATE TABLE IF NOT EXISTS public.payment_reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
    reconciliation_type TEXT NOT NULL, -- 'unconfirmed_callback', 'duplicate_transaction', 'amount_mismatch', 'manual_admin'
    expected_amount NUMERIC NOT NULL,
    received_amount NUMERIC NOT NULL,
    expected_status TEXT NOT NULL,
    provider_status TEXT NOT NULL,
    discrepancy_type TEXT NOT NULL,
    resolution_status TEXT DEFAULT 'unresolved', -- 'unresolved', 'resolved_auto', 'resolved_manual'
    resolution_note TEXT,
    resolved_by UUID REFERENCES auth.users(id),
    reconciled_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SUBSCRIPTION EVENTS LOG
CREATE TABLE IF NOT EXISTS public.subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'created', 'payment_pending', 'activated', 'renewed', 'extended', 'grace_started', 'expired', 'cancelled', 'suspended', 'refunded', 'manually_granted'
    previous_status TEXT,
    new_status TEXT NOT NULL,
    effective_at TIMESTAMPTZ DEFAULT NOW(),
    source TEXT DEFAULT 'system',
    source_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ACCESS LOGS
CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resource_type TEXT NOT NULL, -- 'match_analysis', 'prediction_archive', 'performance_pro'
    resource_id TEXT,
    entitlement_key TEXT NOT NULL,
    decision TEXT NOT NULL, -- 'allowed', 'denied', 'preview', 'anonymous_free'
    reason TEXT,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    occurred_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PROMOTIONS & REDEMPTIONS
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL DEFAULT 'fixed_amount', -- 'fixed_amount', 'percentage'
    discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    max_redemptions INTEGER,
    redemption_count INTEGER DEFAULT 0,
    eligible_plan_ids JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.promotion_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(promotion_id, user_id)
);

-- Seed Launch Entitlements
INSERT INTO public.entitlements (key, name, description, category) VALUES
  ('edge.basic_predictions', 'Basic Predictions', 'Access to 1X2 probabilities for free daily matches.', 'edge'),
  ('edge.full_1x2', 'Full 1X2 Probabilities', 'Access to complete 1X2 win probabilities across all supported matches.', 'edge'),
  ('edge.goals_markets', 'Goals Markets Analysis', 'Access to Over/Under 2.5 goals market probabilities and expected goals.', 'edge'),
  ('edge.btts', 'BTTS Market Analysis', 'Access to Both Teams to Score market probabilities.', 'edge'),
  ('edge.likely_scores', 'Top Likely Scorelines', 'Access to top 3 most likely scorelines with Poisson probabilities.', 'edge'),
  ('edge.full_analysis', 'Full Match Analysis', 'Access to full team strength, attack/defence splits, and form analysis.', 'edge'),
  ('edge.risk_factors', 'Risk & Uncertainty Factors', 'Access to deterministic model risk factors and uncertainty indicators.', 'edge'),
  ('edge.revisions', 'Prediction Revisions History', 'Access to historical prediction revisions timeline.', 'edge'),
  ('edge.early_access', 'Early Access Predictions', 'Access to predictions immediately upon model publication.', 'edge'),
  ('edge.full_archive', 'Full Prediction Archive', 'Access to historical prediction archive during active entitlement.', 'edge'),
  ('edge.fair_odds', 'Fair Odds Estimation', 'Access to model fair odds calculations.', 'edge'),
  ('edge.value_analysis', 'Statistical Value Analysis', 'Access to market odds comparison and statistical value markers.', 'edge')
ON CONFLICT (key) DO NOTHING;

-- Seed Launch Subscription Plans
INSERT INTO public.subscription_plans (code, name, description, price_amount, currency, duration_hours, billing_type, is_active, is_featured, display_order, features, entitlement_keys) VALUES
  (
    'free',
    'Free Preview',
    'Basic statistical football probabilities for selected daily matches.',
    0,
    'KES',
    NULL,
    'free',
    TRUE,
    FALSE,
    1,
    '["Selected daily fixtures", "Basic 1X2 probabilities", "Expected goals (xG)", "Public performance ledger"]'::jsonb,
    '["edge.basic_predictions"]'::jsonb
  ),
  (
    'matchday_pass',
    'Match-Day Pass',
    '24-hour full access to all match predictions, scorelines, and risk factors.',
    20,
    'KES',
    24,
    'one_time',
    TRUE,
    FALSE,
    2,
    '["24-Hour Full Access", "Full 1X2 Probabilities", "Over/Under 2.5 & BTTS", "Top Likely Scorelines", "Risk Factors & Revisions"]'::jsonb,
    '["edge.basic_predictions", "edge.full_1x2", "edge.goals_markets", "edge.btts", "edge.likely_scores", "edge.full_analysis", "edge.risk_factors", "edge.revisions"]'::jsonb
  ),
  (
    'weekly_edge',
    'Weekly Edge',
    '7-day complete access to all supported competitions and full prediction archive.',
    99,
    'KES',
    168,
    'one_time',
    TRUE,
    TRUE,
    3,
    '["7-Day Unrestricted Access", "All Supported Competitions", "Full Prediction Archive", "Updated Prediction Revisions", "Early Access Predictions"]'::jsonb,
    '["edge.basic_predictions", "edge.full_1x2", "edge.goals_markets", "edge.btts", "edge.likely_scores", "edge.full_analysis", "edge.risk_factors", "edge.revisions", "edge.early_access", "edge.full_archive"]'::jsonb
  ),
  (
    'edge_pro',
    'Edge Pro',
    '30-day VIP access with fair odds estimation, value analysis, and priority alerts.',
    399,
    'KES',
    720,
    'one_time',
    TRUE,
    FALSE,
    4,
    '["30-Day VIP Access", "Fair Odds & Value Analysis", "Priority Notification Preparation", "Saved Matches & Full Archive"]'::jsonb,
    '["edge.basic_predictions", "edge.full_1x2", "edge.goals_markets", "edge.btts", "edge.likely_scores", "edge.full_analysis", "edge.risk_factors", "edge.revisions", "edge.early_access", "edge.full_archive", "edge.fair_odds", "edge.value_analysis"]'::jsonb
  )
ON CONFLICT (code) DO NOTHING;
