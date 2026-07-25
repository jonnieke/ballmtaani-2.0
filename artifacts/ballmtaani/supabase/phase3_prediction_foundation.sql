-- BallMtaani Edge Phase 3: Prediction Foundation Schema Migration
-- Run this script in Supabase Dashboard > SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. MODEL VERSIONS
CREATE TABLE IF NOT EXISTS model_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_key TEXT NOT NULL DEFAULT 'ballmtaani-edge-statistical',
  name TEXT NOT NULL,
  version TEXT UNIQUE NOT NULL,
  model_type TEXT DEFAULT 'dixon_coles_elo_hybrid', -- 'elo', 'dixon_coles', 'dixon_coles_elo_hybrid'
  description TEXT,
  status TEXT DEFAULT 'active', -- 'development', 'candidate', 'active', 'retired', 'failed'
  parameters JSONB DEFAULT '{}'::jsonb,
  feature_version TEXT DEFAULT 'v1',
  training_competitions TEXT[] DEFAULT '{"epl", "ucl", "la_liga", "serie_a"}',
  training_start_date DATE,
  training_end_date DATE,
  training_fixture_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  artifact_location TEXT,
  code_commit_hash TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  retired_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(model_key, version)
);

-- 2. TEAM ELO RATINGS (Historical Rating Ledger)
CREATE TABLE IF NOT EXISTS team_elo_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE NOT NULL,
  model_version_id UUID REFERENCES model_versions(id) ON DELETE CASCADE NOT NULL,
  rating_before NUMERIC NOT NULL,
  rating_after NUMERIC NOT NULL,
  opponent_team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  opponent_rating_before NUMERIC NOT NULL,
  expected_result NUMERIC NOT NULL,
  actual_result NUMERIC NOT NULL, -- 1.0 = win, 0.5 = draw, 0.0 = loss
  rating_change NUMERIC NOT NULL,
  home_advantage_applied NUMERIC DEFAULT 65,
  goal_difference_multiplier NUMERIC DEFAULT 1.0,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, fixture_id, model_version_id)
);

CREATE INDEX IF NOT EXISTS idx_team_elo_team ON team_elo_ratings(team_id);
CREATE INDEX IF NOT EXISTS idx_team_elo_fixture ON team_elo_ratings(fixture_id);
CREATE INDEX IF NOT EXISTS idx_team_elo_comp ON team_elo_ratings(competition_id);

-- 3. CURRENT TEAM RATINGS (Fast Current Rating Lookup)
CREATE TABLE IF NOT EXISTS current_team_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
  model_version_id UUID REFERENCES model_versions(id) ON DELETE CASCADE NOT NULL,
  current_rating NUMERIC NOT NULL DEFAULT 1500,
  matches_rated INTEGER DEFAULT 0,
  last_fixture_id UUID REFERENCES fixtures(id) ON DELETE SET NULL,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, competition_id, model_version_id)
);

-- 4. TEAM STRENGTH SNAPSHOTS (Attack & Defence relative parameters)
CREATE TABLE IF NOT EXISTS team_strength_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  snapshot_date DATE DEFAULT CURRENT_DATE,
  model_version_id UUID REFERENCES model_versions(id) ON DELETE CASCADE NOT NULL,
  attack_strength NUMERIC NOT NULL DEFAULT 1.0,
  defence_strength NUMERIC NOT NULL DEFAULT 1.0,
  home_attack_strength NUMERIC NOT NULL DEFAULT 1.0,
  home_defence_strength NUMERIC NOT NULL DEFAULT 1.0,
  away_attack_strength NUMERIC NOT NULL DEFAULT 1.0,
  away_defence_strength NUMERIC NOT NULL DEFAULT 1.0,
  form_score NUMERIC DEFAULT 50,
  goals_for_average NUMERIC,
  goals_against_average NUMERIC,
  matches_used INTEGER DEFAULT 0,
  data_quality_score INTEGER DEFAULT 80,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, competition_id, snapshot_date, model_version_id)
);

-- 5. MODEL TRAINING RUNS
CREATE TABLE IF NOT EXISTS model_training_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_version_id UUID REFERENCES model_versions(id) ON DELETE CASCADE NOT NULL,
  run_type TEXT NOT NULL DEFAULT 'full_training', -- 'full_training', 'incremental_update', 'elo_rebuild'
  competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'completed', -- 'running', 'completed', 'failed'
  fixtures_considered INTEGER DEFAULT 0,
  fixtures_used INTEGER DEFAULT 0,
  convergence_status TEXT DEFAULT 'converged',
  objective_value NUMERIC,
  error_summary TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. FEATURE SNAPSHOTS (Extended)
