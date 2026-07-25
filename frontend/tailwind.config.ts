import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans Arabic', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f4ff',
          500: '#3b5bdb',
          600: '#2f4ac0',
          700: '#253d9e',
        },
      },
    },
  },
  plugins: [],
};

export default config;
