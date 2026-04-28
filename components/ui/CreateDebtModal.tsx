import React, { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import { BaseBottomSheet } from './BaseBottomSheet';
import { Input } from './Input';
import { debtService } from '@/services/debtService';
import { useToast } from '@/contexts/ToastContext';
import { useQueryClient } from '@tanstack/react-query';

interface CreateDebtModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateDebtModal({ isVisible, onClose, onSuccess }: CreateDebtModalProps) {
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        creditor: '',
        title: '',
        total_amount: '',
        installments_total: '1'
    });

    const handleSave = async () => {
        if (!form.creditor || !form.total_amount || !form.title) {
            showToast({ message: 'Por favor, completa los campos obligatorios', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            await debtService.createDebt({
                creditor: form.creditor,
                title: form.title,
                total_amount: parseFloat(form.total_amount),
                balance_remaining: parseFloat(form.total_amount),
                installments_total: parseInt(form.installments_total, 10),
                installments_paid: 0
            });
            showToast({ message: 'Deuda registrada con éxito', type: 'success' });
            await queryClient.invalidateQueries({ queryKey: ['debts'] });
            onSuccess();
            onClose();
            setForm({ creditor: '', title: '', total_amount: '', installments_total: '1' });
        } catch (error) {
            console.error(error);
            showToast({ message: 'Error al registrar la deuda', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseBottomSheet isVisible={isVisible} onClose={onClose} title="Nueva Deuda" maxHeight="90%">
            <ScrollView 
                className="px-6 pb-10"
                automaticallyAdjustKeyboardInsets={true}
                keyboardShouldPersistTaps="handled"
            >
                <View className="gap-6">
                    <Input
                        label="Acreedor"
                        placeholder="Ej: Cashea, Banco, Juan..."
                        value={form.creditor}
                        onChangeText={(val) => setForm(prev => ({ ...prev, creditor: val }))}
                    />

                    <Input
                        label="Concepto / Título"
                        placeholder="Ej: Compra de Celular, Préstamo..."
                        value={form.title}
                        onChangeText={(val) => setForm(prev => ({ ...prev, title: val }))}
                    />

                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Input
                                label="Monto Total ($)"
                                placeholder="0.00"
                                keyboardType="numeric"
                                value={form.total_amount}
                                onChangeText={(val) => setForm(prev => ({ ...prev, total_amount: val }))}
                            />
                        </View>
                        <View className="flex-1">
                            <Input
                                label="Nº de Cuotas"
                                placeholder="1"
                                keyboardType="numeric"
                                value={form.installments_total}
                                onChangeText={(val) => setForm(prev => ({ ...prev, installments_total: val }))}
                            />
                        </View>
                    </View>

                    <TouchableOpacity 
                        onPress={handleSave}
                        disabled={loading}
                        className="bg-rose-500 py-4 rounded-2xl items-center flex-row justify-center mt-4"
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="save-outline" size={20} color="white" className="mr-2" />
                                <Typography weight="bold" className="text-white ml-2">Registrar Deuda</Typography>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </BaseBottomSheet>
    );
}
