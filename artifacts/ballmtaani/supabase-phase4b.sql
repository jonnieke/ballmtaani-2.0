-- ==========================================
-- BALLMTAANI PHASE 4B MIGRATION: SUBSCRIPTIONS & PAYMENTS
-- Additive tables and RLS policies for subscription entitlements and payment transactions
-- ==========================================

-- 1. SUBSCRIPTIONS TABLE
create table if not exists public.subscriptions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    plan_id text not null, -- 'free', 'ballmtaani_plus', 'ballmtaani_pro'
    status text not null default 'active', -- 'active', 'grace_period', 'cancelled', 'expired'
    started_at timestamptz default now(),
    current_period_end timestamptz,
    provider text default 'mpesa',
    created_at timestamptz default now()
);

-- 2. PAYMENT TRANSACTIONS TABLE
create table if not exists public.payment_transactions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    subscription_id uuid references public.subscriptions(id),
    provider text not null, -- 'mpesa', 'card'
    provider_reference text,
    amount numeric(10, 2) not null,
    currency text default 'KES',
    status text not null default 'pending', -- 'pending', 'confirmed', 'failed', 'refunded'
    idempotency_key text not null unique,
    initiated_at timestamptz default now(),
    confirmed_at timestamptz
);

-- 3. PAYMENT WEBHOOK EVENTS TABLE
create table if not exists public.payment_webhook_events (
    id uuid primary key default uuid_generate_v4(),
    provider text not null,
    external_event_id text not null unique,
    payload_hash text not null,
    processing_status text default 'received',
    received_at timestamptz default now()
);

-- 4. ENTITLEMENTS TABLE
create table if not exists public.entitlements (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    feature text not null, -- 'reduced_ads', 'mchambuzi_unlimited', 'advanced_analysis', 'creator_tools'
    source text not null default 'subscription',
    starts_at timestamptz default now(),
    expires_at timestamptz
);

-- RLS POLICIES
alter table public.subscriptions enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.entitlements enable row level security;

create policy "Users can read own subscriptions"
    on public.subscriptions for select
    using (auth.uid() = user_id);

create policy "Users can read own payment transactions"
    on public.payment_transactions for select
    using (auth.uid() = user_id);

create policy "Users can read own entitlements"
    on public.entitlements for select
    using (auth.uid() = user_id);
