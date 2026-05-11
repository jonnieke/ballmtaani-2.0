
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. TEAMS TABLE
create table public.teams (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    logo_url text,
    color text,
    initial text,
    created_at timestamptz default now()
);

-- 2. MATCHES TABLE
create table public.matches (
    id uuid primary key default uuid_generate_v4(),
    home_team_id uuid references public.teams(id),
    away_team_id uuid references public.teams(id),
    home_score int default 0,
    away_score int default 0,
    minute int,
    league text,
    match_date timestamptz,
    status text default 'upcoming',
    possession jsonb,
    scorers jsonb,
    created_at timestamptz default now()
);

-- 3. PROFILES TABLE
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text,
    points int default 0,
    coins int default 0,
    streak int default 0,
    last_login_date date,
    country text,
    favorite_team text,
    created_at timestamptz default now()
);

-- 4. DEBATES TABLE
create table public.debates (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    left_option text,
    right_option text,
    left_image text,
    right_image text,
    left_votes int default 0,
    right_votes int default 0,
    total_votes int default 0,
    created_at timestamptz default now()
);

-- 5. FAN ZONES TABLE
create table public.fan_zones (
    id text primary key, -- e.g. 'arsenal', 'chelsea'
    name text not null,
    team_name text,
    logo text,
    logo_url text,
    color text,
    members_count int default 0,
    preview_text text,
    region text default 'Europe',
    created_at timestamptz default now()
);

-- 6. BANTER TABLE (Chat)
create table public.banter (
    id uuid primary key default uuid_generate_v4(),
    fan_zone_id text references public.fan_zones(id),
    user_id uuid references auth.users(id),
    content text not null,
    username text,
    author_name text,
    created_at timestamptz default now()
);

-- 6c. FAN DUELS TABLE
create table if not exists public.fan_duels (
    id uuid primary key default uuid_generate_v4(),
    challenger_name text not null,
    defender_name text not null,
    home_team text not null,
    away_team text not null,
    home_logo text,
    away_logo text,
    prediction text,
    brag_line text default 'Direct challenge',
    status text default 'pending',
    winner_name text,
    created_at timestamptz default now()
);

-- 6b. PREDICTIONS TABLE
create table public.predictions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade,
    match_id text not null,
    predicted_score text not null,
    actual_score text,
    result text default 'pending',
    coins_awarded int default 0,
    created_at timestamptz default now(),
    unique(user_id, match_id)
);

-- RLS SETTINGS (Disable for testing, Enable for production)
alter table public.teams enable row level security;
alter table public.matches enable row level security;
alter table public.profiles enable row level security;
alter table public.debates enable row level security;
alter table public.fan_zones enable row level security;
alter table public.banter enable row level security;
alter table public.predictions enable row level security;
alter table public.fan_duels enable row level security;

-- Public read access
create policy "Allow public read on teams" on public.teams for select using (true);
create policy "Allow public read on matches" on public.matches for select using (true);
create policy "Allow public read on profiles" on public.profiles for select using (true);
create policy "Allow public read on debates" on public.debates for select using (true);
create policy "Allow public read on fan_zones" on public.fan_zones for select using (true);
create policy "Allow public read on banter" on public.banter for select using (true);
create policy "Allow users to read own predictions" on public.predictions for select using (auth.uid() = user_id);
create policy "Allow public read on fan_duels" on public.fan_duels for select using (true);

-- Authenticated write access
create policy "Allow authenticated insert banter" on public.banter for insert with check (auth.uid() = user_id);
create policy "Allow users to update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Allow users to insert own predictions" on public.predictions for insert with check (auth.uid() = user_id);
create policy "Allow users to update own predictions" on public.predictions for update using (auth.uid() = user_id);
create policy "Allow authenticated insert fan_duels" on public.fan_duels for insert with check (auth.uid() is not null);

-- 7. AUTH TRIGGER (Fixes the 500 error on OTP/Signup)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, country)
  values (new.id, coalesce(split_part(new.email, '@', 1), new.phone, 'Fan'), 'KEN');
  return new;
end;
$$ language plpgsql security definer;

-- ==========================================
-- RAPID FIRE LIVE VOTES
-- ==========================================
create table if not exists public.rapid_fire_votes (
    debate_id text primary key,
    left_votes int not null default 0,
    right_votes int not null default 0,
    total_votes int not null default 0,
    updated_at timestamptz not null default now()
);

