/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F7F7F4',
          cream: '#F7F7F4',
          charcoal: '#111315',
          dark: '#111315',
          gold: '#D99B26',
          accent: '#D99B26',
          'gold-hover': '#C2871E',
          'gold-light': '#FDF6E9',
          navy: '#0E1622',
          container: '#0E1622',
          white: '#FFFFFF',
          stroke: '#E2E8F0',
          muted: '#64748B',
          card: '#FFFFFF',
          blue: '#0066CC'
        }
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      letterSpacing: {
        'widest-xl': '0.2em',
      },
      boxShadow: {
        'executive-card': '0 4px 20px -2px rgba(17, 19, 21, 0.06)',
        'gold-glow': '0 0 25px rgba(217, 155, 38, 0.25)',
        'soft-pill': '0 2px 8px rgba(0, 0, 0, 0.04)'
      }
    },
  },
  plugins: [],
}
