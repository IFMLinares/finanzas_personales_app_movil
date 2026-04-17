import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { SelectModal } from '@/components/ui/SelectModal';
import { financeService } from '@/services/financeService';

export default function CreateAccountScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('0');
  const [selectedCurrency, setSelectedCurrency] = useState<any>(null);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // Fetch currencies
  const { data: currencies = [], isLoading: loadingCurrencies } = useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const response = await financeService.getDashboardSummary(); // Using summary to get symbols and keys or we could add a getCurrencies
      // For now let's assume we have a few standard ones if the endpoint is not ready
      return [
        { id: 1, label: 'Bolívares', code: 'VES', icon: 'cash-outline', symbol: 'Bs' },
        { id: 2, label: 'Dólares', code: 'USD', icon: 'logo-usd', symbol: '$' },
        { id: 3, label: 'Euros', code: 'EUR', icon: 'logo-euro', symbol: '€' },
        { id: 4, label: 'Tether (USDT)', code: 'USDT', icon: 'swap-horizontal-outline', symbol: 'USDT' },
      ];
    }
  });

  const mutation = useMutation({
    mutationFn: (newAccount: any) => financeService.createAccount(newAccount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Error', 'No se pudo crear la cuenta. Verifica los datos.');
      console.error(error);
    }
  });

  const handleCreate = () => {
    if (!name || !selectedCurrency) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios.');
      return;
    }

    mutation.mutate({
      name,
      currency: selectedCurrency.id, // Assuming ID mapping
      balance: parseFloat(initialBalance) || 0,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <View className="flex-row items-center px-6 py-4 border-b border-white/5 bg-gray-950/80">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 rounded-xl bg-white/5 justify-center items-center">
          <Ionicons name="chevron-back" size={20} color="white" />
        </TouchableOpacity>
        <Typography variant="h3" weight="bold">Vincular Activo</Typography>
      </View>

      <ScrollView className="flex-1 px-6 pt-10" showsVerticalScrollIndicator={false}>
        <View className="mb-10">
          <Typography variant="h1" weight="bold" className="text-white mb-2">Nueva Bóveda</Typography>
          <Typography variant="body" className="text-ink-secondary">Define el origen y la moneda de tu fondo.</Typography>
        </View>

        <GlassCard intensity="medium" className="p-8 mb-10">
          <View className="mb-8">
            <Input
              label="Nombre de Referencia"
              placeholder="Ej: Banesco, Efectivo USD..."
              value={name}
              onChangeText={setName}
            />
          </View>

          <View className="mb-8">
            <Typography variant="label" className="text-ink-tertiary mb-3 ml-1">Moneda del Activo</Typography>
            <TouchableOpacity
              onPress={() => setShowCurrencyModal(true)}
              className="flex-row items-center justify-between bg-white/5 border border-white/5 p-4 h-14 rounded-2xl"
            >
              <View className="flex-row items-center">
                {selectedCurrency ? (
                  <>
                    <View className="w-8 h-8 rounded-lg bg-brand-500/10 justify-center items-center mr-3">
                      <Ionicons name={selectedCurrency.icon} size={16} color="#465fff" />
                    </View>
                    <Typography weight="semibold">{selectedCurrency.label} ({selectedCurrency.code})</Typography>
                  </>
                ) : (
                  <Typography className="text-ink-muted">Seleccionar divisa...</Typography>
                )}
              </View>
              <Ionicons name="chevron-down" size={16} color="#4b5563" />
            </TouchableOpacity>
          </View>

          <View className="mb-10">
            <Input
              label="Saldo de Apertura"
              placeholder="0.00"
              value={initialBalance}
              onChangeText={setInitialBalance}
              keyboardType="numeric"
            />
          </View>

          <Button
            title="Guardar cuenta"
            onPress={handleCreate}
            loading={mutation.isPending}
          />
        </GlassCard>

        <View className="items-center mb-10">
          <Typography variant="caption" className="text-ink-muted text-center px-10">
            Esta cuenta será sincronizada con tu balance global inmediatamente.
          </Typography>
        </View>
      </ScrollView>

      <SelectModal
        isVisible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        title="Selecciona Moneda"
        options={currencies}
        selectedValue={selectedCurrency?.id}
        onSelect={(opt) => setSelectedCurrency(opt)}
      />
    </SafeAreaView>
  );
}
