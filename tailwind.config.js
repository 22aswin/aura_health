/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'calm-teal': '#5EEAD4',
        'calm-blue': '#7DD3FC',
        'calm-purple': '#C4B5FD',
        'calm-pink': '#F9A8D4',
        'calm-indigo': '#A5B4FC',
        'soft-teal': '#CCFBF1',
        'soft-blue': '#DBEAFE',
        'soft-purple': '#EDE9FE',
        'glass-white': 'rgba(255, 255, 255, 0.1)',
        'glass-border': 'rgba(255, 255, 255, 0.2)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(94, 234, 212, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(94, 234, 212, 0.6)' },
        }
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
