"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/friends";

/** Replace an entry's recipient list atomically after validating the session. */
export async function setDiaryEntryShares(entryId: string, recipientIds: string[]): Promise<ActionResult> {
  if (!entryId || entryId.length > 80 || !Array.isArray(recipientIds) || recipientIds.length > 100) {
    return { error: "The sharing request is invalid." };
  }
  const supabase = createClient();
  if (!supabase) return { error: "Sharing is unavailable until Supabase is configured." };
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Please sign in to manage sharing." };
  const validUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (recipientIds.some((id) => typeof id !== "string" || !validUuid.test(id))) {
    return { error: "One or more selected friends are invalid." };
  }
  const { error } = await supabase.rpc("set_diary_entry_shares", {
    p_entry_id: entryId,
    p_recipient_ids: Array.from(new Set(recipientIds)),
  });
  if (error) {
    // Surface the real reason instead of one generic message.
    if (error.message.includes("Entry not found")) {
      return { error: "This entry isn't saved to your account yet. Save it first, then choose who can read it." };
    }
    if (error.message.includes("accepted friend")) {
      return { error: "You can only share with current friends. Refresh your friends list and try again." };
    }
    return { error: "Couldn't update sharing. Check that the migration has been applied and recipients are still friends." };
  }
  return { success: true };
}
