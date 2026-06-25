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
        background: '#0d1117',
        card: '#161b27',
        border: '#21293a',
        textPrimary: '#f1f5f9',
        textMuted: '#94a3b8',
        textHint: '#475569',
        accent: '#3b82f6',
        accentDark: '#1d4ed8',
        success: '#22c55e',
        warning: '#eab308',
        danger: '#ef4444',
        amberBtn: '#d97706',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      }
    },
  },
  plugins: [],
}
