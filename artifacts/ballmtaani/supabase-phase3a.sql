-- ==========================================
-- BALLMTAANI PHASE 3A MIGRATION: FAN IDENTITY & PREFERENCES
-- Additive tables and RLS policies for fan preference tracking
-- ==========================================

-- 1. USER FAVOURITE TEAMS
create table if not exists public.user_favourite_teams (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    team_id text not null,
    is_primary boolean default false,
    created_at timestamptz default now(),
    unique(user_id, team_id)
);

-- 2. USER FAVOURITE LEAGUES
create table if not exists public.user_favourite_leagues (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    league_id text not null,
    created_at timestamptz default now(),
    unique(user_id, league_id)
);

-- 3. USER PREFERENCES
create table if not exists public.user_preferences (
    user_id uuid primary key references auth.users(id) on delete cascade,
    language text default 'en',
    timezone text default 'Africa/Nairobi',
    public_profile boolean default true,
    notification_prefs jsonb default '{"kickoff": true, "goals": true, "predictions": true, "news": true}'::jsonb,
    onboarding_completed boolean default false,
    updated_at timestamptz default now()
);

-- ENABLE ROW LEVEL SECURITY
alter table public.user_favourite_teams enable row level security;
alter table public.user_favourite_leagues enable row level security;
alter table public.user_preferences enable row level security;

-- RLS POLICIES FOR USER FAVOURITE TEAMS
create policy "Users can read own favourite teams"
    on public.user_favourite_teams for select
    using (auth.uid() = user_id);

create policy "Users can insert own favourite teams"
    on public.user_favourite_teams for insert
    with check (auth.uid() = user_id);

create policy "Users can update own favourite teams"
    on public.user_favourite_teams for update
    using (auth.uid() = user_id);

create policy "Users can delete own favourite teams"
    on public.user_favourite_teams for delete
    using (auth.uid() = user_id);

-- RLS POLICIES FOR USER FAVOURITE LEAGUES
create policy "Users can read own favourite leagues"
    on public.user_favourite_leagues for select
    using (auth.uid() = user_id);

create policy "Users can insert own favourite leagues"
    on public.user_favourite_leagues for insert
    with check (auth.uid() = user_id);

create policy "Users can delete own favourite leagues"
    on public.user_favourite_leagues for delete
    using (auth.uid() = user_id);

-- RLS POLICIES FOR USER PREFERENCES
create policy "Users can read own preferences"
    on public.user_preferences for select
    using (auth.uid() = user_id);

create policy "Users can upsert own preferences"
    on public.user_preferences for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
