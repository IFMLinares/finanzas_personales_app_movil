import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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
      console.error(error);
      let message = 'Ocurrió un error al intentar registrarte.';
      
      // Manejo de errores específicos del backend
      if (error.response?.data) {
        const data = error.response.data;
        if (data.email) message = 'Este correo ya está registrado.';
        else if (data.password) message = data.password[0];
        else if (data.detail) message = data.detail;
      }
      
      Alert.alert('Error de registro', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1A222C]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-10">
          <View className="mb-8 items-center">
            <Text className="text-white text-4xl font-[Outfit_700Bold] mb-2">
              Unirse
            </Text>
            <Text className="text-[#8A99AF] text-base font-[Outfit_400Regular]">
              Crea tu cuenta para gestionar tus finanzas
            </Text>
          </View>

          <View className="bg-[#24303F] p-6 rounded-3xl border border-[#2E3A47]">
            <View className="mb-6">
              <View className="flex-row space-x-4 mb-4">
                <View className="flex-1">
                  <Input
                    label="Nombre"
                    placeholder="Juan"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Apellido"
                    placeholder="Pérez"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>

              <Input
                label="Correo Electrónico"
                placeholder="ejemplo@correo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              
              <Input
                label="Contraseña"
                placeholder="Mín. 8 caracteres"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              
              <Input
                label="Confirmar Contraseña"
                placeholder="••••••••"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              
              <View className="mt-2 mb-6">
                <Text className="text-[#8A99AF] text-xs font-[Outfit_400Regular]">
                  Al registrarte, aceptas nuestros Términos de Servicio y Política de Privacidad.
                </Text>
              </View>

              <Button
                title="Crear Cuenta"
                onPress={handleRegister}
                loading={isLoading}
              />
            </View>

            <View className="flex-row justify-center items-center">
              <Text className="text-[#8A99AF] font-[Outfit_400Regular] mr-2">
                ¿Ya tienes una cuenta?
              </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text className="text-[#3C50E0] font-[Outfit_600SemiBold]">
                    Inicia Sesión
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
