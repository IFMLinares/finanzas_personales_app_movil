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
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { financeService, DashboardResponse } from '@/services/financeService';
import { transactionService } from '@/services/transactionService';
import { useToast } from '@/contexts/ToastContext';

export default function NewTransactionScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { type: initialType, id } = useLocalSearchParams();
  const isEditing = !!id;

  const [type, setType] = useState<'IN' | 'EX' | 'TR'>((initialType as any) || 'EX');
  const [amount, setAmount] = useState('0');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date] = useState(new Date());

  const { showToast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  // Query para cargar la transacción si estamos editando
  const { data: editingTx, isLoading: loadingTx } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionService.getTransactionById(id as string),
    enabled: isEditing,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => isEditing 
      ? transactionService.updateTransaction(id as string, data)
      : transactionService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['recentTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      showToast({ message: isEditing ? 'Movimiento actualizado' : 'Movimiento guardado exitosamente', type: 'success' });
      router.back();
    },
    onError: (error: any) => {
      console.error('Error creating transaction:', error.response?.data);
      const data = error.response?.data;
      let errorMsg = 'No se pudo registrar el movimiento.';

      if (data) {
        if (typeof data === 'string') {
          errorMsg = data;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else {
          setErrors(data);
          errorMsg = 'Revisa los campos en rojo para continuar.';
        }
      }

      showToast({ message: errorMsg, type: 'error' });
    }
  });

  // Efecto para cargar los datos de la transacción en modo edición
  useEffect(() => {
    if (isEditing && editingTx) {
      setType(editingTx.type);
      setAmount(editingTx.amount.toString());
      setTitle(editingTx.title || '');
      setNotes(editingTx.notes || '');
      
      if (editingTx.account_detail) {
        setSelectedAccount(editingTx.account_detail);
      }
      
      if (editingTx.category_detail) {
        setSelectedCategory({
          id: editingTx.category_detail.id,
          label: editingTx.category_detail.name,
          icon: editingTx.category_detail.icon || 'bookmark-outline'
        });
      }

      if (editingTx.type === 'TR') {
        if (editingTx.destination_account_detail) {
          setSelectedDestinationAccount(editingTx.destination_account_detail);
        }
        if (editingTx.exchange_rate) {
          setExchangeRate(editingTx.exchange_rate.toString());
          setRateSource('MANUAL'); // Siempre manual al editar para no romper lo guardado
        }
      }
    }
  }, [isEditing, editingTx]);

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
    let newErrors: Record<string, string> = {};
    if (!selectedAccount) newErrors.account = 'Debes seleccionar una cuenta';
    if (parseFloat(amount) <= 0) newErrors.amount = 'El monto debe ser mayor a 0';
    if (type === 'TR' && !selectedDestinationAccount) newErrors.destination_account = 'Selecciona la cuenta destino';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast({ message: 'Por favor, completa los campos marcados en rojo', type: 'error' });
      return;
    }

    setErrors({});

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
      showToast({ message: 'No se pudo crear la categoría.', type: 'error' });
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
        <View className="w-6">
          {isEditing && (
            <TouchableOpacity onPress={() => setShowDeleteConfirm(true)}>
              <Ionicons name="trash-outline" size={22} color="#f43f5e" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}>
        {/* Amount Display */}
        <View className="items-center mb-8">
          <Typography variant="label" weight="bold" className={`mb-2 uppercase tracking-wide ${errors.amount ? 'text-error-500' : 'text-gray-500'}`}>Monto</Typography>
          <Typography variant="h1" weight="bold" style={{ color: errors.amount ? '#f04438' : accentColor, fontSize: 52, lineHeight: 56 }} className="tracking-tighter py-1">
            {isIncome ? '+ ' : isExpense ? '- ' : ''}${amount}
          </Typography>
          {errors.amount && <Typography variant="caption" className="text-error-500 mt-2">{errors.amount}</Typography>}
        </View>

        {/* Dynamic Fields */}
        <View className="gap-3 mb-6">
          {!isTransfer && (
            <View>
              <TouchableOpacity
                onPress={() => { setShowAccountModal(true); setErrors(prev => ({...prev, account: ''})); }}
                className={`flex-row items-center justify-between border p-4 rounded-2xl ${errors.account ? 'border-error-500/50 bg-error-500/5' : 'bg-white/5 border-white/5'}`}
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
              {errors.account && <Typography variant="caption" className="text-error-500 mt-1 ml-1">{errors.account}</Typography>}
            </View>
          )}

          {isTransfer && (
            <>
              <View className="flex-row items-center gap-2">
                <View className="flex-1">
                  <TouchableOpacity onPress={() => { setShowAccountModal(true); setErrors(prev => ({...prev, account: ''})); }} className={`border p-3 rounded-2xl h-20 justify-center ${errors.account ? 'border-error-500/50 bg-error-500/5' : 'bg-white/5 border-white/5'}`}>
                    <Typography variant="caption" className="text-gray-500 font-bold uppercase text-[9px]">Desde</Typography>
                    <Typography className={selectedAccount ? 'text-white' : 'text-gray-400'} weight="semibold" numberOfLines={1}>{selectedAccount ? selectedAccount.name : 'Origen'}</Typography>
                    {selectedAccount && <Typography className="text-blue-500 text-[10px] font-bold">{selectedAccount.currency_detail.symbol} {selectedAccount.balance}</Typography>}
                  </TouchableOpacity>
                  {errors.account && <Typography variant="caption" className="text-error-500 mt-1 ml-1">{errors.account}</Typography>}
                </View>

                <View className="bg-gray-900 w-8 h-8 rounded-full items-center justify-center border border-white/5 z-10 mx-[-4px]">
                  <Ionicons name="swap-horizontal" size={14} color="#64748b" />
                </View>

                <View className="flex-1">
                  <TouchableOpacity onPress={() => { setShowDestinationAccountModal(true); setErrors(prev => ({...prev, destination_account: ''})); }} className={`border p-3 rounded-2xl h-20 justify-center ${errors.destination_account ? 'border-error-500/50 bg-error-500/5' : 'bg-white/5 border-white/5'}`}>
                    <Typography variant="caption" className="text-gray-500 font-bold uppercase text-[9px]">Hacia</Typography>
                    <Typography className={selectedDestinationAccount ? 'text-white' : 'text-gray-400'} weight="semibold" numberOfLines={1}>{selectedDestinationAccount ? selectedDestinationAccount.name : 'Destino'}</Typography>
                    {selectedDestinationAccount && <Typography className="text-blue-500 text-[10px] font-bold">Llega: {selectedDestinationAccount.currency_detail.symbol} {destinationAmount}</Typography>}
                  </TouchableOpacity>
                  {errors.destination_account && <Typography variant="caption" className="text-error-500 mt-1 ml-1">{errors.destination_account}</Typography>}
                </View>
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
              <View>
                <TouchableOpacity onPress={() => { setShowCategoryModal(true); setErrors(prev => ({...prev, category: ''})); }} className={`flex-row items-center justify-between border p-4 rounded-2xl ${errors.category ? 'border-error-500/50 bg-error-500/5' : 'bg-white/5 border-white/5'}`}>
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
                {errors.category && <Typography variant="caption" className="text-error-500 mt-1 ml-1">{errors.category}</Typography>}
              </View>

              <View>
                <View className={`border px-4 h-14 rounded-2xl flex-row items-center transition-colors ${errors.title ? 'border-error-500/50 bg-error-500/5' : 'bg-white/5 border-white/5'}`}>
                  <Ionicons name="pricetag-outline" size={18} color="#64748b" style={{ marginRight: 12 }} />
                  <TextInput 
                    value={title} 
                    onChangeText={text => { setTitle(text); setErrors(prev => ({...prev, title: ''})); }} 
                    placeholder="Concepto (ej. Almuerzo, Gasolina)" 
                    placeholderTextColor="#4b5563" 
                    className="flex-1 text-white font-medium h-full" 
                    style={{ fontFamily: 'Outfit_400Regular' }} 
                  />
                </View>
                {errors.title && <Typography variant="caption" className="text-error-500 mt-1 ml-1">{errors.title}</Typography>}
              </View>

              <View>
                <View className={`border px-4 h-14 rounded-2xl flex-row items-center transition-colors ${errors.notes ? 'border-error-500/50 bg-error-500/5' : 'bg-white/5 border-white/5'}`}>
                  <Ionicons name="document-text-outline" size={18} color="#64748b" style={{ marginRight: 12 }} />
                  <TextInput 
                    value={notes} 
                    onChangeText={text => { setNotes(text); setErrors(prev => ({...prev, notes: ''})); }} 
                    placeholder="Notas adicionales (opcional)" 
                    placeholderTextColor="#4b5563" 
                    className="flex-1 text-white font-medium h-full" 
                    style={{ fontFamily: 'Outfit_400Regular' }} 
                  />
                </View>
                {errors.notes && <Typography variant="caption" className="text-error-500 mt-1 ml-1">{errors.notes}</Typography>}
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
            confirmLabel={isEditing ? "GUARDAR" : "CONFIRMAR"}
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

      <ConfirmModal
        isVisible={showDeleteConfirm}
        title="Eliminar Transacción"
        message="¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        isDestructive={true}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          try {
            await transactionService.deleteTransaction(id as string);
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({ queryKey: ['recentTransactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
            setShowDeleteConfirm(false);
            showToast({ message: 'Transacción eliminada exitosamente', type: 'success' });
            router.dismissAll();
            router.replace('/(tabs)');
          } catch (e) {
            showToast({ message: 'Error eliminando la transacción', type: 'error' });
            setShowDeleteConfirm(false);
          }
        }}
      />
    </SafeAreaView>
  );
}
