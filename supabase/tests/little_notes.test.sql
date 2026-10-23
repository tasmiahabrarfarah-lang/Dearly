-- Little Notes v1.0 — pgTAP authorization tests
-- Run with `supabase test db` after applying the little_notes migration.
begin;
create extension if not exists pgtap with schema extensions;
select extensions.plan(14);

-- ── Test fixtures ─────────────────────────────────────────────────────────────
create temporary table note_test_users (
  label text primary key,
  id    uuid not null default gen_random_uuid()
) on commit drop;

insert into note_test_users (label) values
  ('owner'),      -- diary author
  ('recipient'),  -- accepted friend with share access
  ('revoked'),    -- used to have access, will be revoked mid-test
  ('stranger');   -- no relationship at all

-- Register users in auth.users
insert into auth.users (id, aud, role, email, encrypted_password, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
select id, 'authenticated', 'authenticated',
       label || '-' || id || '@note.test', '', '{}'::jsonb, '{}'::jsonb, now(), now()
from note_test_users;

-- Friendships: owner ↔ recipient (accepted), owner ↔ revoked (accepted initially)
insert into public.friendships (requester_id, addressee_id, status)
select a.id, b.id, 'accepted'
from note_test_users a, note_test_users b
where (a.label = 'owner' and b.label = 'recipient')
   or (a.label = 'owner' and b.label = 'revoked');

-- A diary entry owned by 'owner'
insert into public.diary_entries (id, owner_id, title, body, created_at, updated_at)
select 'pgtap-note-entry', id, 'Shared Memory', 'body text', now(), now()
from note_test_users where label = 'owner';

-- Share entry with 'recipient' and 'revoked'
select public.set_diary_entry_shares(
  'pgtap-note-entry',
  array[
    (select id from note_test_users where label = 'recipient'),
    (select id from note_test_users where label = 'revoked')
  ]
);

-- Capture IDs for use in tests
select set_config('test.owner',     (select id::text from note_test_users where label = 'owner'),     true);
select set_config('test.recipient', (select id::text from note_test_users where label = 'recipient'), true);
select set_config('test.revoked',   (select id::text from note_test_users where label = 'revoked'),   true);
select set_config('test.stranger',  (select id::text from note_test_users where label = 'stranger'),  true);

-- ── Test 1: Recipient can leave a note ────────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.recipient'), true);
insert into public.little_notes (entry_id, author_id, content)
values ('pgtap-note-entry', current_setting('test.recipient')::uuid, 'What a lovely memory!');
select extensions.is(
  (select count(*)::integer from public.little_notes where entry_id = 'pgtap-note-entry'),
  1, 'recipient can insert a note'
);
reset role;

-- ── Test 2: Owner can read the note ──────────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.owner'), true);
select extensions.is(
  (select count(*)::integer from public.little_notes where entry_id = 'pgtap-note-entry'),
  1, 'entry owner can read notes on their entry'
);
reset role;

-- ── Test 3: Stranger cannot read notes ───────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.stranger'), true);
select extensions.is(
  (select count(*)::integer from public.little_notes where entry_id = 'pgtap-note-entry'),
  0, 'stranger cannot read notes'
);
reset role;

-- ── Test 4: Stranger cannot insert a note ────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.stranger'), true);
select extensions.throws_ok(
  $$insert into public.little_notes (entry_id, author_id, content)
    values ('pgtap-note-entry',
            current_setting('request.jwt.claim.sub')::uuid,
            'Sneaky note')$$,
  'new row violates row-level security policy for table "little_notes"',
  'stranger cannot insert a note'
);
reset role;

-- ── Test 5: Author cannot impersonate someone else ────────────────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.recipient'), true);
select extensions.throws_ok(
  format(
    $$insert into public.little_notes (entry_id, author_id, content)
      values ('pgtap-note-entry', %L::uuid, 'Impersonated')$$,
    current_setting('test.owner')
  ),
  'new row violates row-level security policy for table "little_notes"',
  'recipient cannot impersonate the entry owner as note author'
);
reset role;

-- ── Test 6: Empty/whitespace note is rejected by CHECK ───────────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.recipient'), true);
select extensions.throws_ok(
  $$insert into public.little_notes (entry_id, author_id, content)
    values ('pgtap-note-entry',
            current_setting('request.jwt.claim.sub')::uuid,
            '   ')$$,
  '23514',  -- check_violation
  'whitespace-only note is rejected'
);
reset role;

-- ── Test 7: Note over 500 chars is rejected ───────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.recipient'), true);
select extensions.throws_ok(
  format(
    $$insert into public.little_notes (entry_id, author_id, content)
      values ('pgtap-note-entry',
              current_setting('request.jwt.claim.sub')::uuid,
              %L)$$,
    repeat('x', 501)
  ),
  '23514',
  'note over 500 chars is rejected'
);
reset role;

-- ── Test 8: Recipient can delete their own note ───────────────────────────────
-- Add a second note by recipient to delete
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.recipient'), true);
insert into public.little_notes (entry_id, author_id, content)
values ('pgtap-note-entry', current_setting('test.recipient')::uuid, 'Note to self-delete');
select extensions.is(
  (select count(*)::integer from public.little_notes
   where entry_id = 'pgtap-note-entry' and content = 'Note to self-delete'),
  1, 'setup: recipient note created'
);
delete from public.little_notes
where entry_id = 'pgtap-note-entry' and content = 'Note to self-delete'
  and author_id = current_setting('test.recipient')::uuid;
select extensions.is(
  (select count(*)::integer from public.little_notes
   where entry_id = 'pgtap-note-entry' and content = 'Note to self-delete'),
  0, 'recipient can delete their own note'
);
reset role;

-- ── Test 9: Entry owner can delete any note on their entry ────────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.owner'), true);
delete from public.little_notes where entry_id = 'pgtap-note-entry';
select extensions.is(
  (select count(*)::integer from public.little_notes where entry_id = 'pgtap-note-entry'),
  0, 'entry owner can delete any note on their entry'
);
reset role;

-- ── Test 10: Revoked access — recipient can no longer read notes ──────────────
-- Re-add a note via owner impersonation at the DB level (bypassing RLS for setup)
insert into public.little_notes (entry_id, author_id, content)
values ('pgtap-note-entry', (select id from note_test_users where label = 'recipient'), 'Pre-revocation note');

-- Revoke 'revoked' user's access
select public.set_diary_entry_shares(
  'pgtap-note-entry',
  array[(select id from note_test_users where label = 'recipient')]
);
-- Now remove recipient too, simulating full revocation test for 'revoked'
select public.set_diary_entry_shares('pgtap-note-entry', '{}'::uuid[]);

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.recipient'), true);
select extensions.is(
  (select count(*)::integer from public.little_notes where entry_id = 'pgtap-note-entry'),
  0, 'recipient with revoked access cannot read notes'
);
reset role;

-- ── Test 11: Revoked recipient cannot insert a new note ───────────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.recipient'), true);
select extensions.throws_ok(
  $$insert into public.little_notes (entry_id, author_id, content)
    values ('pgtap-note-entry',
            current_setting('request.jwt.claim.sub')::uuid,
            'After revocation note')$$,
  'new row violates row-level security policy for table "little_notes"',
  'recipient with revoked access cannot insert a new note'
);
reset role;

-- ── Test 12: Owner still sees notes after sharing is revoked ─────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.owner'), true);
select extensions.is(
  (select count(*)::integer from public.little_notes where entry_id = 'pgtap-note-entry'),
  1, 'entry owner retains read access to notes after revoking sharing'
);
reset role;

-- ── Test 13: Stranger cannot delete someone else's note ───────────────────────
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.stranger'), true);
-- This should silently affect 0 rows (no error, but no deletion)
delete from public.little_notes where entry_id = 'pgtap-note-entry';
reset role;
-- Owner verifies note is still there
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.owner'), true);
select extensions.is(
  (select count(*)::integer from public.little_notes where entry_id = 'pgtap-note-entry'),
  1, 'stranger cannot delete notes (owner verifies note still exists)'
);
reset role;

-- ── Test 14: Friendship deletion cascades to note access ─────────────────────
-- Re-share with recipient so they can read again
select public.set_diary_entry_shares(
  'pgtap-note-entry',
  array[(select id from note_test_users where label = 'recipient')]
);
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.recipient'), true);
select extensions.is(
  (select count(*)::integer from public.little_notes where entry_id = 'pgtap-note-entry'),
  1, 'recipient can read notes after access is restored'
);
reset role;
-- Delete the friendship to trigger the cascade trigger
delete from public.friendships f
using note_test_users o, note_test_users r
where o.label = 'owner' and r.label = 'recipient'
  and f.requester_id = o.id and f.addressee_id = r.id;
-- Friendship deletion cascades via revoke_diary_shares_after_friendship_delete
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.recipient'), true);
select extensions.is(
  (select count(*)::integer from public.little_notes where entry_id = 'pgtap-note-entry'),
  0, 'friendship deletion removes diary share, blocking note reads'
);
reset role;

select * from extensions.finish();
rollback;
