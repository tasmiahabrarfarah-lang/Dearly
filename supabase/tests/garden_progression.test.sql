-- Run with `supabase test db` after applying migrations to a local Supabase DB.
begin;
create extension if not exists pgtap with schema extensions;
select extensions.plan(8);

create temporary table garden_test_users (label text primary key, id uuid not null default gen_random_uuid()) on commit drop;
insert into garden_test_users (label) values ('owner'), ('other');
insert into auth.users (id, aud, role, email, encrypted_password, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
select id, 'authenticated', 'authenticated', label || '-' || id || '@example.test', '', '{}'::jsonb, '{}'::jsonb, now(), now()
from garden_test_users;
insert into public.diary_entries (id, owner_id, title, body, created_at, updated_at)
select 'garden-test-memory', id, 'A memory', 'A few words', now(), now() from garden_test_users where label = 'owner';
insert into public.diary_entries (id, owner_id, title, body, created_at, updated_at)
select 'garden-test-empty', id, '   ', '  ', now(), now() from garden_test_users where label = 'owner';

select set_config('test.garden_owner', (select id::text from garden_test_users where label = 'owner'), true);
select set_config('test.garden_other', (select id::text from garden_test_users where label = 'other'), true);
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.garden_owner'), true);
select extensions.is(public.award_garden_memory('garden-test-memory'), 1, 'saved eligible entry unlocks the first memory');
select extensions.is(public.award_garden_memory('garden-test-memory'), 1, 'retrying an award does not duplicate it');
select extensions.is((select count(*)::integer from public.garden_growth_events where owner_id = auth.uid()), 1, 'one unique reward event is stored');
select extensions.throws_ok($$select public.award_garden_memory('missing-entry')$$, 'P0001', 'Saved eligible entry not found', 'unsaved entry earns no reward');
select extensions.throws_ok($$select public.award_garden_memory('garden-test-empty')$$, 'P0001', 'Saved eligible entry not found', 'empty entry earns no reward');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.garden_other'), true);
select extensions.throws_ok($$select public.award_garden_memory('garden-test-memory')$$, 'P0001', 'Saved eligible entry not found', 'another user cannot claim the owner entry');
select extensions.is((select count(*)::integer from public.garden_progress), 0, 'another user cannot read the owner progress row');
reset role;

delete from public.diary_entries where id = 'garden-test-memory';
select extensions.is((select memories from public.garden_progress where owner_id = current_setting('test.garden_owner')::uuid), 1, 'earned decoration progress survives entry deletion');
select * from extensions.finish();
rollback;
