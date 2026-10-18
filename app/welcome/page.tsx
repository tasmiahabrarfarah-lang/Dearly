import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="welcome-layout">
      <header className="welcome-brand" aria-label="Dearly">
        <svg viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path
            d="M11 1.5 12.8 8l6.7 0-5.5 4 2.2 6.5-5.2-3.7-5.2 3.7L8 12 2.5 8l6.7 0L11 1.5Z"
            fill="currentColor"
          />
        </svg>
        <span>Dearly</span>
      </header>

      <main className="welcome-main">
        <section className="welcome-card" aria-labelledby="welcome-title">
          <p className="welcome-eyebrow">A little world of your own</p>
          <h1 id="welcome-title">Somewhere, a little world is waiting for you.</h1>
          <p className="welcome-description">
            A place to keep your memories, grow something magical, and share little moments with
            the people you love.
          </p>
          <nav className="welcome-actions" aria-label="Account">
            <Link className="welcome-button welcome-button-primary" href="/auth/register">
              Begin Your Journey
            </Link>
            <Link className="welcome-button welcome-button-secondary" href="/auth/login">
              Log In
            </Link>
          </nav>
        </section>
      </main>

      <footer className="welcome-footer">Your memories are private and belong to you.</footer>
    </div>
  );
}
