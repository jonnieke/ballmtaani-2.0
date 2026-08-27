create extension if not exists pgcrypto;

create table if not exists public.local_football_sources (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid references auth.users(id) on delete set null,
  source_name text not null,
  source_type text not null default 'organizer_poster'
    check (source_type in ('organizer_poster', 'club_poster', 'school_poster', 'reporter', 'other')),
  original_filename text not null,
  asset_path text not null unique,
  mime_type text not null,
  document_type text not null default 'unknown'
    check (document_type in ('fixture', 'result', 'multi_result', 'standings', 'team_photo', 'unknown')),
  workflow_status text not null default 'pending_review'
    check (workflow_status in ('processing', 'pending_review', 'verified', 'published', 'rejected', 'failed')),
  extraction_payload jsonb not null default '{}'::jsonb,
  extraction_confidence numeric(4,3) check (extraction_confidence between 0 and 1),
  extraction_warnings text[] not null default '{}',
  extraction_error text,
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.local_competitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_name text,
  season_label text,
  locality text,
  county text,
  country text not null default 'Kenya',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.local_teams (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_name text,
  locality text,
  county text,
  crest_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.local_venues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  locality text,
  county text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.local_fixtures (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.local_football_sources(id) on delete restrict,
  source_match_index integer not null default 0,
  competition_id uuid references public.local_competitions(id) on delete set null,
  home_team_id uuid not null references public.local_teams(id) on delete restrict,
  away_team_id uuid not null references public.local_teams(id) on delete restrict,
  venue_id uuid references public.local_venues(id) on delete set null,
  round_label text,
  scheduled_date date,
  kickoff_time_text text,
  kickoff_at timestamptz,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'live', 'finished', 'postponed', 'cancelled')),
  home_score integer check (home_score is null or home_score >= 0),
  away_score integer check (away_score is null or away_score >= 0),
  home_penalties integer check (home_penalties is null or home_penalties >= 0),
  away_penalties integer check (away_penalties is null or away_penalties >= 0),
  verification_status text not null default 'verified'
    check (verification_status in ('verified', 'corrected', 'disputed')),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, source_match_index),
  check (home_team_id <> away_team_id)
);

create table if not exists public.local_match_events (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null references public.local_fixtures(id) on delete cascade,
  team_id uuid references public.local_teams(id) on delete set null,
  event_type text not null default 'goal' check (event_type in ('goal', 'own_goal', 'penalty_goal')),
  player_name text not null,
  minute_text text,
  assist_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.local_standing_rows (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.local_football_sources(id) on delete restrict,
  competition_id uuid not null references public.local_competitions(id) on delete cascade,
  team_id uuid not null references public.local_teams(id) on delete restrict,
  position integer not null check (position > 0),
  played integer,
  won integer,
  drawn integer,
  lost integer,
  goals_for integer,
  goals_against integer,
  goal_difference integer,
  points integer,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (source_id, team_id)
);

create index if not exists local_fixtures_kickoff_idx on public.local_fixtures (scheduled_date, kickoff_at);
create index if not exists local_fixtures_competition_idx on public.local_fixtures (competition_id, scheduled_date);
create index if not exists local_events_fixture_idx on public.local_match_events (fixture_id);
create index if not exists local_standings_competition_idx on public.local_standing_rows (competition_id, position);
create index if not exists local_sources_status_idx on public.local_football_sources (workflow_status, created_at desc);

alter table public.local_football_sources enable row level security;
alter table public.local_competitions enable row level security;
alter table public.local_teams enable row level security;
alter table public.local_venues enable row level security;
alter table public.local_fixtures enable row level security;
alter table public.local_match_events enable row level security;
alter table public.local_standing_rows enable row level security;

create policy "Published local competitions are public"
  on public.local_competitions for select to anon, authenticated using (is_active);
create policy "Local teams are public"
  on public.local_teams for select to anon, authenticated using (true);
create policy "Local venues are public"
  on public.local_venues for select to anon, authenticated using (true);
create policy "Verified local fixtures are public"
  on public.local_fixtures for select to anon, authenticated
  using (verification_status in ('verified', 'corrected'));
create policy "Published local events are public"
  on public.local_match_events for select to anon, authenticated
  using (exists (
    select 1 from public.local_fixtures f
    where f.id = fixture_id and f.verification_status in ('verified', 'corrected')
  ));
create policy "Published local standings are public"
  on public.local_standing_rows for select to anon, authenticated using (true);

grant select on public.local_competitions, public.local_teams, public.local_venues,
  public.local_fixtures, public.local_match_events, public.local_standing_rows to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'local-football-sources',
  'local-football-sources',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

comment on table public.local_football_sources is
  'Private provenance and human-review record for OCR-extracted Kenyan football posters.';
comment on column public.local_football_sources.extraction_payload is
  'Machine-extracted draft. Never public until an editor verifies and publishes it.';
