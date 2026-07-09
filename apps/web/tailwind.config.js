/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          bg: '#f8fafc',
          surface: '#ffffff',
          border: '#e2e8f0',
          accent: '#4f46e5',
          'accent-dark': '#4338ca',
          muted: '#f1f5f9',
          text: '#0f172a',
          subtle: '#64748b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
