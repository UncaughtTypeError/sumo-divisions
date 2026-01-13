/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sanyaku: '#ff6b6b',
        makuuchi: '#ffa07a',
        juryo: '#daa520',
        makushita: '#d2b48c',
        sandanme: '#c9b79c',
        jonidan: '#b8a88a',
        jonokuchi: '#a69a87',
      },
    },
  },
  plugins: [],
}
