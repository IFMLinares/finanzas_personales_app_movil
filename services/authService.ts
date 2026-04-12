import apiClient from '../api/apiClient';
import * as SecureStore from 'expo-secure-store';
import { ENDPOINTS } from '../constants/Endpoints';

export interface LoginResponse {
  access: string;
  refresh: string;
  user?: {
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}

export interface AuthUser {
  email: string;
  role: string;
}

const authService = {
  /**
   * Inicia sesión y almacena los tokens de forma segura.
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, {
        email: email,
        password,
      });

      if (response.data.access) {
        await SecureStore.setItemAsync('accessToken', response.data.access);
        await SecureStore.setItemAsync('refreshToken', response.data.refresh);
      }

      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error('SERVER ERROR DATA:', error.response.data);
        console.error('SERVER ERROR STATUS:', error.response.status);
      } else {
        console.error('NETWORK OR CONFIG ERROR:', error.message);
      }
      throw error;
    }
  },

  /**
   * Registra un nuevo usuario e inicia sesión automáticamente con los tokens recibidos.
   */
  register: async (userData: any): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.REGISTER, userData);

      if (response.data.access) {
        await SecureStore.setItemAsync('accessToken', response.data.access);
        await SecureStore.setItemAsync('refreshToken', response.data.refresh);
      }

      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error('REGISTRATION ERROR DATA:', error.response.data);
      }
      throw error;
    }
  },

  /**
   * Cierra sesión eliminando los tokens y notificando al backend.
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.warn('Error notifying logout to backend', error);
    } finally {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
    }
  },

  /**
   * Verifica si hay una sesión activa en el almacenamiento local.
   */
  hasStoredSession: async (): Promise<boolean> => {
    const token = await SecureStore.getItemAsync('accessToken');
    return !!token;
  },
};

export default authService;
