/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", //  ← OBRIGATÓRIO PARA O DARK MODE FUNCIONAR
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1D4ED8",
        primaryDark: "#0F172A",
        secondary: "#14B8A6",
        accent: "#FBBF24",
        neutralDark: "#020617",
        neutralLight: "#F9FAFB",
      },
    },
  },
  plugins: [],
}
