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
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });

    if (response.data.access) {
      await SecureStore.setItemAsync('accessToken', response.data.access);
      await SecureStore.setItemAsync('refreshToken', response.data.refresh);
    }

    return response.data;
  },

  register: async (userData: any): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.REGISTER, userData);

    if (response.data.access) {
      await SecureStore.setItemAsync('accessToken', response.data.access);
      await SecureStore.setItemAsync('refreshToken', response.data.refresh);
    }

    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (e) {
      // Ignorar error en logout
    } finally {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
    }
  },

  getMe: async (): Promise<any> => {
    const response = await apiClient.get(ENDPOINTS.AUTH.ME);
    return response.data;
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
