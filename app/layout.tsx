import type { Metadata } from "next";
import { Nunito_Sans, Lora, Caveat } from "next/font/google";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-nunito",
  display: "swap",
});

// Lora — elegant serif for diary writing
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

// Caveat — gentle handwritten feel
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dearly — Your Little World",
  description: "A cozy personal diary and softly magical personal space.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${nunitoSans.variable} ${lora.variable} ${caveat.variable}`}
    >
      <body
        style={{
          fontFamily: "var(--font-nunito), system-ui, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
