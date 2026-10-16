/**
 * middleware.ts
 * Refreshes the Supabase session on every request and protects /world.
 *
 * Public routes: /, /welcome, /auth/*, /auth/callback
 * Protected routes: /world (the home scene)
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Only run Supabase logic when env vars are set (graceful dev-mode degradation)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // No Supabase configured — allow all routes during development
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

  // Refresh the session (keeps tokens alive)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protect /world — redirect unauthenticated users to /welcome
  if (pathname.startsWith("/world") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/welcome";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages to /world
  if (
    user &&
    (pathname === "/welcome" ||
      pathname === "/auth/login" ||
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
    // Run on all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
