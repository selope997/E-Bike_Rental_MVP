/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Existing green scale — kept for admin screens (out of Voltage scope)
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Voltage — dark shell
        volt: {
          bg: '#0d0f0e',
          surface: '#141815',
          border: '#232825',
          line: '#1e2220',
          stroke: '#2a302c',
          outline: '#33393c',
          text: '#f4f6f4',
          muted: '#a9b0ab',
          dim: '#8b928c',
          faint: '#7c837d',
        },
        // Voltage — electric lime accent
        accent: {
          DEFAULT: '#d4ff3f',
          600: '#a8e600',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Hanken Grotesk"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
