-- Personalization fields and owner-scoped primary diary appearance.
alter table public.profiles
  add column if not exists username text,
  add column if not exists profile_title text not null default '',
  add column if not exists avatar_accessory text not null default 'none',
  add column if not exists personalization_completed boolean not null default true;

alter table public.profiles drop constraint if exists profiles_username_format_check;
alter table public.profiles add constraint profiles_username_format_check
  check (username is null or (username = lower(username) and username ~ '^[a-z0-9_]{3,20}$'));
alter table public.profiles drop constraint if exists profiles_username_reserved_check;
alter table public.profiles add constraint profiles_username_reserved_check
  check (username is null or username not in ('admin','administrator','support','help','dearly','system','api','root'));
alter table public.profiles drop constraint if exists profiles_title_length_check;
alter table public.profiles add constraint profiles_title_length_check
  check (char_length(profile_title) <= 40);
alter table public.profiles drop constraint if exists profiles_avatar_accessory_check;
alter table public.profiles add constraint profiles_avatar_accessory_check
  check (avatar_accessory in ('none','glasses','flower','bow'));
create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(username)) where username is not null;

create or replace function public.is_username_available(p_username text)
returns boolean language sql stable security definer set search_path = '' as $$
  select p_username = lower(p_username)
    and p_username ~ '^[a-z0-9_]{3,20}$'
    and p_username <> all(array['admin','administrator','support','help','dearly','system','api','root'])
    and not exists (select 1 from public.profiles p where lower(p.username) = p_username);
$$;
revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;

-- Claim the requested registration username after the existing profile trigger
-- creates the profile. A uniqueness conflict aborts the auth transaction so a
-- racing signup cannot silently create an account without its requested name.
create or replace function public.claim_requested_profile_username()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_username text;
begin
  update public.profiles set personalization_completed = false where id = new.id;
  select lower(nullif(trim(u.raw_user_meta_data ->> 'username'), ''))
    into v_username from auth.users u where u.id = new.id;
  if v_username is null or v_username !~ '^[a-z0-9_]{3,20}$'
     or v_username = any(array['admin','administrator','support','help','dearly','system','api','root']) then
    return new;
  end if;
  update public.profiles set username = v_username, updated_at = now()
    where id = new.id and username is null;
  return new;
end;
$$;
revoke all on function public.claim_requested_profile_username() from public;
drop trigger if exists profile_username_from_auth_metadata on public.profiles;
create trigger profile_username_from_auth_metadata after insert on public.profiles
  for each row execute function public.claim_requested_profile_username();

create table if not exists public.user_diary_designs (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  version smallint not null default 1 check (version = 1),
  preset_id text not null default 'dreamy-garden' check (preset_id in ('dreamy-garden','morning-sky','little-keepsake','custom')),
  cover_color text not null default '#cebbe8' check (cover_color in ('#cebbe8','#a8c9e8','#c6dfc6','#efc6cc','#e9d5a8')),
  pattern_id text not null default 'flowers' check (pattern_id in ('plain','stars','dots','flowers')),
  bookmark_color text not null default '#d89ab8' check (bookmark_color in ('#d89ab8','#8fb8d8','#8fb89a','#d9a95e','#a88bd0')),
  bookmark_style text not null default 'pointed' check (bookmark_style in ('ribbon','rounded','pointed')),
  decoration_ids text[] not null default array['flower','leaf']::text[] check (cardinality(decoration_ids) <= 3 and decoration_ids <@ array['flower','star','heart','moon','leaf','cloud']::text[]),
  updated_at timestamptz not null default now()
);

alter table public.user_diary_designs enable row level security;
drop policy if exists "Owners read their diary design" on public.user_diary_designs;
create policy "Owners read their diary design" on public.user_diary_designs
  for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists "Owners create their diary design" on public.user_diary_designs;
create policy "Owners create their diary design" on public.user_diary_designs
  for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists "Owners update their diary design" on public.user_diary_designs;
create policy "Owners update their diary design" on public.user_diary_designs
  for update to authenticated using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
grant select, insert, update on public.user_diary_designs to authenticated;
