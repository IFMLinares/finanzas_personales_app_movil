import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    try {
      // Nota: El backend de Django actual no tiene implementado el registro público.
      // Simularemos un retraso y daremos un mensaje informativo.
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert(
        'Registro no habilitado', 
        'El registro público está desactivado temporalmente en el servidor. Por favor, contacta al administrador.',
        [{ text: 'OK', onPress: () => router.push('/(auth)/login') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al intentar registrarte.');
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
              <Input
                label="Nombre Completo"
                placeholder="Juan Pérez"
                value={name}
                onChangeText={setName}
              />
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
                placeholder="••••••••"
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
