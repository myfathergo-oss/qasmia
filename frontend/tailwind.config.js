/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:    { DEFAULT: '#26346F', light: '#405B9B' },
        pink:    { DEFAULT: '#E65A9A', light: '#F07EAF' },
        qasmia: {
          bg:      '#EFF3F7',
          text:    '#19284D',
          navy:    '#26346F',
          navylt:  '#405B9B',
          pink:    '#E65A9A',
          pinklt:  '#F07EAF',
          blue:    '#4A8FD4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        urdu: ['"Noto Nastaliq Urdu"', '"Jameel Noori Nastaleeq"', 'serif'],
      },
      borderRadius: {
        xl:  '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 2px 12px rgba(38,52,111,0.08)',
        'card-hover': '0 4px 20px rgba(38,52,111,0.14)',
      }
    },
  },
  plugins: [],
}
