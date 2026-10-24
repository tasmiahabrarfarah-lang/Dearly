-- Server-enforced diary storage and per-entry sharing.
create table if not exists public.diary_entries (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  body text not null default '',
  created_at timestamptz not null,
  updated_at timestamptz not null,
  page_color text not null default '#fdf6ec',
  font_family text not null default 'var(--font-nunito), sans-serif',
  font_size integer not null default 16 check (font_size between 10 and 40),
  inserted_at timestamptz not null default now()
);
create index if not exists diary_entries_owner_created_idx on public.diary_entries (owner_id, created_at desc);

create table if not exists public.diary_entry_shares (
  entry_id text not null references public.diary_entries(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (entry_id, recipient_id),
  check (owner_id <> recipient_id)
);
create index if not exists diary_entry_shares_recipient_idx on public.diary_entry_shares (recipient_id, created_at desc);

alter table public.diary_entries enable row level security;
alter table public.diary_entry_shares enable row level security;

create or replace function public.can_read_diary_entry(p_entry_id text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.diary_entries e
    where e.id = p_entry_id and (
      e.owner_id = (select auth.uid()) or exists (
        select 1 from public.diary_entry_shares s
        join public.friendships f on f.status = 'accepted'
          and ((f.requester_id = s.owner_id and f.addressee_id = s.recipient_id)
            or (f.requester_id = s.recipient_id and f.addressee_id = s.owner_id))
        where s.entry_id = e.id and s.owner_id = e.owner_id and s.recipient_id = (select auth.uid())
      )
    )
  );
$$;
revoke all on function public.can_read_diary_entry(text) from public;
grant execute on function public.can_read_diary_entry(text) to authenticated;

drop policy if exists "Owners and current recipients can read diary entries" on public.diary_entries;
create policy "Owners and current recipients can read diary entries" on public.diary_entries for select to authenticated
  using (public.can_read_diary_entry(id));
drop policy if exists "Owners can create diary entries" on public.diary_entries;
create policy "Owners can create diary entries" on public.diary_entries for insert to authenticated
  with check (owner_id = (select auth.uid()));
drop policy if exists "Owners can update diary entries" on public.diary_entries;
create policy "Owners can update diary entries" on public.diary_entries for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists "Owners can delete diary entries" on public.diary_entries;
create policy "Owners can delete diary entries" on public.diary_entries for delete to authenticated
  using (owner_id = (select auth.uid()));

drop policy if exists "Owners can view their sharing recipients" on public.diary_entry_shares;
create policy "Owners and recipients can view their diary shares" on public.diary_entry_shares for select to authenticated
  using (owner_id = (select auth.uid()) or recipient_id = (select auth.uid()));
-- Share mutations are only available through the validated RPC below.
drop policy if exists "Owners can insert diary shares" on public.diary_entry_shares;
drop policy if exists "Owners can delete diary shares" on public.diary_entry_shares;

create or replace function public.set_diary_entry_shares(p_entry_id text, p_recipient_ids uuid[])
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_owner_id uuid := auth.uid();
  v_recipient_count integer;
begin
  if v_owner_id is null then raise exception 'Not authenticated'; end if;
  if not exists (select 1 from public.diary_entries e where e.id = p_entry_id and e.owner_id = v_owner_id) then
    raise exception 'Entry not found or not owned by the current user';
  end if;
  perform 1 from public.friendships f
    where f.status = 'accepted'
      and ((f.requester_id = v_owner_id and f.addressee_id = any(coalesce(p_recipient_ids, '{}'::uuid[])))
        or (f.addressee_id = v_owner_id and f.requester_id = any(coalesce(p_recipient_ids, '{}'::uuid[]))))
    for key share;
  select count(distinct requested.recipient_id) into v_recipient_count
    from unnest(coalesce(p_recipient_ids, '{}'::uuid[])) as requested(recipient_id);
  if v_recipient_count > 100 then raise exception 'Too many recipients'; end if;
  if exists (
    select 1 from (select distinct unnest(coalesce(p_recipient_ids, '{}'::uuid[])) as recipient_id) requested
    where requested.recipient_id = v_owner_id or not exists (
      select 1 from public.friendships f where f.status = 'accepted'
        and ((f.requester_id = v_owner_id and f.addressee_id = requested.recipient_id)
          or (f.requester_id = requested.recipient_id and f.addressee_id = v_owner_id))
    )
  ) then raise exception 'Every recipient must be a current accepted friend'; end if;
  delete from public.diary_entry_shares where entry_id = p_entry_id and owner_id = v_owner_id;
  insert into public.diary_entry_shares (entry_id, owner_id, recipient_id)
    select p_entry_id, v_owner_id, recipient_id
    from (select distinct unnest(coalesce(p_recipient_ids, '{}'::uuid[])) as recipient_id) requested;
end;
$$;
revoke all on function public.set_diary_entry_shares(text, uuid[]) from public;
grant execute on function public.set_diary_entry_shares(text, uuid[]) to authenticated;

create or replace function public.revoke_diary_shares_after_friendship_delete()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  delete from public.diary_entry_shares s
  where (s.owner_id = old.requester_id and s.recipient_id = old.addressee_id)
     or (s.owner_id = old.addressee_id and s.recipient_id = old.requester_id);
  return old;
end;
$$;
drop trigger if exists revoke_diary_shares_after_friendship_delete on public.friendships;
create trigger revoke_diary_shares_after_friendship_delete after delete on public.friendships
  for each row execute function public.revoke_diary_shares_after_friendship_delete();

grant select, insert, update, delete on public.diary_entries to authenticated;
grant select on public.diary_entry_shares to authenticated;
