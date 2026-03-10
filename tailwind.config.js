/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        khaki: {
          50: '#faf9f0',
          100: '#f5f0dc',
          200: '#ede0b8',
          300: '#e0ca8e',
          400: '#d4b065',
          500: '#c89a44',
          600: '#b07d37',
          700: '#93612e',
          800: '#784f2b',
          900: '#644228',
        },
        sage: {
          50: '#f6f7f4',
          100: '#e8ebe2',
          200: '#d0d6c5',
          300: '#b0bba0',
          400: '#8e9e7e',
          500: '#738364',
          600: '#5c6950',
          700: '#4a5440',
          800: '#3d4436',
          900: '#343a2e',
        },
        warm: {
          50: '#fdf8f0',
          100: '#faefd9',
          200: '#f5ddb2',
          300: '#eec580',
          400: '#e5a54d',
          500: '#df8d2a',
          600: '#d0741f',
          700: '#ac591b',
          800: '#8a471d',
          900: '#713c1b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'pop': 'pop 0.2s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
