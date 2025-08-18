/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        amtGreen: "#1abc9c",
        amtDark: "#145A32"
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
};
