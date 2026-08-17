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
        elementSoft: {
          wood: '#CFE6C9',
          fire: '#F6D2CC',
          earth: '#F3E3B0',
          metal: '#DCDCE6',
          water: '#C9DEF0',
        },
        elementSoftDeep: {
          wood: '#AFD5A7',
          fire: '#EFB6AC',
          earth: '#E9D186',
          metal: '#C6C6D6',
          water: '#A9C6E3',
        },
        elementInk: {
          wood: '#2B4A34',
          fire: '#7A2E24',
          earth: '#5C4715',
          metal: '#3D3E4A',
          water: '#1F3A5C',
        },
      },
    },
  },
  plugins: [],
}
