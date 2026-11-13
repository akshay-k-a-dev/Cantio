/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '360px',      // Small to average phones
        'sm': '390px',      // Large phones  
        'md': '768px',      // Tablets (default md)
        'lg': '1024px',     // Large tablets and desktops
        'xl': '1280px',     // Desktops
        '2xl': '1536px',    // Large desktops
      },
      colors: {
        primary: {
          50: '#e8f4f8',
          100: '#c5e0ec',
          200: '#a4c4d4',   // Pale Frost Blue
          300: '#83aec0',
          400: '#619ca9',   // Muted Steel Blue
          500: '#518eac',   // Cerulean Blue (main accent)
          600: '#0f4c6c',   // Deep Midnight Teal
          700: '#0a3850',
          800: '#062030',
          900: '#010101',   // Pitch Black
        },
        dawnfm: {
          black:   '#010101',
          teal:    '#0F4C6C',
          cerulean:'#518EAC',
          steel:   '#619CA9',
          frost:   '#A4C4D4',
          ash:     '#C8C8C8',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
