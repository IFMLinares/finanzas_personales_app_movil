import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import '../global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SystemUI from 'expo-system-ui';
import * as Notifications from 'expo-notifications';
import { systemService } from '../services/systemService';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Platform, KeyboardAvoidingView } from 'react-native';
import { ForceUpdateScreen } from '../components/ForceUpdateScreen';
import { useState } from 'react';

const queryClient = new QueryClient();

import {
  useFonts,
  Outfit_400Regular,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';
import { ToastBox } from '../components/ui/ToastBox';

// Eliminamos la configuración global superior para que no truene en Expo Go al importar
// Notifications.setNotificationHandler({ ... });

export default function RootLayout() {
  const [appStatus, setAppStatus] = useState<'loading' | 'valid' | 'must_update'>('loading');
  const [storeUrl, setStoreUrl] = useState<string | undefined>(undefined);

  // Configurar notificaciones solo si NO estamos en Expo Go
  useEffect(() => {
    if (Constants.appOwnership !== 'expo') {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }
  }, []);

  const [loaded, error] = useFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      checkVersion();
      SystemUI.setBackgroundColorAsync('#07090e');
    }
  }, [loaded, error]);

  const checkVersion = async () => {
    try {
      // En Expo Go, Application.nativeApplicationVersion devuelve la versión de Expo Go.
      // Necesitamos la versión definida en app.json (expoConfig).
      const version = Constants.expoConfig?.version || '1.0.0';
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';

      const result = await systemService.checkAppVersion(platform, version);

      if (result.must_update) {
        setStoreUrl(result.info?.url_descarga);
        setAppStatus('must_update');
      } else {
        setAppStatus('valid');
      }
    } catch (e) {
      console.error('Failed to check version', e);
      setAppStatus('valid'); // En caso de error, dejamos pasar
    } finally {
      SplashScreen.hideAsync();
    }
  };

  if (!loaded && !error) {
    return null;
  }

  const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#07090e',
      card: '#07090e',
    },
  };

  if (appStatus === 'must_update') {
    return <ForceUpdateScreen storeUrl={storeUrl} />;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <ThemeProvider value={CustomDarkTheme}>
              <Stack screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#07090e' }
              }}>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              </Stack>
              <StatusBar style="light" />
            </ThemeProvider>
            <ToastBox />
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
