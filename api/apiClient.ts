import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { ENDPOINTS } from '../constants/Endpoints';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de peticiones para añadir el Access Token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuestas para manejar el Refresh Token automático
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si recibimos un 401 y no hemos reintentado ya esta petición
    // ADEMÁS: No intentamos refrescar si la petición original fue a rutas de AUTH (login/register)
    const isAuthRequest = originalRequest.url?.includes(ENDPOINTS.AUTH.LOGIN) || 
                         originalRequest.url?.includes(ENDPOINTS.AUTH.REGISTER);

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        
        if (!refreshToken) {
          // Si no hay refresh token, redirigir a login
          router.replace('/(auth)/login');
          return Promise.reject(error);
        }

        // Intentar obtener un nuevo access token
        const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}${ENDPOINTS.AUTH.REFRESH}`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;

        // Guardar el nuevo token
        await SecureStore.setItemAsync('accessToken', newAccessToken);

        // Actualizar el header de la petición original y reintentar
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si el refresco falla (ej. refresh token vencido), limpiar y redirigir
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        router.replace('/(auth)/login');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
