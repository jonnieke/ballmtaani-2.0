-- Correct reviewed poster transcription issues and establish a private talent
-- nomination workflow. Public profiles are a separate, explicitly approved set.

do $$
declare
  v_source_id uuid;
  v_fixture_id uuid;
  v_rada_team_id uuid;
begin
  select id into v_source_id
  from public.local_football_sources
  where asset_path = 'manual://ballmtaani/2026-08-27/pedeshee-wauna-super-cup-batch';

  if v_source_id is not null then
    -- The same Mawe Sacco 1-4 Rada Sports result appeared on two supplied
    -- posters. Keep the Zone B record, which carries the printed kickoff time.
    delete from public.local_fixtures
    where source_id = v_source_id and source_match_index = 1;

    -- The round-of-16 poster shows Mbotela Kamaliza 1-0 Michezo Halisi.
    update public.local_fixtures
    set scheduled_date = null,
        kickoff_time_text = null,
        home_score = 1,
        away_score = 0,
        round_label = 'Pedeshee Wauna Super Cup · Round of 16',
        verification_status = 'corrected',
        venue_id = null,
        updated_at = now()
    where source_id = v_source_id and source_match_index = 10;

    -- Two semi-final posters conflict on the Maziwa v Mbotela venue. Preserve
    -- the fixture while withholding an unverified venue.
    update public.local_fixtures
    set venue_id = null,
        verification_status = 'corrected',
        updated_at = now()
    where source_id = v_source_id and source_match_index = 16;

    select id into v_fixture_id from public.local_fixtures
    where source_id = v_source_id and source_match_index = 3;
    select id into v_rada_team_id from public.local_teams where slug = 'rada-sports';

    if v_fixture_id is not null then
      delete from public.local_match_events where fixture_id = v_fixture_id;
      insert into public.local_match_events
        (fixture_id, team_id, event_type, player_name, assist_name)
      values
        (v_fixture_id, v_rada_team_id, 'goal', 'Denzel', 'Ofamba'),
        (v_fixture_id, v_rada_team_id, 'goal', 'David', null),
        (v_fixture_id, v_rada_team_id, 'goal', 'Mwakio', 'Shaban'),
        (v_fixture_id, v_rada_team_id, 'goal', 'Denzel', 'Shady');
    end if;
  end if;
end $$;

create table if not exists public.talent_nominations (
  id uuid primary key default gen_random_uuid(),
  player_name text not null check (char_length(player_name) between 2 and 120),
  institution text not null check (char_length(institution) between 2 and 160),
  position text not null check (position in (
    'Striker', 'Winger', 'Central Midfielder', 'Defensive Midfielder',
    'Center Back', 'Full Back', 'Goalkeeper'
  )),
  county text not null check (char_length(county) between 2 and 100),
  contact_phone text not null check (contact_phone ~ '^\+?254[17][0-9]{8}$'),
  evidence_notes text check (evidence_notes is null or char_length(evidence_notes) <= 1000),
  submission_fingerprint text not null unique,
  consent_confirmed boolean not null check (consent_confirmed),
  review_status text not null default 'pending'
    check (review_status in ('pending', 'reviewing', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.talent_profiles (
  id uuid primary key default gen_random_uuid(),
  nomination_id uuid unique references public.talent_nominations(id) on delete set null,
  slug text not null unique,
  player_name text not null,
  institution text not null,
  position text not null,
  county text not null,
  image_url text,
  summary text,
  verified_statistics jsonb not null default '{}'::jsonb,
  verification_note text not null,
  profile_status text not null default 'draft'
    check (profile_status in ('draft', 'verified', 'archived')),
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists talent_nominations_review_idx
  on public.talent_nominations (review_status, created_at desc);
create index if not exists talent_profiles_public_idx
  on public.talent_profiles (profile_status, published_at desc);

alter table public.talent_nominations enable row level security;
alter table public.talent_profiles enable row level security;

-- Nominations contain a private phone number. The browser submits through a
-- validated server endpoint using the service role; no client role receives
-- direct table privileges.
revoke all on public.talent_nominations from anon, authenticated;

revoke insert, update, delete, truncate, references, trigger
  on public.talent_profiles from anon, authenticated;
grant select on public.talent_profiles to anon, authenticated;
drop policy if exists "Verified talent profiles are public" on public.talent_profiles;
create policy "Verified talent profiles are public"
  on public.talent_profiles for select to anon, authenticated
  using (
    profile_status = 'verified'
    and published_at is not null
    and published_at <= now()
  );

comment on table public.talent_nominations is
  'Private talent leads awaiting editorial and safeguarding review. Contains contact PII.';
comment on table public.talent_profiles is
  'Public talent profiles created only after evidence and identity review.';

-- A verified row must also belong to a source whose editorial workflow is
-- fully published. This prevents OCR drafts becoming readable mid-process.
drop policy if exists "Verified local fixtures are public" on public.local_fixtures;
create policy "Verified local fixtures are public"
  on public.local_fixtures for select to anon, authenticated
  using (
    verification_status in ('verified', 'corrected')
    and exists (
      select 1 from public.local_football_sources source
      where source.id = public.local_fixtures.source_id and source.workflow_status = 'published'
    )
  );

drop policy if exists "Published local events are public" on public.local_match_events;
create policy "Published local events are public"
  on public.local_match_events for select to anon, authenticated
  using (exists (
    select 1
    from public.local_fixtures fixture
    join public.local_football_sources source on source.id = fixture.source_id
    where fixture.id = public.local_match_events.fixture_id
      and fixture.verification_status in ('verified', 'corrected')
      and source.workflow_status = 'published'
  ));

drop policy if exists "Published local standings are public" on public.local_standing_rows;
create policy "Published local standings are public"
  on public.local_standing_rows for select to anon, authenticated
  using (exists (
    select 1 from public.local_football_sources source
    where source.id = public.local_standing_rows.source_id and source.workflow_status = 'published'
  ));
