"use client";

/**
 * components/auth/AuthCard.tsx
 * Shared visual shell for all auth screens.
 * Renders on top of the background illustration.
 */

import React from "react";
import Link from "next/link";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Small decorative element rendered above the title */
  accent?: React.ReactNode;
}

export default function AuthCard({ title, subtitle, children, accent }: AuthCardProps) {
  return (
    <div
      className="w-full max-w-sm mx-auto rounded-3xl px-8 py-8 flex flex-col gap-5"
      style={{
        background: "rgba(253, 248, 242, 0.92)",
        border: "1px solid rgba(196, 181, 232, 0.4)",
        boxShadow: "0 8px 48px rgba(80, 50, 140, 0.18), 0 2px 12px rgba(80, 50, 140, 0.08)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Accent / icon */}
      {accent && (
        <div className="flex justify-center">{accent}</div>
      )}

      {/* Title */}
      <div className="text-center">
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ fontFamily: "Georgia, var(--font-lora), serif", color: "#3b2e5a" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-sm" style={{ color: "#6b5b8a" }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Content */}
      {children}
    </div>
  );
}

/* ── Small reusable form primitives ── */

interface FieldProps {
  label: string;
  id: string;
  type?: string;
  name: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  rightSlot?: React.ReactNode;
}

export function Field({
  label, id, type = "text", name, autoComplete,
  placeholder, required, error, rightSlot
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "#6b5b8a" }}
        >
          {label}
        </label>
        {rightSlot}
      </div>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        aria-describedby={error ? `${id}-error` : undefined}
        className="
          w-full px-4 py-2.5 rounded-xl text-sm
          transition-colors duration-150
          focus:outline-none focus:ring-2
        "
        style={{
          background: "rgba(244, 238, 255, 0.6)",
          border: "1px solid rgba(196, 181, 232, 0.5)",
          color: "#3b2e5a",
          // @ts-expect-error — CSS custom properties
          "--tw-ring-color": "#9b7fd4",
        }}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs" style={{ color: "#c03050" }}>
          {error}
        </p>
      )}
    </div>
  );
}

interface SubmitButtonProps {
  label: string;
  loadingLabel?: string;
  pending?: boolean;
  variant?: "primary" | "secondary";
}

export function SubmitButton({ label, loadingLabel, pending, variant = "primary" }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="
        w-full py-2.5 px-4 rounded-xl
        text-sm font-semibold
        transition-all duration-150
        disabled:opacity-60 disabled:cursor-not-allowed
        active:scale-[0.98]
      "
      style={
        variant === "primary"
          ? {
              background: "linear-gradient(135deg, #9b7fd4 0%, #7b5fb4 100%)",
              color: "#ffffff",
              boxShadow: "0 2px 12px rgba(155, 127, 212, 0.35)",
            }
          : {
              background: "rgba(196, 181, 232, 0.25)",
              border: "1px solid rgba(196, 181, 232, 0.5)",
              color: "#6b5b8a",
            }
      }
    >
      {pending ? (loadingLabel ?? "Please wait…") : label}
    </button>
  );
}

interface AuthLinkProps {
  href: string;
  children: React.ReactNode;
}

export function AuthLink({ href, children }: AuthLinkProps) {
  return (
    <Link
      href={href}
      className="text-xs font-medium hover:underline transition-all"
      style={{ color: "#9b7fd4" }}
    >
      {children}
    </Link>
  );
}

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="rounded-xl px-4 py-3 text-sm"
      style={{
        background: "rgba(220, 50, 80, 0.08)",
        border: "1px solid rgba(220, 50, 80, 0.2)",
        color: "#c03050",
      }}
    >
      {message}
    </div>
  );
}

interface SuccessBannerProps {
  message: string;
}

export function SuccessBanner({ message }: SuccessBannerProps) {
  return (
    <div
      role="status"
      className="rounded-xl px-4 py-3 text-sm"
      style={{
        background: "rgba(60, 160, 80, 0.08)",
        border: "1px solid rgba(60, 160, 80, 0.2)",
        color: "#2a7040",
      }}
    >
      {message}
    </div>
  );
}
