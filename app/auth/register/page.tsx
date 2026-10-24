"use client";

/**
 * /auth/register — Account creation screen.
 */

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { resendSignupConfirmation, signUp } from "@/app/auth/actions";
import { PALETTES, PaletteId } from "@/components/ThemeContext";
import AuthCard, {
  Field,
  SubmitButton,
  AuthLink,
  ErrorBanner,
  SuccessBanner,
} from "@/components/auth/AuthCard";

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSent, setResendSent] = useState(false);
  const [isResending, startResend] = useTransition();
  const [showPw, setShowPw]     = useState(false);
  const [showCpw, setShowCpw]   = useState(false);
  const [pwError, setPwError]   = useState<string | null>(null);
  const [palette, setPalette] = useState<PaletteId>("dreamy-lavender");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const pw  = fd.get("password")  as string;
    const cpw = fd.get("confirm_password") as string;

    setError(null);
    setPwError(null);

    if (pw.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    if (pw !== cpw) {
      setPwError("Passwords don't match.");
      return;
    }

    startTransition(async () => {
      const result = await signUp(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setSubmittedEmail(String(fd.get("email") ?? ""));
        setSuccess(true);
      }
    });
  }

  // ── Success state: email confirmation needed ──
  if (success) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center px-6 py-10">
        <AuthCard
          title="Check your inbox ✦"
          subtitle="We've sent a confirmation link to your email address."
          accent={
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(196, 181, 232, 0.3)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  stroke="#9b7fd4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          }
        >
          <SuccessBanner message={`If email confirmation is enabled, a message should arrive at ${submittedEmail}. Follow its link to activate your account.`} />
          <div className="flex flex-col gap-2">
            {resendError && <ErrorBanner message={resendError} />}
            {resendSent && <SuccessBanner message="A new confirmation message was requested. Check your inbox and spam folder." />}
            <button
              type="button"
              disabled={isResending}
              onClick={() => {
                setResendError(null);
                setResendSent(false);
                startResend(async () => {
                  const result = await resendSignupConfirmation(submittedEmail);
                  if (result.error) setResendError(result.error);
                  else setResendSent(true);
                });
              }}
              className="w-full rounded-xl px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-60"
              style={{ background: "rgba(196, 181, 232, 0.25)", color: "#6b5b8a" }}
            >
              {isResending ? "Requesting another message…" : "Resend confirmation email"}
            </button>
          </div>
          <p className="text-xs text-center" style={{ color: "#6b5b8a" }}>
            Already confirmed?{" "}
            <AuthLink href="/auth/login">Log in here</AuthLink>
          </p>
        </AuthCard>
      </div>
    );
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
        title="Choose your little world's atmosphere"
        subtitle="Every little world has its own feeling. Choose the one that feels like home to you."
        accent={
          <svg viewBox="0 0 22 22" fill="none" className="w-7 h-7" aria-hidden="true">
            <path d="M11 1.5 L12.8 8 L19.5 8 L14 12 L16.2 18.5 L11 14.8 L5.8 18.5 L8 12 L2.5 8 L9.2 8 Z"
              fill="#c4b5e8" opacity="0.8" />
          </svg>
        }
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {error && <ErrorBanner message={error} />}

          <fieldset className="flex flex-col gap-2" aria-describedby="theme-note">
            <legend className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#6b5b8a" }}>
              Choose a theme
            </legend>
            <div className="grid grid-cols-2 gap-2.5">
              {PALETTES.map((option) => {
                const selected = palette === option.id;
                return (
                  <label key={option.id} className="relative min-w-0 cursor-pointer rounded-2xl focus-within:ring-2 focus-within:ring-offset-2" style={{ "--tw-ring-color": "#8062b4" } as React.CSSProperties}>
                    <input
                      className="peer sr-only"
                      type="radio"
                      name="palette"
                      value={option.id}
                      checked={selected}
                      onChange={() => setPalette(option.id)}
                    />
                    <span
                      className="block overflow-hidden rounded-2xl transition-shadow"
                      style={{ border: `2px solid ${selected ? "#8062b4" : "rgba(120,100,150,0.22)"}`, boxShadow: selected ? "0 0 0 2px rgba(128,98,180,0.2)" : "none" }}
                    >
                      <span className="relative block aspect-[1.8] overflow-hidden bg-slate-100" aria-hidden="true">
                        <Image src={option.background} alt="" fill sizes="(max-width: 640px) 45vw, 180px" style={{ objectFit: "cover", objectPosition: "center 48%" }} />
                        <Image src={option.foreground} alt="" width={option.id === "morning-sky" ? 1870 : 1920} height={option.id === "morning-sky" ? 841 : 540} sizes="(max-width: 640px) 45vw, 180px" className="absolute bottom-0 left-0 w-full h-auto" />
                      </span>
                      <span className="flex items-start gap-2 px-2.5 py-2.5 text-left" style={{ background: "rgba(255,255,255,0.88)", color: "#3b2e5a" }}>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold leading-tight">{option.label}</span>
                          <span className="mt-1 block text-[10px] leading-snug" style={{ color: "#6b5b8a" }}>{option.description}</span>
                        </span>
                        {selected && <span className="flex-shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ background: "#8062b4", color: "white" }}>Selected</span>}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            <p id="theme-note" className="rounded-xl px-3 py-2 text-xs text-center font-medium" style={{ background: "rgba(128,98,180,0.1)", color: "#59427e" }}>
              You can change your theme anytime in Settings.
            </p>
          </fieldset>

          <Field
            label="Username"
            id="username"
            name="username"
            autoComplete="username"
            placeholder="little_wanderer"
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]{3,20}"
          />
          <p className="-mt-3 text-xs" style={{ color: "#6b5b8a" }}>3–20 characters: lowercase letters, numbers, and underscores. You can change it later.</p>

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
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                required
                aria-describedby={pwError ? "pw-error" : undefined}
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
                placeholder="Repeat your password"
                required
                aria-describedby={pwError ? "pw-error" : undefined}
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
            {pwError && (
              <p id="pw-error" role="alert" className="text-xs" style={{ color: "#c03050" }}>
                {pwError}
              </p>
            )}
          </div>

          <SubmitButton
            label="Create Account"
            loadingLabel="Creating your world…"
            pending={isPending}
          />
        </form>

        <div className="flex items-center justify-center gap-1 text-xs" style={{ color: "#6b5b8a" }}>
          <span>Already have an account?</span>
          <AuthLink href="/auth/login">Log in</AuthLink>
        </div>
      </AuthCard>
    </div>
  );
}
