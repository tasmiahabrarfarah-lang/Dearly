/**
 * middleware.ts
 * Refreshes the Supabase session on every request and protects /world.
 *
 * Public routes: /, /welcome, /auth/*, /auth/callback
 * Protected routes: /world (the home scene)
 *
 * Performance note: /welcome and / are fully public static pages.
 * We skip the getUser() network call for them to avoid cold-start
 * timeouts (e.g. after Supabase free-tier project auto-pause).
 * The session is still refreshed for all other routes.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Routes that never need a session check — skip getUser() entirely. */
const PUBLIC_STATIC_ROUTES = new Set(["/", "/welcome"]);

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Only run Supabase logic when env vars are set (graceful dev-mode degradation)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // No Supabase configured — allow all routes during development
    return supabaseResponse;
  }

  const { pathname } = request.nextUrl;

  // Skip the network round-trip for fully public, non-personalized pages.
  // This prevents 504 timeouts when the Supabase project is cold/paused.
  if (PUBLIC_STATIC_ROUTES.has(pathname)) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh the session (keeps tokens alive).
  // getUser() contacts the Supabase auth server — if the project is paused
  // or cold-starting this may be slow. The matcher below excludes routes
  // that do not need a session to reduce unnecessary calls.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /world — redirect unauthenticated users to /welcome
  if (pathname.startsWith("/world") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/welcome";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages to /world
  if (
    user &&
    (pathname === "/auth/login" ||
      pathname === "/auth/register" ||
      pathname === "/auth/forgot-password")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/world";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *  - _next/static  (Next.js static assets)
     *  - _next/image   (Next.js image optimisation)
     *  - favicon.ico
     *  - /assets/**    (public images / scenery)
     *  - /api/**       (API routes handle their own auth)
     *  - /auth/callback (mid-session exchange — no getUser needed here)
     *  - image file extensions
     */
    "/((?!_next/static|_next/image|favicon\\.ico|assets|api|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
