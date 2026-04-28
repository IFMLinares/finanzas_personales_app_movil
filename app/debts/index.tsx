import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { BackgroundAura } from '@/components/ui/BackgroundAura';
import { debtService, Debt } from '@/services/debtService';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { CreateDebtModal } from '@/components/ui/CreateDebtModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';

export default function DebtsScreen() {
    const { showToast } = useToast();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { data: debts, isLoading, refetch } = useQuery({
        queryKey: ['debts'],
        queryFn: () => debtService.getDebts()
    });

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await debtService.deleteDebt(deleteId);
            showToast({ message: 'Deuda eliminada', type: 'success' });
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
            <BackgroundAura color="#f43f5e" size={400} opacity={0.1} top={-100} right={-100} />
            
            <View className="px-6 py-6 flex-row items-center justify-between">
                <View>
                    <Typography variant="h2" weight="bold" className="text-white">Deudas</Typography>
                    <Typography variant="caption" className="text-ink-tertiary">Control de cuotas y acreedores</Typography>
                </View>
                <TouchableOpacity 
                    onPress={() => setShowCreateModal(true)}
                    activeOpacity={0.7}
                >
                    <GlassCard className="p-2 border border-white/5 rounded-full">
                        <Ionicons name="add" size={24} color="#f43f5e" />
                    </GlassCard>
                </TouchableOpacity>
            </View>

            <ScrollView 
                className="flex-1 px-6"
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#f43f5e" />}
            >
                {Array.isArray(debts) && debts.map((debt: Debt) => {
                    const paidPercentage = (debt.installments_paid / debt.installments_total) * 100;
                    
                    return (
                        <GlassCard key={debt.id} className="p-5 mb-4 border border-white/5">
                            <View className="flex-row justify-between items-start mb-4">
                                <View className="flex-1">
                                    <View className="flex-row items-center">
                                        <Typography weight="bold" className="text-white text-lg">{debt.creditor}</Typography>
                                        {debt.creditor.toLowerCase().includes('cashea') && (
                                            <View className="ml-2 bg-brand-500/10 px-2 py-0.5 rounded-md">
                                                <Typography variant="caption" className="text-brand-400 font-bold">CASHEA</Typography>
                                            </View>
                                        )}
                                    </View>
                                    <Typography variant="caption" className="text-ink-tertiary">{debt.title}</Typography>
                                </View>
                                <View className="flex-row items-center">
                                    <Typography weight="bold" className="text-white text-lg mr-4">
                                        ${Number(debt.balance_remaining || 0).toFixed(2)}
                                    </Typography>
                                    <TouchableOpacity onPress={() => setDeleteId(debt.id)}>
                                        <Ionicons name="trash-outline" size={20} color="#f43f5e" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Barra de Deuda */}
                            <View className="h-2 w-full bg-gray-800 rounded-full overflow-hidden mb-3">
                                <View 
                                    style={{ width: `${paidPercentage}%` }} 
                                    className="h-full bg-rose-500 rounded-full"
                                />
                            </View>

                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center">
                                    <Ionicons name="time-outline" size={14} color="#94a3b8" />
                                    <Typography variant="caption" className="text-ink-tertiary ml-1">
                                        Prox: {debt.next_due_date || 'N/A'}
                                    </Typography>
                                </View>
                                <Typography variant="caption" weight="bold" className="text-white/60">
                                    Cuotas {debt.installments_paid}/{debt.installments_total}
                                </Typography>
                            </View>
                        </GlassCard>
                    );
                })}

                {Array.isArray(debts) && debts.length === 0 && (
                    <View className="items-center py-20">
                        <Ionicons name="calendar-outline" size={64} color="#334155" />
                        <Typography className="text-ink-tertiary mt-4 text-center">Sin deudas pendientes.{"\n"}¡Buen trabajo manteniendo tus cuentas claras!</Typography>
                    </View>
                )}
            </ScrollView>

            <CreateDebtModal 
                isVisible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={refetch}
            />

            <ConfirmModal
                isVisible={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Eliminar Deuda"
                description="¿Estás seguro de que deseas eliminar esta deuda? Esta acción no se puede deshacer."
                loading={deleting}
            />
        </SafeAreaView>
    );
}
