import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter, useSegments } from 'expo-router';
import authService from '../services/authService';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: any) => Promise<void>;
  signOut: () => Promise<void>;
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
  const segments = useSegments();
  const router = useRouter();

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
      if (token) {
        // En una app real, aquí haríamos una petición al backend para validar el token
        // y obtener los datos frescos del usuario. Por ahora, simulamos que el usuario está logueado.
        
        // Verificación Geométrica/Biométrica
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && isEnrolled) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Autentícate para continuar a Finanzas',
            fallbackLabel: 'Usar PIN o Contraseña',
            cancelLabel: 'Cancelar',
          });

          if (result.success) {
            setUser({ authenticated: true });
          } else {
            // Si cancelan el prompt o falla, se redirige al login sin setear el usuario
            setUser(null);
          }
        } else {
          // Fallback: Si no posee biometría, pasamos directamente como estaba antes
          setUser({ authenticated: true });
        }
      }
    } catch (e) {
      console.error('Error loading token', e);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.login(email, password);
      setUser({ email }); // Guardamos algo en el estado para indicar que está logueado
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
      setUser({ email: userData.email, ...(response.user || {}) });
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
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
