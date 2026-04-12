import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa todos los campos.');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      // El AuthContext manejara la redirección automáticamente
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.detail || 'Correo o contraseña incorrectos.';
      Alert.alert('Error de acceso', message);
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
          <View className="mb-12 items-center">
            <Text className="text-white text-4xl font-[Outfit_700Bold] mb-2">
              Finanzas
            </Text>
            <Text className="text-[#8A99AF] text-base font-[Outfit_400Regular]">
              Ingresa a tu cuenta para continuar
            </Text>
          </View>

          <View className="bg-[#24303F] p-6 rounded-3xl border border-[#2E3A47]">
            <View className="mb-6">
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
              
              <TouchableOpacity className="self-end mb-6">
                <Text className="text-[#3C50E0] font-[Outfit_600SemiBold] text-sm">
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>

              <Button
                title="Iniciar Sesión"
                onPress={handleLogin}
                loading={isLoading}
              />
            </View>

            <View className="flex-row justify-center items-center">
              <Text className="text-[#8A99AF] font-[Outfit_400Regular] mr-2">
                ¿No tienes una cuenta?
              </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text className="text-[#3C50E0] font-[Outfit_600SemiBold]">
                    Regístrate
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          <View className="flex-1 justify-end items-center mt-10">
            <Text className="text-[#5B6B7C] text-xs font-[Outfit_400Regular]">
              © 2026 Sistema de Finanzas Personales
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
