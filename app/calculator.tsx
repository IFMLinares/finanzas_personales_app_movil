import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, Clipboard, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Typography } from '@/components/ui/Typography';
import { CustomNumpad } from '@/components/ui/CustomNumpad';
import { financeService } from '@/services/financeService';
import { SelectModal } from '@/components/ui/SelectModal';

type RateSource = 'BCV' | 'PARALLEL' | 'MANUAL';
type OtherCurrency = 'USD' | 'EUR' | 'USDT';

export default function CalculatorScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('0');
  const [isFromVes, setIsFromVes] = useState(false); // Default: USD -> VES
  const [otherCurrency, setOtherCurrency] = useState<OtherCurrency>('USD');
  const [rateSource, setRateSource] = useState<RateSource>('BCV');
  const [manualRate, setManualRate] = useState('0');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // Obtener tasas reales
  const { data: summary } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => financeService.getDashboardSummary(),
  });

  const bcvRate = summary?.rates?.[otherCurrency] || 36.50;
  const parallelRate = bcvRate * 1.12; // Spread simulado si no hay paralelo explícito

  useEffect(() => {
    if (rateSource === 'BCV') setManualRate(bcvRate.toFixed(2));
    else if (rateSource === 'PARALLEL') setManualRate(parallelRate.toFixed(2));
  }, [rateSource, bcvRate, parallelRate]);

  const currentRate = parseFloat(manualRate || '1');
  const val = parseFloat(amount || '0');
  const result = isFromVes ? val / currentRate : val * currentRate;

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

  const copyToClipboard = () => {
    Clipboard.setString(result.toFixed(2));
    Alert.alert('Copiado', 'El resultado se ha copiado al portapapeles.');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Typography variant="h3" weight="bold" className="text-white">Calculadora</Typography>
        <TouchableOpacity onPress={() => setAmount('0')}>
          <Typography variant="label" weight="bold" className="text-blue-500">LIMPIAR</Typography>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-10" showsVerticalScrollIndicator={false}>
        {/* The Conversion Bridge (PODS) */}
        <View className="flex-row items-center justify-between mb-8">
          {/* Source Pod */}
          <View className="flex-1 bg-white/5 border border-white/10 p-4 rounded-3xl h-32 justify-center items-center">
            <Typography variant="caption" className="text-gray-500 font-bold uppercase text-[9px] mb-1">MONEDA ORIGEN</Typography>
            <TouchableOpacity
              onPress={() => !isFromVes && setShowCurrencyModal(true)}
              className="flex-row items-center"
              disabled={isFromVes}
            >
              <Typography variant="h2" weight="bold" className="text-blue-400">
                {isFromVes ? 'Bs' : otherCurrency === 'USD' ? '$' : otherCurrency}
              </Typography>
              {!isFromVes && <Ionicons name="caret-down" size={12} color="#60a5fa" className="ml-1" />}
            </TouchableOpacity>
            <Typography variant="h2" weight="bold" className="text-white mt-1" numberOfLines={1}>{amount}</Typography>
          </View>

          {/* Swap Center */}
          <TouchableOpacity
            onPress={() => setIsFromVes(!isFromVes)}
            className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center -mx-3 z-10 border-4 border-gray-950"
          >
            <Ionicons name="swap-horizontal" size={18} color="white" />
          </TouchableOpacity>

          {/* Destination Pod */}
          <TouchableOpacity
            onLongPress={copyToClipboard}
            onPress={() => isFromVes && setShowCurrencyModal(true)}
            className="flex-1 bg-blue-500/10 border border-blue-500/20 p-4 rounded-3xl h-32 justify-center items-center"
          >
            {/* <Typography variant="caption" className="text-blue-500 font-bold uppercase text-[9px] mb-1">REALIZARÁ (RESULTADO)</Typography> */}
            <View className="flex-row items-center">
              <Typography variant="h2" weight="bold" className="text-white">
                {!isFromVes ? 'Bs' : otherCurrency === 'USD' ? '$' : otherCurrency}
              </Typography>
              {isFromVes && <Ionicons name="caret-down" size={12} color="#3b82f6" className="ml-1" />}
            </View>
            <Typography variant="h2" weight="bold" className="text-white mt-1" numberOfLines={1}>{result.toFixed(2)}</Typography>
            <Typography variant="caption" className="text-blue-300 text-[8px] mt-1 font-bold">MANTÉN PARA COPIAR</Typography>
          </TouchableOpacity>
        </View>

        {/* Rate Selector */}
        <View className="mb-8">
          <View className="flex-row bg-gray-900 p-1 rounded-2xl mb-4 border border-white/5">
            {(['BCV', 'PARALLEL', 'MANUAL'] as RateSource[]).map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setRateSource(s)}
                className={`flex-1 py-2 rounded-xl items-center ${rateSource === s ? 'bg-blue-500' : ''}`}
              >
                <Typography variant="label" weight="bold" className={rateSource === s ? 'text-white' : 'text-gray-500'} style={{ fontSize: 10 }}>
                  {s === 'BCV' ? 'OFICIAL' : s === 'PARALLEL' ? 'MONITOR' : 'MANUAL'}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rate Value Display/Input */}
          <View className="bg-white/5 border border-white/5 p-4 rounded-2xl flex-row items-center justify-between">
            <View>
              <Typography variant="caption" className="text-gray-500 font-bold uppercase text-[9px]">Tasa Aplicada</Typography>
              <View className="flex-row items-center mt-1">
                <Typography className="text-gray-500 mr-2 font-bold">1 {otherCurrency} =</Typography>
                <TextInput
                  value={manualRate}
                  onChangeText={setManualRate}
                  editable={rateSource === 'MANUAL'}
                  keyboardType="numeric"
                  className={`text-white text-xl font-bold p-0 ${rateSource === 'MANUAL' ? 'text-blue-400' : ''}`}
                  style={{ fontFamily: 'Outfit_700Bold' }}
                />
                <Typography className="text-gray-500 ml-2 font-bold">Bs</Typography>
              </View>
            </View>
            {rateSource === 'MANUAL' && (
              <View className="bg-blue-500/20 p-2 rounded-full">
                <Ionicons name="pencil" size={14} color="#3b82f6" />
              </View>
            )}
          </View>
        </View>

        {/* Keyboard Section */}
        <View className="-mx-2 mb-10 opacity-95">
          <CustomNumpad
            onPress={handleNumpadPress}
            onDelete={handleNumpadDelete}
            onClear={handleNumpadClear}
            onConfirm={copyToClipboard}
            confirmColor="#3b82f6"
          />
        </View>
      </ScrollView>

      {/* Currency Modal */}
      <SelectModal
        isVisible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        title="Seleccionar Divisa"
        options={[
          { id: 'USD', label: 'Dólar Estadounidense', sublabel: '$', icon: 'logo-usd' },
          { id: 'EUR', label: 'Euro (BCV)', sublabel: '€', icon: 'logo-euro' },
          { id: 'USDT', label: 'Tether (Binance)', sublabel: '₮', icon: 'shield-checkmark-outline' },
        ]}
        selectedValue={otherCurrency}
        onSelect={(opt) => {
          setOtherCurrency(opt.id as OtherCurrency);
          setShowCurrencyModal(false);
        }}
      />
    </SafeAreaView>
  );
}
