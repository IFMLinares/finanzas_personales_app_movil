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
          950: '#07090e',
        },
        ink: {
          primary: '#ffffff',
          secondary: '#94a3b8',
          tertiary: '#64748b',
          muted: '#475569',
        },
        surface: {
          base: '#101828',
          elevated: '#1a2231',
          overlay: '#262f41',
        },
        vault: {
          usd: '#465fff',
          eur: '#3b82f6',
          usdt: '#14b8a6',
          ves: '#f43f5e',
        }
      },
      fontFamily: {
        outfit: ['Outfit_400Regular', 'sans-serif'],
        outfitBold: ['Outfit_700Bold', 'sans-serif'],
        outfitSemiBold: ['Outfit_600SemiBold', 'sans-serif'],
      },
      tracking: {
        'tightest': '-0.05em',
        'tighter': '-0.03em',
      }
    },
  },
  plugins: [],
}
