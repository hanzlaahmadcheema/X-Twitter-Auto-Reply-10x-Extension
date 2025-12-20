/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./chrome-extension/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'twitter-blue': '#1da1f2',
        'twitter-black': '#000000',
        'twitter-dark-gray': '#16181c',
        'twitter-border': '#2f3336',
        'twitter-text': '#e7e9ea',
        'twitter-text-secondary': '#71767b',
      },
      fontFamily: {
        chirp: ['Chirp', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
