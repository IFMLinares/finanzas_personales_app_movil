import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Typography } from '../../components/ui/Typography';
import { GlassCard } from '../../components/ui/GlassCard';
import { BackgroundAura } from '../../components/ui/BackgroundAura';
import { parseApiError } from '../../utils/errorUtils';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signIn } = useAuth();
  const { showToast } = useToast();

  const handleLogin = async () => {
    if (!email || !password) {
      showToast({ message: 'Por favor ingresa todos los campos.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setErrors({}); // Limpiar errores previos

    try {
      await signIn(email, password);
    } catch (error: any) {
      const parsed = parseApiError(error);

      // Si hay errores por campo, los seteamos en el estado
      if (Object.keys(parsed.errors).length > 0) {
        setErrors(parsed.errors);
      } else {
        // Si es un error general (ej: credenciales o servidor), usamos Toast
        showToast({ message: parsed.message || 'Error de acceso', type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <BackgroundAura top="10%" left="-20%" color="#465fff" size={400} opacity={0.15} />
      <BackgroundAura bottom="-10%" right="-10%" color="#3b82f6" size={300} opacity={0.1} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          className="px-8 py-12"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-16 mt-10">
            <Typography variant="h1" weight="bold" className="text-white mb-2">
              Finanzas
            </Typography>
            <Typography variant="body" className="text-white/80">
              Gestiona tu capital con precisión tecnológica.
            </Typography>
          </View>

          <GlassCard intensity="high" className="p-8">
            <View className="mb-6">
              <Input
                label="Email"
                placeholder="ejemplo@correo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                error={errors.email || errors.username}
              />
              <Input
                label="Clave de Acceso"
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                error={errors.password}
              />

              <Link href={"/forgot-password" as any} asChild>
                <TouchableOpacity className="self-end mb-8">
                  <Typography variant="label" weight="bold" className="text-vault-usd">
                    ¿Olvidaste tu contraseña?
                  </Typography>
                </TouchableOpacity>
              </Link>

              <Button
                title="Iniciar sesión"
                onPress={handleLogin}
                loading={isLoading}
              />
            </View>

            <View className="flex-row justify-center items-center">
              <Typography variant="caption" className="text-white/50 mr-2">
                ¿Nuevo en la plataforma?
              </Typography>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Typography variant="caption" weight="bold" className="text-brand-500">
                    Crea una cuenta
                  </Typography>
                </TouchableOpacity>
              </Link>
            </View>
          </GlassCard>

          <View className="flex-1 justify-end items-center mt-12">
            <Typography variant="label" className="text-white/20 text-[10px] mb-2">
              API: {process.env.EXPO_PUBLIC_API_URL || 'UNDEFINED'}
            </Typography>
            <Typography variant="label" className="text-white/40">
              © 2026 Ecosistema Finanzas Premium
            </Typography>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
