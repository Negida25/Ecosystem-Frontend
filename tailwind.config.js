/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#166534",
        "primary-dark": "#052e16",
        "primary-light": "#dcfce7",
        accent: "#4ade80",
        danger: "#dc2626",
        warning: "#d97706",
        info: "#2563eb",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}