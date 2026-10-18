import Image from "next/image";

/** The public welcome page has its own scenery, separate from the app world. */
export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="welcome-scene">
      <div className="welcome-scenery" aria-hidden="true">
        <Image
          src="/assets/scenery/dearly-landing-background.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          quality={90}
          style={{ objectFit: "cover", objectPosition: "center center" }}
        />
      </div>
      <div className="welcome-content">{children}</div>
    </div>
  );
}
