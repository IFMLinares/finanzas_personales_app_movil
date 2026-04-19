import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { Typography } from './Typography';
import { Ionicons } from '@expo/vector-icons';

interface ConfirmModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmModal({
  isVisible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
        <View className="flex-1 justify-center items-center px-4 bg-black/60">
          <View className="w-full max-w-sm bg-[#121622] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <View className="p-6 items-center">
              <View className={`w-14 h-14 rounded-full justify-center items-center mb-4 ${isDestructive ? 'bg-error-500/10' : 'bg-brand-500/10'}`}>
                <Ionicons 
                  name={isDestructive ? 'warning-outline' : 'help-circle-outline'} 
                  size={28} 
                  color={isDestructive ? '#f04438' : '#465fff'} 
                />
              </View>
              
              <Typography variant="h3" weight="bold" className="text-white text-center mb-2">
                {title}
              </Typography>
              
              <Typography variant="body" className="text-gray-400 text-center mb-6">
                {message}
              </Typography>

              <View className="flex-row gap-3 w-full">
                <TouchableOpacity
                  onPress={onCancel}
                  disabled={isLoading}
                  className="flex-1 h-12 bg-white/5 rounded-xl justify-center items-center border border-white/5"
                >
                  <Typography variant="button" weight="semibold" className="text-gray-300">
                    {cancelText}
                  </Typography>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 h-12 rounded-xl justify-center items-center ${isDestructive ? 'bg-error-500' : 'bg-brand-500'}`}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Typography variant="button" weight="bold" className="text-white">
                      {confirmText}
                    </Typography>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}
