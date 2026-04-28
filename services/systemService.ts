import apiClient from '../api/apiClient';

/**
 * Servicio para manejar configuraciones del sistema, versiones y notificaciones.
 */
export const systemService = {
  /**
   * Verifica si la versión actual de la app necesita actualización.
   */
  checkAppVersion: async (plataforma: 'android' | 'ios', version: string) => {
    const response = await apiClient.post('/appversion/validate/', {
      plataforma,
      version_app: version,
    });
    return response.data;
  },

  registerDeviceToken: async (token: string, deviceType: 'android' | 'ios' | 'web') => {
    const response = await apiClient.post('/notifications/register-fcm-token/', {
      token,
      device_type: deviceType,
    });
    return response.data;
  },
};
