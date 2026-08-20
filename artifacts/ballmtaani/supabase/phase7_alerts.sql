-- BallMtaani Edge Phase 7 Database Schema Migration
-- Premium Alerts, Lineups, Odds Movement, Retention & Engagement

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SAVED MATCHES TABLE
CREATE TABLE IF NOT EXISTS public.saved_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fixture_id UUID NOT NULL REFERENCES public.fixtures(id) ON DELETE CASCADE,
    source TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'team_follow', 'competition_follow', 'onboarding'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    notification_profile_id UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, fixture_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_matches_user ON public.saved_matches(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_saved_matches_fixture ON public.saved_matches(fixture_id);

-- 2. SAVED TEAMS TABLE
CREATE TABLE IF NOT EXISTS public.saved_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, team_id)
);

-- 3. SAVED COMPETITIONS TABLE
CREATE TABLE IF NOT EXISTS public.saved_competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, competition_id)
);

-- 4. NOTIFICATION PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.notification_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT DEFAULT 'Default Profile',
    is_default BOOLEAN DEFAULT TRUE,
    timezone TEXT DEFAULT 'Africa/Nairobi',
    quiet_hours_enabled BOOLEAN DEFAULT TRUE,
    quiet_hours_start INTEGER DEFAULT 23, -- 23:00 EAT
    quiet_hours_end INTEGER DEFAULT 7, -- 07:00 EAT
    digest_mode TEXT DEFAULT 'instant', -- 'instant', 'hourly_digest', 'morning_digest', 'evening_digest', 'weekly_digest', 'disabled'
    maximum_daily_notifications INTEGER DEFAULT 15,
    priority_only_during_quiet_hours BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NOTIFICATION PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_profile_id UUID REFERENCES public.notification_profiles(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL, -- 'prediction_published', 'prediction_revised', 'lineup_confirmed', 'lineup_impact', 'odds_movement', 'kickoff_reminder', 'subscription_expiry'
    channel TEXT NOT NULL DEFAULT 'in_app', -- 'in_app', 'push', 'email', 'sms', 'whatsapp'
    enabled BOOLEAN DEFAULT TRUE,
    minimum_change_threshold NUMERIC DEFAULT 0.04, -- e.g. 4% probability change
    minimum_confidence TEXT DEFAULT 'Low',
    minimum_data_quality TEXT DEFAULT 'Good',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, alert_type, channel)
);

-- 6. NOTIFICATION ENDPOINTS TABLE
CREATE TABLE IF NOT EXISTS public.notification_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    channel TEXT NOT NULL, -- 'web_push', 'mobile_push', 'email', 'whatsapp'
    endpoint_reference TEXT NOT NULL,
    endpoint_hash TEXT,
    masked_destination TEXT,
    status TEXT DEFAULT 'active', -- 'active', 'disabled', 'revoked'
    verified_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    failure_count INTEGER DEFAULT 0,
    disabled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NOTIFICATION EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.notification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_key TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    fixture_id UUID REFERENCES public.fixtures(id) ON DELETE CASCADE,
    prediction_id UUID REFERENCES public.predictions(id) ON DELETE CASCADE,
    previous_prediction_id UUID REFERENCES public.predictions(id) ON DELETE SET NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    materiality_score INTEGER DEFAULT 50, -- 0-100 score
    source TEXT DEFAULT 'system',
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_events_type ON public.notification_events(event_type);
CREATE INDEX IF NOT EXISTS idx_notification_events_fixture ON public.notification_events(fixture_id);

