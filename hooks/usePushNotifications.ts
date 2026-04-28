import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { systemService } from '../services/systemService';

// No importamos Notifications aquí arriba para evitar el error global en Expo Go SDK 53
let Notifications: any = null;
try {
  if (Constants.appOwnership !== 'expo') {
    Notifications = require('expo-notifications');
  }
} catch (e) {
  console.log('Notificaciones no disponibles');
}

export interface PushNotificationState {
  notification?: any;
  expoPushToken?: string;
  devicePushToken?: string;
}

export const usePushNotifications = () => {
  const [notificationState, setNotificationState] = useState<PushNotificationState>({});
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  const registerForPushNotificationsAsync = async () => {
    // Si estamos en Expo Go, ni siquiera intentamos nada para evitar errores fatales
    if (Constants.appOwnership === 'expo' || !Notifications) {
      console.warn('Modo Expo Go detectado: Saltando registro de notificaciones Push.');
      return;
    }

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

    try {
      const deviceToken = (await Notifications.getDevicePushTokenAsync()).data;
      setNotificationState(prev => ({ ...prev, devicePushToken: deviceToken }));
      
      await systemService.registerDeviceToken(
        deviceToken,
        Platform.OS as 'android' | 'ios'
      );
    } catch (error) {
      console.error('Error obteniendo el token:', error);
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  };

  useEffect(() => {
    if (Constants.appOwnership === 'expo' || !Notifications) return;

    registerForPushNotificationsAsync();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
      setNotificationState(prev => ({ ...prev, notification }));
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
      console.log('Notificación abierta:', response);
    });

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  return notificationState;
};
