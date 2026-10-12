import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/diary/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dearly: {
          lavender:  "#c4b5e8",
          "lavender-deep": "#9b7fd4",
          cream:     "#fdf8f2",
          "dusty-blue": "#aed6f0",
          "soft-pink": "#f0c8d4",
          "warm-gold": "#d4a843",
          "text-primary": "#3b2e5a",
          "text-muted":   "#6b5b8a",
        },
      },
      fontFamily: {
        sans:  ["Nunito Sans", "Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "soft": "0 4px 20px rgba(100,80,160,0.12)",
        "glow": "0 0 20px rgba(155,127,212,0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
