import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Typography } from '../../components/ui/Typography';
import { GlassCard } from '../../components/ui/GlassCard';
import { parseApiError } from '../../utils/errorUtils';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signUp } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    // 1. Validaciones de campos obligatorios
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos para continuar.');
      return;
    }

    // 2. Esquema mínimo de seguridad (Solicitado: Validar longitud y contraseñas iguales)
    if (password.length < 8) {
      Alert.alert('Seguridad', 'La contraseña debe tener al menos 8 caracteres por seguridad.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setIsLoading(true);
    setErrors({}); // Limpiar errores previos

    try {
      await signUp({
        email,
        password,
        password_confirm: confirmPassword,
        first_name: firstName,
        last_name: lastName
      });
      // La redirección se maneja automáticamente en el AuthContext al detectar el cambio de estado de 'user'
    } catch (error: any) {
      const parsed = parseApiError(error);

      // Si hay errores por campo, los seteamos en el estado
      if (Object.keys(parsed.errors).length > 0) {
        setErrors(parsed.errors);
      } else {
        // Si es un error general, usamos Alert
        Alert.alert('Error de registro', parsed.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 py-10">
          <View className="mb-12 mt-6">
            <Typography variant="h1" weight="bold" className="text-white mb-2">
              Unirse
            </Typography>
            <Typography variant="body" className="text-ink-secondary">
              Crea tu perfil en el ecosistema financiero.
            </Typography>
          </View>

          <GlassCard intensity="high" className="p-8">
            <View className="mb-6">
              <View className="flex-row space-x-4 mb-2">
                <View className="flex-1">
                  <Input
                    label="Nombre"
                    placeholder="Juan"
                    value={firstName}
                    onChangeText={setFirstName}
                    error={errors.first_name}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Apellido"
                    placeholder="Pérez"
                    value={lastName}
                    onChangeText={setLastName}
                    error={errors.last_name}
                  />
                </View>
              </View>

              <Input
                label="Email"
                placeholder="ejemplo@correo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
              />

              <Input
                label="Clave de Acceso"
                placeholder="Mín. 8 caracteres"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                error={errors.password}
              />

              <Input
                label="Confirmar Clave"
                placeholder="••••••••"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={errors.password_confirm}
              />

              <View className="mt-2 mb-8 px-1">
                <Typography variant="caption" className="text-ink-muted leading-5">
                  Al registrarte, declaras conocer los términos de seguridad del sistema.
                </Typography>
              </View>

              <Button
                title="Registrarse"
                onPress={handleRegister}
                loading={isLoading}
              />
            </View>

            <View className="flex-row justify-center items-center">
              <Typography variant="caption" className="text-ink-muted mr-2">
                ¿Ya tienes acceso?
              </Typography>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Typography variant="caption" weight="bold" className="text-brand-500">
                    Inicia Sesión
                  </Typography>
                </TouchableOpacity>
              </Link>
            </View>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
