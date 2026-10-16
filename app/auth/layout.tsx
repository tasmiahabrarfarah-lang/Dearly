/**
 * app/auth/layout.tsx
 * Auth pages share the same illustrated background as /welcome.
 */
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
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
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(40,20,80,0.55) 0%, rgba(40,20,80,0.22) 45%, rgba(40,20,80,0.08) 100%)",
          }}
        />
      </div>

      {/* Foreground meadow */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ zIndex: 1 }}>
        <Image
          src="/assets/scenery/foreground-meadow.webp"
          alt=""
          width={1920}
          height={540}
          quality={85}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>

      {/* Page content */}
      <div className="relative z-10 flex flex-col flex-1 min-h-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
