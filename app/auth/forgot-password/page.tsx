"use client";

/**
 * /auth/forgot-password — Password recovery screen.
 */

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { forgotPassword } from "@/app/auth/actions";
import AuthCard, {
  Field,
  SubmitButton,
  AuthLink,
  ErrorBanner,
  SuccessBanner,
} from "@/components/auth/AuthCard";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await forgotPassword(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
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
        title="Recover your account"
        subtitle="Enter your email and we'll send you a link to reset your password."
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
        {success ? (
          <>
            <SuccessBanner
              message="If an account exists for that address, a reset link is on its way. Check your inbox — and your spam folder."
            />
            <p className="text-xs text-center" style={{ color: "#6b5b8a" }}>
              <AuthLink href="/auth/login">Back to log in</AuthLink>
            </p>
          </>
        ) : (
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

            <SubmitButton
              label="Send Reset Link"
              loadingLabel="Sending…"
              pending={isPending}
            />

            <p className="text-xs text-center" style={{ color: "#6b5b8a" }}>
              Remembered it?{" "}
              <AuthLink href="/auth/login">Log in</AuthLink>
            </p>
          </form>
        )}
      </AuthCard>
    </div>
  );
}
