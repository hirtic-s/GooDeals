/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'Menlo', 'monospace'],
      },
      colors: {
        paper:    '#f0f7ff',
        surface:  '#0f1116',
        panel:    '#1a1d23',
        card:     '#1e2229',
        'card-light': '#d0d8e4',
        accent:   '#6cb4e4',
        'accent-dim': '#3d7aa8',
        muted:    '#4a5468',
        border:   '#252830',
        'border-accent': '#3a4a5c',
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      boxShadow: {
        'inner-glow': 'none',
        'card':  'none',
        'card-hover': '0 0 0 1px rgba(108,180,228,0.15)',
        'hero': 'none',
      },
      backgroundImage: {
        'page-gradient': 'linear-gradient(160deg, #0f1116 0%, #131720 100%)',
      },
      keyframes: {
        'seg-fill': {
          '0%':   { opacity: '0.15' },
          '50%':  { opacity: '1'    },
          '100%': { opacity: '0.15' },
        },
      },
      animation: {
        'seg-fill': 'seg-fill 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
