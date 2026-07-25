-- BallMtaani Edge Phase 4: Backtesting, Calibration & Model Evaluation Schema Migration
-- Run this script in Supabase Dashboard > SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BACKTEST RUNS
CREATE TABLE IF NOT EXISTS backtest_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  model_version_id UUID REFERENCES model_versions(id) ON DELETE CASCADE,
  backtest_version TEXT DEFAULT 'v1',
  status TEXT DEFAULT 'completed', -- 'queued', 'running', 'evaluating', 'completed', 'failed', 'invalid'
  evaluation_mode TEXT DEFAULT 'expanding', -- 'expanding', 'rolling', 'season_by_season'
  training_window_days INTEGER DEFAULT 730,
  initial_training_start DATE,
  initial_training_end DATE,
  evaluation_start DATE,
  evaluation_end DATE,
  retraining_frequency TEXT DEFAULT 'weekly',
  competitions TEXT[] DEFAULT '{"epl", "ucl", "la_liga", "serie_a"}',
  fixture_count INTEGER DEFAULT 0,
  prediction_count INTEGER DEFAULT 0,
  brier_score NUMERIC,
  log_loss NUMERIC,
  accuracy NUMERIC,
  expected_calibration_error NUMERIC,
  max_calibration_error NUMERIC,
  roi_percentage NUMERIC,
  max_drawdown_percentage NUMERIC,
  leakage_check_status TEXT DEFAULT 'passed', -- 'passed', 'failed', 'pending'
  configuration JSONB DEFAULT '{}'::jsonb,
  code_commit_hash TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. BACKTEST WINDOWS
CREATE TABLE IF NOT EXISTS backtest_windows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backtest_run_id UUID REFERENCES backtest_runs(id) ON DELETE CASCADE NOT NULL,
  sequence_number INTEGER NOT NULL,
  training_start TIMESTAMP WITH TIME ZONE NOT NULL,
  training_end TIMESTAMP WITH TIME ZONE NOT NULL,
  prediction_start TIMESTAMP WITH TIME ZONE NOT NULL,
  prediction_end TIMESTAMP WITH TIME ZONE NOT NULL,
  fixtures_available INTEGER DEFAULT 0,
  fixtures_predicted INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. BACKTEST PREDICTIONS (Immutable Point-in-Time Historical Ledger)
CREATE TABLE IF NOT EXISTS backtest_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backtest_run_id UUID REFERENCES backtest_runs(id) ON DELETE CASCADE NOT NULL,
  backtest_window_id UUID REFERENCES backtest_windows(id) ON DELETE CASCADE,
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE NOT NULL,
  model_version_id UUID REFERENCES model_versions(id) ON DELETE SET NULL,
  prediction_cutoff_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expected_home_goals NUMERIC NOT NULL,
  expected_away_goals NUMERIC NOT NULL,
  home_win_probability NUMERIC NOT NULL,
  draw_probability NUMERIC NOT NULL,
  away_win_probability NUMERIC NOT NULL,
  over_2_5_probability NUMERIC NOT NULL,
  under_2_5_probability NUMERIC NOT NULL,
  btts_yes_probability NUMERIC NOT NULL,
  btts_no_probability NUMERIC NOT NULL,
  confidence_score INTEGER DEFAULT 75,
  confidence_label TEXT DEFAULT 'Medium',
  data_quality_score INTEGER DEFAULT 80,
  data_quality_label TEXT DEFAULT 'Good',
  actual_home_score INTEGER,
  actual_away_score INTEGER,
  actual_1x2_result TEXT, -- 'home_win', 'draw', 'away_win'
  actual_over_2_5_result TEXT, -- 'over_2_5', 'under_2_5'
  actual_btts_result TEXT, -- 'btts_yes', 'btts_no'
  settled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(backtest_run_id, fixture_id)
);

-- 4. BACKTEST MARKET PREDICTIONS
CREATE TABLE IF NOT EXISTS backtest_market_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backtest_prediction_id UUID REFERENCES backtest_predictions(id) ON DELETE CASCADE NOT NULL,
  market TEXT NOT NULL, -- '1x2', 'over_under_2_5', 'btts'
  selection TEXT NOT NULL,
  predicted_probability NUMERIC NOT NULL,
  actual_outcome INTEGER NOT NULL, -- 1 = true, 0 = false
  brier_component NUMERIC NOT NULL,
  log_loss_component NUMERIC NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. BACKTEST METRICS
CREATE TABLE IF NOT EXISTS backtest_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backtest_run_id UUID REFERENCES backtest_runs(id) ON DELETE CASCADE NOT NULL,
  scope_type TEXT NOT NULL DEFAULT 'overall', -- 'overall', 'competition', 'market', 'confidence', 'data_quality'
  scope_value TEXT NOT NULL DEFAULT 'all',
  market TEXT DEFAULT '1x2',
  metric_name TEXT NOT NULL, -- 'brier_score', 'log_loss', 'accuracy', 'ece', 'roi', 'max_drawdown'
  metric_value NUMERIC NOT NULL,
  sample_size INTEGER DEFAULT 0,
  benchmark_value NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CALIBRATION BUCKETS (10-Percentage-Point Reliability Buckets)
CREATE TABLE IF NOT EXISTS calibration_buckets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backtest_run_id UUID REFERENCES backtest_runs(id) ON DELETE CASCADE NOT NULL,
  market TEXT NOT NULL DEFAULT '1x2',
  bucket_start NUMERIC NOT NULL, -- e.g. 0.10
  bucket_end NUMERIC NOT NULL, -- e.g. 0.20
  average_predicted_probability NUMERIC NOT NULL,
  actual_frequency NUMERIC NOT NULL,
  prediction_count INTEGER NOT NULL DEFAULT 0,
  absolute_calibration_error NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. BACKTEST EXCLUSIONS
CREATE TABLE IF NOT EXISTS backtest_exclusions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backtest_run_id UUID REFERENCES backtest_runs(id) ON DELETE CASCADE NOT NULL,
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  exclusion_reason TEXT NOT NULL, -- 'insufficient_history', 'missing_result', 'possible_data_leakage'
  description TEXT,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. MODEL EVALUATION DECISIONS
CREATE TABLE IF NOT EXISTS model_evaluation_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_version_id UUID REFERENCES model_versions(id) ON DELETE CASCADE NOT NULL,
  backtest_run_id UUID REFERENCES backtest_runs(id) ON DELETE CASCADE NOT NULL,
  decision TEXT NOT NULL, -- 'accepted_for_beta', 'accepted_with_limits', 'needs_recalibration', 'rejected'
  decision_reason TEXT NOT NULL,
  metrics_snapshot JSONB DEFAULT '{}'::jsonb,
  reviewed_by TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
