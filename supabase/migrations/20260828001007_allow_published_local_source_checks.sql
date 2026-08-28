-- Public fixture policies need to confirm that their private provenance source
-- reached the published state. Expose only the three non-sensitive columns
-- needed for that check; extraction payloads and source files remain private.

alter table public.local_football_sources enable row level security;

revoke all on public.local_football_sources from anon, authenticated;
grant select (id, workflow_status, published_at)
  on public.local_football_sources to anon, authenticated;

drop policy if exists "Published source identities support public records"
  on public.local_football_sources;
create policy "Published source identities support public records"
  on public.local_football_sources for select to anon, authenticated
  using (workflow_status = 'published' and published_at is not null);

