/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./frontend/index.html', './frontend/src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange:  '#EA580C',
          dark:    '#9A3412',
          accent:  '#FED7AA',
          bg:      '#FFF7ED',
          text:    '#1C1917',
        },
      },
      fontFamily: {
        sans: ['"Fira Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
