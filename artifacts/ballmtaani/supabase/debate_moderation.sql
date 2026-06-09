-- Debate Moderation System

-- 1. DEBATE MODERATION TABLE
create table if not exists public.debate_moderation (
    id uuid primary key default uuid_generate_v4(),
    debate_id uuid not null references public.debates(id) on delete cascade unique,
    is_pinned boolean default false,
    pin_reason text,
    pinned_by uuid references auth.users(id),
    pinned_at timestamptz,
    is_flagged boolean default false,
    flag_reason text, -- 'spam' | 'inappropriate' | 'misinformation' | 'duplicate'
    flag_count int default 0,
    flagged_by uuid references auth.users(id),
    flagged_at timestamptz,
    status text default 'active', -- 'active' | 'hidden' | 'deleted'
    admin_notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_debate_moderation_debate_id on public.debate_moderation(debate_id);
create index if not exists idx_debate_moderation_is_pinned on public.debate_moderation(is_pinned);
create index if not exists idx_debate_moderation_status on public.debate_moderation(status);
create index if not exists idx_debate_moderation_flag_count on public.debate_moderation(flag_count desc);

-- 2. DEBATE FLAGS TABLE (Track individual flags)
create table if not exists public.debate_flags (
    id uuid primary key default uuid_generate_v4(),
    debate_id uuid not null references public.debates(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    reason text not null, -- 'spam' | 'inappropriate' | 'misinformation' | 'duplicate'
    details text,
    created_at timestamptz default now(),
    unique(debate_id, user_id) -- One flag per user per debate
);

create index if not exists idx_debate_flags_debate_id on public.debate_flags(debate_id);
create index if not exists idx_debate_flags_user_id on public.debate_flags(user_id);
create index if not exists idx_debate_flags_reason on public.debate_flags(reason);

-- Enable realtime
alter publication supabase_realtime add table public.debate_moderation;
alter publication supabase_realtime add table public.debate_flags;

-- RLS Policies

-- debate_moderation: anyone can view, only admins can modify
alter table public.debate_moderation enable row level security;

create policy "Anyone can view debate moderation"
    on public.debate_moderation for select
    using (true);

create policy "Only admins can update moderation"
    on public.debate_moderation for update
    using (
        auth.uid() is not null and
        exists (
            select 1 from auth.users
            where id = auth.uid() and
            raw_user_meta_data->>'role' = 'admin'
        )
    );

create policy "Only admins can insert moderation"
    on public.debate_moderation for insert
    with check (
        auth.uid() is not null and
        exists (
            select 1 from auth.users
            where id = auth.uid() and
            raw_user_meta_data->>'role' = 'admin'
        )
    );

-- debate_flags: anyone can view, authenticated users can flag
alter table public.debate_flags enable row level security;

create policy "Anyone can view debate flags"
    on public.debate_flags for select
    using (true);

create policy "Authenticated users can flag debates"
    on public.debate_flags for insert
    with check (auth.uid() is not null);
