import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#070A13",
        panel: "#101627",
        ink: "#F4F7FF",
        glow: "#4CC9F0"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(76, 201, 240, 0.45), 0 12px 35px rgba(76, 201, 240, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
