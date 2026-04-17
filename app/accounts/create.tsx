import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
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
      <View className="flex-row items-center px-5 py-4 border-b border-gray-900">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Typography variant="h3" weight="bold">Nueva Cuenta</Typography>
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        <View className="mb-6">
          <Typography variant="label" className="text-gray-400 mb-2">Nombre de la cuenta</Typography>
          <Input 
            placeholder="Ej: Banesco, Efectivo USD..." 
            value={name} 
            onChangeText={setName}
            className="bg-gray-900 border-gray-800 text-white"
          />
        </View>

        <View className="mb-6">
          <Typography variant="label" className="text-gray-400 mb-2">Moneda</Typography>
          <TouchableOpacity 
            onPress={() => setShowCurrencyModal(true)}
            className="flex-row items-center justify-between bg-gray-900 border border-gray-800 p-4 rounded-xl"
          >
            <View className="flex-row items-center">
              {selectedCurrency ? (
                <>
                  <Ionicons name={selectedCurrency.icon} size={20} color="#465fff" className="mr-3" />
                  <Typography>{selectedCurrency.label} ({selectedCurrency.code})</Typography>
                </>
              ) : (
                <Typography className="text-gray-500">Seleccionar moneda</Typography>
              )}
            </View>
            <Ionicons name="chevron-down" size={20} color="#4b5563" />
          </TouchableOpacity>
        </View>

        <View className="mb-8">
          <Typography variant="label" className="text-gray-400 mb-2">Saldo Inicial (Opcional)</Typography>
          <Input 
            placeholder="0.00" 
            value={initialBalance} 
            onChangeText={setInitialBalance}
            keyboardType="numeric"
            className="bg-gray-900 border-gray-800 text-white"
          />
        </View>

        <Button 
          label="Crear Cuenta" 
          onPress={handleCreate} 
          loading={mutation.isPending}
          className="bg-brand-500 h-14 rounded-2xl"
        />
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
