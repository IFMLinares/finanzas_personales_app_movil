import React, { useEffect } from 'react';
import { View, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';

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
  const translateY = useSharedValue(500);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
    } else {
      translateY.value = withTiming(500, { duration: 300 });
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleClose = () => {
    translateY.value = withTiming(500, { duration: 250 }, () => {
      runOnJS(onClose)();
    });
  };

  const currencies: { id: CurrencyType; name: string; icon: string; symbol: string }[] = [
    { id: 'USD', name: 'Dólares Estadounidenses', icon: 'logo-usd', symbol: '$' },
    { id: 'EUR', name: 'Euros', icon: 'logo-euro', symbol: '€' },
    { id: 'USDT', name: 'Tether (USDT)', icon: 'globe-outline', symbol: '₮' },
  ];

  if (!isVisible && translateY.value === 500) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end">
        <Pressable 
          className="absolute inset-0 bg-black/60" 
          onPress={handleClose} 
        />
        <Animated.View 
          className="bg-gray-900 rounded-t-[40px] p-8 border-t border-gray-800"
          style={animatedStyle}
        >
          {/* Indicator */}
          <View className="w-12 h-1 bg-gray-700 rounded-full self-center mb-8" />
          
          <Typography variant="h3" weight="bold" className="mb-6">Seleccionar Moneda</Typography>
          
          <View className="gap-3">
            {currencies.map((item) => (
              <TouchableOpacity 
                key={item.id}
                onPress={() => { onSelect(item.id); handleClose(); }}
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
            onPress={handleClose}
            className="mt-8 py-4 bg-gray-800 rounded-2xl items-center"
          >
            <Typography weight="semibold" className="text-gray-400">Cancelar</Typography>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
