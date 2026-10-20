/**
 * app/api/search-user/route.ts
 * GET /api/search-user?dearly_id=cozy-star-482
 *
 * Returns the public profile of a user with the given Dearly ID.
 * - Requires authentication (cookie-based session).
 * - Returns ONLY public fields: display_name and dearly_id.
 * - Does NOT return internal IDs, email, or private metadata.
 * - Returns 404 for unknown IDs (does not reveal whether an account exists
 *   or not beyond returning no result — acceptable for a Dearly ID search
 *   since IDs are shared intentionally by users).
 *
 * The internal user ID (UUID) is returned so the caller can pass it to
 * friend-request actions, but this is scoped to authenticated users only.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  // Require authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rawId = searchParams.get("dearly_id") ?? "";

  // Normalize: lowercase, trim, strip leading "@"
  const dearlyId = rawId.trim().toLowerCase().replace(/^@/, "");

  if (!dearlyId || dearlyId.length < 3) {
    return NextResponse.json(
      { error: "Please enter a Dearly ID (at least 3 characters)." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, dearly_id")
    .eq("dearly_id", dearlyId)
    .single();

  if (error || !data) {
    // 404 — no result found
    return NextResponse.json({ result: null }, { status: 200 });
  }

  // Return only safe public fields
  return NextResponse.json({
    result: {
      id: data.id,           // needed for friend-request action (auth-gated)
      display_name: data.display_name,
      dearly_id: data.dearly_id,
    },
  });
}
