create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  push_enabled boolean not null default false,
  email_enabled boolean not null default false,
  whatsapp_enabled boolean not null default false,
  breaking_news boolean not null default true,
  kickoff_reminders boolean not null default true,
  lineup_alerts boolean not null default true,
  goal_alerts boolean not null default false,
  red_card_alerts boolean not null default true,
  full_time_results boolean not null default true,
  prediction_results boolean not null default true,
  daily_digest boolean not null default true,
  evening_digest boolean not null default true,
  all_major_matches boolean not null default false,
  quiet_hours_enabled boolean not null default true,
  quiet_start time without time zone not null default '23:00',
  quiet_end time without time zone not null default '06:30',
  timezone text not null default 'Africa/Nairobi',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

create policy "Users read own notification preferences"
  on public.notification_preferences for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert own notification preferences"
  on public.notification_preferences for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update own notification preferences"
  on public.notification_preferences for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete own notification preferences"
  on public.notification_preferences for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.notification_preferences to authenticated;
grant all on public.notification_preferences to service_role;

create table if not exists public.notification_follows (
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('team', 'league', 'match')),
  entity_id text not null,
  entity_name text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, entity_type, entity_id)
);

create index if not exists notification_follows_entity_idx
  on public.notification_follows(entity_type, entity_id);

alter table public.notification_follows enable row level security;

create policy "Users read own notification follows"
  on public.notification_follows for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert own notification follows"
  on public.notification_follows for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users delete own notification follows"
  on public.notification_follows for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, delete on public.notification_follows to authenticated;
grant all on public.notification_follows to service_role;

create table if not exists public.notification_consent_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null check (channel in ('push', 'email', 'whatsapp', 'telegram', 'sms')),
  action text not null check (action in ('granted', 'withdrawn')),
  purpose text not null,
  source text not null default 'notification_preferences',
  policy_version text not null default '2026-08-20',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists notification_consent_user_idx
  on public.notification_consent_events(user_id, created_at desc);

alter table public.notification_consent_events enable row level security;

create policy "Users read own notification consent"
  on public.notification_consent_events for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users record own notification consent"
  on public.notification_consent_events for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

grant select, insert on public.notification_consent_events to authenticated;
grant all on public.notification_consent_events to service_role;

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  unsubscribe_token uuid not null default gen_random_uuid() unique,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  status text not null default 'active' check (status in ('active', 'unsubscribed', 'bounced', 'complained')),
  morning_digest boolean not null default true,
  evening_digest boolean not null default true,
  breaking_news boolean not null default false,
  source text not null default 'notifications_page',
  consent_text text not null,
  consented_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.newsletter_subscribers
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid();

create unique index if not exists newsletter_subscribers_unsubscribe_token_unique
  on public.newsletter_subscribers(unsubscribe_token);

create unique index if not exists newsletter_subscribers_email_unique
  on public.newsletter_subscribers(lower(email));

alter table public.newsletter_subscribers enable row level security;

create policy "Users read own newsletter subscription"
  on public.newsletter_subscribers for select
  to authenticated
  using ((select auth.uid()) = user_id);

grant select on public.newsletter_subscribers to authenticated;
grant all on public.newsletter_subscribers to service_role;

create table if not exists public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  event_key text not null,
  event_type text not null,
  channel text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'partial', 'failed')),
  eligible_count integer not null default 0,
  sent_count integer not null default 0,
  failed_count integer not null default 0,
  scheduled_for timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_key, channel)
);

create index if not exists notification_outbox_status_idx
  on public.notification_outbox(status, scheduled_for);

alter table public.notification_outbox enable row level security;
revoke all on public.notification_outbox from anon, authenticated;
grant all on public.notification_outbox to service_role;

create table if not exists public.notification_deliveries (
  id bigint generated always as identity primary key,
  outbox_id uuid references public.notification_outbox(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  channel text not null,
  status text not null check (status in ('sent', 'failed', 'expired', 'skipped')),
  provider_message_id text,
  error_code text,
  created_at timestamptz not null default now()
);

create index if not exists notification_deliveries_outbox_idx
  on public.notification_deliveries(outbox_id, status);

alter table public.notification_deliveries enable row level security;
revoke all on public.notification_deliveries from anon, authenticated;
grant all on public.notification_deliveries to service_role;
grant usage, select on sequence public.notification_deliveries_id_seq to service_role;
