# Contexto: Inicialización y UI Base de App Móvil "Finanzas" (React Native)

Eres un desarrollador Frontend Senior experto en React Native y Expo. Tu tarea es inicializar el repositorio móvil de la app "Finanzas". Esta app se conectará a un backend Django y debe mantener una estricta coherencia visual con un panel web basado en Tailadmin, pero usando la UX optimizada de una app financiera móvil de referencia.

## Fase 1: Configuración del Core y ADN Visual (Tailadmin)
1. Inicializa un proyecto Expo (SDK reciente) con Expo Router y TypeScript. El proyecto debe llamarse `finanzas-mobile`.
2. Instala y configura **NativeWind** para usar clases de Tailwind.
3. **INYECCIÓN DE ADN VISUAL:** Modifica el `tailwind.config.js` del proyecto React Native para incluir EXACTAMENTE esta paleta extraída del panel web:
   ```javascript
   theme: {
     extend: {
       colors: {
         brand: { 500: '#465fff', 600: '#3641f5' }, // Color primario Tailadmin
         success: { 500: '#12b76a', 50: '#ecfdf3' },
         error: { 500: '#f04438', 50: '#fef3f2' },
         warning: { 500: '#f79009' },
         gray: {
           50: '#f9fafb', 100: '#f2f4f7', 200: '#e4e7ec', 300: '#d0d5dd',
           400: '#98a2b3', 500: '#667085', 800: '#1d2939', 900: '#101828', dark: '#1a2231'
         }
       },
       fontFamily: {
         outfit: ['Outfit', 'sans-serif'], // Asumir que se cargará via expo-font
       }
     }
   }