-- Little Notes v1.0
-- Short personal messages that friends can leave on diary entries shared with them.
-- Access is fully controlled by the existing can_read_diary_entry() function, so
-- revoking diary sharing automatically revokes access to its notes.

create table if not exists public.little_notes (
  id          uuid        primary key default gen_random_uuid(),
  entry_id    text        not null references public.diary_entries(id) on delete cascade,
  author_id   uuid        not null references auth.users(id) on delete cascade,
  content     text        not null
                          check (char_length(trim(content)) >= 1 and char_length(content) <= 500),
  created_at  timestamptz not null default now()
);

-- Index for fetching all notes for an entry efficiently.
create index if not exists little_notes_entry_idx on public.little_notes (entry_id, created_at asc);
-- Index for fetching notes authored by a specific user (for ownership checks).
create index if not exists little_notes_author_idx on public.little_notes (author_id);

alter table public.little_notes enable row level security;

-- ── SELECT ───────────────────────────────────────────────────────────────────
-- A note is readable only if the current user can read the diary entry it is
-- attached to. This covers both the entry owner and currently-authorised recipients.
-- Revoking diary sharing immediately blocks note reads — no separate revocation needed.
drop policy if exists "Notes are readable by anyone who can read the entry" on public.little_notes;
create policy "Notes are readable by anyone who can read the entry"
  on public.little_notes for select to authenticated
  using (public.can_read_diary_entry(entry_id));

-- ── INSERT ───────────────────────────────────────────────────────────────────
-- A user may leave a note only when:
--   1. They are the authenticated session owner (prevents impersonation).
--   2. They can currently read the diary entry (ensures active access).
-- The entry owner is allowed to leave notes on their own entries too.
drop policy if exists "Authorized users can leave a note" on public.little_notes;
create policy "Authorized users can leave a note"
  on public.little_notes for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and public.can_read_diary_entry(entry_id)
  );

-- ── DELETE ───────────────────────────────────────────────────────────────────
-- A note can be deleted by:
--   a) Its own author (you can always retract what you wrote), OR
--   b) The diary entry's owner (they moderate their own entries).
-- The entry owner may delete even if sharing has been revoked (they still own the entry).
drop policy if exists "Authors and entry owners can delete notes" on public.little_notes;
create policy "Authors and entry owners can delete notes"
  on public.little_notes for delete to authenticated
  using (
    author_id = (select auth.uid())
    or exists (
      select 1 from public.diary_entries e
      where e.id = entry_id and e.owner_id = (select auth.uid())
    )
  );

-- Grant table access to the authenticated role (RLS policies are the actual gate).
grant select, insert, delete on public.little_notes to authenticated;
