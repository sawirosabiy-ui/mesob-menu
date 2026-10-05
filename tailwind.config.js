/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Earth & Light - Warm Ivory Palette
        ivory: {
          50: '#FDFCF9',
          100: '#FAF7F2',
          200: '#F4EFE6',
          300: '#EFE6D8',
          400: '#E3D7C5',
          500: '#D4C4AE',
          600: '#BAA78E',
        },
        // Espresso & Ethiopian Coffee Brown Palette
        espresso: {
          500: '#5A3D2E',
          600: '#462E22',
          700: '#382319',
          800: '#2C1B13',
          900: '#1F120C',
          950: '#140A06',
        },
        // Deep Charcoal Palette for Dark Mode
        charcoal: {
          600: '#403B37',
          700: '#2E2A27',
          800: '#221F1C',
          850: '#1A1816',
          900: '#141211',
          950: '#0D0B0A',
        },
        // Restrained Terracotta / Berbere Accent
        terracotta: {
          300: '#E88B69',
          400: '#D86B43',
          500: '#C85A32',
          600: '#B04620',
          700: '#8F3414',
          800: '#6E250C',
        },
        // Subtle Olive Accent
        olive: {
          300: '#949E7C',
          400: '#7B8762',
          500: '#5F6B47',
          600: '#4A5435',
          700: '#373F26',
        },
        // Champagne & Muted Ethiopian Gold
        gold: {
          50: '#FAF6EE',
          100: '#F5ECDB',
          200: '#EBD8B6',
          300: '#DEC28E',
          400: '#D4AF37', // Champagne Gold
          500: '#C5A059',
          600: '#9E7241', // Muted Bronze
          700: '#7B5630',
          800: '#5A3E22',
          900: '#3D2A17',
          950: '#23170B',
        },
        obsidian: {
          800: '#1C1917',
          850: '#161412',
          900: '#12100E',
          950: '#0C0A09',
        },
        berbere: {
          400: '#D94B32',
          500: '#C23B22',
          600: '#A92D17',
          700: '#8A200E',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(212, 175, 55, 0.25)',
        'luxury-subtle': '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
        'earth-card': '0 4px 20px -2px rgba(20, 12, 8, 0.25)',
      }
    },
  },
  plugins: [],
};
