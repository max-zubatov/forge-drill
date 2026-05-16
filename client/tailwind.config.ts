import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forge: {
          bg: "#0c0a09",
          surface: "#0a0908",
          border: "#292524",
          orange: "#f97316",
          muted: "#57534e",
          text: "#e7e5e4",
          subtext: "#a8a29e",
        },
      },
      fontFamily: {
        serif: ["Instrument Serif", "Georgia", "serif"],
        sans: ["Geist", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
