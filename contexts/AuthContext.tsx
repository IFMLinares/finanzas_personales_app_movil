import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';
import authService from '../services/authService';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
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
        setUser({ authenticated: true });
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
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
