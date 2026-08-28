-- Distinguish editorial intake channels and retain stable provider identifiers
-- so repeated API imports update the same fixture instead of duplicating it.

alter table public.local_football_sources
  drop constraint if exists local_football_sources_source_type_check;
alter table public.local_football_sources
  add constraint local_football_sources_source_type_check
  check (source_type in (
    'organizer_poster', 'club_poster', 'school_poster', 'reporter', 'other',
    'manual_entry', 'text_report', 'api_football'
  ));

alter table public.local_fixtures
  add column if not exists external_provider text,
  add column if not exists external_fixture_id bigint;

alter table public.local_fixtures
  drop constraint if exists local_fixtures_external_provider_id_key;
alter table public.local_fixtures
  add constraint local_fixtures_external_provider_id_key
  unique (external_provider, external_fixture_id);

comment on column public.local_fixtures.external_provider is
  'Stable upstream provider name. Null for organizer and manually entered records.';
comment on column public.local_fixtures.external_fixture_id is
  'Provider fixture identifier used to make repeated imports idempotent.';

