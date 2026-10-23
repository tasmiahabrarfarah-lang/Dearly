-- Private in-app notifications for friendship and Little Notes events.
-- Event payloads contain IDs only; note content and diary data are never copied.

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  friend_activity boolean not null default true,
  little_notes boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  kind text not null check (kind in ('friend_request', 'friend_accepted', 'little_note')),
  event_id text not null,
  resource_id text,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  unique (recipient_id, kind, event_id)
);

create index if not exists notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc);
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;

drop policy if exists "Users read their notifications" on public.notifications;
create policy "Users read their notifications" on public.notifications
  for select to authenticated using (recipient_id = (select auth.uid()));
drop policy if exists "Users update their notifications" on public.notifications;
create policy "Users update their notifications" on public.notifications
  for update to authenticated using (recipient_id = (select auth.uid()))
  with check (recipient_id = (select auth.uid()));

drop policy if exists "Users read their notification preferences" on public.notification_preferences;
create policy "Users read their notification preferences" on public.notification_preferences
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Users create their notification preferences" on public.notification_preferences;
create policy "Users create their notification preferences" on public.notification_preferences
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Users update their notification preferences" on public.notification_preferences;
create policy "Users update their notification preferences" on public.notification_preferences
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant select, insert, update on public.notification_preferences to authenticated;

create or replace function public.create_friend_notification()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_kind text;
  v_recipient uuid;
  v_actor uuid;
begin
  if tg_op = 'INSERT' and new.status = 'pending' then
    v_kind := 'friend_request';
    v_recipient := new.addressee_id;
    v_actor := new.requester_id;
  elsif tg_op = 'UPDATE' and old.status = 'pending' and new.status = 'accepted' then
    delete from public.notifications
      where recipient_id = old.addressee_id and kind = 'friend_request' and event_id = old.id::text;
    v_kind := 'friend_accepted';
    v_recipient := new.requester_id;
    v_actor := new.addressee_id;
  else
    return new;
  end if;

  if coalesce((select p.friend_activity from public.notification_preferences p where p.user_id = v_recipient), true) then
    insert into public.notifications (recipient_id, actor_id, kind, event_id)
    values (v_recipient, v_actor, v_kind, new.id::text)
    on conflict (recipient_id, kind, event_id) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function public.create_friend_notification() from public;
drop trigger if exists friendship_notification_insert on public.friendships;
create trigger friendship_notification_insert after insert on public.friendships
  for each row execute function public.create_friend_notification();
drop trigger if exists friendship_notification_accept on public.friendships;
create trigger friendship_notification_accept after update of status on public.friendships
  for each row execute function public.create_friend_notification();

create or replace function public.remove_cancelled_friend_request_notification()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.status = 'pending' then
    delete from public.notifications
      where recipient_id = old.addressee_id and kind = 'friend_request' and event_id = old.id::text;
  end if;
  return old;
end;
$$;
revoke all on function public.remove_cancelled_friend_request_notification() from public;
drop trigger if exists friendship_notification_delete on public.friendships;
create trigger friendship_notification_delete after delete on public.friendships
  for each row execute function public.remove_cancelled_friend_request_notification();

create or replace function public.create_little_note_notification()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_recipient uuid;
begin
  select e.owner_id into v_recipient
  from public.diary_entries e where e.id = new.entry_id;
  if v_recipient is not null and v_recipient <> new.author_id
     and coalesce((select p.little_notes from public.notification_preferences p where p.user_id = v_recipient), true) then
    insert into public.notifications (recipient_id, actor_id, kind, event_id, resource_id)
    values (v_recipient, new.author_id, 'little_note', new.id::text, new.entry_id)
    on conflict (recipient_id, kind, event_id) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function public.create_little_note_notification() from public;
drop trigger if exists little_note_notification_insert on public.little_notes;
create trigger little_note_notification_insert after insert on public.little_notes
  for each row execute function public.create_little_note_notification();

create or replace function public.remove_deleted_little_note_notification()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  delete from public.notifications where kind = 'little_note' and event_id = old.id::text;
  return old;
end;
$$;
revoke all on function public.remove_deleted_little_note_notification() from public;
drop trigger if exists little_note_notification_delete on public.little_notes;
create trigger little_note_notification_delete after delete on public.little_notes
  for each row execute function public.remove_deleted_little_note_notification();
