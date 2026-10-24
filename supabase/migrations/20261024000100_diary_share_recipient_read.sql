-- Allow a recipient to discover entries explicitly shared with them.
-- Recipients can see only their own grant rows; write access remains RPC-only.
drop policy if exists "Owners can view their sharing recipients" on public.diary_entry_shares;
drop policy if exists "Owners and recipients can view their diary shares" on public.diary_entry_shares;
create policy "Owners and recipients can view their diary shares"
  on public.diary_entry_shares for select to authenticated
  using (owner_id = (select auth.uid()) or recipient_id = (select auth.uid()));