alter table public.rapid_fire_votes enable row level security;

create policy "Allow public read on rapid_fire_votes"
on public.rapid_fire_votes for select using (true);

create policy "Allow authenticated upsert on rapid_fire_votes"
on public.rapid_fire_votes for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

create or replace function public.increment_rapid_fire_vote(
  p_debate_id text,
  p_side text
)
returns void as $$
begin
  insert into public.rapid_fire_votes (debate_id, left_votes, right_votes, total_votes, updated_at)
  values (
    p_debate_id,
    case when p_side = 'left' then 1 else 0 end,
    case when p_side = 'right' then 1 else 0 end,
    1,
    now()
  )
  on conflict (debate_id) do update
  set
    left_votes = public.rapid_fire_votes.left_votes + case when p_side = 'left' then 1 else 0 end,
    right_votes = public.rapid_fire_votes.right_votes + case when p_side = 'right' then 1 else 0 end,
    total_votes = public.rapid_fire_votes.total_votes + 1,
    updated_at = now();
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- SEED DATA (Optional, but helpful)
insert into public.fan_zones (id, name, team_name, logo, logo_url, color, members_count, preview_text, region) values 
('arsenal', 'Arsenal', 'Arsenal', 'https://media.api-sports.io/football/teams/42.png', 'https://media.api-sports.io/football/teams/42.png', '#EF0107', 1200000, 'North London arguments, Nairobi volume.', 'Europe'),
('chelsea', 'Chelsea', 'Chelsea', 'https://media.api-sports.io/football/teams/49.png', 'https://media.api-sports.io/football/teams/49.png', '#034694', 980000, 'Transfer takes, matchday hope, and blue loyalty.', 'Europe'),
('man-utd', 'Man United', 'Man United', 'https://media.api-sports.io/football/teams/33.png', 'https://media.api-sports.io/football/teams/33.png', '#DA291C', 1500000, 'United fans debating the rebuild every weekend.', 'Europe'),
('gor-mahia', 'Gor Mahia', 'Gor Mahia', 'https://media.api-sports.io/football/teams/1063.png', 'https://media.api-sports.io/football/teams/1063.png', '#006400', 450000, 'K''Ogalo pride, derby receipts, and matchday noise.', 'Africa'),
('afc-leopards', 'AFC Leopards', 'AFC Leopards', 'https://media.api-sports.io/football/teams/1064.png', 'https://media.api-sports.io/football/teams/1064.png', '#0000FF', 380000, 'Ingwe faithful tracking every result and rivalry.', 'Africa')
on conflict (id) do nothing;

-- ==========================================
-- PHASE 5: TOURNAMENTS & NOTIFICATIONS
-- ==========================================

-- 8. TOURNAMENT WINNERS TABLE
create table public.tournament_winners (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id),
    username text,
    rank int,
    prize_amount int,
    week_start timestamptz,
    week_end timestamptz,
    created_at timestamptz default now()
);

-- 9. PUSH SUBSCRIPTIONS TABLE
create table public.push_subscriptions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade,
    endpoint text not null unique,
    p256dh text,
    auth text,
    created_at timestamptz default now()
);

-- RLS for Push Subscriptions
alter table public.push_subscriptions enable row level security;
create policy "Users can manage own push subscriptions" 
on public.push_subscriptions for all 
using (auth.uid() = user_id) 
with check (auth.uid() = user_id);

-- 10. RPC: PROCESS WEEKLY TOURNAMENT
-- This function finds the top 3 users by points, awards them MTC, logs the win, and resets points.
create or replace function public.process_weekly_tournament()
returns void as $$
declare
    v_user record;
    v_rank int := 1;
    v_prize int;
begin
    -- Loop through top 3 users based on points
    for v_user in (select id, username, coins from public.profiles order by coins desc nulls last limit 3)
    loop
        -- Determine prize
        if v_rank = 1 then v_prize := 50000;
        elsif v_rank = 2 then v_prize := 20000;
        elsif v_rank = 3 then v_prize := 10000;
        end if;

        -- Log winner
        insert into public.tournament_winners (user_id, username, rank, prize_amount, week_end)
        values (v_user.id, v_user.username, v_rank, v_prize, now());

        v_rank := v_rank + 1;
    end loop;

    -- Reset points for all users
    update public.profiles set points = 0;
end;
$$ language plpgsql security definer;
