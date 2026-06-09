-- Fan Zone Polls Feature

-- 1. FAN ZONE POLLS TABLE
create table if not exists public.fan_zone_polls (
    id uuid primary key default uuid_generate_v4(),
    fan_zone_id text not null references public.fan_zones(id) on delete cascade,
    question text not null,
    options jsonb not null, -- array of {id, text}
    votes jsonb not null, -- object: {option_id: count}
    created_by uuid references auth.users(id),
    created_at timestamptz default now(),
    closes_at timestamptz,
    status text default 'active' -- 'active' | 'closed'
);

create index if not exists idx_fan_zone_polls_fan_zone_id on public.fan_zone_polls(fan_zone_id);
create index if not exists idx_fan_zone_polls_status on public.fan_zone_polls(status);
create index if not exists idx_fan_zone_polls_closes_at on public.fan_zone_polls(closes_at);

-- 2. POLL VOTES TABLE (Track individual votes for user history)
create table if not exists public.poll_votes (
    id uuid primary key default uuid_generate_v4(),
    poll_id uuid not null references public.fan_zone_polls(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    option_id text not null,
    created_at timestamptz default now(),
    unique(poll_id, user_id) -- One vote per user per poll
);

create index if not exists idx_poll_votes_poll_id on public.poll_votes(poll_id);
create index if not exists idx_poll_votes_user_id on public.poll_votes(user_id);

-- Enable realtime
alter publication supabase_realtime add table public.fan_zone_polls;
alter publication supabase_realtime add table public.poll_votes;

-- RLS Policies

-- fan_zone_polls: anyone can view, authenticated users can vote
alter table public.fan_zone_polls enable row level security;

create policy "Anyone can view polls"
    on public.fan_zone_polls for select
    using (true);

create policy "Only zone admins can create polls"
    on public.fan_zone_polls for insert
    with check (
        auth.uid() is not null and
        exists (
            select 1 from auth.users
            where id = auth.uid() and
            (raw_user_meta_data->>'role' = 'admin' or raw_user_meta_data->>'role' = 'editor')
        )
    );

create policy "Admins can update own polls"
    on public.fan_zone_polls for update
    using (created_by = auth.uid());

-- poll_votes: anyone authenticated can vote
alter table public.poll_votes enable row level security;

create policy "Anyone can view poll votes"
    on public.poll_votes for select
    using (true);

create policy "Authenticated users can vote"
    on public.poll_votes for insert
    with check (auth.uid() is not null);

create policy "Users can view own votes"
    on public.poll_votes for select
    using (user_id = auth.uid() or true);
