import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { BackgroundAura } from '@/components/ui/BackgroundAura';
import { recurringPlanService, RecurringPlan } from '@/services/recurringPlanService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrencyWithSymbol } from '@/utils/formatters';

export default function FixedExpensesScreen() {
    const router = useRouter();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [planToDelete, setPlanToDelete] = useState<number | null>(null);

    const { data: plans, isLoading, refetch } = useQuery({
        queryKey: ['recurring-plans'],
        queryFn: () => recurringPlanService.getPlans()
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, active }: { id: number, active: boolean }) => 
            recurringPlanService.updatePlan(id, { is_active: active }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-plans'] });
            showToast({ message: 'Estado del plan actualizado', type: 'success' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => recurringPlanService.deletePlan(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-plans'] });
            showToast({ message: 'Plan eliminado', type: 'success' });
            setPlanToDelete(null);
        }
    });

    const safePlans = Array.isArray(plans) ? plans : [];

    const totalMonthlyEstimate = safePlans.reduce((acc, plan) => {
        if (!plan.is_active) return acc;
        return acc + recurringPlanService.calculateMonthlyEstimate(plan.schedules);
    }, 0);

    const summarySymbol = safePlans[0]?.account_detail?.currency_detail?.symbol || 'USD';

    return (
        <SafeAreaView className="flex-1 bg-gray-950">
            <BackgroundAura color="#8b5cf6" size={400} opacity={0.1} top={-100} right={-100} />
            
            <View className="px-6 py-6 flex-row items-center justify-between">
                <View>
                    <Typography variant="h2" weight="bold" className="text-white">Gastos Fijos</Typography>
                    <Typography variant="caption" className="text-ink-tertiary">Automatización semanal</Typography>
                </View>
                <TouchableOpacity 
                    onPress={() => router.push('/fixed-expenses/edit')}
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
                            {formatCurrencyWithSymbol(totalMonthlyEstimate, summarySymbol)}
                        </Typography>
                        <Typography className="text-ink-tertiary ml-2">/ mes</Typography>
                    </View>
                </GlassCard>
            </View>

            <ScrollView 
                className="flex-1 px-6"
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#8b5cf6" />}
            >
                {isLoading && safePlans.length === 0 && (
                    <View className="py-20 items-center">
                        <ActivityIndicator color="#8b5cf6" />
                    </View>
                )}

                {safePlans.map((plan) => {
                    const monthly = recurringPlanService.calculateMonthlyEstimate(plan.schedules);
                    const activeDays = plan.schedules.filter(s => Number(s.amount) > 0).length;

                    return (
                        <GlassCard key={plan.id} className={`p-4 mb-4 border border-white/5 ${!plan.is_active ? 'opacity-60' : ''}`}>
                            <View className="flex-row justify-between items-start">
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-1">
                                        <Typography weight="bold" className="text-white text-lg mr-2">{plan.title}</Typography>
                                        {!plan.is_active && (
                                            <View className="bg-gray-800 px-2 py-0.5 rounded-md">
                                                <Typography variant="caption" style={{ fontSize: 10 }} className="text-gray-400">Pausado</Typography>
                                            </View>
                                        )}
                                    </View>
                                    <Typography variant="caption" className="text-ink-tertiary mb-3">
                                        {plan.account_detail?.name} • {activeDays} días/semana
                                    </Typography>
                                </View>
                                
                                <View className="flex-row space-x-2">
                                    <TouchableOpacity 
                                        onPress={() => toggleMutation.mutate({ id: plan.id!, active: !plan.is_active })}
                                        className="w-8 h-8 rounded-full bg-white/5 items-center justify-center"
                                    >
                                        <Ionicons 
                                            name={plan.is_active ? "pause" : "play"} 
                                            size={16} 
                                            color={plan.is_active ? "#fbbf24" : "#10b981"} 
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => router.push(`/fixed-expenses/edit?id=${plan.id}`)}
                                        className="w-8 h-8 rounded-full bg-white/5 items-center justify-center"
                                    >
                                        <Ionicons name="pencil" size={16} color="#60a5fa" />
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => setPlanToDelete(plan.id!)}
                                        className="w-8 h-8 rounded-full bg-rose-500/10 items-center justify-center"
                                    >
                                        <Ionicons name="trash" size={16} color="#f43f5e" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="flex-row justify-between items-center mt-2 pt-3 border-t border-white/5">
                                <View className="flex-row space-x-1">
                                    {['L','M','M','J','V','S','D'].map((d, i) => {
                                        const isSet = plan.schedules.some(s => s.day_of_week === i && Number(s.amount) > 0);
                                        return (
                                            <View key={i} className={`w-6 h-6 rounded-md items-center justify-center ${isSet ? 'bg-purple-500/20' : 'bg-white/5'}`}>
                                                <Typography variant="caption" style={{ fontSize: 9 }} className={isSet ? 'text-purple-400' : 'text-gray-600'}>{d}</Typography>
                                            </View>
                                        );
                                    })}
                                </View>
                                <Typography weight="bold" className="text-emerald-400">
                                    +{formatCurrencyWithSymbol(monthly, plan.account_detail?.currency_detail?.symbol)} / mes
                                </Typography>
                            </View>
                        </GlassCard>
                    );
                })}

                {safePlans.length === 0 && !isLoading && (
                    <View className="py-20 items-center">
                        <Ionicons name="calendar-outline" size={64} color="#1e293b" />
                        <Typography className="text-ink-tertiary text-center mt-4">
                            No tienes planes de gasto fijos.{"\n"}¡Añade uno para automatizar tus finanzas!
                        </Typography>
                    </View>
                )}
            </ScrollView>

            <ConfirmModal
                isVisible={!!planToDelete}
                title="Eliminar Plan"
                description="¿Estás seguro de que deseas eliminar este plan? Ya no se realizarán registros automáticos."
                type="danger"
                onClose={() => setPlanToDelete(null)}
                onConfirm={() => deleteMutation.mutate(planToDelete!)}
            />
        </SafeAreaView>
    );
}
