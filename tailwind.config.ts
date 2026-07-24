import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          500: "#3b6cff",
          600: "#2f56d9",
          700: "#2645ad",
        },
      },
    },
  },
  plugins: [],
};

export default config;
