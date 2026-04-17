import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SelectModal } from '@/components/ui/SelectModal';
import { CustomNumpad } from '@/components/ui/CustomNumpad';
import { financeService } from '@/services/financeService';
import { transactionService } from '@/services/transactionService';

export default function NewTransactionScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { type: initialType } = useLocalSearchParams();
  
  const [type, setType] = useState<'IN' | 'EX' | 'TR'>((initialType as any) || 'EX');
  const [amount, setAmount] = useState('0');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showNumpad, setShowNumpad] = useState(true);

  // Queries
  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => financeService.getAccounts(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => financeService.getCategories(),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => transactionService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['recentTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      router.back();
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'No se pudo registrar el movimiento.';
      Alert.alert('Error', errorMsg);
      console.error(error);
    }
  });

  const handleNumpadPress = (key: string) => {
    if (key === '.' && amount.includes('.')) return;
    if (amount === '0' && key !== '.') {
      setAmount(key);
    } else {
      setAmount(prev => prev + key);
    }
  };

  const handleNumpadDelete = () => {
    if (amount.length === 1) {
      setAmount('0');
    } else {
      setAmount(prev => prev.slice(0, -1));
    }
  };

  const handleSave = () => {
    if (!selectedAccount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Por favor selecciona una cuenta y un monto válido.');
      return;
    }

    mutation.mutate({
      account: selectedAccount.id,
      category: selectedCategory?.id || null,
      type,
      amount: parseFloat(amount),
      date: date.toISOString(),
      notes: notes || null,
    });
  };

  const isExpense = type === 'EX';
  const isIncome = type === 'IN';
  const accentColor = isIncome ? '#12b76a' : isExpense ? '#f04438' : '#465fff';

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-900">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <View className="flex-row bg-gray-900 p-1 rounded-2xl">
          <TouchableOpacity 
            onPress={() => setType('EX')}
            className={`px-4 py-2 rounded-xl ${type === 'EX' ? 'bg-error-500' : ''}`}
          >
            <Typography variant="label" weight="bold" className={type === 'EX' ? 'text-white' : 'text-gray-500'}>Gasto</Typography>
          </TouchableOpacity>
          <TouchableOpacity 
           onPress={() => setType('IN')}
            className={`px-4 py-2 rounded-xl ${type === 'IN' ? 'bg-success-500' : ''}`}
          >
            <Typography variant="label" weight="bold" className={type === 'IN' ? 'text-white' : 'text-gray-500'}>Ingreso</Typography>
          </TouchableOpacity>
        </View>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        {/* Amount Display */}
        <TouchableOpacity 
          onPress={() => setShowNumpad(true)}
          className="items-center mb-10"
        >
          <Typography variant="caption" className="text-gray-500 mb-2">Monto del movimiento</Typography>
          <View className="flex-row items-baseline">
            <Typography variant="h1" weight="bold" style={{ color: accentColor, fontSize: 48 }}>
              {isIncome ? '+' : isExpense ? '-' : ''}${amount}
            </Typography>
          </View>
        </TouchableOpacity>

        {/* Dynamic Fields */}
        <View className="gap-4">
          <View>
            <Typography variant="label" className="text-gray-400 mb-2">Cuenta origen</Typography>
            <TouchableOpacity 
              onPress={() => setShowAccountModal(true)}
              className="flex-row items-center justify-between bg-gray-900 border border-gray-800 p-4 rounded-2xl"
            >
              <View className="flex-row items-center">
                <Ionicons name="wallet-outline" size={20} color={accentColor} className="mr-3" />
                <Typography className={selectedAccount ? 'text-white' : 'text-gray-500'}>
                  {selectedAccount ? selectedAccount.label : 'Seleccionar cuenta'}
                </Typography>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#4b5563" />
            </TouchableOpacity>
          </View>

          <View>
            <Typography variant="label" className="text-gray-400 mb-2">Categoría</Typography>
            <TouchableOpacity 
              onPress={() => setShowCategoryModal(true)}
              className="flex-row items-center justify-between bg-gray-900 border border-gray-800 p-4 rounded-2xl"
            >
              <View className="flex-row items-center">
                <Ionicons name={selectedCategory?.icon || "grid-outline"} size={20} color={accentColor} className="mr-3" />
                <Typography className={selectedCategory ? 'text-white' : 'text-gray-500'}>
                  {selectedCategory ? selectedCategory.label : 'Seleccionar categoría'}
                </Typography>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#4b5563" />
            </TouchableOpacity>
          </View>

          <View>
            <Typography variant="label" className="text-gray-400 mb-2">Nota (Opcional)</Typography>
            <Input 
              placeholder="¿En qué lo usaste?" 
              value={notes} 
              onChangeText={setNotes}
              className="bg-gray-900 border-gray-800 text-white h-14"
            />
          </View>
        </View>

        <View className="h-40" />
      </ScrollView>

      {/* Floating Save Button */}
      <View className="px-5 pb-8">
        <Button 
          label="Guardar Movimiento" 
          onPress={handleSave} 
          loading={mutation.isPending}
          style={{ backgroundColor: accentColor }}
          className="h-16 rounded-3xl shadow-xl shadow-brand-500/20"
        />
      </View>

      {/* Select Modals */}
      <SelectModal 
        isVisible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        title="Selecciona Cuenta"
        options={accounts.map(a => ({ id: a.id, label: a.name, sublabel: `${a.currency_detail.symbol} ${a.balance}`, icon: 'briefcase-outline' }))}
        selectedValue={selectedAccount?.id}
        onSelect={(opt) => setSelectedAccount(opt)}
        footerLabel="Agregar nueva cuenta"
        onFooterPress={() => router.push('/accounts/create')}
      />

      <SelectModal 
        isVisible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Selecciona Categoría"
        options={categories.map(c => ({ id: c.id, label: c.name, icon: 'bookmark-outline' }))}
        selectedValue={selectedCategory?.id}
        onSelect={(opt) => setSelectedCategory(opt)}
        footerLabel="Nueva categoría"
        onFooterPress={() => router.push('/categories/create')}
      />

      {/* Numpad Modal */}
      <Modal
        visible={showNumpad}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNumpad(false)}
      >
        <Pressable className="flex-1" onPress={() => setShowNumpad(false)} />
        <View className="bg-gray-950 border-t border-gray-900 pt-2 rounded-t-[40px]">
          <View className="w-12 h-1 bg-gray-800 rounded-full self-center mb-2" />
          <CustomNumpad onPress={handleNumpadPress} onDelete={handleNumpadDelete} />
          <TouchableOpacity 
            onPress={() => setShowNumpad(false)}
            className="mx-5 mb-8 bg-brand-500 h-14 rounded-2xl justify-center items-center"
          >
            <Typography weight="bold">Listo</Typography>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
