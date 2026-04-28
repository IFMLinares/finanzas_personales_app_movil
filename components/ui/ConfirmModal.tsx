import React from 'react';
import { View, TouchableOpacity, ActivityIndicator, Modal, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import { BlurView } from 'expo-blur';

interface ConfirmModalProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    type?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
    isVisible,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    loading = false,
    type = 'danger'
}: ConfirmModalProps) {
    
    const getColor = () => {
        switch (type) {
            case 'danger': return '#f43f5e';
            case 'warning': return '#f59e0b';
            case 'info': return '#3b82f6';
            default: return '#8b5cf6';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'danger': return 'trash-outline';
            case 'warning': return 'alert-circle-outline';
            case 'info': return 'information-circle-outline';
            default: return 'checkmark-circle-outline';
        }
    };

    const color = getColor();
    const iconName = getIcon();

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable 
                className="flex-1 justify-center items-center px-6"
                onPress={onClose}
            >
                {/* Backdrop con Blur */}
                <BlurView 
                    intensity={20} 
                    tint="dark" 
                    style={StyleSheet.absoluteFill} 
                />
                <View className="absolute inset-0 bg-black/60" />

                {/* Card del Modal */}
                <Pressable 
                    className="w-full bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
                    onPress={(e) => e.stopPropagation()}
                >
                    <View className="p-8 items-center">
                        <View 
                            style={{ backgroundColor: `${color}15` }}
                            className="w-20 h-20 rounded-full items-center justify-center mb-6"
                        >
                            <Ionicons 
                                name={iconName as any} 
                                size={40} 
                                color={color} 
                            />
                        </View>

                        <Typography variant="h3" weight="bold" className="text-white text-center mb-2">
                            {title}
                        </Typography>
                        
                        <Typography className="text-ink-tertiary text-center mb-8 px-4 leading-5">
                            {description}
                        </Typography>

                        <View className="flex-row gap-3 w-full">
                            <TouchableOpacity 
                                onPress={onClose}
                                disabled={loading}
                                className="flex-1 bg-white/5 py-4 rounded-2xl items-center border border-white/5"
                            >
                                <Typography weight="semibold" className="text-white">
                                    {cancelText}
                                </Typography>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                onPress={onConfirm}
                                disabled={loading}
                                style={{ backgroundColor: color }}
                                className="flex-1 py-4 rounded-2xl items-center shadow-lg"
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Typography weight="bold" className="text-white">
                                        {confirmText}
                                    </Typography>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
