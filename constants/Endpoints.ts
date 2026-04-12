/**
 * Centralización de todas las rutas de la API del backend.
 * Facilita el mantenimiento y evita errores tipográficos.
 */
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    LOGOUT: '/auth/logout/',
    REFRESH: '/auth/refresh/',
  },
  FINANCE: {
    DASHBOARD_SUMMARY: '/finance/dashboard/summary/',
  },
  TRANSACTIONS: {
    BASE: '/transactions/',
  },
};

export default ENDPOINTS;
