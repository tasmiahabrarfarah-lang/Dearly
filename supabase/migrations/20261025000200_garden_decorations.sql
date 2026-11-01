-- User-owned garden decoration milestones. Earned events survive diary deletion.
create table if not exists public.garden_progress (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  memories integer not null default 0 check (memories >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.garden_growth_events (
  owner_id uuid not null references auth.users(id) on delete cascade,
  entry_id text not null,
  created_at timestamptz not null default now(),
  primary key (owner_id, entry_id)
);

alter table public.garden_progress enable row level security;
alter table public.garden_growth_events enable row level security;
drop policy if exists "Owners read their garden progress" on public.garden_progress;
create policy "Owners read their garden progress" on public.garden_progress
  for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists "Owners read their garden events" on public.garden_growth_events;
create policy "Owners read their garden events" on public.garden_growth_events
  for select to authenticated using (owner_id = (select auth.uid()));
grant select on public.garden_progress, public.garden_growth_events to authenticated;

create or replace function public.award_garden_memory(p_entry_id text)
returns integer language plpgsql security definer set search_path = '' as $$
declare v_owner uuid := auth.uid(); v_awarded integer;
begin
  if v_owner is null then raise exception 'Authentication required'; end if;
  if p_entry_id is null or length(p_entry_id) > 80 then raise exception 'Invalid entry'; end if;
  if not exists (
    select 1 from public.diary_entries e
    where e.id = p_entry_id and e.owner_id = v_owner
      and (length(trim(e.title)) > 0 or length(trim(e.body)) > 0)
  ) then raise exception 'Saved eligible entry not found'; end if;

  insert into public.garden_growth_events(owner_id, entry_id)
  values (v_owner, p_entry_id) on conflict do nothing;
  get diagnostics v_awarded = row_count;
  if v_awarded = 1 then
    insert into public.garden_progress(owner_id, memories)
    values (v_owner, 1)
    on conflict (owner_id) do update set memories = public.garden_progress.memories + 1, updated_at = now();
  end if;
  return coalesce((select memories from public.garden_progress where owner_id = v_owner), 0);
end;
$$;
revoke all on function public.award_garden_memory(text) from public;
grant execute on function public.award_garden_memory(text) to authenticated;
