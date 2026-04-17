import React, { useEffect } from 'react';
import { View, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';

interface Option {
  id: string | number;
  label: string;
  sublabel?: string;
  icon?: string;
  color?: string;
}

interface SelectModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (option: Option) => void;
  title: string;
  options: Option[];
  selectedValue?: string | number;
  footerLabel?: string;
  onFooterPress?: () => void;
}

export function SelectModal({ 
  isVisible, 
  onClose, 
  onSelect, 
  title, 
  options,
  selectedValue,
  footerLabel,
  onFooterPress
}: SelectModalProps) {
  const translateY = useSharedValue(500);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withTiming(0, { duration: 250 });
    } else {
      translateY.value = withTiming(500, { duration: 200 });
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
          className="bg-gray-900 rounded-t-[40px] p-8 border-t border-gray-800 max-h-[80%]"
          style={animatedStyle}
        >
          {/* Indicator */}
          <View className="w-12 h-1 bg-gray-700 rounded-full self-center mb-8" />
          
          <Typography variant="h3" weight="bold" className="mb-6">{title}</Typography>
          
          <ScrollView showsVerticalScrollIndicator={false} className="gap-2">
            {options.map((option) => (
              <TouchableOpacity 
                key={option.id}
                onPress={() => { onSelect(option); handleClose(); }}
                className={`flex-row items-center p-5 rounded-3xl border ${selectedValue === option.id ? 'bg-brand-500/10 border-brand-500' : 'bg-gray-800 border-gray-700'}`}
              >
                {option.icon && (
                  <View 
                    className="w-10 h-10 rounded-2xl justify-center items-center mr-4"
                    style={{ backgroundColor: option.color ? `${option.color}20` : '#465fff20' }}
                  >
                    <Ionicons name={option.icon as any} size={20} color={option.color || '#465fff'} />
                  </View>
                )}
                <View className="flex-1">
                  <Typography weight={selectedValue === option.id ? "bold" : "semibold"} className={selectedValue === option.id ? 'text-brand-500' : 'text-white'}>
                    {option.label}
                  </Typography>
                  {option.sublabel && (
                    <Typography variant="caption" className="text-gray-400">{option.sublabel}</Typography>
                  )}
                </View>
                {selectedValue === option.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#465fff" />
                )}
              </TouchableOpacity>
            ))}

            {footerLabel && onFooterPress && (
              <TouchableOpacity 
                onPress={() => { handleClose(); onFooterPress(); }}
                className="flex-row items-center p-5 rounded-3xl border border-dashed border-gray-700 mt-2"
              >
                <View className="w-10 h-10 rounded-2xl bg-gray-800 justify-center items-center mr-4">
                  <Ionicons name="add" size={20} color="#667085" />
                </View>
                <Typography weight="semibold" className="text-gray-400">{footerLabel}</Typography>
              </TouchableOpacity>
            )}
          </ScrollView>

          <TouchableOpacity 
            onPress={handleClose}
            className="mt-6 py-4 bg-gray-800 rounded-2xl items-center"
          >
            <Typography weight="semibold" className="text-gray-400">Cancelar</Typography>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default SelectModal;
