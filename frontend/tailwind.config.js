/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003366', // Deep Blue
          light: '#004488',
          dark: '#002244',
        },
        secondary: {
          DEFAULT: '#D2B48C', // Warm Beige
          light: '#E3CDB0',
          dark: '#C19F6E',
        },
        accent: {
          DEFAULT: '#228B22', // Vibrant Green
          hover: '#1D751D',
          light: '#4CAF50',
        },
        warning: '#FF4500', // Red
        alert: '#FFD700',   // Yellow
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        arabic: ['"Noto Kufi Arabic"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

