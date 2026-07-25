-- BallMtaani Edge Database Schema
-- Run this script in the Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPETITIONS
CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  logo_url TEXT,
  competition_strength NUMERIC DEFAULT 1.0,
  is_supported BOOLEAN DEFAULT TRUE,
  active_season_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SEASONS
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add circular FK for active_season_id if not present
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_competitions_active_season'
  ) THEN
    ALTER TABLE competitions 
    ADD CONSTRAINT fk_competitions_active_season 
    FOREIGN KEY (active_season_id) REFERENCES seasons(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. TEAMS
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT,
  country TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. FIXTURES
CREATE TABLE IF NOT EXISTS fixtures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_fixture_id INTEGER UNIQUE NOT NULL,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  home_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  away_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  kickoff_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'NS', -- 'NS', '1H', 'HT', '2H', 'FT', 'AET', 'PEN', 'PPD', 'CANC'
  home_score INTEGER,
  away_score INTEGER,
  venue TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. MATCH STATISTICS
CREATE TABLE IF NOT EXISTS match_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  possession NUMERIC,
  shots INTEGER,
  shots_on_target INTEGER,
  corners INTEGER,
  fouls INTEGER,
  cards INTEGER,
  expected_goals NUMERIC,
  expected_goals_against NUMERIC,
  data_quality TEXT DEFAULT 'Good', -- 'Excellent', 'Good', 'Limited', 'Insufficient'
  source TEXT DEFAULT 'api-football',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fixture_id, team_id)
);

-- 6. TEAM RATINGS (Elo history)
CREATE TABLE IF NOT EXISTS team_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  fixture_id UUID REFERENCES fixtures(id) ON DELETE SET NULL,
  rating_before NUMERIC NOT NULL,
  rating_after NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ODDS SNAPSHOTS
CREATE TABLE IF NOT EXISTS odds_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE NOT NULL,
  bookmaker TEXT NOT NULL DEFAULT 'market_avg',
  market TEXT NOT NULL, -- '1X2', 'OU25', 'BTTS'
  selection TEXT NOT NULL, -- 'HOME', 'DRAW', 'AWAY', 'OVER', 'UNDER', 'YES', 'NO'
  decimal_odds NUMERIC NOT NULL,
  implied_probability NUMERIC NOT NULL,
  normalized_probability NUMERIC NOT NULL,
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. FEATURE SNAPSHOTS
CREATE TABLE IF NOT EXISTS feature_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE NOT NULL,
  feature_version TEXT NOT NULL DEFAULT 'v1',
  feature_payload JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. MODEL VERSIONS
CREATE TABLE IF NOT EXISTS model_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  version TEXT UNIQUE NOT NULL,
  description TEXT,
  parameters JSONB DEFAULT '{}'::jsonb,
  trained_from DATE,
  trained_to DATE,
  training_sample_size INTEGER DEFAULT 0,
  brier_score NUMERIC,
  log_loss NUMERIC,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. PREDICTIONS
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE NOT NULL,
  model_version_id UUID REFERENCES model_versions(id) ON DELETE CASCADE,
  revision_number INTEGER DEFAULT 1,
  prediction_status TEXT DEFAULT 'Strong Edge', -- 'Strong Edge', 'Moderate Edge', 'Small Edge', 'No Edge', 'Avoid', 'Insufficient Data', 'Awaiting Lineups'
  home_probability NUMERIC NOT NULL,
  draw_probability NUMERIC NOT NULL,
  away_probability NUMERIC NOT NULL,
  over_2_5_probability NUMERIC NOT NULL,
  under_2_5_probability NUMERIC NOT NULL,
  btts_yes_probability NUMERIC NOT NULL,
  btts_no_probability NUMERIC NOT NULL,
  expected_home_goals NUMERIC NOT NULL,
  expected_away_goals NUMERIC NOT NULL,
  likely_scorelines JSONB NOT NULL, -- Array of { home, away, probability }
  confidence TEXT NOT NULL DEFAULT 'Medium', -- 'High', 'Medium', 'Low'
  data_quality TEXT NOT NULL DEFAULT 'Good', -- 'Excellent', 'Good', 'Limited', 'Insufficient'
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fixture_id, revision_number)
);

