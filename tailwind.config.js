/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#13bef0', // Portainer Teal/Turquoise
          dark: '#0ea5d9',
        },
        secondary: {
          DEFAULT: '#10b981', // Emerald Green
        },
        accent: {
          DEFAULT: '#f59e0b', // Amber
        },
        bg: {
          primary: '#1a1a1a', // Very dark gray (almost black)
          secondary: '#242424', // Dark gray
          tertiary: '#2e2e2e', // Medium dark gray
          elevated: '#3a3a3a', // Lighter gray
          hover: '#4a4a4a', // Hover state gray
        },
        surface: {
          DEFAULT: '#242424',
          glass: 'rgba(36, 36, 36, 0.7)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(19, 190, 240, 0.4)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.25s ease-out',
        'slideIn': 'slideIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      spacing: {
        '15': '3.75rem',
      },
    },
  },
  plugins: [],
}
