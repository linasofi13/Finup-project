/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#FFD700', // Standard gold/yellow color
        'primary-light': '#FFEB99',
        'secondary': '#3B82F6', // Tailwind blue-500
        'secondary-dark': '#1D4ED8', // Tailwind blue-700
        'neutral-light': '#F3F4F6', // Tailwind gray-100
        'neutral-medium': '#D1D5DB', // Tailwind gray-300
        'neutral-dark': '#374151', // Tailwind gray-700
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'bancolombia': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      ringColor: {
        DEFAULT: '#0C3FFE',
        'bancolombia-blue': '#0C3FFE',
      },
      ringWidth: {
        DEFAULT: '3px',
        '1': '1px',
        '2': '2px',
      },
    },
  },
  plugins: [],
};