-- Organizer-poster transcription supplied by BallMtaani editorial desk.
-- Dates absent from a poster intentionally remain NULL; do not infer them.
do $$
declare
  source_id uuid;
  competition_id uuid;
  venue_id uuid;
  home_id uuid;
  away_id uuid;
begin
  insert into public.local_football_sources (
    source_name, source_type, original_filename, asset_path, mime_type,
    document_type, workflow_status, extraction_confidence, extraction_payload,
    verified_at, published_at
  ) values (
    'Pedeshee Wauna Super Cup organizer posters', 'organizer_poster',
    'whatsapp-pedeshee-wauna-super-cup-batch.jpeg',
    'manual://ballmtaani/2026-08-27/pedeshee-wauna-super-cup-batch',
    'image/jpeg', 'multi_result', 'published', 0.98,
    jsonb_build_object(
      'competition', 'Pedeshee Wauna Super Cup',
      'source_note', 'Transcribed from organizer posters supplied to BallMtaani on 27 August 2026.',
      'date_policy', 'Only dates printed on the posters were recorded.'
    ), now(), now()
  ) on conflict (asset_path) do update set
    workflow_status = 'published', published_at = now(), updated_at = now()
  returning id into source_id;

  select id into competition_id from public.local_competitions where slug = 'pedeshee-wauna-super-cup';
  if competition_id is null then
    insert into public.local_competitions (slug, name, short_name, season_label, locality, county)
    values ('pedeshee-wauna-super-cup', 'Pedeshee Wauna Super Cup', 'Pedeshee Super Cup', '2026', 'Nairobi', 'Nairobi')
    returning id into competition_id;
  end if;

  insert into public.local_venues (slug, name, locality, county)
  values
    ('lower-jericho-grounds', 'Lower Jericho Grounds', 'Jericho', 'Nairobi'),
    ('nindo-grounds-jericho', 'Nindo Grounds Jericho', 'Jericho', 'Nairobi'),
    ('st-patrick-grounds-maringo', 'St Patrick Grounds', 'Maringo', 'Nairobi')
  on conflict (slug) do nothing;

  -- Teams named on the supplied posters.
  insert into public.local_teams (slug, name, short_name)
  values
    ('mawe-sacco', 'Mawe Sacco', 'Mawe'),
    ('rada-sports', 'Rada Sports', 'Rada'),
    ('hakati-sportif', 'Hakati Sportif', 'Hakati'),
    ('jasa', 'Jasa', 'Jasa'),
    ('maziwa-county-fc', 'Maziwa County FC', 'Maziwa County'),
    ('salem-sportif', 'Salem Sportif', 'Salem'),
    ('makongeni-elite', 'Makongeni Elite', 'Makongeni'),
    ('maringo-united', 'Maringo United', 'Maringo'),
    ('a1000-sportiff', 'A1000 Sportiff', 'A1000'),
    ('shy-fc', 'Shy FC', 'Shy'),
    ('pro-soccer', 'Pro Soccer', 'Pro Soccer'),
    ('young-warriors', 'Young Warriors', 'Young Warriors'),
    ('mamba', 'Mamba', 'Mamba'),
    ('maringo-united-youth', 'Maringo United Youth', 'Maringo Utd Youth'),
    ('kick-off-to-hope', 'Kick Off To Hope', 'Kick Off To Hope'),
    ('makadara-youth', 'Makadara Youth', 'Makadara'),
    ('mbotela-kamaliza', 'Mbotela Kamaliza', 'Mbotela'),
    ('michezo-halisi', 'Michezo Halisi', 'Michezo Halisi'),
    ('gava-fc', 'Gava FC', 'Gava')
  on conflict (slug) do nothing;

  -- Correct an accidental soft-hyphen-free slug if this migration is rerun after edit.
  if not exists (select 1 from public.local_teams where slug = 'maringo-united') then
    insert into public.local_teams (slug, name, short_name) values ('maringo-united', 'Maringo United', 'Maringo');
  end if;

  -- Results and fixtures. source_match_index makes the seed idempotent.
  insert into public.local_fixtures (source_id, source_match_index, competition_id, home_team_id, away_team_id, venue_id, scheduled_date, kickoff_time_text, status, home_score, away_score, home_penalties, away_penalties, round_label)
  select source_id, x.idx, competition_id, h.id, a.id, v.id, x.match_date, x.kickoff, x.status, x.home_goals, x.away_goals, x.home_pens, x.away_pens, x.round_label
  from (values
    (1, 'mawe-sacco', 'rada-sports', null::date, null, 'finished', 1, 4, null::int, null::int, 'Pedeshee Wauna Super Cup'),
    (2, 'hakati-sportif', 'jasa', null::date, null, 'finished', 2, 0, null::int, null::int, 'Pedeshee Wauna Super Cup · Zone B'),
    (3, 'mawe-sacco', 'rada-sports', null::date, '11:00 AM', 'finished', 1, 4, null::int, null::int, 'Pedeshee Wauna Super Cup · Zone B'),
    (4, 'maziwa-county-fc', 'salem-sportif', null::date, '1:00 PM', 'finished', 2, 1, null::int, null::int, 'Pedeshee Wauna Super Cup · Zone B'),
    (5, 'makongeni-elite', 'maringo-united', null::date, '4:00 PM', 'finished', 2, 3, null::int, null::int, 'Pedeshee Wauna Super Cup · Zone B'),
    (6, 'a1000-sportiff', 'shy-fc', '2026-08-08'::date, null, 'finished', 9, 1, null::int, null::int, 'Pedeshee Wauna Super Cup'),
    (7, 'pro-soccer', 'young-warriors', null::date, null, 'finished', 1, 3, null::int, null::int, 'Pedeshee Wauna Super Cup · Round of 16'),
    (8, 'mamba', 'maringo-united-youth', null::date, null, 'finished', 0, 2, null::int, null::int, 'Pedeshee Wauna Super Cup · Round of 16'),
    (9, 'kick-off-to-hope', 'makadara-youth', null::date, null, 'finished', 2, 1, null::int, null::int, 'Pedeshee Wauna Super Cup · Round of 16'),
    (10, 'mbotela-kamaliza', 'michezo-halisi', '2026-08-23'::date, '1:00 PM', 'finished', 2, 1, null::int, null::int, 'Pedeshee Wauna Super Cup · Quarter-finals'),
    (11, 'gava-fc', 'young-warriors', null::date, null, 'finished', 1, 1, 5, 4, 'Pedeshee Wauna Super Cup · Quarter-finals'),
    (12, 'maringo-united-youth', 'kick-off-to-hope', null::date, null, 'finished', 2, 0, null::int, null::int, 'Pedeshee Wauna Super Cup · Quarter-finals'),
    (13, 'mbotela-kamaliza', 'hakati-sportif', '2026-08-23'::date, null, 'finished', 2, 1, null::int, null::int, 'Pedeshee Wauna Super Cup · Quarter-finals'),
    (14, 'a1000-sportiff', 'maziwa-county-fc', null::date, null, 'finished', 0, 0, 4, 5, 'Pedeshee Wauna Super Cup · Quarter-finals'),
    (15, 'maringo-united-youth', 'gava-fc', '2026-08-29'::date, '1:00 PM', 'scheduled', null::int, null::int, null::int, null::int, 'Pedeshee Wauna Super Cup · Semi-finals'),
    (16, 'maziwa-county-fc', 'mbotela-kamaliza', '2026-08-29'::date, '4:00 PM', 'scheduled', null::int, null::int, null::int, null::int, 'Pedeshee Wauna Super Cup · Semi-finals')
  ) as x(idx, home_slug, away_slug, match_date, kickoff, status, home_goals, away_goals, home_pens, away_pens, round_label)
  join public.local_teams h on h.slug = x.home_slug
  join public.local_teams a on a.slug = x.away_slug
  left join public.local_venues v on v.slug = case when x.idx in (2,3,4,5,10,13,16) then 'lower-jericho-grounds' when x.idx = 6 then 'st-patrick-grounds-maringo' when x.idx = 15 then 'nindo-grounds-jericho' end
  on conflict (source_id, source_match_index) do update set
    scheduled_date = excluded.scheduled_date, kickoff_time_text = excluded.kickoff_time_text,
    status = excluded.status, home_score = excluded.home_score, away_score = excluded.away_score,
    home_penalties = excluded.home_penalties, away_penalties = excluded.away_penalties,
    round_label = excluded.round_label, venue_id = excluded.venue_id, updated_at = now();
end $$;
