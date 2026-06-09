-- BallMtaani Supabase Schema
-- Paste this entire script into Supabase Dashboard > SQL Editor and run

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PREDICTIONS TABLE (Core feature - WC26 + match predictions)
create table if not exists predictions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  match_id text not null,
  predicted_score text,
  result text, -- 'correct', 'partial', 'incorrect', null
  actual_score text,
  coins_awarded integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, match_id)
);

-- 2. PUSH_SUBSCRIPTIONS TABLE (Web push notifications)
create table if not exists push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  endpoint text not null unique,
  auth text not null,
  p256dh text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. DEBATES TABLE (Community debate feature)
create table if not exists debates (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  left_option text,
  left text,
  right_option text,
  right text,
  left_image text,
  right_image text,
  left_votes integer default 0,
  right_votes integer default 0,
  total_votes integer default 0,
  author text default 'BallMtaani',
  status text default 'active', -- 'active', 'live', 'closed', 'pending_review'
  interaction_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 4. FAN_DUELS TABLE (1v1 prediction challenges)
create table if not exists fan_duels (
  id uuid primary key default uuid_generate_v4(),
  challenger_name text not null,
  defender_name text not null,
  home_team text not null,
  away_team text not null,
  home_logo text,
  away_logo text,
  prediction text,
  status text default 'pending', -- 'pending', 'active', 'completed'
  brag_line text,
  winner_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 5. FAN_ZONES TABLE (Community groups/zones)
create table if not exists fan_zones (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  founder_id uuid,
  member_count integer default 1,
  banner_color text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 6. RAPID_FIRE_VOTES TABLE (Quick polls)
create table if not exists rapid_fire_votes (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  option_a text not null,
  option_b text not null,
  votes_a integer default 0,
  votes_b integer default 0,
  status text default 'active', -- 'active', 'closed'
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 7. WAR_ROOM_DAILY TABLE (Daily consensus predictions)
create table if not exists war_room_daily (
  id uuid primary key default uuid_generate_v4(),
  date date not null unique,
  featured_match text not null,
  consensus_prediction text,
  total_participants integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 8. BANTER TABLE (Community banter/comments)
create table if not exists banter (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  content text not null,
  match_id text,
  debate_id uuid,
  likes integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 9. DEBATE_SUGGESTIONS TABLE (Community-submitted debate ideas)
create table if not exists debate_suggestions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  title text not null,
  left_option text not null,
  right_option text not null,
  status text default 'pending', -- 'pending', 'approved', 'rejected'
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Set up Row Level Security (RLS) for privacy
alter table predictions enable row level security;
alter table push_subscriptions enable row level security;
alter table banter enable row level security;
alter table debate_suggestions enable row level security;

-- RLS Policies: Users can only see/modify their own data
create policy "Users can view own predictions"
  on predictions for select
  using (auth.uid() = user_id or true); -- Allow public read for now, can restrict later

create policy "Users can insert own predictions"
  on predictions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own predictions"
  on predictions for update
  using (auth.uid() = user_id);

create policy "Users can view own push subscriptions"
  on push_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own push subscriptions"
  on push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own push subscriptions"
  on push_subscriptions for delete
  using (auth.uid() = user_id);

create policy "Users can insert own banter"
  on banter for insert
  with check (auth.uid() = user_id);

create policy "Users can view all banter"
  on banter for select
  using (true);

create policy "Users can insert debate suggestions"
  on debate_suggestions for insert
  with check (auth.uid() = user_id);

-- Create indexes for performance
create index if not exists idx_predictions_user_id on predictions(user_id);
create index if not exists idx_predictions_match_id on predictions(match_id);
create index if not exists idx_push_subscriptions_user_id on push_subscriptions(user_id);
create index if not exists idx_debates_status on debates(status);
create index if not exists idx_fan_duels_status on fan_duels(status);
create index if not exists idx_banter_match_id on banter(match_id);
create index if not exists idx_banter_debate_id on banter(debate_id);

-- Seed: Create one test debate for the Debates page
insert into debates (title, left_option, right_option, left_votes, right_votes, total_votes, status)
values (
  'Best African team at WC26?',
  'Morocco',
  'Senegal',
  450,
  380,
  830,
  'active'
) on conflict do nothing;

insert into debates (title, left_option, right_option, left_votes, right_votes, total_votes, status)
values (
  'Will Kenya make WC28?',
  'Yes, they''ll qualify',
  'Not this cycle',
  520,
  320,
  840,
  'active'
) on conflict do nothing;

-- ─────────────────────────── PARTNER ARTICLES SYSTEM ─────────────────────────

-- Partner teams approved to publish articles on BallMtaani
create table if not exists partner_teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  logo_url text,
  description text,
  contact_email text,
  approved boolean default false,
  created_at timestamp with time zone default now()
);

-- Articles written by partner teams (internal — keeps users on-platform)
create table if not exists articles (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  content text not null,
  excerpt text,
  thumbnail_url text,
  author_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  partner_team_id uuid references partner_teams(id) on delete set null,
  partner_team_name text,
  tags text[] default '{}',
  is_wc26 boolean default false,
  status text default 'draft',
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table articles enable row level security;
create policy "Published articles are public" on articles
  for select using (status = 'published');
create policy "Authors manage own articles" on articles
  for all using (auth.uid() = author_id);

alter table partner_teams enable row level security;
create policy "Partner teams are public" on partner_teams
  for select using (true);

-- ─────────────────────────── REWARDS ENGINE ──────────────────────────────

-- Reward catalog (managed by admins)
create table if not exists reward_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category text not null default 'merch', -- 'merch' | 'airtime' | 'data' | 'digital'
  cost_mtc integer not null,
  image_url text,
  partner text,          -- e.g. 'credoFaster', 'BallMtaani'
  stock integer,         -- null = unlimited
  active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);

alter table reward_items enable row level security;
create policy "Active reward items are public" on reward_items
  for select using (active = true);

-- User redemption requests
create table if not exists reward_redemptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  display_name text,
  item_id uuid references reward_items(id) on delete set null,
  item_name text not null,
  item_category text not null,
  cost_mtc integer not null,
  contact_phone text,
  delivery_address text,
  delivery_name text,
  notes text,
  status text default 'pending',    -- 'pending' | 'processing' | 'fulfilled' | 'cancelled'
  admin_note text,
  fulfilled_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table reward_redemptions enable row level security;
create policy "Users see own redemptions" on reward_redemptions
  for select using (auth.uid() = user_id);
create policy "Users create own redemptions" on reward_redemptions
  for insert with check (auth.uid() = user_id);

-- Seed reward catalog
insert into reward_items (name, description, category, cost_mtc, partner, stock, sort_order) values
  ('Ksh 50 Airtime',        'Instant airtime top-up to any Kenyan network',               'airtime', 2500,  'credoFaster', null, 10),
  ('Ksh 100 Airtime',       'Instant airtime top-up to any Kenyan network',               'airtime', 5000,  'credoFaster', null, 11),
  ('Ksh 200 Airtime',       'Instant airtime top-up to any Kenyan network',               'airtime', 9500,  'credoFaster', null, 12),
  ('1 GB Data Bundle',      '1GB data valid for 1 day — any Kenyan network',              'data',    2000,  'credoFaster', null, 20),
  ('2 GB Data Bundle',      '2GB data valid for 7 days — any Kenyan network',             'data',    3800,  'credoFaster', null, 21),
  ('5 GB Data Bundle',      '5GB data valid for 30 days — any Kenyan network',            'data',    8500,  'credoFaster', null, 22),
  ('BallMtaani T-Shirt',    'Official BallMtaani jersey — size M/L/XL, delivered Kenya',  'merch',   20000, 'BallMtaani',  100,  30),
  ('BallMtaani Hoodie',     'Premium BallMtaani hoodie — delivered within Kenya',         'merch',   35000, 'BallMtaani',  50,   31),
  ('BallMtaani Cap',        'Snapback cap with BallMtaani emblem — any colour',           'merch',   10000, 'BallMtaani',  200,  32)
on conflict do nothing;

-- Direct sponsor ad campaigns (override AdSense when active)
create table if not exists ad_campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  advertiser text,
  image_url text,
  destination_url text not null,
  cta_text text default 'Learn More',
  label text default 'Sponsor',
  placement text not null default 'horizontal',
  status text default 'active',
  priority integer default 0,
  starts_at timestamp with time zone default now(),
  ends_at timestamp with time zone,
  impressions integer default 0,
  clicks integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table ad_campaigns enable row level security;
create policy "Active ad campaigns are public" on ad_campaigns
  for select using (status = 'active');
