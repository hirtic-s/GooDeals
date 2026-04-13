/** @type {import('tailwindcss').Config} */
export default {
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
        surface:  '#0f1116',
        panel:    '#1a1d23',
        card:     '#1e2229',
        'card-light': '#d0d8e4',
        accent:   '#6cb4e4',
        'accent-dim': '#3d7aa8',
        muted:    '#4a5468',
        border:   '#252830',
        'border-accent': '#3a4a5c',
      },
      boxShadow: {
        'inner-glow': 'inset 0 0 24px 0 rgba(108,180,228,0.07)',
        'card':  '0 4px 24px 0 rgba(0,0,0,0.5)',
        'card-hover': '0 8px 40px 0 rgba(0,0,0,0.7), 0 0 0 1px rgba(108,180,228,0.15)',
        'hero': '0 0 80px 0 rgba(108,180,228,0.12)',
      },
      backgroundImage: {
        'page-gradient': 'linear-gradient(160deg, #0f1116 0%, #131720 100%)',
      },
    },
  },
  plugins: [],
}
