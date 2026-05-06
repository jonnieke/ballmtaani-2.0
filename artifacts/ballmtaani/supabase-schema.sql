
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
    streak int default 0,
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
    left_votes int default 0,
    right_votes int default 0,
    total_votes int default 0,
    created_at timestamptz default now()
);

-- 5. FAN ZONES TABLE
create table public.fan_zones (
    id text primary key, -- e.g. 'arsenal', 'chelsea'
    name text not null,
    logo text,
    created_at timestamptz default now()
);

-- 6. BANTER TABLE (Chat)
create table public.banter (
    id uuid primary key default uuid_generate_v4(),
    fan_zone_id text references public.fan_zones(id),
    user_id uuid references auth.users(id),
    content text not null,
    username text,
    created_at timestamptz default now()
);

-- RLS SETTINGS (Disable for testing, Enable for production)
alter table public.teams enable row level security;
alter table public.matches enable row level security;
alter table public.profiles enable row level security;
alter table public.debates enable row level security;
alter table public.fan_zones enable row level security;
alter table public.banter enable row level security;

-- Public read access
create policy "Allow public read on teams" on public.teams for select using (true);
create policy "Allow public read on matches" on public.matches for select using (true);
create policy "Allow public read on profiles" on public.profiles for select using (true);
create policy "Allow public read on debates" on public.debates for select using (true);
create policy "Allow public read on fan_zones" on public.fan_zones for select using (true);
create policy "Allow public read on banter" on public.banter for select using (true);

-- Authenticated write access
create policy "Allow authenticated insert banter" on public.banter for insert with check (auth.uid() = user_id);
create policy "Allow users to update own profile" on public.profiles for update using (auth.uid() = id);

-- 7. AUTH TRIGGER (Fixes the 500 error on OTP/Signup)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, country)
  values (new.id, split_part(new.email, '@', 1), 'KEN');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- SEED DATA (Optional, but helpful)
insert into public.fan_zones (id, name, logo) values 
('arsenal', 'Arsenal', 'https://media.api-sports.io/football/teams/42.png'),
('chelsea', 'Chelsea', 'https://media.api-sports.io/football/teams/49.png'),
('man-utd', 'Man United', 'https://media.api-sports.io/football/teams/33.png');
