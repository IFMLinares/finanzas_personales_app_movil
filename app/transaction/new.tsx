import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Typography } from '@/components/ui/Typography';
import { SelectModal } from '@/components/ui/SelectModal';
import { CustomNumpad } from '@/components/ui/CustomNumpad';
import { CreateCategoryModal } from '@/components/ui/CreateCategoryModal';
import { financeService, DashboardResponse } from '@/services/financeService';
import { transactionService } from '@/services/transactionService';

export default function NewTransactionScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { type: initialType } = useLocalSearchParams();

  const [type, setType] = useState<'IN' | 'EX' | 'TR'>((initialType as any) || 'EX');
  const [amount, setAmount] = useState('0');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date] = useState(new Date());

  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [selectedDestinationAccount, setSelectedDestinationAccount] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  
  const [rateSource, setRateSource] = useState<'BCV' | 'PARALLEL' | 'MANUAL'>('BCV');
  const [exchangeRate, setExchangeRate] = useState('1');

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showDestinationAccountModal, setShowDestinationAccountModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);

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

  // Lógica de tasas automáticas
  useEffect(() => {
    if (type !== 'TR' || !selectedAccount || !selectedDestinationAccount) return;

    const sourceCurrency = selectedAccount.currency_detail?.code;
    const destCurrency = selectedDestinationAccount.currency_detail?.code;

    // Si son la misma moneda, tasa es 1
    if (sourceCurrency === destCurrency) {
      setExchangeRate('1');
      return;
    }

    // Identificar la divisa que no es BS para buscar la tasa
    type RateKey = keyof DashboardResponse['rates'];
    const otherCurrency = (sourceCurrency !== 'VES' ? sourceCurrency : destCurrency) as RateKey;
    
    if (rateSource === 'BCV') {
      const rate = summary?.rates?.[otherCurrency] || 1;
      setExchangeRate(rate.toString());
    } else if (rateSource === 'PARALLEL') {
      const bcv = summary?.rates?.[otherCurrency] || 1;
      const rate = (bcv * 1.12).toFixed(2); // Spread simulado si no hay monitor explícito
      setExchangeRate(rate);
    }
  }, [rateSource, selectedAccount, selectedDestinationAccount, summary, type]);

  const calculateDestinationAmount = () => {
    const val = parseFloat(amount || '0');
    const rate = parseFloat(exchangeRate || '1');
    if (!selectedAccount || !selectedDestinationAccount) return val.toFixed(2);

    const sourceCurrency = selectedAccount.currency_detail?.code;
    const destCurrency = selectedDestinationAccount.currency_detail?.code;

    if (sourceCurrency === 'VES' && destCurrency !== 'VES') {
      // Bs -> USD/EUR: Se divide
      return (val / rate).toFixed(2);
    } else {
      // USD -> Bs o Misma Moneda: Se multiplica
      return (val * rate).toFixed(2);
    }
  };

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

  const handleNumpadClear = () => {
    setAmount('0');
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
    if (title) payload.title = title;
    if (notes) payload.notes = notes;
    if (!isTransfer && selectedCategory) payload.category = selectedCategory.id;

    if (isTransfer) {
      payload.destination_account = selectedDestinationAccount?.id;
      payload.exchange_rate = parseFloat(exchangeRate);
      payload.destination_amount = parseFloat(calculateDestinationAmount());
    }

    mutation.mutate(payload);
  };
  const handleCreateCategory = async (name: string, icon: string) => {
    if (type === 'TR') return;
    try {
      const newCategory = await financeService.createCategory({
        name,
        type: type, // 'IN' or 'EX'
        icon
      });
      
      if (newCategory) {
        // Invalida cache para refrescar la lista
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        
        // Selecciona la nueva categoría automáticamente
        setSelectedCategory({
          id: newCategory.id,
          label: newCategory.name,
          icon: newCategory.icon || 'bookmark-outline'
        });
      }
      
      setShowCreateCategoryModal(false);
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Error', 'No se pudo crear la categoría.');
    }
  };

  const isExpense = type === 'EX';
  const isIncome = type === 'IN';
  const isTransfer = type === 'TR';
  const accentColor = isIncome ? '#12b76a' : isExpense ? '#f04438' : '#465fff';
  const destinationAmount = calculateDestinationAmount();

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
                    {selectedAccount ? (selectedAccount as any).name : 'Seleccionar cuenta'}
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
                  <Typography className={selectedAccount ? 'text-white' : 'text-gray-400'} weight="semibold" numberOfLines={1}>{selectedAccount ? selectedAccount.name : 'Origen'}</Typography>
                  {selectedAccount && <Typography className="text-blue-500 text-[10px] font-bold">{selectedAccount.currency_detail.symbol} {selectedAccount.balance}</Typography>}
                </TouchableOpacity>

                <View className="bg-gray-900 w-8 h-8 rounded-full items-center justify-center border border-white/5 z-10">
                  <Ionicons name="swap-horizontal" size={14} color="#64748b" />
                </View>

                <TouchableOpacity onPress={() => setShowDestinationAccountModal(true)} className="flex-1 bg-white/5 border border-white/5 p-3 rounded-2xl h-20 justify-center">
                  <Typography variant="caption" className="text-gray-500 font-bold uppercase text-[9px]">Hacia</Typography>
                  <Typography className={selectedDestinationAccount ? 'text-white' : 'text-gray-400'} weight="semibold" numberOfLines={1}>{selectedDestinationAccount ? selectedDestinationAccount.name : 'Destino'}</Typography>
                  {selectedDestinationAccount && <Typography className="text-blue-500 text-[10px] font-bold">Llega: {selectedDestinationAccount.currency_detail.symbol} {destinationAmount}</Typography>}
                </TouchableOpacity>
              </View>

              {/* Selector de Tasa - Solo si las monedas son distintas */}
              {selectedAccount && selectedDestinationAccount && selectedAccount.currency_detail?.code !== selectedDestinationAccount.currency_detail?.code && (
                <View className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                  <View className="flex-row bg-gray-900/50 p-1 rounded-xl mb-3 border border-white/5">
                    {(['BCV', 'PARALLEL', 'MANUAL'] as const).map((s) => (
                      <TouchableOpacity
                        key={s}
                        onPress={() => setRateSource(s)}
                        className={`flex-1 py-1.5 rounded-lg items-center ${rateSource === s ? 'bg-blue-600' : ''}`}
                      >
                        <Typography variant="label" weight="bold" className={rateSource === s ? 'text-white' : 'text-gray-500'} style={{ fontSize: 9 }}>
                          {s === 'BCV' ? 'OFICIAL' : s === 'PARALLEL' ? 'MONITOR' : 'MANUAL'}
                        </Typography>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Typography variant="caption" className="text-gray-500 font-bold uppercase text-[9px] mb-1">Tasa de Cambio</Typography>
                      <View className="flex-row items-center">
                        <Typography className="text-gray-400 text-xs mr-2">1 USD =</Typography>
                        <TextInput 
                          value={exchangeRate} 
                          onChangeText={setExchangeRate} 
                          editable={rateSource === 'MANUAL'}
                          keyboardType="numeric" 
                          className={`text-white text-base font-bold flex-1 p-0 ${rateSource === 'MANUAL' ? 'text-blue-400' : ''}`} 
                          placeholder="0.00" 
                          placeholderTextColor="#4b5563" 
                          style={{ fontFamily: 'Outfit_600SemiBold', height: 24 }} 
                        />
                        <Typography className="text-gray-400 text-xs ml-2">Bs</Typography>
                      </View>
                    </View>
                    {rateSource === 'MANUAL' && (
                      <View className="bg-blue-500/20 p-1.5 rounded-full">
                        <Ionicons name="pencil" size={12} color="#3b82f6" />
                      </View>
                    )}
                  </View>
                </View>
              )}

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

              <View className="bg-white/5 border border-white/5 px-4 h-14 rounded-2xl flex-row items-center mb-3">
                <Ionicons name="pricetag-outline" size={18} color="#64748b" style={{ marginRight: 12 }} />
                <TextInput 
                  value={title} 
                  onChangeText={setTitle} 
                  placeholder="Concepto (ej. Almuerzo, Gasolina)" 
                  placeholderTextColor="#4b5563" 
                  className="flex-1 text-white font-medium" 
                  style={{ fontFamily: 'Outfit_400Regular' }} 
                />
              </View>

              <View className="bg-white/5 border border-white/5 px-4 h-14 rounded-2xl flex-row items-center">
                <Ionicons name="document-text-outline" size={18} color="#64748b" style={{ marginRight: 12 }} />
                <TextInput 
                  value={notes} 
                  onChangeText={setNotes} 
                  placeholder="Notas adicionales (opcional)" 
                  placeholderTextColor="#4b5563" 
                  className="flex-1 text-white font-medium" 
                  style={{ fontFamily: 'Outfit_400Regular' }} 
                />
              </View>
            </>
          )}
        </View>

        <View className="flex-1" />
        <View className="-mx-2 opacity-95 mt-auto">
          <CustomNumpad 
            onPress={handleNumpadPress} 
            onDelete={handleNumpadDelete}
            onClear={handleNumpadClear}
            onConfirm={handleSave}
            confirmColor={accentColor}
          />
        </View>
      </ScrollView>

      <SelectModal isVisible={showAccountModal} onClose={() => setShowAccountModal(false)} title="Seleccionar Cuenta" options={accounts.map(a => ({ id: a.id, label: a.name, sublabel: `${a.currency_detail.symbol} ${a.balance}`, icon: 'briefcase-outline' }))} selectedValue={selectedAccount?.id} onSelect={(opt) => setSelectedAccount(accounts.find(a => a.id === opt.id))} />
      <SelectModal isVisible={showDestinationAccountModal} onClose={() => setShowDestinationAccountModal(false)} title="Hacia (Destino)" options={accounts.map(a => ({ id: a.id, label: a.name, sublabel: `${a.currency_detail.symbol} ${a.balance}`, icon: 'swap-horizontal-outline' }))} selectedValue={selectedDestinationAccount?.id} onSelect={(opt) => setSelectedDestinationAccount(accounts.find(a => a.id === opt.id))} />
      <SelectModal 
        isVisible={showCategoryModal} 
        onClose={() => setShowCategoryModal(false)} 
        title="Selecciona Categoría" 
        options={financeService.getHierarchicalCategories(categories, type as 'IN' | 'EX')} 
        selectedValue={selectedCategory?.id} 
        onSelect={(opt) => setSelectedCategory(opt)}
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
        type={type === 'IN' ? 'IN' : 'EX'}
      />
    </SafeAreaView>
  );
}
