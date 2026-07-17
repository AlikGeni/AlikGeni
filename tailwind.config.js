/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0A0A0A',
          light: '#FFFFFF',
          secondary: '#64748B',
          accent: '#14B8A6',
          text: '#0F172A',
          surface: '#121212',
          elevated: '#171717',
        },
      },
    },
  },
  plugins: [],
};
