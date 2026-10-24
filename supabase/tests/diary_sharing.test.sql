-- Run with `supabase test db` after applying migrations to a local Supabase DB.
begin;
create extension if not exists pgtap with schema extensions;
select extensions.plan(11);

create temporary table diary_share_test_users (label text primary key, id uuid not null default gen_random_uuid()) on commit drop;
insert into diary_share_test_users (label) values ('owner'), ('accepted'), ('pending'), ('stranger');
insert into auth.users (id, aud, role, email, encrypted_password, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
select id, 'authenticated', 'authenticated', label || '-' || id || '@example.test', '', '{}'::jsonb, '{}'::jsonb, now(), now()
from diary_share_test_users;

insert into public.friendships (requester_id, addressee_id, status)
select a.id, b.id, 'accepted' from diary_share_test_users a, diary_share_test_users b
where a.label = 'owner' and b.label = 'accepted';
insert into public.friendships (requester_id, addressee_id, status)
select a.id, b.id, 'pending' from diary_share_test_users a, diary_share_test_users b
where a.label = 'owner' and b.label = 'pending';
insert into public.diary_entries (id, owner_id, title, body, created_at, updated_at)
select 'pgtap-diary-sharing-entry', id, 'Private memory', 'secret body', now(), now()
from diary_share_test_users where label = 'owner';

select set_config('test.diary_owner', (select id::text from diary_share_test_users where label = 'owner'), true);
select set_config('test.diary_accepted', (select id::text from diary_share_test_users where label = 'accepted'), true);
select set_config('test.diary_pending', (select id::text from diary_share_test_users where label = 'pending'), true);
select set_config('test.diary_stranger', (select id::text from diary_share_test_users where label = 'stranger'), true);

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.diary_owner'), true);
select extensions.is((select count(*)::integer from public.diary_entries where id = 'pgtap-diary-sharing-entry'), 1, 'owner can read a private entry');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.diary_accepted'), true);
select extensions.is((select count(*)::integer from public.diary_entries where id = 'pgtap-diary-sharing-entry'), 0, 'entry is private before explicit sharing');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.diary_owner'), true);
select extensions.throws_ok(
  format('select public.set_diary_entry_shares(%L, array[%L::uuid])', 'pgtap-diary-sharing-entry', current_setting('test.diary_stranger')),
  'P0001', 'Every recipient must be a current accepted friend', 'owner cannot add a non-friend recipient'
);
select public.set_diary_entry_shares('pgtap-diary-sharing-entry', array[current_setting('test.diary_accepted')::uuid]);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.diary_accepted'), true);
select extensions.is((select count(*)::integer from public.diary_entries where id = 'pgtap-diary-sharing-entry'), 1, 'accepted selected friend can read the shared entry');
select extensions.is((select count(*)::integer from public.diary_entry_shares where entry_id = 'pgtap-diary-sharing-entry' and recipient_id = auth.uid()), 1, 'recipient can see only their own share grant');
select extensions.is((with changed as (update public.diary_entries set body = 'tampered' where id = 'pgtap-diary-sharing-entry' returning id) select count(*)::integer from changed), 0, 'recipient cannot edit the owner entry');
select extensions.throws_ok(
  format('select public.set_diary_entry_shares(%L, %L::uuid[])', 'pgtap-diary-sharing-entry', '{}'),
  'P0001', 'Entry not found or not owned by the current user', 'recipient cannot re-share the owner entry'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.diary_pending'), true);
select extensions.is((select count(*)::integer from public.diary_entries where id = 'pgtap-diary-sharing-entry'), 0, 'pending friend cannot read the entry');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.diary_stranger'), true);
select extensions.is((select count(*)::integer from public.diary_entries where id = 'pgtap-diary-sharing-entry'), 0, 'unrelated user cannot read the entry');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.diary_owner'), true);
select public.set_diary_entry_shares('pgtap-diary-sharing-entry', '{}'::uuid[]);
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.diary_accepted'), true);
select extensions.is((select count(*)::integer from public.diary_entries where id = 'pgtap-diary-sharing-entry'), 0, 'revoked recipient cannot read the entry again');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.diary_owner'), true);
select public.set_diary_entry_shares('pgtap-diary-sharing-entry', array[current_setting('test.diary_accepted')::uuid]);
reset role;
delete from public.friendships f using diary_share_test_users o, diary_share_test_users r
where o.label = 'owner' and r.label = 'accepted'
  and f.requester_id = o.id and f.addressee_id = r.id;
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.diary_accepted'), true);
select extensions.is((select count(*)::integer from public.diary_entries where id = 'pgtap-diary-sharing-entry'), 0, 'friendship removal revokes access');
reset role;

select * from extensions.finish();
rollback;
