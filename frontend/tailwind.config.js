/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Controlamos el tema oscuro con clases
  theme: {
    extend: {
      colors: {
        primary: "#FFE600", // Cambiado a amarillo más brillante
        "primary-light": "#FFF159", // Color hover
        secondary: "#3B82F6", // Tailwind blue-500
        "secondary-dark": "#1D4ED8", // Tailwind blue-700
        "neutral-light": "#F3F4F6", // Tailwind gray-100
        "neutral-medium": "#D1D5DB", // Tailwind gray-300
        "neutral-dark": "#374151", // Tailwind gray-700
        "bancolombia-yellow": "#FFE600", // Color amarillo de Bancolombia
        "bancolombia-blue": "#0C3FFE", // Color azul de Bancolombia
        "bancolombia-text": "#000000", // Color de texto principal
      },
      fontFamily: {
        sans: ["Inter", "Arial", "sans-serif"],
      },
      boxShadow: {
        bancolombia:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
      ringColor: {
        DEFAULT: "#0C3FFE",
        "bancolombia-blue": "#0C3FFE",
      },
      ringWidth: {
        DEFAULT: "3px",
        1: "1px",
        2: "2px",
      },
    },
  },
  plugins: [],
};
