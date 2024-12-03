/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        'neo4j-green': '#018bff',
        'neo4j-blue': '#0056B3',
        'frame-bg': 'var(--frame-background)',
        'frame-sidebar': 'var(--frame-sidebar-background)',
        'primary-btn': 'var(--primary-button-background)',
        'secondary-btn': 'var(--secondary-button-background)',
        'border': 'var(--border-color)'
      },
      spacing: {
        'frame-header': '30px'
      }
    },
  },
  plugins: [],
  important: true
} 