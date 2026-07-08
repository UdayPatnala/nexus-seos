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
          bg: '#0a0e1a',
          surface: '#111827',
          border: '#1f2937',
          accent: '#6366f1',
          'accent-dark': '#4f46e5',
          muted: '#374151',
          text: '#f9fafb',
          subtle: '#9ca3af',
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
