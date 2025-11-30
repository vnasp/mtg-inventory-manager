import flowbite from 'flowbite/plugin';
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: false, // Desactiva completamente el dark mode
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './admin/**/*.{js,ts,jsx,tsx}',
    './node_modules/flowbite-react/**/*.js',
    './node_modules/flowbite/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        'bo-primary': '#9c35bf',
        'bo-primary-dark': '#7a2a99',
        'bo-primary-light': '#f3e5f8',
        'bo-primary-hover': '#8b2fad',
        'bo-secondary': '#e79640',
        'bo-secondary-dark': '#d17f2a',
        'bo-secondary-light': '#fef3e7',
      },
      keyframes: {
        lightSweep: {
          '0%, 100%': { opacity: 0.05, transform: 'translateX(-10%)' },
          '50%': { opacity: 0.25, transform: 'translateX(10%)' },
        },
      },
      animation: {
        lightSweep: 'lightSweep 6s ease-in-out infinite',
      },
    },
  },
  plugins: [flowbite],
};

export default config;
