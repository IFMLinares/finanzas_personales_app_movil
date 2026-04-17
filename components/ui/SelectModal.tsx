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
          className="bg-gray-950 rounded-t-[40px] p-8 border-t border-white/5 max-h-[80%]"
          style={animatedStyle}
        >
          {/* Indicator */}
          <View className="w-12 h-0.5 bg-white/10 rounded-full self-center mb-8" />
          
          <Typography variant="h3" weight="bold" className="mb-8 text-white">
            {title}
          </Typography>
          
          <ScrollView showsVerticalScrollIndicator={false} className="gap-3">
            {options.map((option) => (
              <TouchableOpacity 
                key={option.id}
                onPress={() => { onSelect(option); handleClose(); }}
                className={`flex-row items-center p-5 rounded-3xl border ${
                  selectedValue === option.id 
                    ? 'bg-brand-500/10 border-brand-500' 
                    : 'bg-white/5 border-white/5'
                }`}
              >
                {option.icon && (
                  <View 
                    className="w-10 h-10 rounded-2xl justify-center items-center mr-4"
                    style={{ backgroundColor: option.color ? `${option.color}20` : 'rgba(255,255,255,0.05)' }}
                  >
                    <Ionicons 
                      name={option.icon as any} 
                      size={20} 
                      color={option.color || (selectedValue === option.id ? '#465fff' : '#94a3b8')} 
                    />
                  </View>
                )}
                <View className="flex-1">
                  <Typography 
                    variant="body"
                    weight={selectedValue === option.id ? "bold" : "semibold"} 
                    className={selectedValue === option.id ? 'text-brand-500' : 'text-white'}
                  >
                    {option.label}
                  </Typography>
                  {option.sublabel && (
                    <Typography variant="caption" className="text-ink-tertiary mt-0.5">
                      {option.sublabel}
                    </Typography>
                  )}
                </View>
                {selectedValue === option.id && (
                  <View className="w-5 h-5 rounded-full bg-brand-500 justify-center items-center">
                    <Ionicons name="checkmark" size={12} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity 
            onPress={handleClose}
            className="mt-8 py-4 bg-white/5 rounded-2xl items-center border border-white/5"
          >
            <Typography weight="bold" className="text-ink-secondary">Cancelar</Typography>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default SelectModal;
