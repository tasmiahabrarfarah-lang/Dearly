/**
 * app/welcome/layout.tsx  (and reused by /auth/*)
 * Full-screen background wrapper: shows the Dearly illustration behind all auth screens.
 */
import Image from "next/image";

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col">
      {/* Background illustration */}
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/assets/scenery/home-background.webp"
          alt=""
          fill
          priority
          quality={90}
          style={{ objectFit: "cover", objectPosition: "center 38%" }}
        />
        {/* Soft darkening overlay — makes text readable without obscuring art */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(40,20,80,0.55) 0%, rgba(40,20,80,0.25) 40%, rgba(40,20,80,0.10) 80%, transparent 100%)",
          }}
        />
      </div>

      {/* Foreground meadow strip */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ zIndex: 1 }}>
        <Image
          src="/assets/scenery/foreground-meadow.webp"
          alt=""
          width={1920}
          height={540}
          priority
          quality={85}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>

      {/* Page content */}
      <div className="relative z-10 flex flex-col flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
}
