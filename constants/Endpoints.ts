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
    ME: '/auth/me/',
  },
  FINANCE: {
    DASHBOARD_SUMMARY: '/finance/dashboard/summary/',
    ACCOUNTS: '/finance/accounts/',
    CATEGORIES: '/finance/categories/',
    CURRENCIES: '/finance/currencies/',
  },
  TRANSACTIONS: {
    BASE: '/transactions/',
    PLANS: '/transactions/plans/',
  },
};

export default ENDPOINTS;
