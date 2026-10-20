"use server";

/**
 * app/auth/actions.ts
 * Server Actions for Supabase email/password authentication.
 * All sensitive logic runs on the server — no credentials in the client bundle.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const NO_CONFIG_ERROR =
  "Authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and " +
  "NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file and restart the dev server.";

// ── Sign Up ────────────────────────────────────────────────────────────────
export async function signUp(formData: FormData) {
  const supabase = createClient();
  if (!supabase) return { error: NO_CONFIG_ERROR };

  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;
  const requestedPalette = formData.get("palette");
  const palette = requestedPalette === "morning-sky" ? "morning-sky" : "dreamy-lavender";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // After email confirmation, user lands on /world
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback`,
      // Auth user metadata is scoped to the account being created and is
      // available even when email confirmation is required.
      data: { palette },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, needsConfirmation: true };
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

  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback?next=/auth/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  // Always return a neutral success message — do not reveal whether email exists
  return { success: true };
}
