/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0d0f14',
        'bg-surface': '#13161e',
        'bg-elevated': '#1a1e2a',
        'accent-cyan': '#00f5d4',
        'accent-violet': '#8b5cf6',
        'accent-green': '#22d3a5',
        'accent-red': '#f87171',
        'text-primary': '#e2e8f0',
        'text-muted': '#64748b',
        'text-code': '#94e2d1',
      },
      fontFamily: {
        'mono': ['"JetBrains Mono"', 'monospace'],
        'display': ['Syne', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
