/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fastgo: {
          primary: "#059669",
          hover: "#047857",
          light: "#ECFDF5",
          accent: "#0D9488",
          dark: "#0F172A",
          darker: "#020617",
          gray: "#64748B",
          lightGray: "#F1F5F9",
          bg: "#F8FAFC",
          text: "#0F172A",
          success: "#10B981",
          danger: "#EF4444",
          warning: "#F59E0B",
          info: "#3B82F6",
        }
      }
    },
  },
  plugins: [],
}