-- 8. USER NOTIFICATIONS FEED TABLE
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_event_id UUID REFERENCES public.notification_events(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    deep_link TEXT NOT NULL,
    priority TEXT DEFAULT 'standard', -- 'low', 'standard', 'high', 'urgent'
    status TEXT DEFAULT 'queued', -- 'queued', 'delivered', 'read', 'dismissed', 'expired', 'suppressed'
    read_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_status ON public.user_notifications(user_id, status);

-- 9. NOTIFICATION DELIVERIES AUDIT
CREATE TABLE IF NOT EXISTS public.notification_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_notification_id UUID NOT NULL REFERENCES public.user_notifications(id) ON DELETE CASCADE,
    channel TEXT NOT NULL, -- 'in_app', 'push', 'email', 'whatsapp'
    endpoint_id UUID REFERENCES public.notification_endpoints(id) ON DELETE SET NULL,
    provider TEXT NOT NULL DEFAULT 'internal',
    status TEXT DEFAULT 'sent', -- 'queued', 'sent', 'delivered', 'failed'
    attempt_count INTEGER DEFAULT 1,
    provider_message_id TEXT,
    queued_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_code TEXT,
    failure_reason TEXT,
    next_retry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. NOTIFICATION SUPPRESSIONS AUDIT
CREATE TABLE IF NOT EXISTS public.notification_suppressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_event_id UUID REFERENCES public.notification_events(id) ON DELETE CASCADE,
    reason TEXT NOT NULL, -- 'duplicate', 'quiet_hours', 'daily_limit', 'entitlement_missing', 'preference_disabled', 'insignificant_change'
    rule_key TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. LINEUP SNAPSHOTS TABLE
CREATE TABLE IF NOT EXISTS public.lineup_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fixture_id UUID NOT NULL REFERENCES public.fixtures(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    provider TEXT DEFAULT 'api-football',
    status TEXT NOT NULL DEFAULT 'confirmed', -- 'predicted', 'probable', 'confirmed'
    formation TEXT, -- e.g. '4-3-3'
    coach_name TEXT,
    confirmed BOOLEAN DEFAULT TRUE,
    captured_at TIMESTAMPTZ DEFAULT NOW(),
    source_updated_at TIMESTAMPTZ,
    data_quality_score INTEGER DEFAULT 95,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(fixture_id, team_id, status)
);

-- 12. LINEUP PLAYERS TABLE
CREATE TABLE IF NOT EXISTS public.lineup_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lineup_snapshot_id UUID NOT NULL REFERENCES public.lineup_snapshots(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
    player_name TEXT NOT NULL,
    position TEXT NOT NULL, -- 'G', 'D', 'M', 'F'
    shirt_number INTEGER,
    role TEXT NOT NULL DEFAULT 'starter', -- 'starter', 'substitute', 'unavailable'
    is_captain BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. PLAYER AVAILABILITY SNAPSHOTS TABLE
CREATE TABLE IF NOT EXISTS public.player_availability_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fixture_id UUID REFERENCES public.fixtures(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
    player_name TEXT NOT NULL,
    availability_status TEXT NOT NULL DEFAULT 'unavailable', -- 'available', 'doubtful', 'unavailable', 'suspended', 'injured'
    reason_type TEXT, -- 'injury', 'suspension', 'rest', 'tactical'
    description TEXT,
    reliability TEXT DEFAULT 'confirmed', -- 'confirmed', 'official', 'high', 'medium', 'low'
    captured_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ODDS MOVEMENT EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.odds_movement_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fixture_id UUID NOT NULL REFERENCES public.fixtures(id) ON DELETE CASCADE,
    market TEXT NOT NULL DEFAULT '1X2', -- '1X2', 'OU25', 'BTTS'
    selection TEXT NOT NULL, -- 'HOME', 'DRAW', 'AWAY'
    bookmaker TEXT DEFAULT 'market_avg',
    previous_odds NUMERIC NOT NULL,
    current_odds NUMERIC NOT NULL,
    previous_normalized_probability NUMERIC NOT NULL,
    current_normalized_probability NUMERIC NOT NULL,
    absolute_change NUMERIC NOT NULL,
    percentage_change NUMERIC NOT NULL,
    direction TEXT NOT NULL, -- 'shortened', 'drifted'
    materiality_score INTEGER DEFAULT 50,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. SUBSCRIBER ENGAGEMENT DAILY TABLE
CREATE TABLE IF NOT EXISTS public.subscriber_engagement_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notifications_received INTEGER DEFAULT 0,
    notifications_opened INTEGER DEFAULT 0,
    match_pages_viewed INTEGER DEFAULT 0,
    saved_matches_added INTEGER DEFAULT 0,
    days_since_last_active INTEGER DEFAULT 0,
    subscription_status TEXT DEFAULT 'active',
    churn_risk_score INTEGER DEFAULT 10, -- 0-100 score
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Seed Notification Entitlements
INSERT INTO public.entitlements (key, name, description, category) VALUES
  ('edge.saved_matches', 'Saved Matches & Custom Alerts', 'Save upcoming matches and set customized alert triggers.', 'edge'),
  ('edge.in_app_alerts', 'In-App Match Notifications', 'Receive instant in-app prediction revision and lineup alerts.', 'edge'),
  ('edge.push_alerts', 'Web Push Match Notifications', 'Receive real-time push alerts on mobile/desktop browsers.', 'edge'),
  ('edge.lineup_impact', 'Lineup Impact Revisions', 'Access prediction revisions generated automatically from confirmed lineups.', 'edge'),
  ('edge.odds_movement_alerts', 'Odds Movement Alerts', 'Receive alerts when market odds shift beyond threshold.', 'edge'),
  ('edge.weekly_digest', 'Weekly Match Intelligence Digest', 'Receive curated weekly email digests of followed teams.', 'edge')
ON CONFLICT (key) DO NOTHING;
