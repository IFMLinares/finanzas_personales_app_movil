import apiClient from '../api/apiClient';

/**
 * Servicio para manejar configuraciones del sistema, versiones y notificaciones.
 */
export const systemService = {
  /**
   * Verifica si la versión actual de la app necesita actualización.
   */
  checkAppVersion: async (plataforma: 'android' | 'ios', version: string) => {
    try {
      const response = await apiClient.post('/appversion/validate/', {
        plataforma,
        version_app: version,
      });
      return response.data;
    } catch (error) {
      console.error('Error checking app version:', error);
      return { must_update: false }; // Fallback para no bloquear al usuario por un error de red
    }
  },

  /**
   * Registra el token del dispositivo para notificaciones push.
   */
  registerDeviceToken: async (token: string, deviceType: 'android' | 'ios' | 'web') => {
    try {
      const response = await apiClient.post('/notifications/register-fcm-token/', {
        token,
        device_type: deviceType,
      });
      return response.data;
    } catch (error) {
      console.error('Error registering device token:', error);
      throw error;
    }
  },
};
