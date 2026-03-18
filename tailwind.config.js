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
          DEFAULT: '#10b981',
          dark: '#059669',
          light: '#34d399'
        },
        ocean: {
          DEFAULT: '#0ea5e9',
          dark: '#0284c7',
          light: '#38bdf8'
        },
        coral: {
          DEFAULT: '#f97316',
          dark: '#ea580c',
          light: '#fb923c'
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
