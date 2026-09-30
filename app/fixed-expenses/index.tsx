import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { BackgroundAura } from '@/components/ui/BackgroundAura';
import { recurringPlanService } from '@/services/recurringPlanService';
import { recurringExpenseService } from '@/services/recurringExpenseService';
import { normalizeMonthly } from '@/utils/recurringMath';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { SelectModal } from '@/components/ui/SelectModal';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrencyWithSymbol } from '@/utils/formatters';

const FREQUENCY_LABELS: Record<string, string> = {
    daily: 'Diario',
    weekly: 'Semanal',
    monthly: 'Mensual',
    yearly: 'Anual',
};

type UnifiedItem = {
    key: string;
    kind: 'plan' | 'expense';
    id: number;
    name: string;
    monthly: number;
    symbol: string | undefined;
    isActive: boolean;
    badge: string;
    subtitle: string;
};

function formatDate(isoDate: string): string {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    if (!year || !month || !day) return isoDate;
    return `${day}/${month}/${year}`;
}

export default function FixedExpensesScreen() {
    const router = useRouter();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [deleteTarget, setDeleteTarget] = useState<{ kind: 'plan' | 'expense'; id: number } | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { data: plans, isLoading: loadingPlans, refetch: refetchPlans } = useQuery({
        queryKey: ['recurring-plans'],
        queryFn: () => recurringPlanService.getPlans()
    });

    const { data: expenses, isLoading: loadingExpenses, refetch: refetchExpenses } = useQuery({
        queryKey: ['recurring-expenses'],
        queryFn: () => recurringExpenseService.getExpenses()
    });

    const isLoading = loadingPlans || loadingExpenses;

    const toggleMutation = useMutation({
        mutationFn: async ({ kind, id, active }: { kind: 'plan' | 'expense'; id: number; active: boolean }): Promise<any> =>
            kind === 'plan'
                ? recurringPlanService.updatePlan(id, { is_active: active })
                : recurringExpenseService.updateExpense(id, { is_active: active }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: [variables.kind === 'plan' ? 'recurring-plans' : 'recurring-expenses'] });
            showToast({ message: 'Estado actualizado', type: 'success' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async ({ kind, id }: { kind: 'plan' | 'expense'; id: number }): Promise<any> =>
            kind === 'plan'
                ? recurringPlanService.deletePlan(id)
                : recurringExpenseService.deleteExpense(id),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: [variables.kind === 'plan' ? 'recurring-plans' : 'recurring-expenses'] });
            showToast({ message: 'Elemento eliminado', type: 'success' });
            setDeleteTarget(null);
        }
    });

    const safePlans = Array.isArray(plans) ? plans : [];
    const safeExpenses = Array.isArray(expenses) ? expenses : [];

    const planItems: UnifiedItem[] = safePlans.map(plan => {
        const activeDays = plan.schedules.filter(s => Number(s.amount) > 0).length;
        return {
            key: `plan-${plan.id}`,
            kind: 'plan' as const,
            id: plan.id!,
            name: plan.title,
            monthly: recurringPlanService.calculateMonthlyEstimate(plan.schedules),
            symbol: plan.account_detail?.currency_detail?.symbol,
            isActive: plan.is_active,
            badge: 'Semanal',
            subtitle: `${plan.category_detail?.name || 'Sin categoría'} • ${activeDays} días/semana`,
        };
    });

    const expenseItems: UnifiedItem[] = safeExpenses.map(expense => ({
        key: `expense-${expense.id}`,
        kind: 'expense' as const,
        id: expense.id!,
        name: expense.name,
        monthly: normalizeMonthly(expense.amount, expense.frequency),
        symbol: expense.currency_detail?.symbol || expense.account_detail?.currency_detail?.symbol,
        isActive: expense.is_active,
        badge: FREQUENCY_LABELS[expense.frequency] || expense.frequency,
        subtitle: `${expense.category_detail?.name || 'Sin categoría'} • Próx. ${formatDate(expense.next_execution_date)}`,
    }));

    const unifiedItems: UnifiedItem[] = [...planItems, ...expenseItems];

    const totalMonthly = unifiedItems.reduce((acc, item) => {
        if (!item.isActive) return acc;
        return acc + item.monthly;
    }, 0);

    const summarySymbol = unifiedItems.find(i => i.symbol)?.symbol || '$';

    const refetchAll = () => {
        refetchPlans();
        refetchExpenses();
    };

    const handleEdit = (item: UnifiedItem) => {
        if (item.kind === 'expense') {
            router.push(`/fixed-expenses/edit?type=recurring-expense&id=${item.id}`);
        } else {
            router.push(`/fixed-expenses/edit?id=${item.id}`);
        }
    };

    const handleCreateSelect = (option: { id: string | number }) => {
        setShowCreateModal(false);
        if (option.id === 'recurring-expense') {
            router.push('/fixed-expenses/edit?type=recurring-expense');
        } else {
            router.push('/fixed-expenses/edit');
        }
    };

    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        deleteMutation.mutate(deleteTarget);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-950">
            <BackgroundAura color="#8b5cf6" size={400} opacity={0.1} top={-100} right={-100} />

            <View className="px-6 py-6 flex-row items-center justify-between">
                <View>
                    <Typography variant="h2" weight="bold" className="text-white">Gastos Fijos</Typography>
                    <Typography variant="caption" className="text-ink-tertiary">Suscripciones y planes recurrentes</Typography>
                </View>
                <TouchableOpacity
                    onPress={() => setShowCreateModal(true)}
                    activeOpacity={0.7}
                >
                    <GlassCard className="p-2 border border-white/5 rounded-full">
                        <Ionicons name="add" size={24} color="#8b5cf6" />
                    </GlassCard>
                </TouchableOpacity>
            </View>

            {/* Resumen de impacto mensual */}
            <View className="px-6 mb-6">
                <GlassCard className="p-5 border border-purple-500/20 bg-purple-500/5">
                    <Typography variant="caption" className="text-purple-400 mb-1">Impacto Mensual Estimado</Typography>
                    <View className="flex-row items-baseline">
                        <Typography variant="h1" weight="bold" className="text-white">
                            {formatCurrencyWithSymbol(totalMonthly, summarySymbol)}
                        </Typography>
                        <Typography className="text-ink-tertiary ml-2">/ mes</Typography>
                    </View>
                </GlassCard>
            </View>

            <ScrollView
                className="flex-1 px-6"
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetchAll} tintColor="#8b5cf6" />}
            >
                {isLoading && unifiedItems.length === 0 && (
                    <View className="py-20 items-center">
                        <ActivityIndicator color="#8b5cf6" />
                    </View>
                )}

                {unifiedItems.map((item) => (
                    <GlassCard
                        key={item.key}
                        className={`p-4 mb-4 border border-white/5 ${!item.isActive ? 'opacity-60' : ''}`}
                    >
                        <View className="flex-row justify-between items-start">
                            <View className="flex-1">
                                <View className="flex-row items-center mb-1">
                                    <Typography weight="bold" className="text-white text-lg mr-2">{item.name}</Typography>
                                    <View className="bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                                        <Typography variant="caption" style={{ fontSize: 10 }} className="text-purple-400">{item.badge}</Typography>
                                    </View>
                                    {!item.isActive && (
                                        <View className="bg-gray-800 px-2 py-0.5 rounded-md ml-2">
                                            <Typography variant="caption" style={{ fontSize: 10 }} className="text-gray-400">Pausado</Typography>
                                        </View>
                                    )}
                                </View>
                                <Typography variant="caption" className="text-ink-tertiary mb-3">
                                    {item.subtitle}
                                </Typography>
                            </View>

                            <View className="flex-row space-x-2">
                                <TouchableOpacity
                                    onPress={() => toggleMutation.mutate({ kind: item.kind, id: item.id, active: !item.isActive })}
                                    className="w-8 h-8 rounded-full bg-white/5 items-center justify-center"
                                >
                                    <Ionicons
                                        name={item.isActive ? "pause" : "play"}
                                        size={16}
                                        color={item.isActive ? "#fbbf24" : "#10b981"}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleEdit(item)}
                                    className="w-8 h-8 rounded-full bg-white/5 items-center justify-center"
                                >
                                    <Ionicons name="pencil" size={16} color="#60a5fa" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setDeleteTarget({ kind: item.kind, id: item.id })}
                                    className="w-8 h-8 rounded-full bg-rose-500/10 items-center justify-center"
                                >
                                    <Ionicons name="trash" size={16} color="#f43f5e" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="flex-row justify-between items-center mt-2 pt-3 border-t border-white/5">
                            <Typography variant="caption" className="text-ink-tertiary">
                                {item.kind === 'plan' ? 'Plan semanal' : `Pago ${item.badge.toLowerCase()}`}
                            </Typography>
                            <Typography weight="bold" className="text-emerald-400">
                                +{formatCurrencyWithSymbol(item.monthly, item.symbol)} / mes
                            </Typography>
                        </View>
                    </GlassCard>
                ))}

                {unifiedItems.length === 0 && !isLoading && (
                    <View className="py-20 items-center">
                        <Ionicons name="calendar-outline" size={64} color="#1e293b" />
                        <Typography className="text-ink-tertiary text-center mt-4">
                            No tienes gastos fijos.{"\n"}¡Añade uno para automatizar tus finanzas!
                        </Typography>
                    </View>
                )}
            </ScrollView>

            <SelectModal
                isVisible={showCreateModal}
                title="Nuevo gasto fijo"
                options={[
                    { id: 'plan', label: 'Plan semanal', icon: 'calendar-outline', sublabel: 'Gasto recurrente por día de la semana' },
                    { id: 'recurring-expense', label: 'Suscripción', icon: 'repeat-outline', sublabel: 'Mensual, anual, semanal o diario' },
                ]}
                onSelect={handleCreateSelect}
                onClose={() => setShowCreateModal(false)}
            />

            <ConfirmModal
                isVisible={!!deleteTarget}
                title="Eliminar gasto fijo"
                description="¿Estás seguro de que deseas eliminar este elemento? Ya no se realizarán registros automáticos."
                type="danger"
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
            />
        </SafeAreaView>
    );
}
