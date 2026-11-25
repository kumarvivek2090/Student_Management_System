/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#F8F7F2',       // Primary Background
        cream: '#F0EFE6',       // Secondary Background
        card: '#FFFFFF',        // Card Background
        brand: {
          DEFAULT: '#52613B',   // Primary Brand Deep Olive Green
          hover: '#3F4D2D',     // Primary Hover
          light: '#65774A',
          dark: '#293526',      // Deep Forest Green
        },
        forest: '#293526',      // Dark Forest Green
        charcoal: {
          DEFAULT: '#242820',   // Heading Text (Rich Charcoal)
          body: '#555B50',      // Body Text (Readable Muted Charcoal)
          secondary: '#74796D', // Secondary Text
        },
        muted: '#555B50',       // Accessible Body Text
        border: '#E3E1D6',      // Global Border
        warmgrey: '#E3E1D6',    // Border alias
        gold: {
          light: '#D2B66F',     // Dark section accent
          DEFAULT: '#A58A50',   // Accent Muted Gold
          dark: '#856D38',
        },
        success: '#247A55',
        error: '#B84040',
        info: '#386A91',
        olive: {
          50: '#F5F7F1',
          100: '#E4EAD9',
          200: '#CAD6B7',
          300: '#AAB895',
          400: '#7B8F5E',
          500: '#52613B',      // Primary Brand
          600: '#3F4D2D',      // Primary Hover
          700: '#2F3C21',
          800: '#293526',      // Deep Forest Green
          900: '#1D251A',
        },
        dark: {
          bg: '#111710',
          page: '#111710',
          card: '#182216',
          subtle: '#131A12',
          border: '#283623',
          heading: '#F3F6F0',
          body: '#CAD6B7',
          secondary: '#A8B49E',
          muted: '#85917B',
          accent: '#B2D297',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(36, 40, 32, 0.05), 0 1px 2px -1px rgba(36, 40, 32, 0.05)',
        card: '0 4px 12px 0 rgba(36, 40, 32, 0.06)',
        elevated: '0 10px 25px -3px rgba(36, 40, 32, 0.08), 0 4px 6px -4px rgba(36, 40, 32, 0.04)',
        panel: '0 12px 30px -4px rgba(36, 40, 32, 0.1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        slideDown: 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        scaleIn: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
}
