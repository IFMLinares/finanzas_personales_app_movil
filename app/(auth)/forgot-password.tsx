import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../contexts/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Typography } from '../../components/ui/Typography';
import { GlassCard } from '../../components/ui/GlassCard';
import { BackgroundAura } from '../../components/ui/BackgroundAura';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import apiClient from '../../api/apiClient';
import { parseApiError } from '../../utils/errorUtils';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleRequestOTP = async () => {
    if (!email) {
      showToast({ message: 'Ingresa tu email', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/password-reset/', { email });
      showToast({ message: 'Código enviado a tu correo', type: 'success' });
      setStep(2);
    } catch (error: any) {
      const parsed = parseApiError(error);
      showToast({ message: parsed.message || 'Error al enviar código', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      showToast({ message: 'Completa todos los campos', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/password-reset/verify/', {
        email,
        otp,
        new_password: newPassword
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      const parsed = parseApiError(error);
      showToast({ message: parsed.message || 'Código inválido o expirado', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <BackgroundAura top="5%" right="-10%" color="#465fff" size={300} opacity={0.1} />
      <BackgroundAura bottom="5%" left="-10%" color="#8b5cf6" size={250} opacity={0.1} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-8" 
          contentContainerStyle={{ paddingVertical: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity 
            onPress={() => step === 2 ? setStep(1) : router.back()}
            className="mb-8 w-12 h-12 items-center justify-center rounded-2xl bg-white/5 border border-white/5"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="mb-10">
            <View className="w-16 h-16 rounded-3xl bg-brand-500/10 items-center justify-center mb-6 border border-brand-500/20">
              <Ionicons 
                name={step === 1 ? "mail-outline" : "shield-checkmark-outline"} 
                size={32} 
                color="#465fff" 
              />
            </View>
            <Typography variant="h1" weight="bold" className="text-white mb-2">
              {step === 1 ? '¿Olvidaste tu clave?' : 'Verifica tu identidad'}
            </Typography>
            <Typography variant="body" className="text-ink-secondary leading-6">
              {step === 1 
                ? 'No te preocupes. Ingresa tu correo y te enviaremos un código para recuperar el acceso.' 
                : `Hemos enviado un código a ${email}. Por favor, ingrésalo abajo junto con tu nueva clave.`}
            </Typography>
          </View>

          <GlassCard intensity="high" className="p-8 rounded-[32px]">
            {step === 1 ? (
              <View>
                <Input
                  label="Correo Electrónico"
                  placeholder="ejemplo@correo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                <View className="mt-4">
                  <Button
                    title="Enviar Código"
                    onPress={handleRequestOTP}
                    loading={isLoading}
                  />
                </View>
              </View>
            ) : (
              <View>
                <Input
                  label="Código de Seguridad"
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                  className="mb-4"
                />
                <Input
                  label="Nueva Contraseña"
                  placeholder="Mínimo 8 caracteres"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <View className="mt-6">
                  <Button
                    title="Actualizar Contraseña"
                    onPress={handleResetPassword}
                    loading={isLoading}
                  />
                </View>
              </View>
            )}
          </GlassCard>

          {step === 1 && (
            <TouchableOpacity 
              onPress={() => router.back()}
              className="mt-8 items-center"
            >
              <Typography className="text-brand-500 font-semibold">
                Volver al inicio de sesión
              </Typography>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmModal
        isVisible={showSuccessModal}
        onClose={() => {}}
        onConfirm={handleSuccessConfirm}
        title="¡Clave Actualizada!"
        description="Tu contraseña ha sido restablecida con éxito. Ya puedes iniciar sesión con tus nuevas credenciales."
        confirmText="Ir al Login"
        type="info"
      />
    </SafeAreaView>
  );
}
