import React from 'react';
import { View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { BackgroundAura } from '@/components/ui/BackgroundAura';
import { budgetService, BudgetStatus } from '@/services/budgetService';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { CreateBudgetModal } from '@/components/ui/CreateBudgetModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useToast } from '@/contexts/ToastContext';

export default function BudgetsScreen() {
    const { showToast } = useToast();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { data: budgets, isLoading, isError, refetch } = useQuery({
        queryKey: ['budgets-status'],
        queryFn: () => budgetService.getBudgetStatus()
    });

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await budgetService.deleteBudget(deleteId);
            showToast({ message: 'Presupuesto eliminado', type: 'success' });
            await refetch();
            setDeleteId(null);
        } catch (error) {
            showToast({ message: 'Error al eliminar', type: 'error' });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-950">
            <BackgroundAura color="#8b5cf6" size={400} opacity={0.1} top={-100} right={-100} />
            
            <View className="px-6 py-6 flex-row items-center justify-between">
                <View>
                    <Typography variant="h2" weight="bold" className="text-white">Presupuestos</Typography>
                    <Typography variant="caption" className="text-ink-tertiary">Control mensual de gastos</Typography>
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

            <ScrollView 
                className="flex-1 px-6"
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#8b5cf6" />}
            >
                {isLoading && !budgets && (
                    <View className="items-center py-20">
                        <ActivityIndicator size="large" color="#8b5cf6" />
                        <Typography className="text-ink-tertiary mt-4">Cargando presupuestos...</Typography>
                    </View>
                )}

                {isError && (
                    <View className="items-center py-20">
                        <Ionicons name="alert-circle-outline" size={64} color="#f43f5e" />
                        <Typography className="text-rose-400 mt-4 text-center">Error al cargar los presupuestos</Typography>
                        <TouchableOpacity onPress={() => refetch()} className="mt-4 bg-purple-500/20 px-6 py-2 rounded-full border border-purple-500/30">
                            <Typography className="text-purple-400">Reintentar</Typography>
                        </TouchableOpacity>
                    </View>
                )}

                {!isLoading && !isError && budgets?.map((budget: BudgetStatus) => (
                    <GlassCard key={budget.budget_id} className="p-5 mb-4 border border-white/5">
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-xl bg-purple-500/10 items-center justify-center mr-3">
                                    <Ionicons name="apps" size={20} color="#a78bfa" />
                                </View>
                                <Typography weight="bold" className="text-white text-lg">{budget.category_name}</Typography>
                            </View>
                            <View className="flex-row items-center">
                                <View className="items-end mr-4">
                                    <Typography weight="bold" className={budget.is_over_budget ? "text-rose-400" : "text-emerald-400"}>
                                    ${Number(budget.spent || 0).toFixed(2)} / ${Number(budget.limit || 0).toFixed(2)}
                                    </Typography>
                                </View>
                                <TouchableOpacity onPress={() => setDeleteId(budget.budget_id)}>
                                    <Ionicons name="trash-outline" size={20} color="#f43f5e" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="h-2 w-full bg-gray-800 rounded-full overflow-hidden mb-2">
                            <View 
                                style={{ width: `${Math.min(Number(budget.percentage || 0), 100)}%` }} 
                                className={`h-full rounded-full ${budget.is_over_budget ? 'bg-rose-500' : 'bg-purple-500'}`}
                            />
                        </View>

                        <View className="flex-row justify-between">
                            <Typography variant="caption" className="text-ink-tertiary">
                                {Number(budget.percentage || 0).toFixed(0)}% consumido
                            </Typography>
                            <Typography variant="caption" className={budget.is_over_budget ? "text-rose-400" : "text-ink-tertiary"}>
                                {Number(budget.remaining) > 0 ? `Restan $${Number(budget.remaining).toFixed(2)}` : 'Límite excedido'}
                            </Typography>
                        </View>
                    </GlassCard>
                ))}

                {!isLoading && !isError && budgets?.length === 0 && (
                    <View className="items-center py-20">
                        <Ionicons name="bar-chart-outline" size={64} color="#334155" />
                        <Typography className="text-ink-tertiary mt-4 text-center">No tienes presupuestos activos.{"\n"}Crea uno para empezar a ahorrar.</Typography>
                    </View>
                )}
            </ScrollView>

            <CreateBudgetModal 
                isVisible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={refetch}
            />

            <ConfirmModal
                isVisible={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Eliminar Presupuesto"
                description="¿Estás seguro de que deseas eliminar este presupuesto? Esta acción no se puede deshacer."
                loading={deleting}
            />
        </SafeAreaView>
    );
}
