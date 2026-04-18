import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Typography } from '@/components/ui/Typography';
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
  const [date] = useState(new Date());
  
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [selectedDestinationAccount, setSelectedDestinationAccount] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [exchangeRate, setExchangeRate] = useState('1');
  
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showDestinationAccountModal, setShowDestinationAccountModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Queries
  const { data: summary } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => financeService.getDashboardSummary(),
  });

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
      console.error('Error creating transaction:', error.response?.data);
      // Extraer errores de validación por campo (formato DRF)
      const data = error.response?.data;
      let errorMsg = 'No se pudo registrar el movimiento.';
      
      if (data) {
        if (typeof data === 'string') {
          errorMsg = data;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else {
          // Si es un objeto de errores de campo { "category": ["error"] }
          errorMsg = Object.entries(data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('\n');
        }
      }
      
      Alert.alert('Error en el Registro', errorMsg);
    }
  });

  const handleNumpadPress = (key: string) => {
    if (key === '.' && amount.includes('.')) return;
    if (amount === '0' && key !== '.') {
      setAmount(key);
    } else {
      if (amount.includes('.')) {
        const [, dec] = amount.split('.');
        if (dec && dec.length >= 2) return;
      }
      setAmount(prev => prev + key);
    }
  };

  const handleNumpadDelete = () => {
    if (amount.length <= 1) setAmount('0');
    else setAmount(prev => prev.slice(0, -1));
  };

  const handleSave = () => {
    if (!selectedAccount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Por favor selecciona una cuenta y un monto mayor a 0.');
      return;
    }

    const isTransfer = type === 'TR';
    
    // Objeto base
    const payload: any = {
      account: selectedAccount.id,
      type,
      amount: parseFloat(amount),
      date: date.toISOString(),
    };

    // Campos opcionales/condicionales (solo se añaden si existen/aplican)
    if (notes) payload.notes = notes;
    if (!isTransfer && selectedCategory) payload.category = selectedCategory.id;
    
    if (isTransfer) {
      payload.destination_account = selectedDestinationAccount?.id;
      payload.exchange_rate = parseFloat(exchangeRate);
      payload.destination_amount = parseFloat(amount) * parseFloat(exchangeRate);
    }

    mutation.mutate(payload);
  };

  const isExpense = type === 'EX';
  const isIncome = type === 'IN';
  const isTransfer = type === 'TR';
  const accentColor = isIncome ? '#12b76a' : isExpense ? '#f04438' : '#465fff';
  const destinationAmount = (parseFloat(amount) * parseFloat(exchangeRate || '0')).toFixed(2);

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        
        <View className="flex-row bg-gray-900 p-1 rounded-2xl">
          {(['EX', 'IN', 'TR'] as const).map((t) => (
            <TouchableOpacity 
              key={t}
              onPress={() => setType(t)}
              className={`px-3 py-2 rounded-xl border ${type === t ? (t === 'IN' ? 'bg-success-500/20 border-success-500/30' : t === 'EX' ? 'bg-error-500/20 border-error-500/30' : 'bg-blue-500/20 border-blue-500/30') : 'border-transparent'}`}
            >
              <Typography variant="label" weight="bold" className={type === t ? (t === 'IN' ? 'text-success-500' : t === 'EX' ? 'text-error-500' : 'text-blue-500') : 'text-gray-500'} style={{ fontSize: 11 }}>
                {t === 'EX' ? 'GASTO' : t === 'IN' ? 'INGRESO' : 'TRANSF'}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}>
        {/* Amount Display */}
        <View className="items-center mb-8">
          <Typography variant="label" weight="bold" className="text-gray-500 mb-2 uppercase tracking-wide">Monto</Typography>
          <Typography variant="h1" weight="bold" style={{ color: accentColor, fontSize: 52, lineHeight: 56 }} className="tracking-tighter py-1">
            {isIncome ? '+ ' : isExpense ? '- ' : ''}${amount}
          </Typography>
        </View>

        {/* Dynamic Fields */}
        <View className="gap-3 mb-6">
          {!isTransfer && (
            <TouchableOpacity 
              onPress={() => setShowAccountModal(true)}
              className="flex-row items-center justify-between bg-white/5 border border-white/5 p-4 rounded-2xl"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-white/5 justify-center items-center mr-3">
                  <Ionicons name="wallet-outline" size={16} color={accentColor} />
                </View>
                <View>
                  <Typography variant="caption" className="text-gray-500 font-bold uppercase text-[10px]">Cuenta</Typography>
                  <Typography className={selectedAccount ? 'text-white' : 'text-gray-400'} weight="semibold">
                    {selectedAccount ? selectedAccount.label : 'Seleccionar cuenta'}
                  </Typography>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#4b5563" />
            </TouchableOpacity>
          )}

          {isTransfer && (
            <>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity onPress={() => setShowAccountModal(true)} className="flex-1 bg-white/5 border border-white/5 p-3 rounded-2xl h-20 justify-center">
                  <Typography variant="caption" className="text-gray-500 font-bold uppercase text-[9px]">Desde</Typography>
                  <Typography className={selectedAccount ? 'text-white' : 'text-gray-400'} weight="semibold" numberOfLines={1}>{selectedAccount ? selectedAccount.label : 'Origen'}</Typography>
                  {selectedAccount && <Typography className="text-blue-500 text-[10px] font-bold">{selectedAccount.sublabel.split(' ')[0]}</Typography>}
                </TouchableOpacity>

                <View className="bg-gray-900 w-8 h-8 rounded-full items-center justify-center border border-white/5 z-10">
                  <Ionicons name="arrow-forward" size={14} color="#64748b" />
                </View>

                <TouchableOpacity onPress={() => setShowDestinationAccountModal(true)} className="flex-1 bg-white/5 border border-white/5 p-3 rounded-2xl h-20 justify-center">
                  <Typography variant="caption" className="text-gray-500 font-bold uppercase text-[9px]">Hacia</Typography>
                  <Typography className={selectedDestinationAccount ? 'text-white' : 'text-gray-400'} weight="semibold" numberOfLines={1}>{selectedDestinationAccount ? selectedDestinationAccount.label : 'Destino'}</Typography>
                  {selectedDestinationAccount && <Typography className="text-blue-500 text-[10px] font-bold">Llega: {destinationAmount}</Typography>}
                </TouchableOpacity>
              </View>

              <View className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                 <View className="flex-row justify-between items-center mb-2">
                   <Typography variant="caption" className="text-gray-500 font-bold uppercase text-[9px]">Tasa Manual</Typography>
                   <View className="flex-row gap-2">
                     {summary?.rates?.USD && <Typography className="text-blue-400 text-[9px] font-bold">BCV: {summary.rates.USD}</Typography>}
                     {summary?.rates?.EUR && <Typography className="text-purple-400 text-[9px] font-bold">EUR: {summary.rates.EUR}</Typography>}
                   </View>
                 </View>
                 <View className="flex-row items-center">
                    <Ionicons name="pencil" size={12} color="#64748b" style={{ marginRight: 8 }} />
                    <TextInput value={exchangeRate} onChangeText={setExchangeRate} keyboardType="numeric" className="text-white text-base font-bold flex-1 p-0" placeholder="Ej: 36.50" placeholderTextColor="#4b5563" style={{ fontFamily: 'Outfit_600SemiBold', height: 24 }} />
                 </View>
              </View>
            </>
          )}

          {!isTransfer && (
            <>
              <TouchableOpacity onPress={() => setShowCategoryModal(true)} className="flex-row items-center justify-between bg-white/5 border border-white/5 p-4 rounded-2xl">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-white/5 justify-center items-center mr-3">
                    <Ionicons name={selectedCategory?.icon || "grid-outline"} size={16} color={accentColor} />
                  </View>
                  <View>
                    <Typography variant="caption" className="text-gray-500 font-bold uppercase text-[10px]">Categoría</Typography>
                    <Typography className={selectedCategory ? 'text-white' : 'text-gray-400'} weight="semibold">{selectedCategory ? selectedCategory.label : 'Seleccionar categoría'}</Typography>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#4b5563" />
              </TouchableOpacity>

              <View className="bg-white/5 border border-white/5 px-4 h-14 rounded-2xl flex-row items-center">
                <Ionicons name="document-text-outline" size={18} color="#64748b" style={{ marginRight: 12 }} />
                <TextInput value={notes} onChangeText={setNotes} placeholder="¿En qué lo usaste? (opcional)" placeholderTextColor="#4b5563" className="flex-1 text-white font-medium" style={{ fontFamily: 'Outfit_400Regular' }} />
              </View>
            </>
          )}
        </View>

        <View className="flex-1" />
        <View className="-mx-2 opacity-90 mt-auto">
           <CustomNumpad onPress={handleNumpadPress} onDelete={handleNumpadDelete} />
        </View>
      </ScrollView>

      <View className="px-5 pb-5 pt-0 bg-gray-950">
         <TouchableOpacity onPress={handleSave} disabled={mutation.isPending} className="w-full h-14 rounded-2xl justify-center items-center" style={{ backgroundColor: accentColor }}>
           <Typography weight="bold" className="text-white text-lg">{mutation.isPending ? 'Guardando...' : 'Guardar Movimiento'}</Typography>
         </TouchableOpacity>
      </View>

      <SelectModal isVisible={showAccountModal} onClose={() => setShowAccountModal(false)} title="Seleccionar Cuenta" options={accounts.map(a => ({ id: a.id, label: a.name, sublabel: `${a.currency_detail.symbol} ${a.balance}`, icon: 'briefcase-outline' }))} selectedValue={selectedAccount?.id} onSelect={(opt) => setSelectedAccount(opt)} />
      <SelectModal isVisible={showDestinationAccountModal} onClose={() => setShowDestinationAccountModal(false)} title="Hacia (Destino)" options={accounts.map(a => ({ id: a.id, label: a.name, sublabel: `${a.currency_detail.symbol} ${a.balance}`, icon: 'swap-horizontal-outline' }))} selectedValue={selectedDestinationAccount?.id} onSelect={(opt) => setSelectedDestinationAccount(opt)} />
      <SelectModal isVisible={showCategoryModal} onClose={() => setShowCategoryModal(false)} title="Selecciona Categoría" options={categories.map(c => ({ id: c.id, label: c.name, icon: 'bookmark-outline' }))} selectedValue={selectedCategory?.id} onSelect={(opt) => setSelectedCategory(opt)} />
    </SafeAreaView>
  );
}
