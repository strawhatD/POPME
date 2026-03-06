/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        rounded: ['DM Rounded', 'Nunito', 'sans-serif'],
      },
      colors: {
        mint: '#b2dfdb',
        'mint-light': '#e0f2f1',
        lavender: '#7c6fcd',
      },
    },
  },
  plugins: [],
}
