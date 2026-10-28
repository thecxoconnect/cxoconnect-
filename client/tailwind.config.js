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
          charcoal: '#111315',
          ochre: '#D99B26',
          'ochre-hover': '#C2871E',
          'card-navy': '#0E1622',
          muted: '#64748B',
          stroke: '#E2E8F0'
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
        'executive-card': '0 10px 30px -10px rgba(17, 19, 21, 0.08)',
        'dark-card': '0 20px 40px -15px rgba(14, 22, 34, 0.35)',
        'gold-glow': '0 0 25px rgba(217, 155, 38, 0.25)',
      }
    },
  },
  plugins: [],
}
