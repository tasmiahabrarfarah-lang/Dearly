"use client";

/**
 * /auth/reset-password — Set a new password after following the email link.
 *
 * Flow:
 *   1. User clicks "Reset password" in email → Supabase sends them to
 *      /auth/callback?next=/auth/reset-password
 *   2. /auth/callback exchanges the code for a live session, then redirects here.
 *   3. This page calls updatePassword() which uses the live session to set the
 *      new password, then redirects to /world.
 */

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { updatePassword } from "@/app/auth/actions";
import AuthCard, {
  SubmitButton,
  AuthLink,
  ErrorBanner,
} from "@/components/auth/AuthCard";

export default function ResetPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError]   = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const pw  = fd.get("password")         as string;
    const cpw = fd.get("confirm_password")  as string;

    if (pw.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (pw !== cpw) {
      setError("Passwords don't match.");
      return;
    }

    startTransition(async () => {
      const result = await updatePassword(fd);
      if (result?.error) setError(result.error);
      // On success the server action redirects to /world — no client handling needed
    });
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-10">
      {/* Back to login */}
      <div className="w-full max-w-sm mb-4">
        <Link
          href="/auth/login"
          className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80"
          style={{ color: "rgba(220,210,255,0.85)" }}
        >
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to log in
        </Link>
      </div>

      <AuthCard
        title="Choose a new password"
        subtitle="Pick something you'll remember. You can always reset it again from the login page."
        accent={
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(196, 181, 232, 0.3)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true">
              <path
                d="M15 7a4 4 0 0 0-8 0v1H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2V7z"
                stroke="#9b7fd4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              />
              <circle cx="12" cy="15" r="1.5" fill="#9b7fd4" />
            </svg>
          </div>
        }
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {error && <ErrorBanner message={error} />}

          {/* New password */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: "#6b5b8a" }}
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                required
                className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{
                  background: "rgba(244, 238, 255, 0.6)",
                  border: "1px solid rgba(196, 181, 232, 0.5)",
                  color: "#3b2e5a",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80 transition-opacity"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="confirm_password"
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: "#6b5b8a" }}
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirm_password"
                name="confirm_password"
                type={showCpw ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repeat your new password"
                required
                className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{
                  background: "rgba(244, 238, 255, 0.6)",
                  border: "1px solid rgba(196, 181, 232, 0.5)",
                  color: "#3b2e5a",
                }}
              />
              <button
                type="button"
                onClick={() => setShowCpw(!showCpw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80 transition-opacity"
                aria-label={showCpw ? "Hide password" : "Show password"}
              >
                {showCpw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <SubmitButton
            label="Set New Password"
            loadingLabel="Saving…"
            pending={isPending}
          />
        </form>

        <p className="text-xs text-center" style={{ color: "#6b5b8a" }}>
          Remembered it?{" "}
          <AuthLink href="/auth/login">Log in instead</AuthLink>
        </p>
      </AuthCard>
    </div>
  );
}
