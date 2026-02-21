import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // DuoCafé brand palette
        brand: {
          50: '#fdf6ee',
          100: '#faebd6',
          200: '#f4d3a8',
          300: '#ecb471',
          400: '#e28f3a',
          500: '#d97218',  // naranja café principal
          600: '#ca5d12',
          700: '#a84710',
          800: '#883a15',
          900: '#6e3114',
          950: '#3b1708',
        },
        coffee: {
          50: '#f5f0eb',
          100: '#e8ddd2',
          200: '#d4bba5',
          300: '#bc9272',
          400: '#a86e4a',
          500: '#8b5e3c',  // marron café
          600: '#724a2e',
          700: '#5c3a25',
          800: '#4a2e1d',
          900: '#3b2417',
        },
        // Gamificacion
        granos: '#f59e0b',    // dorado (XP)
        cerezas: '#ef4444',   // rojo cereza (moneda)
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
