/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#4CAF50",
          DEFAULT: "#2E7D32",
          dark: "#1B5E20",
        },
        secondary: {
          light: "#81C784",
          DEFAULT: "#4CAF50",
          dark: "#388E3C",
        },
        background: {
          light: "#F1F8E9",
          DEFAULT: "#F1F8E9",
          dark: "#E8F5E9",
        },
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        "open-sans": ["Open Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
