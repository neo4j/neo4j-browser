/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#018BFF',
          dark: '#0060B3'
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1A1C1E'
        }
      },
      viewTransitions: {
        'slide-up': {
          old: { transform: 'translateY(100%)' },
          new: { transform: 'translateY(0)' }
        },
        'fade': {
          old: { opacity: '0' },
          new: { opacity: '1' }
        }
      },
      iconSizes: {
        sm: '16px',
        md: '20px',
        lg: '24px',
        xl: '32px'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    function({ addUtilities, theme }) {
      addUtilities({
        '.transition-fast': {
          transition: 'all 0.15s ease-in-out'
        },
        '.transition-medium': {
          transition: 'all 0.3s ease-in-out'
        },
        '.view-transition-old': {
          'animation': '90ms cubic-bezier(0.4, 0, 1, 1) both fade-out'
        },
        '.view-transition-new': {
          'animation': '210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in'
        },
        '@keyframes fade-out': {
          'from': { opacity: '1' },
          'to': { opacity: '0' }
        },
        '@keyframes fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' }
        }
      })
      const iconUtilities = {
        '.icon': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          verticalAlign: 'middle'
        },
        '.icon-sm': {
          width: theme('iconSizes.sm'),
          height: theme('iconSizes.sm')
        },
        '.icon-md': {
          width: theme('iconSizes.md'),
          height: theme('iconSizes.md')
        },
        '.icon-lg': {
          width: theme('iconSizes.lg'),
          height: theme('iconSizes.lg')
        },
        '.icon-xl': {
          width: theme('iconSizes.xl'),
          height: theme('iconSizes.xl')
        }
      }
      addUtilities(iconUtilities)
    }
  ]
} 