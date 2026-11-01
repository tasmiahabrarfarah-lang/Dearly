/**
 * /auth/callback — Supabase OAuth / magic-link / email-confirmation callback.
 *
 * Supabase can call this route in two ways:
 *   1. PKCE flow (default for email confirmations and password resets):
 *      GET /auth/callback?code=<code>&next=<path>
 *      → Exchange code for session, then redirect to `next` (or /world).
 *
 *   2. Implicit / magic-link flow:
 *      GET /auth/callback#access_token=...&type=recovery
 *      → The hash fragment is handled client-side by Supabase JS automatically.
 *      → A page-level component is needed to catch this case; the route handler
 *        cannot read hash fragments (they are never sent to the server).
 *        We redirect to a thin client page that lets Supabase JS detect the hash.
 *
 * The `next` param is validated to be an app-local path (no open redirects).
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Only allow paths that start with "/" and are not protocol-relative ("//"). */
function safeNext(raw: string | null): string {
  if (!raw) return "/world";
  const trimmed = raw.trim();
  return trimmed.startsWith("/") && !trimmed.startsWith("//") ? trimmed : "/world";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code     = searchParams.get("code");
  const next     = safeNext(searchParams.get("next"));

  // ── PKCE flow: exchange the one-time code for a session ──────────────────
  if (code) {
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        // Use the canonical public URL (NEXT_PUBLIC_SITE_URL) as the base
        // so the redirect always goes to the real app domain, not an internal
        // Vercel deployment URL or localhost.
        const base = process.env.NEXT_PUBLIC_SITE_URL ?? origin;
        return NextResponse.redirect(new URL(next, base));
      }
    }
  }

  // ── Fallback: bad/expired code or no code at all ─────────────────────────
  // Could also be an implicit-flow hash link that the browser followed directly
  // (e.g. an older magic link). Redirect to login with an error banner.
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? origin;
  return NextResponse.redirect(new URL("/auth/login?error=link_expired", base));
}
