import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Typography } from '@/components/ui/Typography';
import { CustomNumpad } from '@/components/ui/CustomNumpad';
import { CreateCategoryModal } from '@/components/ui/CreateCategoryModal';
import { SelectModal } from '@/components/ui/SelectModal';
import { financeService } from '@/services/financeService';
import { transactionService } from '@/services/transactionService';

export default function CreateTransactionScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Core State
  const [step, setStep] = useState<'amount' | 'details'>('amount');
  const [type, setType] = useState<'EX' | 'IN'>('EX');
  const [amount, setAmount] = useState('0');
  const [inputCurrency, setInputCurrency] = useState<'USD' | 'VES'>('USD');
  const [bcvRate, setBcvRate] = useState(36.15); // Default, should load from API

  const [selectedAccountId, setSelectedAccountId] = useState<number | string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | string | null>(null);
  const [notes, setNotes] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);

  // Queries
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => financeService.getDashboardSummary(),
  });

  const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => financeService.getAccounts(),
  });

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => financeService.getCategories(),
  });

  // Prefill first account and category when they load
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts]);

  useEffect(() => {
    // try to find a default category based on type or just pick the first one
    const applicableCategories = categories.filter(c => c.type === type);
    if (applicableCategories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(applicableCategories[0].id);
    }
  }, [categories, type]);

  useEffect(() => {
    if (dashboardData?.rates?.USD) {
      setBcvRate(dashboardData.rates.USD);
    }
  }, [dashboardData]);

  const mutation = useMutation({
    mutationFn: (data: any) => transactionService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['recentTransactions'] });
      router.back();
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Error al procesar la transacción.';
      Alert.alert('Error', errorMsg);
    }
  });

  const handleNumpadPress = (key: string) => {
    if (key === '.' && amount.includes('.')) return;
    if (amount === '0' && key !== '.') {
      setAmount(key);
    } else {
      if (amount.includes('.')) {
        const [, decimalStr] = amount.split('.');
        if (decimalStr && decimalStr.length >= 2) return;
      }
      if (amount.length > 9) return;
      setAmount(prev => prev + key);
    }
  };

  const handleNumpadDelete = () => {
    if (amount.length <= 1) {
      setAmount('0');
    } else {
      setAmount(prev => prev.slice(0, -1));
    }
  };

  const handleNumpadClear = () => {
    setAmount('0');
  };

  const toggleCurrency = () => {
    setInputCurrency(prev => prev === 'USD' ? 'VES' : 'USD');
    setAmount('0'); 
  };

  const numericAmount = parseFloat(amount) || 0;

  const handleNext = () => {
    if (numericAmount <= 0) {
      Alert.alert('Incompleto', 'Ingresa un monto mayor a 0');
      return;
    }
    setStep('details');
  };

  const handleSave = () => {
    if (!selectedAccountId) {
      Alert.alert('Incompleto', 'Selecciona una cuenta origen.');
      return;
    }

    let baseAmountUsd = numericAmount;
    if (inputCurrency === 'VES') {
      baseAmountUsd = numericAmount / bcvRate;
    }

    mutation.mutate({
      account: selectedAccountId,
      category: selectedCategoryId,
      type,
      amount: parseFloat(baseAmountUsd.toFixed(2)),
      date: new Date().toISOString(),
      notes: notes || null,
    });
  };

  const handleCreateCategory = async (name: string, icon: string) => {
    try {
      const newCategory = await financeService.createCategory({
        name,
        type: type,
        icon
      });
      if (newCategory) {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        setSelectedCategoryId(newCategory.id);
        setShowCreateCategoryModal(false);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Error', 'No se pudo crear la categoría.');
    }
  };

  const isExpense = type === 'EX';
  const isIncome = type === 'IN';
  const colorBase = isExpense ? '#f43f5e' : '#10b981';

  const secondaryAmount = inputCurrency === 'USD' 
    ? (numericAmount * bcvRate).toFixed(2) 
    : (numericAmount / bcvRate).toFixed(2);
  const secondarySymbol = inputCurrency === 'USD' ? 'BS' : '$';

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      
      {/* Header Tabs */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity 
          onPress={() => {
            if (step === 'details') setStep('amount');
            else router.back();
          }} 
          className="w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-white/10"
        >
          <Ionicons name={step === 'details' ? "arrow-back" : "close"} size={20} color="white" />
        </TouchableOpacity>

        {step === 'amount' && (
          <View className="flex-row bg-surface-overlay rounded-2xl p-1 border border-white/5">
            <TouchableOpacity 
              onPress={() => setType('EX')}
              className={`px-6 py-2.5 rounded-xl transition-all ${isExpense ? 'bg-rose-500/20 border border-rose-500/30' : ''}`}
            >
              <Typography variant="label" weight="bold" className={isExpense ? 'text-rose-400' : 'text-ink-tertiary'}>
                Enviar
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setType('IN')}
              className={`px-6 py-2.5 rounded-xl transition-all ${isIncome ? 'bg-emerald-500/20 border border-emerald-500/30' : ''}`}
            >
              <Typography variant="label" weight="bold" className={isIncome ? 'text-emerald-400' : 'text-ink-tertiary'}>
                Recibir
              </Typography>
            </TouchableOpacity>
          </View>
        )}
        {step === 'details' && (
          <Typography variant="h3" weight="bold" className="text-white">
            Detalles
          </Typography>
        )}

        <View className="w-10 h-10" />
      </View>

      {/* Main Display Sector (Always Visible) */}
      <View className={`justify-center items-center px-4 transition-all ${step === 'details' ? 'flex-0 py-8' : 'flex-1'}`}>
        
        {step === 'amount' && (
          <TouchableOpacity 
            onPress={toggleCurrency}
            activeOpacity={0.7}
            className="bg-white/5 px-4 py-2 rounded-full border border-white/10 mb-6 flex-row items-center"
          >
            <Ionicons name="swap-vertical" size={14} color="#94a3b8" />
            <Typography className="text-ink-tertiary ml-2 uppercase text-xs" weight="bold">
              Entrada en {inputCurrency}
            </Typography>
          </TouchableOpacity>
        )}

        <Typography 
          className="text-white tracking-tighter" 
          weight="bold" 
          style={{ 
            fontSize: step === 'details' ? 48 : (amount.length > 6 ? 64 : 80), 
            color: colorBase 
          }}
        >
          {inputCurrency === 'USD' ? '$' : 'BS'} {amount}
        </Typography>

        <Typography variant={step === 'details' ? 'caption' : 'h3'} className="text-ink-muted mt-2" weight="semibold">
          ~ {secondarySymbol} {secondaryAmount}
        </Typography>

        {step === 'amount' && (
           <View className="flex-row items-center mt-6">
            <Ionicons name="information-circle-outline" size={14} color="#64748b" />
            <Typography variant="caption" className="text-ink-tertiary ml-1">
              Tasa BCV: {bcvRate.toFixed(2)} VES/USD
            </Typography>
          </View>
        )}
      </View>

      {/* Dynamic Bottom Area */}
      {step === 'amount' ? (
        <View className="pb-8 pt-4 px-2 bg-gray-950">
          <CustomNumpad 
            onPress={handleNumpadPress} 
            onDelete={handleNumpadDelete}
            onClear={handleNumpadClear}
            onConfirm={handleNext}
            confirmColor={colorBase}
          />
        </View>
      ) : (
        <View className="flex-1 bg-surface-overlay rounded-t-[40px] px-6 pt-8 border-t border-white/5 shadow-2xl">
           <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
             
             {/* Cuentas */}
             <Typography variant="h3" weight="bold" className="mb-4 text-white">¿De dónde sale?</Typography>
             {loadingAccounts ? (
               <ActivityIndicator color={colorBase} />
             ) : (
               <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 flex-row" contentContainerStyle={{ gap: 12 }}>
                 {accounts.map(acc => {
                   const isSelected = selectedAccountId === acc.id;
                   return (
                     <TouchableOpacity 
                       key={acc.id}
                       onPress={() => setSelectedAccountId(acc.id)}
                       className={`px-5 py-4 rounded-2xl border ${isSelected ? `border-emerald-500 bg-emerald-500/10` : 'border-white/5 bg-white/5'}`}
                     >
                       <Typography variant="label" weight="bold" className={isSelected ? 'text-white' : 'text-ink-tertiary'}>
                         {acc.name}
                       </Typography>
                       <Typography variant="caption" className={isSelected ? 'text-white/80' : 'text-ink-muted'}>
                         {acc.currency_detail?.symbol} {typeof acc.balance === 'number' ? acc.balance.toFixed(2) : parseFloat(acc.balance).toFixed(2)}
                       </Typography>
                     </TouchableOpacity>
                   );
                 })}
               </ScrollView>
             )}

             {/* Categorías */}
             <Typography variant="h3" weight="bold" className="mb-4 text-white">¿En qué se usó?</Typography>
             {loadingCategories ? (
               <ActivityIndicator color={colorBase} />
             ) : (
               <View className="mb-8">
                 <TouchableOpacity
                   onPress={() => setShowCategoryModal(true)}
                   className="flex-row items-center justify-between bg-white/5 border border-white/10 p-5 rounded-2xl"
                 >
                   <View className="flex-row items-center">
                     <View className="w-10 h-10 rounded-xl bg-white/5 justify-center items-center mr-4">
                       <Ionicons 
                         name={(categories.find(c => c.id === selectedCategoryId)?.icon || 'grid-outline') as any} 
                         size={20} 
                         color={colorBase} 
                       />
                     </View>
                     <View>
                        <Typography weight="bold" className="text-white">
                          {categories.find(c => c.id === selectedCategoryId)?.name || 'Seleccionar Categoría'}
                        </Typography>
                        <Typography variant="caption" className="text-ink-tertiary">
                          {isExpense ? 'Gasto' : 'Ingreso'}
                        </Typography>
                     </View>
                   </View>
                   <Ionicons name="chevron-forward" size={18} color="#475569" />
                 </TouchableOpacity>

                 <TouchableOpacity
                   onPress={() => setShowCreateCategoryModal(true)}
                   className="mt-3 flex-row items-center self-end px-4 py-2 bg-white/5 rounded-full border border-dashed border-white/20"
                 >
                   <Ionicons name="add" size={14} color="#64748b" className="mr-1" />
                   <Typography variant="caption" className="text-ink-tertiary">Nueva</Typography>
                 </TouchableOpacity>
               </View>
             )}

           </ScrollView>

           <View className="pb-8 pt-4">
            <TouchableOpacity 
              className="w-full h-16 rounded-2xl justify-center items-center flex-row"
              style={{ backgroundColor: colorBase }}
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="white" className="mr-2" />
                  <Typography variant="h3" weight="bold" className="text-white">
                    Confirmar Transacción
                  </Typography>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <SelectModal 
        isVisible={showCategoryModal} 
        onClose={() => setShowCategoryModal(false)} 
        title="Selecciona Categoría" 
        options={financeService.getHierarchicalCategories(categories, type)} 
        selectedValue={selectedCategoryId || undefined} 
        onSelect={(opt) => setSelectedCategoryId(opt.id)}
        footerLabel="Gestionar Categorías"
        onFooterPress={() => {
          setShowCategoryModal(false);
          router.push('/category' as any);
        }}
      />

      <CreateCategoryModal
        isVisible={showCreateCategoryModal}
        onClose={() => setShowCreateCategoryModal(false)}
        onSubmit={handleCreateCategory}
        type={type}
      />
    </SafeAreaView>
  );
}
