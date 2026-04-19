import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import { BaseBottomSheet } from './BaseBottomSheet';

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
  return (
    <BaseBottomSheet
      isVisible={isVisible}
      onClose={onClose}
      title="Acciones Rápidas"
      backgroundColor="bg-gray-900"
    >
      <View className="px-8 gap-4">
        <TouchableOpacity 
          onPress={() => { onNewMovement(); onClose(); }}
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
          onPress={() => { onNewTransfer(); onClose(); }}
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

        <TouchableOpacity 
          onPress={onClose}
          className="mt-4 py-4 bg-gray-800 rounded-2xl items-center mb-2"
        >
          <Typography weight="semibold" className="text-gray-400">Cancelar</Typography>
        </TouchableOpacity>
      </View>
    </BaseBottomSheet>
  );
}
