-- BallMtaani Edge Phase 2: Data Foundation Schema Migration
-- Run this script in Supabase Dashboard > SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPETITIONS (Extended)
CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL DEFAULT 'api-football',
  provider_competition_id INTEGER NOT NULL,
  internal_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT,
  country TEXT NOT NULL,
  logo_url TEXT,
  competition_type TEXT DEFAULT 'league', -- 'league', 'cup', 'international'
  strength_coefficient NUMERIC DEFAULT 1.0,
  data_coverage TEXT DEFAULT 'Full', -- 'Full', 'Basic', 'Limited'
  is_supported BOOLEAN DEFAULT TRUE,
  prediction_enabled BOOLEAN DEFAULT TRUE,
  statistics_enabled BOOLEAN DEFAULT TRUE,
  odds_enabled BOOLEAN DEFAULT TRUE,
  active_season_id UUID,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_competition_id)
);

-- 2. SEASONS (Extended)
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
  provider_season_id INTEGER,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  data_status TEXT DEFAULT 'pending', -- 'pending', 'importing', 'completed', 'partial'
  historical_import_completed BOOLEAN DEFAULT FALSE,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(competition_id, name)
);

-- 3. TEAMS (Extended)
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL DEFAULT 'api-football',
  provider_team_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT,
  normalized_name TEXT NOT NULL,
  country TEXT,
  city TEXT,
  founded_year INTEGER,
  stadium_name TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_team_id)
);

CREATE INDEX IF NOT EXISTS idx_teams_normalized_name ON teams(normalized_name);
CREATE INDEX IF NOT EXISTS idx_teams_country ON teams(country);

-- 4. COMPETITION TEAMS (Promotion/Relegation tracking per season)
CREATE TABLE IF NOT EXISTS competition_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  provider_team_id INTEGER NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(competition_id, season_id, team_id)
);

-- 5. FIXTURES (Extended)
CREATE TABLE IF NOT EXISTS fixtures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL DEFAULT 'api-football',
  provider_fixture_id INTEGER NOT NULL,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE NOT NULL,
  home_team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  away_team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  kickoff_at TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  venue_name TEXT,
  venue_city TEXT,
  matchweek INTEGER,
  round_name TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'first_half', 'halftime', 'second_half', 'completed', 'postponed', 'cancelled', 'abandoned'
  status_short TEXT DEFAULT 'NS',
  elapsed_minutes INTEGER,
  home_score INTEGER,
  away_score INTEGER,
  halftime_home_score INTEGER,
  halftime_away_score INTEGER,
  extra_time_home_score INTEGER,
  extra_time_away_score INTEGER,
  penalty_home_score INTEGER,
  penalty_away_score INTEGER,
  referee TEXT,
  has_statistics BOOLEAN DEFAULT FALSE,
  has_lineups BOOLEAN DEFAULT FALSE,
  has_odds BOOLEAN DEFAULT FALSE,
  data_quality_score INTEGER DEFAULT 0,
  source_updated_at TIMESTAMP WITH TIME ZONE,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT chk_diff_teams CHECK (home_team_id <> away_team_id),
  UNIQUE(provider, provider_fixture_id)
);

CREATE INDEX IF NOT EXISTS idx_fixtures_kickoff ON fixtures(kickoff_at);
CREATE INDEX IF NOT EXISTS idx_fixtures_competition ON fixtures(competition_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_season ON fixtures(season_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_home_team ON fixtures(home_team_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_away_team ON fixtures(away_team_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_status ON fixtures(status);
CREATE INDEX IF NOT EXISTS idx_fixtures_comp_kickoff ON fixtures(competition_id, kickoff_at);

-- 6. MATCH STATISTICS (Extended)
CREATE TABLE IF NOT EXISTS match_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  possession_percentage NUMERIC,
  total_shots INTEGER,
  shots_on_target INTEGER,
  shots_off_target INTEGER,
  blocked_shots INTEGER,
  shots_inside_box INTEGER,
  shots_outside_box INTEGER,
  corners INTEGER,
  offsides INTEGER,
  fouls INTEGER,
  yellow_cards INTEGER,
  red_cards INTEGER,
  goalkeeper_saves INTEGER,
  passes_total INTEGER,
  passes_accurate INTEGER,
  pass_accuracy_percentage NUMERIC,
  expected_goals NUMERIC,
  expected_goals_against NUMERIC,
  source TEXT DEFAULT 'api-football',
  source_updated_at TIMESTAMP WITH TIME ZONE,
  data_quality_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fixture_id, team_id)
);

-- 7. FIXTURE EVENTS
CREATE TABLE IF NOT EXISTS fixture_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  player_name TEXT,
  assist_player_name TEXT,
  event_type TEXT NOT NULL, -- 'goal', 'own_goal', 'penalty_goal', 'missed_penalty', 'yellow_card', 'red_card', 'sub', 'var_decision'
  event_detail TEXT,
  minute INTEGER NOT NULL,
  added_time INTEGER,
  comments TEXT,
  provider_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TEAM ALIASES (Manual resolution for renamed clubs / provider discrepancies)
CREATE TABLE IF NOT EXISTS team_aliases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL DEFAULT 'api-football',
  alias TEXT NOT NULL,
  normalized_alias TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, normalized_alias)
);

-- 9. DATA SYNC RUNS
CREATE TABLE IF NOT EXISTS data_sync_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_type TEXT NOT NULL, -- 'competitions', 'teams', 'fixtures', 'results', 'statistics', 'historical_import'
  provider TEXT NOT NULL DEFAULT 'api-football',
  competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
  season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running', -- 'queued', 'running', 'completed', 'completed_with_errors', 'failed', 'cancelled'
  records_requested INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_skipped INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  api_calls_used INTEGER DEFAULT 0,
  error_summary TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. DATA SYNC ERRORS
CREATE TABLE IF NOT EXISTS data_sync_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sync_run_id UUID REFERENCES data_sync_runs(id) ON DELETE CASCADE NOT NULL,
  provider_endpoint TEXT NOT NULL,
  external_record_id TEXT,
  error_code TEXT,
  error_message TEXT NOT NULL,
  payload_excerpt TEXT,
  retryable BOOLEAN DEFAULT TRUE,
  retry_count INTEGER DEFAULT 0,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. DATA QUALITY ISSUES
CREATE TABLE IF NOT EXISTS data_quality_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL, -- 'fixture', 'team', 'competition', 'statistics'
  entity_id UUID NOT NULL,
  issue_type TEXT NOT NULL, -- 'missing_team', 'duplicate_fixture', 'invalid_score', 'missing_kickoff', 'missing_statistics', 'stale_fixture'
  severity TEXT DEFAULT 'warning', -- 'info', 'warning', 'critical'
  description TEXT NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_note TEXT
);

-- ─────────────────────────── INITIAL SEED CONFIGURATION ───────────────────────────
INSERT INTO competitions (provider_competition_id, internal_key, name, country, competition_strength, prediction_enabled) VALUES
  (39, 'epl', 'Premier League', 'England', 1.0, TRUE),
  (2, 'ucl', 'UEFA Champions League', 'World', 1.05, TRUE),
  (140, 'la_liga', 'La Liga', 'Spain', 0.98, TRUE),
  (135, 'serie_a', 'Serie A', 'Italy', 0.95, TRUE),
  (686, 'kpl', 'Kenyan Premier League', 'Kenya', 0.50, FALSE) -- Disabled for prediction until data completeness target is reached
ON CONFLICT (provider, provider_competition_id) DO NOTHING;