CREATE TABLE IF NOT EXISTS feature_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE NOT NULL,
  model_version_id UUID REFERENCES model_versions(id) ON DELETE CASCADE NOT NULL,
  feature_version TEXT NOT NULL DEFAULT 'v1',
  home_elo NUMERIC NOT NULL,
  away_elo NUMERIC NOT NULL,
  elo_difference NUMERIC NOT NULL,
  home_attack_strength NUMERIC NOT NULL DEFAULT 1.0,
  home_defence_strength NUMERIC NOT NULL DEFAULT 1.0,
  away_attack_strength NUMERIC NOT NULL DEFAULT 1.0,
  away_defence_strength NUMERIC NOT NULL DEFAULT 1.0,
  home_form_5 NUMERIC DEFAULT 50,
  away_form_5 NUMERIC DEFAULT 50,
  home_rest_days INTEGER DEFAULT 7,
  away_rest_days INTEGER DEFAULT 7,
  data_quality_score INTEGER DEFAULT 80,
  feature_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fixture_id, model_version_id, feature_version)
);

-- 7. PREDICTIONS (Extended Immutable Predictions Ledger)
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE NOT NULL,
  model_version_id UUID REFERENCES model_versions(id) ON DELETE CASCADE NOT NULL,
  feature_snapshot_id UUID REFERENCES feature_snapshots(id) ON DELETE SET NULL,
  revision_number INTEGER DEFAULT 1,
  prediction_status TEXT DEFAULT 'eligible', -- 'draft', 'generated', 'eligible', 'published', 'superseded', 'insufficient_data', 'failed'
  expected_home_goals NUMERIC NOT NULL,
  expected_away_goals NUMERIC NOT NULL,
  home_win_probability NUMERIC NOT NULL,
  draw_probability NUMERIC NOT NULL,
  away_win_probability NUMERIC NOT NULL,
  over_2_5_probability NUMERIC NOT NULL,
  under_2_5_probability NUMERIC NOT NULL,
  btts_yes_probability NUMERIC NOT NULL,
  btts_no_probability NUMERIC NOT NULL,
  confidence_score INTEGER NOT NULL DEFAULT 75,
  confidence_label TEXT NOT NULL DEFAULT 'Medium', -- 'High', 'Medium', 'Low'
  data_quality_score INTEGER NOT NULL DEFAULT 80,
  data_quality_label TEXT NOT NULL DEFAULT 'Good', -- 'Excellent', 'Good', 'Limited', 'Insufficient'
  likely_scorelines JSONB NOT NULL,
  score_probability_matrix JSONB,
  risk_factors TEXT[] DEFAULT '{}',
  calculation_metadata JSONB DEFAULT '{}'::jsonb,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  superseded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT chk_prob_totals CHECK (
    ABS((home_win_probability + draw_probability + away_win_probability) - 1.0) < 0.01 AND
    ABS((over_2_5_probability + under_2_5_probability) - 1.0) < 0.01 AND
    ABS((btts_yes_probability + btts_no_probability) - 1.0) < 0.01
  ),
  UNIQUE(fixture_id, model_version_id, revision_number)
);

-- 8. PREDICTION REVISIONS (Revision History Ledger)
CREATE TABLE IF NOT EXISTS prediction_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE NOT NULL,
  previous_prediction_id UUID REFERENCES predictions(id) ON DELETE SET NULL,
  revision_reason TEXT NOT NULL, -- 'new_result_data', 'model_retrained', 'fixture_time_changed', 'corrected_statistics'
  changed_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ────────────────────────── SEED ACTIVE MODEL VERSION ──────────────────────────
INSERT INTO model_versions (model_key, name, version, description, is_active, parameters) VALUES
  ('ballmtaani-edge-statistical', 'BallMtaani Dixon-Coles Elo Hybrid', 'ballmtaani-edge-statistical-v1', 'Dixon-Coles Poisson model combined with dynamic Elo team ratings and time-decay weighted attack/defence strength.', TRUE, '{
    "base_rating": 1500,
    "home_advantage": 65,
    "k_factor": 32,
    "dixon_coles_rho": -0.08,
    "time_decay_half_life_days": 180,
    "min_team_matches": 5
  }'::jsonb)
ON CONFLICT (model_key, version) DO NOTHING;
