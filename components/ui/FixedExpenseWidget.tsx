import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Typography } from './Typography';
import { GlassCard } from './GlassCard';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { recurringPlanService } from '@/services/recurringPlanService';
import { financeService } from '@/services/financeService';
import { formatCurrencyWithSymbol } from '@/utils/formatters';

export const FixedExpenseWidget = () => {
    const router = useRouter();
    
    // Obtener planes
    const { data: plans = [] } = useQuery({
        queryKey: ['recurring-plans'],
        queryFn: () => recurringPlanService.getPlans()
    });

    // Obtener transacciones de hoy para verificar ejecución
    const { data: transactions = [] } = useQuery({
        queryKey: ['recentTransactions'],
        queryFn: () => financeService.getRecentTransactions()
    });

    const today = new Date();
    const jsDay = today.getDay();
    const modelDay = jsDay === 0 ? 6 : jsDay - 1;

    // Asegurar que plans sea un array antes de filtrar
    const safePlans = Array.isArray(plans) ? plans : [];

    // Filtrar planes que deberían correr hoy
    const plansForToday = safePlans.filter(plan => 
        plan.is_active && plan.schedules.some(s => s.day_of_week === modelDay && Number(s.amount) > 0)
    );

    if (plansForToday.length === 0) return null;

    const totalScheduledToday = plansForToday.reduce((acc, plan) => {
        const schedule = plan.schedules.find(s => s.day_of_week === modelDay);
        return acc + Number(schedule?.amount || 0);
    }, 0);

    // Obtener símbolo del primer plan para referencia
    const displaySymbol = plansForToday[0]?.account_detail?.currency_detail?.symbol || 'USD';

    // Verificar cuáles ya se registraron (buscando en transacciones de hoy con el prefijo)
    const registeredTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        const isToday = txDate.toDateString() === today.toDateString();
        return isToday && tx.display_title?.startsWith('Automático:');
    });

    const totalRegisteredToday = registeredTransactions.reduce((acc, tx) => acc + Number(tx.amount), 0);
    const isFullyProcessed = totalRegisteredToday >= totalScheduledToday && totalScheduledToday > 0;

    return (
        <TouchableOpacity 
            onPress={() => router.push('/fixed-expenses' as any)}
            activeOpacity={0.9}
            className="mb-8"
        >
            <GlassCard 
                className={`p-4 border ${isFullyProcessed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-purple-500/20 bg-purple-500/5'}`}
                intensity="low"
            >
                <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                        <View className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${isFullyProcessed ? 'bg-emerald-500/20' : 'bg-purple-500/20'}`}>
                            <Ionicons 
                                name={isFullyProcessed ? "shield-checkmark" : "calendar"} 
                                size={18} 
                                color={isFullyProcessed ? "#10b981" : "#a78bfa"} 
                            />
                        </View>
                        <View>
                            <Typography weight="bold" className="text-white text-sm">
                                {isFullyProcessed ? 'Gastos del día procesados' : 'Gastos fijos de hoy'}
                            </Typography>
                            <Typography variant="caption" className="text-ink-tertiary" style={{ fontSize: 10 }}>
                                {plansForToday.length} {plansForToday.length === 1 ? 'plan activo' : 'planes activos'}
                            </Typography>
                        </View>
                    </View>
                    <View className="items-end">
                        <Typography weight="bold" className={isFullyProcessed ? 'text-emerald-400' : 'text-white'}>
                            {formatCurrencyWithSymbol(totalRegisteredToday, displaySymbol)} / {formatCurrencyWithSymbol(totalScheduledToday, displaySymbol)}
                        </Typography>
                    </View>
                </View>

                {/* Progress Bar */}
                <View className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <View 
                        className={`h-full rounded-full ${isFullyProcessed ? 'bg-emerald-500' : 'bg-purple-500'}`}
                        style={{ width: `${totalScheduledToday > 0 ? Math.min((totalRegisteredToday / totalScheduledToday) * 100, 100) : 0}%` }}
                    />
                </View>
            </GlassCard>
        </TouchableOpacity>
    );
};
