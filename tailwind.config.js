/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include any new directories with components or views
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#465fff', // Azul Tailadmin
          600: '#3641f5', 
        },
        success: { 500: '#12b76a', 50: '#ecfdf3' },
        error: { 500: '#f04438', 50: '#fef3f2' },
        warning: { 500: '#f79009' },
        gray: {
          50: '#f9fafb',
          100: '#f2f4f7',
          200: '#e4e7ec',
          300: '#d0d5dd',
          400: '#98a2b3',
          500: '#667085',
          800: '#1d2939',
          900: '#101828', // Background oscuro principal
          dark: '#0a0d14', // Fondo ultra oscuro
        }
      },
      fontFamily: {
        outfit: ['Outfit_400Regular', 'sans-serif'],
        outfitBold: ['Outfit_700Bold', 'sans-serif'],
        outfitSemiBold: ['Outfit_600SemiBold', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
