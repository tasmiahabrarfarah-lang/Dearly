/**
 * /auth/callback — Supabase OAuth / magic-link / email-confirmation callback.
 * Exchanges the code for a session, then redirects to /world (or error).
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // After email confirmation, Supabase may send a `next` param
  const next = searchParams.get("next") ?? "/world";

  if (code) {
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }


  // Redirect to an error page or back to login with a message
  return NextResponse.redirect(
    `${origin}/auth/login?error=link_expired`
  );
}
