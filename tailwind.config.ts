import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B1220",
        panel: "#121A2B",
        panelLine: "#22304A",
        text: {
          DEFAULT: "#E4E9F2",
          muted: "#7C8AA5",
        },
        signal: "#43D9A3",
        alert: "#F2A65A",
        critical: "#E5484D",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
        body: ["var(--font-body)", "sans-serif"],
      },
      keyframes: {
        marquee: {
          "from": { transform: "translateX(0)" },
          "to": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 45s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
