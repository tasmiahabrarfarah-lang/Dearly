"use server";

/**
 * app/auth/actions.ts
 * Server Actions for Supabase email/password authentication.
 * All sensitive logic runs on the server — no credentials in the client bundle.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizeUsername, validateUsername } from "@/lib/profile";

const NO_CONFIG_ERROR =
  "Authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and " +
  "NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file and restart the dev server.";

function getAuthSiteUrl(): { url?: string; error?: string } {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configured) return { error: "Set NEXT_PUBLIC_SITE_URL to the public address of this app before requesting an email." };
  try {
    const parsed = new URL(configured);
    const local = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && local)) {
      return { error: "NEXT_PUBLIC_SITE_URL must use HTTPS for a deployed app." };
    }
    if (process.env.NODE_ENV === "production" && local) {
      return { error: "NEXT_PUBLIC_SITE_URL still points to localhost. Set it to the deployed app URL and rebuild." };
    }
    return { url: parsed.origin };
  } catch {
    return { error: "NEXT_PUBLIC_SITE_URL must be a valid absolute URL, such as https://dearly.example." };
  }
}

// ── Sign Up ────────────────────────────────────────────────────────────────
export async function signUp(formData: FormData) {
  const supabase = createClient();
  if (!supabase) return { error: NO_CONFIG_ERROR };
  const site = getAuthSiteUrl();
  if (!site.url) return { error: site.error };

  const emailValue = formData.get("email");
  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  const password = formData.get("password") as string;
  const requestedPalette = formData.get("palette");
  const usernameValue = formData.get("username");
  const username = typeof usernameValue === "string" ? normalizeUsername(usernameValue) : "";
  const usernameError = validateUsername(username);
  if (usernameError) return { error: usernameError };
  const { data: available, error: availabilityError } = await supabase.rpc("is_username_available", { p_username: username });
  if (availabilityError) return { error: "Username availability could not be checked. Please try again." };
  if (!available) return { error: "That username is already taken. Please choose another." };
  const palette = requestedPalette === "morning-sky" ? "morning-sky" : "dreamy-lavender";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // After email confirmation, user lands on /world
      emailRedirectTo: new URL("/auth/callback", site.url).toString(),
      // Auth user metadata is scoped to the account being created and is
      // available even when email confirmation is required.
      data: { palette, username },
    },
  });

  if (error) {
    if (error.code === "23505") return { error: "That username was just claimed. Please choose another." };
    return { error: error.message };
  }

  // Supabase intentionally returns a successful-looking response for an
  // already registered address when email confirmations are enabled. In that
  // case it returns an empty identities array instead of an Auth error.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return {
      error: "This email may already have an account. Try logging in or resetting your password.",
    };
  }

  return { success: true, needsConfirmation: true };
}

// ── Resend sign-up confirmation ──────────────────────────────────────────
export async function resendSignupConfirmation(email: string) {
  if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }
  const supabase = createClient();
  if (!supabase) return { error: NO_CONFIG_ERROR };
  const site = getAuthSiteUrl();
  if (!site.url) return { error: site.error };

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: new URL("/auth/callback", site.url).toString() },
  });
  if (error) return { error: error.message };
  return { success: true };
}

// ── Sign In ────────────────────────────────────────────────────────────────
export async function signIn(formData: FormData) {
  const supabase = createClient();
  if (!supabase) return { error: NO_CONFIG_ERROR };

  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Generic message — do not reveal whether an email exists
    return { error: "Invalid email or password. Please try again." };
  }

  revalidatePath("/world");
  redirect("/world");
}

// ── Sign Out ───────────────────────────────────────────────────────────────
export async function signOut() {
  const supabase = createClient();
  if (supabase) await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/welcome");
}

// ── Forgot Password ────────────────────────────────────────────────────────
export async function forgotPassword(formData: FormData) {
  const supabase = createClient();
  if (!supabase) return { error: NO_CONFIG_ERROR };
  const site = getAuthSiteUrl();
  if (!site.url) return { error: site.error };

  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: new URL("/auth/callback?next=/auth/reset-password", site.url).toString(),
  });

  if (error) {
    return { error: error.message };
  }

  // Always return a neutral success message — do not reveal whether email exists
  return { success: true };
}
