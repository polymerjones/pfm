import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0A",
        panel: "#111111",
        ink: "#F5F5F5",
        glow: "#EDEDED"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255, 255, 255, 0.22), 0 14px 34px rgba(0, 0, 0, 0.55)"
      }
    }
  },
  plugins: []
};

export default config;
