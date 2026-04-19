import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import { BaseBottomSheet } from './BaseBottomSheet';

type CurrencyType = 'USD' | 'EUR' | 'USDT';

interface CurrencyBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  selectedCurrency: CurrencyType;
  onSelect: (currency: CurrencyType) => void;
}

export function CurrencyBottomSheet({ 
  isVisible, 
  onClose, 
  selectedCurrency,
  onSelect
}: CurrencyBottomSheetProps) {
  const currencies: { id: CurrencyType; name: string; icon: string; symbol: string }[] = [
    { id: 'USD', name: 'Dólares Estadounidenses', icon: 'logo-usd', symbol: '$' },
    { id: 'EUR', name: 'Euros', icon: 'logo-euro', symbol: '€' },
    { id: 'USDT', name: 'Tether (USDT)', icon: 'globe-outline', symbol: '₮' },
  ];

  return (
    <BaseBottomSheet
      isVisible={isVisible}
      onClose={onClose}
      title="Seleccionar Moneda"
      backgroundColor="bg-gray-900"
    >
      <View className="px-8 mb-4">
        <View className="gap-3">
          {currencies.map((item) => (
            <TouchableOpacity 
              key={item.id}
              onPress={() => { onSelect(item.id); onClose(); }}
              className={`flex-row items-center p-5 rounded-3xl border ${selectedCurrency === item.id ? 'bg-brand-500/10 border-brand-500' : 'bg-gray-800 border-gray-700'}`}
            >
              <View className={`w-12 h-12 rounded-2xl justify-center items-center mr-4 ${selectedCurrency === item.id ? 'bg-brand-500' : 'bg-gray-900'}`}>
                <Ionicons name={item.icon as any} size={24} color="white" />
              </View>
              <View className="flex-1">
                <Typography weight="semibold" className={selectedCurrency === item.id ? 'text-white' : 'text-gray-200'}>
                  {item.name}
                </Typography>
                <Typography variant="caption" className="text-gray-500">{item.id}</Typography>
              </View>
              {selectedCurrency === item.id && (
                <Ionicons name="checkmark-circle" size={24} color="#465fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          onPress={onClose}
          className="mt-8 py-4 bg-gray-800 rounded-2xl items-center mb-4"
        >
          <Typography weight="semibold" className="text-gray-400">Cancelar</Typography>
        </TouchableOpacity>
      </View>
    </BaseBottomSheet>
  );
}
