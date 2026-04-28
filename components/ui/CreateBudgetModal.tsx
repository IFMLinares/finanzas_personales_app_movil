import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import { BaseBottomSheet } from './BaseBottomSheet';
import { Input } from './Input';
import { SelectModal } from './SelectModal';
import { budgetService } from '@/services/budgetService';
import { financeService, Category } from '@/services/financeService';
import { useToast } from '@/contexts/ToastContext';
import { useQueryClient } from '@tanstack/react-query';

interface CreateBudgetModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateBudgetModal({ isVisible, onClose, onSuccess }: CreateBudgetModalProps) {
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showCategorySelect, setShowCategorySelect] = useState(false);
    
    const [form, setForm] = useState({
        category: null as number | null,
        categoryName: '',
        amount_limit: ''
    });

    useEffect(() => {
        if (isVisible) {
            loadCategories();
        }
    }, [isVisible]);

    const loadCategories = async () => {
        try {
            const data = await financeService.getCategories();
            // Filtrar solo categorías de gasto
            setCategories(data.filter(c => c.type === 'EX'));
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async () => {
        if (!form.category || !form.amount_limit) {
            showToast({ message: 'Por favor, completa los campos obligatorios', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            
            await budgetService.createBudget({
                category: form.category,
                amount_limit: parseFloat(form.amount_limit),
                start_date: firstDay.toISOString().split('T')[0],
                is_active: true
            });
            showToast({ message: 'Presupuesto creado con éxito', type: 'success' });
            await queryClient.invalidateQueries({ queryKey: ['budgets-status'] });
            onSuccess();
            onClose();
            setForm({ category: null, categoryName: '', amount_limit: '' });
        } catch (error) {
            console.error(error);
            showToast({ message: 'Error al crear el presupuesto', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseBottomSheet isVisible={isVisible} onClose={onClose} title="Nuevo Presupuesto" maxHeight="80%">
            <ScrollView 
                className="px-6 pb-10"
                automaticallyAdjustKeyboardInsets={true}
                keyboardShouldPersistTaps="handled"
            >
                <View className="gap-6">
                        <View>
                            <Typography variant="label" weight="bold" className="text-white/40 mb-2 uppercase">Categoría</Typography>
                            <TouchableOpacity 
                                onPress={() => setShowCategorySelect(true)}
                                className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 flex-row items-center justify-between"
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="apps-outline" size={20} color="#8b5cf6" className="mr-3" />
                                    <Typography className={form.category ? 'text-white' : 'text-gray-500'} weight="semibold">
                                        {form.categoryName || 'Seleccionar categoría...'}
                                    </Typography>
                                </View>
                                <Ionicons name="chevron-down" size={18} color="#475569" />
                            </TouchableOpacity>
                        </View>

                        <Input
                            label="Límite Mensual ($)"
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={form.amount_limit}
                            onChangeText={(val) => setForm(prev => ({ ...prev, amount_limit: val }))}
                        />

                        <Typography variant="caption" className="text-ink-tertiary">
                            El presupuesto se aplicará automáticamente a los gastos del mes en curso.
                        </Typography>

                        <TouchableOpacity 
                            onPress={handleSave}
                            disabled={loading}
                            className="bg-brand-500 py-4 rounded-2xl items-center flex-row justify-center mt-4"
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Ionicons name="save-outline" size={20} color="white" className="mr-2" />
                                    <Typography weight="bold" className="text-white ml-2">Guardar Presupuesto</Typography>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            <SelectModal
                isVisible={showCategorySelect}
                onClose={() => setShowCategorySelect(false)}
                title="Selecciona Categoría"
                options={financeService.getHierarchicalCategories(categories, 'EX')}
                selectedValue={form.category || undefined}
                onSelect={(opt) => setForm(prev => ({ ...prev, category: opt.id as number, categoryName: opt.label }))}
            />
        </BaseBottomSheet>
    );
}