-- 11. PREDICTION MARKETS
CREATE TABLE IF NOT EXISTS prediction_markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE NOT NULL,
  market TEXT NOT NULL, -- '1X2', 'OU25', 'BTTS'
  selection TEXT NOT NULL, -- 'HOME', 'DRAW', 'AWAY', 'OVER', 'UNDER', 'YES', 'NO'
  probability NUMERIC NOT NULL,
  fair_odds NUMERIC NOT NULL,
  market_odds NUMERIC,
  market_probability NUMERIC,
  expected_value NUMERIC,
  edge_percentage NUMERIC,
  recommendation TEXT NOT NULL DEFAULT 'No Edge', -- 'Strong Edge', 'Moderate Edge', 'Small Edge', 'No Edge', 'Avoid'
  risk_level TEXT DEFAULT 'Medium', -- 'Low', 'Medium', 'High'
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. PREDICTION RESULTS
CREATE TABLE IF NOT EXISTS prediction_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_market_id UUID REFERENCES prediction_markets(id) ON DELETE CASCADE NOT NULL,
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE NOT NULL,
  result_status TEXT NOT NULL, -- 'WON', 'LOST', 'VOID'
  hypothetical_unit_profit NUMERIC NOT NULL DEFAULT 0,
  settled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. PREDICTION EXPLANATIONS
CREATE TABLE IF NOT EXISTS prediction_explanations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE NOT NULL,
  language TEXT DEFAULT 'en',
  explanation_type TEXT DEFAULT 'template', -- 'template', 'llm'
  content TEXT NOT NULL,
  generated_by TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL, -- 'free', 'matchday_pass', 'weekly_edge', 'edge_pro'
  name TEXT NOT NULL,
  price_kes NUMERIC NOT NULL DEFAULT 0,
  billing_period TEXT NOT NULL DEFAULT 'monthly', -- 'daily', 'weekly', 'monthly'
  feature_limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. USER SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE RESTRICT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'cancelled', 'pending'
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_reference TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. PREDICTION ACCESS LOGS
CREATE TABLE IF NOT EXISTS prediction_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────── INDEXES ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_fixtures_competition ON fixtures(competition_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_kickoff ON fixtures(kickoff_at);
CREATE INDEX IF NOT EXISTS idx_fixtures_status ON fixtures(status);
CREATE INDEX IF NOT EXISTS idx_predictions_fixture ON predictions(fixture_id);
CREATE INDEX IF NOT EXISTS idx_predictions_published ON predictions(published_at);
CREATE INDEX IF NOT EXISTS idx_pred_markets_recommendation ON prediction_markets(recommendation);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_team_ratings_team ON team_ratings(team_id);

-- ─────────────────────────── SEED DATA ───────────────────────────
-- Seed initial supported competitions
INSERT INTO competitions (provider_id, name, country, competition_strength) VALUES
  (39, 'Premier League', 'England', 1.0),
  (140, 'La Liga', 'Spain', 0.98),
  (135, 'Serie A', 'Italy', 0.95),
  (2, 'UEFA Champions League', 'World', 1.05)
ON CONFLICT (provider_id) DO NOTHING;

-- Seed subscription plans
INSERT INTO subscription_plans (code, name, price_kes, billing_period, feature_limits) VALUES
  ('free', 'Free Matchday Pass', 0, 'monthly', '{"max_daily_predictions": 3, "show_odds": false, "show_value": false}'::jsonb),
  ('matchday_pass', 'Match-Day Pass', 20, 'daily', '{"max_daily_predictions": 999, "show_odds": true, "show_value": true, "duration_hours": 24}'::jsonb),
  ('weekly_edge', 'Weekly Edge', 99, 'weekly', '{"max_daily_predictions": 999, "show_odds": true, "show_value": true, "duration_days": 7}'::jsonb),
  ('edge_pro', 'Edge Pro', 399, 'monthly', '{"max_daily_predictions": 999, "show_odds": true, "show_value": true, "duration_days": 30, "early_access": true}'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- Seed active model version v1.0
INSERT INTO model_versions (name, version, description, is_active, trained_from, trained_to) VALUES
  ('BallMtaani Dixon-Coles Elo Hybrid', 'v1.0.0', 'Dixon-Coles Poisson model combined with dynamic Elo team ratings and 10-match rolling form features.', TRUE, '2023-08-01', '2026-07-01')
ON CONFLICT (version) DO NOTHING;

-- ─────────────────────────── RLS POLICIES ─────────────────────────
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read competitions" ON competitions FOR SELECT USING (TRUE);
CREATE POLICY "Public read seasons" ON seasons FOR SELECT USING (TRUE);
CREATE POLICY "Public read teams" ON teams FOR SELECT USING (TRUE);
CREATE POLICY "Public read fixtures" ON fixtures FOR SELECT USING (TRUE);
CREATE POLICY "Public read active predictions" ON predictions FOR SELECT USING (TRUE);
CREATE POLICY "Public read prediction markets" ON prediction_markets FOR SELECT USING (TRUE);
CREATE POLICY "Public read prediction results" ON prediction_results FOR SELECT USING (TRUE);
CREATE POLICY "Public read prediction explanations" ON prediction_explanations FOR SELECT USING (TRUE);
CREATE POLICY "Public read subscription plans" ON subscription_plans FOR SELECT USING (TRUE);
CREATE POLICY "Users read own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');
