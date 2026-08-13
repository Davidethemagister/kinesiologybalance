/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFFEF8',
        sage: {
          DEFAULT: '#A7D9DE',
          dark: '#5F9BA3',
        },
        element: {
          wood: '#4A7C59',
          fire: '#C0392B',
          earth: '#D4A72C',
          metal: '#B0B4B8',
          water: '#1B3A5C',
        },
      },
    },
  },
  plugins: [],
}
