import React, { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { View, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Typography } from './Typography';
import { BaseBottomSheet } from './BaseBottomSheet';
import { CreateCategoryModal } from './CreateCategoryModal';
import { financeService, Category, Account, Currency } from '@/services/financeService';
import { SelectModal } from './SelectModal';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency, getCurrencySymbol, formatCurrencyWithSymbol } from '@/utils/formatters';

interface TemplateModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  title: string;
}

export function TemplateModal({
  isVisible,
  onClose,
  onSubmit,
  initialData,
  title
}: TemplateModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number | string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const [showCurrencySelect, setShowCurrencySelect] = useState(false);
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [showAccountSelect, setShowAccountSelect] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isVisible && isFocused) {
      loadData();
      if (initialData) {
        setName(initialData.name || '');
        setAmount(parseFloat(initialData.amount?.toString() || '0').toFixed(2));
        setSelectedCurrencyId(initialData.currency || null);
        setSelectedCategoryId(initialData.category || null);
        setSelectedAccountId(initialData.preferred_account || null);
      } else {
        setName('');
        setAmount('');
        setSelectedCurrencyId(2); // Default USD
        setSelectedCategoryId(null);
        setSelectedAccountId(null);
      }
    }
  }, [isVisible, initialData, isFocused]);

  const loadData = async () => {
    try {
      const [cats, accs, curs] = await Promise.all([
        financeService.getCategories(),
        financeService.getAccounts(),
        financeService.getCurrencies()
      ]);
      setCategories(cats);
      setAccounts(accs);
      setCurrencies(curs);

      if (!initialData) {
        // Seleccionar USD por defecto (ID 2 típicamente)
        const usd = curs.find(c => c.code === 'USD');
        if (usd) setSelectedCurrencyId(usd.id);

        const exCats = cats.filter(c => c.type === 'EX');
        if (exCats.length > 0) setSelectedCategoryId(exCats[0].id);

        // Intentar pre-seleccionar una cuenta que coincida con USD
        const defaultAcc = accs.find(a => a.currency === (usd?.id || 2));
        if (defaultAcc) setSelectedAccountId(defaultAcc.id);
      }
    } catch (error) {
      console.error('Error loading template modal data:', error);
    }
  };

  const handleCreateCategory = async (name: string, icon: string) => {
    try {
      const newCat = await financeService.createCategory({
        name,
        type: 'EX',
        icon
      });
      if (newCat) {
        await loadData();
        setSelectedCategoryId(newCat.id);
        setShowCreateCategoryModal(false);
        showToast({ message: 'Categoría creada con éxito.', type: 'success' });
      }
    } catch (error) {
      console.error('Error creating category in modal:', error);
      showToast({ message: 'No se pudo crear la categoría.', type: 'error' });
    }
  };

  // Filtrar cuentas por la moneda seleccionada
  const filteredAccounts = accounts.filter(a => a.currency === selectedCurrencyId);

  const handleCurrencySelect = (currencyId: number) => {
    setSelectedCurrencyId(currencyId);
    // Si la cuenta actual no es de esta moneda, la deseleccionamos
    const currentAcc = accounts.find(a => a.id === selectedAccountId);
    if (currentAcc && currentAcc.currency !== currencyId) {
      // Intentar pre-seleccionar la primera cuenta de la nueva moneda
      const firstMatch = accounts.find(a => a.currency === currencyId);
      setSelectedAccountId(firstMatch ? firstMatch.id : null);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !amount || !selectedCategoryId || !selectedAccountId || !selectedCurrencyId) {
      showToast({ message: 'Por favor completa todos los campos obligatorios.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        amount: parseFloat(amount),
        currency: selectedCurrencyId,
        category: selectedCategoryId,
        preferred_account: selectedAccountId
      });
      onClose();
    } catch (error) {
      console.error(error);
      showToast({ message: 'Error al guardar la plantilla.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const selectedCurrency = currencies.find(c => c.id === selectedCurrencyId);
  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  return (
    <BaseBottomSheet
      isVisible={isVisible}
      onClose={onClose}
      title={title}
      maxHeight="90%"
    >
      <ScrollView className="px-8 pb-10" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Typography variant="label" weight="bold" className="text-white/40 mb-2 uppercase">Nombre de la Plantilla</Typography>
          <View className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ej: Pasaje, Café, Almuerzo..."
              placeholderTextColor="#475569"
              className="text-white font-semibold text-base"
            />
          </View>
        </View>

        <View className="flex-row gap-4 mb-6">
          <View className="flex-1">
            <Typography variant="label" weight="bold" className="text-white/40 mb-2 uppercase">Moneda</Typography>
            <TouchableOpacity
              onPress={() => setShowCurrencySelect(true)}
              className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex-row items-center justify-between"
            >
              <Typography weight="bold" className="text-brand-500">
                {selectedCurrency?.code || 'USD'}
              </Typography>
              <Ionicons name="chevron-down" size={14} color="#475569" />
            </TouchableOpacity>
          </View>

          <View className="flex-[2]">
            <Typography variant="label" weight="bold" className="text-white/40 mb-2 uppercase">Monto</Typography>
            <View className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex-row items-center">
              <Typography className="text-ink-tertiary mr-2" weight="bold">{getCurrencySymbol(selectedCurrency?.symbol || selectedCurrency?.code)}</Typography>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor="#475569"
                className="text-white font-semibold text-base flex-1"
              />
            </View>
          </View>
        </View>

        <View className="mb-6">
          <Typography variant="label" weight="bold" className="text-white/40 mb-2 uppercase">Categoría</Typography>
          <TouchableOpacity
            onPress={() => setShowCategorySelect(true)}
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons
                name={(categories.find(c => c.id === selectedCategoryId)?.icon || 'grid-outline') as any}
                size={20}
                color="#465fff"
                className="mr-3"
              />
              <Typography className="text-white font-semibold">
                {categories.find(c => c.id === selectedCategoryId)?.name || 'Seleccionar...'}
              </Typography>
            </View>
            <Ionicons name="chevron-down" size={18} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowCreateCategoryModal(true)}
            className="mt-3 flex-row items-center self-end px-4 py-2 bg-white/5 rounded-full border border-dashed border-white/20"
          >
            <Ionicons name="add" size={14} color="#64748b" className="mr-1" />
            <Typography variant="caption" weight="bold" className="text-ink-tertiary">Nueva</Typography>
          </TouchableOpacity>
        </View>

        <View className="mb-10">
          <Typography variant="label" weight="bold" className="text-white/40 mb-2 uppercase">Cuenta de Pago ({selectedCurrency?.code})</Typography>
          <TouchableOpacity
            onPress={() => setShowAccountSelect(true)}
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons name="wallet-outline" size={20} color="#10b981" className="mr-3" />
              <Typography className="text-white font-semibold">
                {selectedAccount?.name || 'Seleccionar...'}
              </Typography>
            </View>
            <Ionicons name="chevron-down" size={18} color="#475569" />
          </TouchableOpacity>
          {filteredAccounts.length === 0 && (
            <Typography variant="caption" className="text-rose-400 mt-2">
              No tienes cuentas en {selectedCurrency?.code}. Debes crear una primero.
            </Typography>
          )}
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading || (filteredAccounts.length === 0)}
          className={`py-5 rounded-2xl items-center flex-row justify-center ${filteredAccounts.length === 0 ? 'bg-gray-800' : 'bg-brand-500'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="white" className="mr-2" />
              <Typography weight="bold" className="text-white ml-2">Guardar Plantilla</Typography>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onClose}
          className="mt-4 py-4 items-center"
        >
          <Typography weight="bold" className="text-ink-tertiary">Cancelar</Typography>
        </TouchableOpacity>
      </ScrollView>

      {/* Selectores Anidados */}
      <SelectModal
        isVisible={showCurrencySelect}
        onClose={() => setShowCurrencySelect(false)}
        title="Selecciona Moneda"
        options={currencies.map(c => ({ id: c.id, label: `${c.code} (${c.symbol})`, sublabel: c.name, icon: 'cash-outline' }))}
        selectedValue={selectedCurrencyId || undefined}
        onSelect={(opt) => handleCurrencySelect(opt.id as number)}
      />

      <SelectModal
        isVisible={showCategorySelect}
        onClose={() => setShowCategorySelect(false)}
        title="Selecciona Categoría"
        options={financeService.getHierarchicalCategories(categories, 'EX')}
        selectedValue={selectedCategoryId || undefined}
        onSelect={(opt) => setSelectedCategoryId(opt.id)}
        footerLabel="Gestionar Categorías"
        onFooterPress={() => {
          setShowCategorySelect(false);
          router.push('/category' as any);
        }}
      />

      <SelectModal
        isVisible={showAccountSelect}
        onClose={() => setShowAccountSelect(false)}
        title={`Cuentas en ${selectedCurrency?.code || ''}`}
        options={filteredAccounts.map(a => ({ id: a.id, label: a.name, sublabel: formatCurrencyWithSymbol(a.balance, a.currency_detail?.symbol), icon: 'wallet-outline' }))}
        selectedValue={selectedAccountId || undefined}
        onSelect={(opt) => setSelectedAccountId(opt.id)}
      />

      <CreateCategoryModal
        isVisible={showCreateCategoryModal}
        onClose={() => setShowCreateCategoryModal(false)}
        onSubmit={handleCreateCategory}
        type="EX"
      />
    </BaseBottomSheet>
  );
}
