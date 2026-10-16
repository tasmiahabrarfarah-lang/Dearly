/**
 * lib/supabase/server.ts
 * Server-side Supabase client — safe to import in Server Components and API routes.
 * Uses @supabase/ssr createServerClient with Next.js cookie helpers.
 *
 * Returns null when Supabase env vars are not configured so callers can
 * return a user-friendly error instead of crashing with an unhandled exception.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createClient() {
  if (!url || !key) return null;

  const cookieStore = cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method is called from a Server Component.
          // This can be ignored if you have middleware refreshing sessions.
        }
      },
    },
  });
}
