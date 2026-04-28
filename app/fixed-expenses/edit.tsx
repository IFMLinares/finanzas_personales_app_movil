import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Typography } from '@/components/ui/Typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { SelectModal } from '@/components/ui/SelectModal';
import { WeeklyScheduleSelector } from '@/components/ui/WeeklyScheduleSelector';
import { recurringPlanService, RecurringPlan } from '@/services/recurringPlanService';
import { financeService } from '@/services/financeService';
import { useToast } from '@/contexts/ToastContext';
import { BackgroundAura } from '@/components/ui/BackgroundAura';
import { formatCurrencyWithSymbol, getCurrencySymbol } from '@/utils/formatters';

const INITIAL_SCHEDULE = [
    { day_of_week: 0, amount: '0', active: false },
    { day_of_week: 1, amount: '0', active: false },
    { day_of_week: 2, amount: '0', active: false },
    { day_of_week: 3, amount: '0', active: false },
    { day_of_week: 4, amount: '0', active: false },
    { day_of_week: 5, amount: '0', active: false },
    { day_of_week: 6, amount: '0', active: false },
];

export default function EditFixedExpenseScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const isEditing = !!id;
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const [title, setTitle] = useState('');
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
    const [isActive, setIsActive] = useState(true);

    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    // Queries
    const { data: accounts = [] } = useQuery({
        queryKey: ['accounts'],
        queryFn: () => financeService.getAccounts(),
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => financeService.getCategories(),
    });

    const { data: plan, isLoading: loadingPlan } = useQuery({
        queryKey: ['recurring-plan', id],
        queryFn: () => recurringPlanService.getPlans().then(plans => plans.find(p => p.id === Number(id))),
        enabled: isEditing
    });

    useEffect(() => {
        if (isEditing && plan) {
            setTitle(plan.title);
            setIsActive(plan.is_active);
            setSelectedAccount(plan.account_detail);
            if (plan.category_detail) {
                setSelectedCategory({
                    id: plan.category_detail.id,
                    label: plan.category_detail.name,
                    icon: plan.category_detail.icon || 'bookmark-outline'
                });
            }
            
            const newSchedule = INITIAL_SCHEDULE.map(item => {
                const dayPlan = plan.schedules.find(s => s.day_of_week === item.day_of_week);
                if (dayPlan) {
                    return { ...item, amount: dayPlan.amount.toString(), active: Number(dayPlan.amount) > 0 };
                }
                return item;
            });
            setSchedule(newSchedule);
        }
    }, [isEditing, plan]);

    const mutation = useMutation({
        mutationFn: (data: RecurringPlan) => isEditing 
            ? recurringPlanService.updatePlan(Number(id), data)
            : recurringPlanService.createPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-plans'] });
            showToast({ message: isEditing ? 'Plan actualizado' : 'Plan creado con éxito', type: 'success' });
            router.back();
        },
        onError: (error: any) => {
            showToast({ message: 'Error al guardar el plan', type: 'error' });
        }
    });

    const handleSave = () => {
        if (!title.trim()) {
            showToast({ message: 'El título es obligatorio', type: 'info' });
            return;
        }
        if (!selectedAccount) {
            showToast({ message: 'Selecciona una cuenta de origen', type: 'info' });
            return;
        }

        const schedulesToSave = schedule
            .filter(s => s.active && Number(s.amount) > 0)
            .map(s => ({ day_of_week: s.day_of_week, amount: Number(s.amount) }));

        if (schedulesToSave.length === 0) {
            showToast({ message: 'Configura al menos un día de gasto', type: 'info' });
            return;
        }

        const data: any = {
            title,
            account: selectedAccount.id,
            category: selectedCategory?.id,
            is_active: isActive,
            schedules: schedulesToSave
        };

        mutation.mutate(data);
    };

    const monthlyEstimate = recurringPlanService.calculateMonthlyEstimate(
        schedule.filter(s => s.active).map(s => ({ day_of_week: s.day_of_week, amount: s.amount }))
    );

    if (isEditing && loadingPlan) {
        return (
            <View className="flex-1 bg-gray-950 items-center justify-center">
                <ActivityIndicator color="#8b5cf6" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-950">
            <BackgroundAura color="#8b5cf6" size={400} opacity={0.1} bottom={-100} left={-100} />
            
            <View className="px-6 py-4 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Typography variant="h2" weight="bold" className="text-white">
                    {isEditing ? 'Editar Plan' : 'Nuevo Plan Fijo'}
                </Typography>
            </View>

            <ScrollView className="flex-1 px-6">
                <View className="space-y-6 pb-20">
                    {/* Título del Plan */}
                    <View className="space-y-2">
                        <Typography variant="caption" className="text-ink-tertiary">Nombre del plan (ej. Pasaje Trabajo)</Typography>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Introduce un nombre..."
                            placeholderTextColor="#475569"
                            className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white text-lg"
                        />
                    </View>

                    {/* Cuenta y Categoría */}
                    <View className="flex-row space-x-4">
                        <TouchableOpacity 
                            onPress={() => setShowAccountModal(true)}
                            className="flex-1"
                        >
                            <Typography variant="caption" className="text-ink-tertiary mb-2">Cuenta</Typography>
                            <GlassCard className="p-4 border border-white/10 flex-row items-center justify-between">
                                <Typography className={selectedAccount ? 'text-white' : 'text-gray-500'}>
                                    {selectedAccount ? selectedAccount.name : 'Seleccionar'}
                                </Typography>
                                <Ionicons name="chevron-down" size={16} color="#64748b" />
                            </GlassCard>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={() => setShowCategoryModal(true)}
                            className="flex-1"
                        >
                            <Typography variant="caption" className="text-ink-tertiary mb-2">Categoría</Typography>
                            <GlassCard className="p-4 border border-white/10 flex-row items-center justify-between">
                                <Typography className={selectedCategory ? 'text-white' : 'text-gray-500'}>
                                    {selectedCategory ? selectedCategory.label : 'Seleccionar'}
                                </Typography>
                                <Ionicons name="chevron-down" size={16} color="#64748b" />
                            </GlassCard>
                        </TouchableOpacity>
                    </View>

                    {/* Selector Semanal */}
                    <View className="space-y-4">
                        <View className="flex-row justify-between items-center">
                            <Typography weight="bold" className="text-white text-lg">Horario Semanal</Typography>
                            <View className="bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                                <Typography variant="caption" weight="bold" className="text-purple-400">
                                    ~ {formatCurrencyWithSymbol(monthlyEstimate, selectedAccount?.currency_detail?.symbol)} / mes
                                </Typography>
                            </View>
                        </View>
                        
                        <WeeklyScheduleSelector 
                            value={schedule}
                            onChange={setSchedule}
                            accentColor={selectedAccount?.color || '#8b5cf6'}
                            currencySymbol={getCurrencySymbol(selectedAccount?.currency_detail?.symbol || selectedAccount?.currency_detail?.code)}
                        />
                    </View>

                    {/* Botón de Guardar */}
                    <TouchableOpacity 
                        onPress={handleSave}
                        disabled={mutation.isPending}
                        className={`mt-6 p-4 rounded-2xl items-center shadow-lg ${mutation.isPending ? 'bg-purple-500/50' : 'bg-purple-600'}`}
                    >
                        {mutation.isPending ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Typography weight="bold" className="text-white text-lg">
                                {isEditing ? 'Guardar Cambios' : 'Activar Plan'}
                            </Typography>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <SelectModal
                isVisible={showAccountModal}
                title="Seleccionar Cuenta"
                options={accounts.map((a: any) => ({ id: a.id, label: a.name, color: a.color }))}
                onSelect={(opt) => {
                    setSelectedAccount(accounts.find((a: any) => a.id === opt.id));
                    setShowAccountModal(false);
                }}
                onClose={() => setShowAccountModal(false)}
            />

            <SelectModal
                isVisible={showCategoryModal}
                title="Seleccionar Categoría"
                options={categories
                    .filter((c: any) => c.type === 'EX')
                    .map((c: any) => ({ id: c.id, label: c.name, icon: c.icon }))
                }
                onSelect={(opt) => {
                    setSelectedCategory(opt);
                    setShowCategoryModal(false);
                }}
                onClose={() => setShowCategoryModal(false)}
            />
        </SafeAreaView>
    );
}
