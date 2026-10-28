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
          charcoal: '#0F172A',
          dark: '#111315',
          blue: '#0066CC',
          'blue-vibrant': '#0D6EFD',
          'blue-hover': '#0052A3',
          'blue-light': '#EBF5FF',
          white: '#FFFFFF',
          stroke: '#E2E8F0',
          muted: '#64748B',
          card: '#FFFFFF'
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
        'executive-card': '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
        'blue-glow': '0 0 25px rgba(0, 102, 204, 0.25)',
        'soft-pill': '0 2px 8px rgba(0, 0, 0, 0.04)'
      }
    },
  },
  plugins: [],
}
