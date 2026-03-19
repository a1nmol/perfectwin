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
      },
      backgroundOpacity: {
        '3': '0.03',
        '8': '0.08',
        '12': '0.12',
        '15': '0.15',
      },
      animation: {
        'gradient-shift': 'gradientShift 20s ease infinite',
        'float': 'float 8s ease-in-out infinite',
        'float-delayed': 'floatDelayed 10s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 6s ease-in-out infinite',
        'bird-fly': 'birdFly 18s linear infinite',
        'bird-fly-2': 'birdFly2 24s linear infinite',
        'bird-fly-3': 'birdFly3 30s linear infinite',
        'particle': 'particle linear infinite',
        'scroll-dot': 'scrollDot 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
