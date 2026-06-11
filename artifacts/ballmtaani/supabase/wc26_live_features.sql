-- WC26 Live Match Engagement Features

-- 0. ALTER PREDICTIONS TABLE (add status field if not exists)
alter table if exists public.predictions add column if not exists status text default 'locked';

-- 1. MATCH COMMENTS TABLE
create table if not exists public.match_comments (
    id uuid primary key default uuid_generate_v4(),
    match_id text not null,
    user_id uuid references auth.users(id) on delete cascade,
    user_name text not null,
    text text not null,
    reaction text, -- 'goal' | 'save' | 'tackle' | 'yellow' | 'red'
    likes int default 0,
    created_at timestamptz default now()
);

create index if not exists idx_match_comments_match_id on public.match_comments(match_id);
create index if not exists idx_match_comments_created_at on public.match_comments(created_at desc);

-- 2. MATCH REPORTS TABLE
create table if not exists public.match_reports (
    id uuid primary key default uuid_generate_v4(),
    match_id text not null unique,
    summary text,
    goals jsonb, -- array of goal scorers
    standout_players jsonb, -- array of player names
    stats jsonb, -- array of {category, home, away} objects
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_match_reports_match_id on public.match_reports(match_id);

-- 3. PREDICTION STATS TABLE (for leaderboard)
create table if not exists public.prediction_stats (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade unique,
    display_name text,
    correct_count int default 0,
    total_predictions int default 0,
    accuracy_pct decimal(5,2) default 0,
    updated_at timestamptz default now()
);

create index if not exists idx_prediction_stats_correct_count on public.prediction_stats(correct_count desc);
create index if not exists idx_prediction_stats_accuracy on public.prediction_stats(accuracy_pct desc);

-- Enable realtime for these tables
alter publication supabase_realtime add table public.match_comments;
alter publication supabase_realtime add table public.match_reports;
alter publication supabase_realtime add table public.prediction_stats;

-- RLS Policies

-- match_comments: anyone can view, authenticated users can insert
alter table public.match_comments enable row level security;

create policy "Anyone can view match comments"
    on public.match_comments for select
    using (true);

create policy "Authenticated users can insert match comments"
    on public.match_comments for insert
    with check (auth.uid() is not null);

-- match_reports: anyone can view
alter table public.match_reports enable row level security;

create policy "Anyone can view match reports"
    on public.match_reports for select
    using (true);

-- prediction_stats: anyone can view
alter table public.prediction_stats enable row level security;

create policy "Anyone can view prediction stats"
    on public.prediction_stats for select
    using (true);

-- 4. PUSH ALERTS SENT TABLE (deduplication for kickoff notifications)
create table if not exists public.push_alerts_sent (
    fixture_id text primary key,
    sent_at timestamptz default now()
);
