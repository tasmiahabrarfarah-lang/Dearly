"use client";

/**
 * /auth/login — Login screen.
 */

import React, { useState, useTransition, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "@/app/auth/actions";
import AuthCard, {
  Field,
  SubmitButton,
  AuthLink,
  ErrorBanner,
} from "@/components/auth/AuthCard";


function LoginInner() {

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("error") === "link_expired") {
      setError("That link has expired or is invalid. Please try again.");
    }
  }, [params]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await signIn(fd);
      if (result?.error) setError(result.error);
      // On success, signIn() server action redirects — no client-side handling needed
    });
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-10">
      {/* Back to welcome */}
      <div className="w-full max-w-sm mb-4">
        <Link
          href="/welcome"
          className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80"
          style={{ color: "rgba(220,210,255,0.85)" }}
        >
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to welcome
        </Link>
      </div>

      <AuthCard
        title="Welcome back"
        subtitle="Log in to return to your world."
        accent={
          <svg viewBox="0 0 22 22" fill="none" className="w-7 h-7" aria-hidden="true">
            <path d="M11 1.5 L12.8 8 L19.5 8 L14 12 L16.2 18.5 L11 14.8 L5.8 18.5 L8 12 L2.5 8 L9.2 8 Z"
              fill="#c4b5e8" opacity="0.8" />
          </svg>
        }
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {error && <ErrorBanner message={error} />}

          <Field
            label="Email address"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "#6b5b8a" }}
              >
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-medium hover:underline"
                style={{ color: "#9b7fd4" }}
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Your password"
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

          <SubmitButton
            label="Log In"
            loadingLabel="Opening your world…"
            pending={isPending}
          />
        </form>

        <div className="flex items-center justify-center gap-1 text-xs" style={{ color: "#6b5b8a" }}>
          <span>New to Dearly?</span>
          <AuthLink href="/auth/register">Begin your journey</AuthLink>
        </div>
      </AuthCard>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
