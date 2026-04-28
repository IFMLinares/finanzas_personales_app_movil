import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import authService from '../services/authService';
import { Typography } from '../components/ui/Typography';
import { usePushNotifications } from '../hooks/usePushNotifications';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  isBiometricEnabled: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  enableBiometrics: () => Promise<void>;
  disableBiometrics: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifyingSession, setIsVerifyingSession] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  
  // Hook de notificaciones: Se encarga de pedir permisos y registrar el token
  // Solo se activa si el usuario está autenticado
  const pushNotificationState = usePushNotifications();

  useEffect(() => {
    checkStorage();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirigir a login si no está autenticado y no está en el grupo de auth
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirigir al dashboard si ya está autenticado y está en el grupo de auth
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading]);

  const checkStorage = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      
      // Cargar preferencia de biometría
      const biometricPref = await SecureStore.getItemAsync('user_biometrics_enabled');
      const bioEnabled = biometricPref === 'true';
      setIsBiometricEnabled(bioEnabled);

      if (token) {
        // Verificación Geométrica/Biométrica SOLO si el usuario lo activó
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (bioEnabled && hasHardware && isEnrolled) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Autentícate para continuar a Finanzas',
            fallbackLabel: 'Usar PIN o Contraseña',
            cancelLabel: 'Cancelar',
          });

          if (result.success) {
            await verifySessionWithBackend();
          } else {
            // Si cancelan el prompt o falla, se redirige al login sin setear el usuario
            setUser(null);
          }
        } else if (!bioEnabled) {
          // Si NO está activa la biometría, validamos sesión directamente (o pedimos login)
          // Para esta v2, si hay token pero no biometría, intentamos validar sesión directo para UX fluida
          await verifySessionWithBackend();
        } else {
          // Fallback: Si no posee biometría disponible pero estaba activa (raro)
          await verifySessionWithBackend();
        }
      }
    } catch (e) {
      console.error('Error loading token', e);
    } finally {
      setIsLoading(false);
    }
  };

  const verifySessionWithBackend = async () => {
    setIsVerifyingSession(true);
    try {
      const userData = await authService.getMe();
      setUser({ ...userData, authenticated: true });
    } catch (error: any) {
      console.warn('Session validation failed:', error.message);
      setUser(null);
      await authService.logout(); // Limpiar tokens si falló la validación
    } finally {
      setIsVerifyingSession(false);
    }
  };

  const enableBiometrics = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirma tu identidad para activar el acceso biométrico',
      });
      if (result.success) {
        await SecureStore.setItemAsync('user_biometrics_enabled', 'true');
        setIsBiometricEnabled(true);
      } else {
        throw new Error('Autenticación fallida');
      }
    } else {
      throw new Error('El dispositivo no soporta biometría o no tiene huellas registradas');
    }
  };

  const disableBiometrics = async () => {
    await SecureStore.setItemAsync('user_biometrics_enabled', 'false');
    setIsBiometricEnabled(false);
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.login(email, password);
      // Tras login exitoso, obtenemos datos
      const userData = await authService.getMe();
      setUser({ ...userData, authenticated: true });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      setUser({ email: userData.email, ...(response.user || {}), authenticated: true });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isBiometricEnabled,
        signIn,
        signUp,
        signOut,
        enableBiometrics,
        disableBiometrics,
      }}
    >
      {children}
      {isVerifyingSession && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 9999, alignItems: 'center', justifyContent: 'center' }]}>
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          <View className="items-center bg-gray-900/60 p-6 rounded-3xl border border-white/5">
            <ActivityIndicator size="large" color="#465fff" />
            <Typography variant="body" weight="semibold" className="text-white mt-4 text-center">
              Verificando conexión segura...
            </Typography>
          </View>
        </View>
      )}
    </AuthContext.Provider>
  );
}
