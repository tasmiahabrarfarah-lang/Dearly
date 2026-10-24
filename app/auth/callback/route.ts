/**
 * /auth/callback — Supabase OAuth / magic-link / email-confirmation callback.
 * Exchanges the code for a session, then redirects to /world (or error).
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Only allow app-local destinations. Never let an auth callback become an
  // open redirect based on a query parameter from an email link.
  const requestedNext = searchParams.get("next") ?? "/world";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/world";

  if (code) {
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(next, origin));
      }
    }
  }


  // Redirect to an error page or back to login with a message
  return NextResponse.redirect(
    `${origin}/auth/login?error=link_expired`
  );
}
