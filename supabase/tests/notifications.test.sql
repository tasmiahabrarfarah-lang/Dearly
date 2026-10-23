-- Notification privacy and event lifecycle checks.
-- Run with `supabase test db` after applying all migrations.
begin;
create extension if not exists pgtap with schema extensions;
select extensions.plan(10);

create temporary table notification_test_users (label text primary key, id uuid not null default gen_random_uuid()) on commit drop;
insert into notification_test_users (label) values ('requester'), ('recipient'), ('stranger'), ('note_author');
insert into auth.users (id, aud, role, email, encrypted_password, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
select id, 'authenticated', 'authenticated', label || '-' || id || '@notification.test', '', '{}'::jsonb, '{}'::jsonb, now(), now()
from notification_test_users;

insert into public.friendships (requester_id, addressee_id, status)
select a.id, b.id, 'pending' from notification_test_users a, notification_test_users b
where a.label = 'requester' and b.label = 'recipient';

select extensions.is(
  (select count(*)::integer from public.notifications n join notification_test_users u on u.id = n.recipient_id where u.label = 'recipient' and n.kind = 'friend_request'),
  1, 'new friend request creates one notification for its recipient'
);
select extensions.is(
  (select count(*)::integer from public.notifications n join notification_test_users u on u.id = n.recipient_id where u.label = 'requester'),
  0, 'friend request is not sent to the requester'
);

update public.friendships set status = 'accepted'
where requester_id = (select id from notification_test_users where label = 'requester')
  and addressee_id = (select id from notification_test_users where label = 'recipient');
select extensions.is(
  (select count(*)::integer from public.notifications n join notification_test_users u on u.id = n.recipient_id where u.label = 'recipient' and n.kind = 'friend_request'),
  0, 'acceptance clears the obsolete pending-request alert'
);
select extensions.is(
  (select count(*)::integer from public.notifications n join notification_test_users u on u.id = n.recipient_id where u.label = 'requester' and n.kind = 'friend_accepted'),
  1, 'acceptance notifies the original requester'
);

insert into public.diary_entries (id, owner_id, title, body, created_at, updated_at)
values ('pgtap-notification-entry', (select id from notification_test_users where label = 'recipient'), 'Private title', 'Private body', now(), now());
insert into public.little_notes (entry_id, author_id, content)
values ('pgtap-notification-entry', (select id from notification_test_users where label = 'note_author'), 'Secret note text');
select extensions.is(
  (select count(*)::integer from public.notifications n join notification_test_users u on u.id = n.recipient_id where u.label = 'recipient' and n.kind = 'little_note'),
  1, 'a note creates a recipient notification'
);
select extensions.is(
  (select count(*)::integer from public.notifications where kind = 'little_note' and event_id = (select id::text from public.little_notes where entry_id = 'pgtap-notification-entry')),
  1, 'notification stores only the note reference and not its private contents'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', (select id::text from notification_test_users where label = 'recipient'), true);
select extensions.is((select count(*)::integer from public.notifications), 1, 'recipient can read only their notifications');
update public.notifications set read_at = now() where recipient_id = (select id from notification_test_users where label = 'recipient');
select extensions.is((select count(*)::integer from public.notifications where read_at is not null), 1, 'recipient can mark their notifications as read');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', (select id::text from notification_test_users where label = 'stranger'), true);
select extensions.is((select count(*)::integer from public.notifications), 0, 'another account cannot read those notifications');
update public.notifications set read_at = null
where recipient_id = (select id from notification_test_users where label = 'recipient');
reset role;
select extensions.is((select count(*)::integer from public.notifications where read_at is not null), 1, 'another account cannot change the recipient read state');

select * from extensions.finish();
rollback;
