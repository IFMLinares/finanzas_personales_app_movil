import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { systemService } from '../services/systemService';

export interface PushNotificationState {
  notification?: Notifications.Notification;
  expoPushToken?: string;
  devicePushToken?: string;
}

export const usePushNotifications = () => {
  const [notificationState, setNotificationState] = useState<PushNotificationState>({});
  const notificationListener = useRef<Notifications.Subscription>(undefined);
  const responseListener = useRef<Notifications.Subscription>(undefined);

  const registerForPushNotificationsAsync = async () => {
    let token;

    if (!Device.isDevice) {
      console.log('Debes usar un dispositivo físico para las notificaciones Push');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permiso denegado para notificaciones!');
      return;
    }

    // EVITAR ERROR EN EXPO GO:
    // Las notificaciones push nativas de Firebase (FCM) no funcionan en Expo Go estándar.
    // Solo funcionan en Development Builds o Builds reales (EAS).
    if (Constants.appOwnership === 'expo') {
      console.warn('Ejecutando en Expo Go: Las notificaciones Push (FCM) están desactivadas. Usa una Build nativa para probarlas.');
      return;
    }

    // Obtenemos el token nativo (FCM para Android)
    // Esto es lo que enviamos a nuestro backend Django
    try {
      const deviceToken = (await Notifications.getDevicePushTokenAsync()).data;
      setNotificationState(prev => ({ ...prev, devicePushToken: deviceToken }));
      
      // Registrar en nuestro backend
      await systemService.registerDeviceToken(
        deviceToken,
        Platform.OS as 'android' | 'ios'
      );
      
      console.log('Token de dispositivo registrado exitosamente');
    } catch (error) {
      console.error('Error obteniendo el token de dispositivo:', error);
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  };

  useEffect(() => {
    registerForPushNotificationsAsync();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotificationState(prev => ({ ...prev, notification }));
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificación abierta:', response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return notificationState;
};
