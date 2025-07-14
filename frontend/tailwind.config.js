// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        walmart: {
          blue: '#0071CE', // Primary Walmart Blue
          yellow: '#FFC220', // Accent Yellow
          black: '#000000', // For titles
          dark: '#2C2C2C', // Neutral dark for dark mode
        },
        gray: {
          50: '#F9F9F9', // Lightest gray for backgrounds
          100: '#F5F5F5', // Light gray for backgrounds
          200: '#E0E0E0', // Border gray
          400: '#A0A0A0', // Muted text
          900: '#2E2E2E', // For dark text
        },
        white: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        card: '0 4px 16px 0 rgba(0,0,0,0.06)',
        modal: '0 8px 32px 0 rgba(0,0,0,0.12)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'scale(0.96)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s ease',
      },
    },
  },
  plugins: [],
}; 