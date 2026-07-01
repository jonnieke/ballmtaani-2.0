-- ═══════════════════════════════════════════════════════════════════════════
-- BallMtaani Redeem Engine — run once in Supabase SQL Editor
-- Self-contained: creates reward tables if missing, adds RPCs & columns.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Reward catalog table
create table if not exists reward_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category text not null default 'merch',
  cost_mtc integer not null,
  image_url text,
  partner text,
  stock integer,
  active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);

alter table reward_items enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'reward_items' and policyname = 'Active reward items are public'
  ) then
    create policy "Active reward items are public" on reward_items for select using (active = true);
  end if;
end $$;

-- 2. Redemption requests table
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
  status text default 'pending',
  admin_note text,
  fulfilled_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table reward_redemptions enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'reward_redemptions' and policyname = 'Users see own redemptions'
  ) then
    create policy "Users see own redemptions" on reward_redemptions for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'reward_redemptions' and policyname = 'Users create own redemptions'
  ) then
    create policy "Users create own redemptions" on reward_redemptions for insert with check (auth.uid() = user_id);
  end if;
end $$;

-- 3. Seed reward catalog (skips on conflict)
insert into reward_items (name, description, category, cost_mtc, partner, stock, sort_order) values
  ('Ksh 50 Airtime',   'Instant airtime top-up to any Kenyan network',               'airtime', 2500,  'credoFaster', null, 10),
  ('Ksh 100 Airtime',  'Instant airtime top-up to any Kenyan network',               'airtime', 5000,  'credoFaster', null, 11),
  ('Ksh 200 Airtime',  'Instant airtime top-up to any Kenyan network',               'airtime', 9500,  'credoFaster', null, 12),
  ('1 GB Data Bundle', '1GB data valid for 1 day — any Kenyan network',              'data',    2000,  'credoFaster', null, 20),
  ('2 GB Data Bundle', '2GB data valid for 7 days — any Kenyan network',             'data',    3800,  'credoFaster', null, 21),
  ('5 GB Data Bundle', '5GB data valid for 30 days — any Kenyan network',            'data',    8500,  'credoFaster', null, 22),
  ('BallMtaani T-Shirt',  'Official BallMtaani jersey — size M/L/XL, delivered Kenya', 'merch', 20000, 'BallMtaani',  100,  30),
  ('BallMtaani Hoodie',   'Premium BallMtaani hoodie — delivered within Kenya',         'merch', 35000, 'BallMtaani',  50,   31),
  ('BallMtaani Cap',      'Snapback cap with BallMtaani emblem — any colour',           'merch', 10000, 'BallMtaani',  200,  32)
on conflict do nothing;

-- 4. Add value_kes column (KES amount passed to Credofaster)
alter table reward_items add column if not exists value_kes integer;

-- Populate value_kes from seeded names ("Ksh 50 Airtime" → 50 etc.)
update reward_items set value_kes = 50  where name ilike 'Ksh 50%'  and category in ('airtime', 'data') and value_kes is null;
update reward_items set value_kes = 100 where name ilike 'Ksh 100%' and category in ('airtime', 'data') and value_kes is null;
update reward_items set value_kes = 200 where name ilike 'Ksh 200%' and category in ('airtime', 'data') and value_kes is null;
-- Data bundles: confirm correct KES amount with Credofaster, then update manually:
-- update reward_items set value_kes = 100 where name ilike '1 GB%' and category = 'data';
-- update reward_items set value_kes = 200 where name ilike '2 GB%' and category = 'data';
-- update reward_items set value_kes = 500 where name ilike '5 GB%' and category = 'data';

-- 5. Add credofaster_txn_id to redemptions
alter table reward_redemptions add column if not exists credofaster_txn_id text;

-- 6. Atomic coin deduction (prevents double-spend under concurrent requests)
create or replace function deduct_coins(p_user_id uuid, p_amount int)
returns boolean
language plpgsql
security definer
as $$
declare
  v_coins integer;
begin
  select coins into v_coins from profiles where id = p_user_id for update;
  if v_coins is null or v_coins < p_amount then
    return false;
  end if;
  update profiles set coins = coins - p_amount where id = p_user_id;
  return true;
end;
$$;

-- 7. Coin refund (used when Credofaster fails after coins were deducted)
create or replace function refund_coins(p_user_id uuid, p_amount int)
returns void
language plpgsql
security definer
as $$
begin
  update profiles set coins = coins + p_amount where id = p_user_id;
end;
$$;

-- 8. Grant execute permissions
grant execute on function deduct_coins(uuid, int) to authenticated, service_role;
grant execute on function refund_coins(uuid, int) to authenticated, service_role;
