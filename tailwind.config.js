/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // App surface palette (modern dark)
        canvas: "#0a0b0d",
        surface: {
          DEFAULT: "#16181d",
          raised: "#1c1f26",
          hover: "#22262e",
        },
        line: "#2a2e37",
        // Semantic accents (kept close to the original meaning, freshened)
        primary: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
          fg: "#ffffff",
        },
        secondary: {
          DEFAULT: "#a855f7",
          hover: "#9333ea",
          fg: "#ffffff",
        },
        success: {
          DEFAULT: "#22c55e",
          hover: "#16a34a",
          fg: "#06210f",
        },
        danger: {
          DEFAULT: "#ef4444",
          hover: "#dc2626",
          fg: "#ffffff",
        },
        warning: {
          DEFAULT: "#f59e0b",
          hover: "#d97706",
          fg: "#241803",
        },
        info: {
          DEFAULT: "#0ea5e9",
          hover: "#0284c7",
          fg: "#ffffff",
        },
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -12px rgba(0,0,0,0.6)",
        pop: "0 8px 30px -8px rgba(0,0,0,0.7)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: 0, transform: "translateY(-2px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 120ms ease-out",
      },
    },
  },
  plugins: [],
};
