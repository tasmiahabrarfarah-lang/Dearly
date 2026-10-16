import Link from "next/link";

/**
 * /welcome — Dearly Landing Page
 * The entry experience: brand, hero copy, and two primary actions.
 */
export default function WelcomePage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-between px-6 py-8 sm:py-10">

      {/* ── Top: Wordmark ─────────────────────────────────── */}
      <header className="flex items-center gap-2.5 select-none">
        {/* Star accent */}
        <svg viewBox="0 0 22 22" fill="none" className="w-5 h-5 flex-shrink-0" aria-hidden="true">
          <path
            d="M11 1.5 L12.8 8 L19.5 8 L14 12 L16.2 18.5 L11 14.8 L5.8 18.5 L8 12 L2.5 8 L9.2 8 Z"
            fill="#e0d0ff"
            opacity="0.9"
          />
        </svg>
        <span
          className="text-2xl font-semibold tracking-tight text-white"
          style={{ fontFamily: "Georgia, serif", textShadow: "0 1px 8px rgba(40,20,80,0.4)" }}
        >
          Dearly
        </span>
      </header>

      {/* ── Centre: Hero ──────────────────────────────────── */}
      <main className="flex flex-col items-center text-center gap-7 max-w-lg">

        {/* Decorative diary icon */}
        <div aria-hidden="true" className="opacity-90">
          <svg viewBox="0 0 80 62" fill="none" className="w-20 h-auto drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lp-cover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8d8f8" />
                <stop offset="100%" stopColor="#c8aee8" />
              </linearGradient>
            </defs>
            {/* Pages */}
            <rect x="11" y="5" width="63" height="52" rx="4" fill="#f8f0e8" opacity="0.95" />
            {/* Cover */}
            <rect x="7" y="3" width="63" height="53" rx="5" fill="url(#lp-cover)" />
            {/* Spine */}
            <rect x="7" y="3" width="8" height="53" rx="4" fill="#a880d0" opacity="0.9" />
            {/* Ribbon */}
            <path d="M50 3 L50 24 L46 19 L42 24 L42 3 Z" fill="#d890b8" opacity="0.9" />
            {/* Flower */}
            <g transform="translate(38, 30)">
              {[0, 90, 180, 270].map((deg, i) => (
                <ellipse key={i} cx="0" cy="-5" rx="2.5" ry="4"
                  fill={i % 2 === 0 ? "#c8a8e8" : "#b898d8"} opacity="0.85"
                  transform={`rotate(${deg})`} />
              ))}
              <circle r="2.5" fill="#e8d8f8" />
            </g>
          </svg>
        </div>

        {/* Headline */}
        <div className="flex flex-col gap-3">
          <h1
            className="text-3xl sm:text-4xl font-semibold leading-snug text-white"
            style={{
              fontFamily: "Georgia, serif",
              textShadow: "0 2px 16px rgba(30,10,70,0.5)",
            }}
          >
            Somewhere, a little world<br className="hidden sm:block" /> is waiting for you.
          </h1>
          <p
            className="text-base sm:text-lg leading-relaxed max-w-sm mx-auto"
            style={{
              color: "rgba(240, 230, 255, 0.88)",
              textShadow: "0 1px 8px rgba(30,10,70,0.4)",
            }}
          >
            A place to keep your memories, grow something magical, and share little moments with
            the people you love.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href="/auth/register"
            className="
              w-full sm:w-auto px-8 py-3 rounded-2xl
              text-sm font-semibold text-white
              transition-all duration-150 active:scale-[0.97]
              text-center
            "
            style={{
              background: "linear-gradient(135deg, #9b7fd4 0%, #7b5fb4 100%)",
              boxShadow: "0 4px 24px rgba(155,127,212,0.45), 0 1px 4px rgba(155,127,212,0.3)",
            }}
          >
            Begin Your Journey
          </Link>
          <Link
            href="/auth/login"
            className="
              w-full sm:w-auto px-8 py-3 rounded-2xl
              text-sm font-semibold
              transition-all duration-150 active:scale-[0.97]
              text-center
            "
            style={{
              background: "rgba(253, 248, 242, 0.15)",
              border: "1px solid rgba(253, 248, 242, 0.35)",
              color: "rgba(240, 230, 255, 0.95)",
              backdropFilter: "blur(8px)",
            }}
          >
            Log In
          </Link>
        </div>
      </main>

      {/* ── Bottom: Discreet footer ───────────────────────── */}
      <footer className="text-center">
        <p
          className="text-xs"
          style={{ color: "rgba(210, 195, 240, 0.65)" }}
        >
          Your memories are private and belong to you.
        </p>
      </footer>
    </div>
  );
}
