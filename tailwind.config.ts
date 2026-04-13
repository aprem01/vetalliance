import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: { center: true, padding: "1.5rem" },
    extend: {
      colors: {
        navy: {
          50: "#E8ECF2",
          100: "#C4CCD9",
          500: "#1F3352",
          700: "#12233D",
          900: "#0A1628",
          950: "#050B17",
        },
        gold: {
          300: "#E2C87A",
          400: "#D4B45E",
          500: "#C9A84C",
          600: "#A88A33",
        },
        border: "hsl(220 20% 22%)",
        input: "hsl(220 20% 18%)",
        ring: "#C9A84C",
        background: "#0A1628",
        foreground: "#E8ECF2",
        primary: { DEFAULT: "#C9A84C", foreground: "#0A1628" },
        secondary: { DEFAULT: "#12233D", foreground: "#E8ECF2" },
        muted: { DEFAULT: "#12233D", foreground: "#8FA0B8" },
        accent: { DEFAULT: "#1F3352", foreground: "#E8ECF2" },
        destructive: { DEFAULT: "#B44B4B", foreground: "#FFF" },
        card: { DEFAULT: "#0F1E33", foreground: "#E8ECF2" },
        popover: { DEFAULT: "#0F1E33", foreground: "#E8ECF2" },
      },
      borderRadius: {
        lg: "0.625rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
