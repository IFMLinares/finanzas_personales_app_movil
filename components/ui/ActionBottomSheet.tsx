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

interface ActionBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onNewMovement: () => void;
  onNewTransfer: () => void;
}

export function ActionBottomSheet({ 
  isVisible, 
  onClose, 
  onNewMovement, 
  onNewTransfer 
}: ActionBottomSheetProps) {
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
          
          <Typography variant="h3" weight="bold" className="mb-6">Acciones Rápidas</Typography>
          
          <View className="gap-4">
            <TouchableOpacity 
              onPress={() => { onNewMovement(); handleClose(); }}
              className="flex-row items-center bg-gray-800 p-5 rounded-3xl border border-gray-700"
            >
              <View className="w-12 h-12 bg-lime-400/10 rounded-2xl justify-center items-center mr-4">
                <Ionicons name="add-circle-outline" size={26} color="#a3e635" />
              </View>
              <View className="flex-1">
                <Typography weight="semibold">Nuevo movimiento</Typography>
                <Typography variant="caption" className="text-gray-400">Registrar ingreso o gasto</Typography>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#4b5563" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => { onNewTransfer(); handleClose(); }}
              className="flex-row items-center bg-gray-800 p-5 rounded-3xl border border-gray-700"
            >
              <View className="w-12 h-12 bg-brand-500/10 rounded-2xl justify-center items-center mr-4">
                <Ionicons name="repeat-outline" size={26} color="#465fff" />
              </View>
              <View className="flex-1">
                <Typography weight="semibold">Nueva transferencia</Typography>
                <Typography variant="caption" className="text-gray-400">Mover entre cuentas</Typography>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#4b5563" />
            </TouchableOpacity>
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
