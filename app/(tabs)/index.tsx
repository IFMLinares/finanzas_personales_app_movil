import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { financeService, Transaction, DashboardResponse } from '@/services/financeService';
import { useAuth } from '@/contexts/AuthContext';
import { FAB } from '@/components/ui/FAB';
import { GlassCard } from '@/components/ui/GlassCard';
import { LinearGradient } from 'expo-linear-gradient';

type CurrencyType = 'USD' | 'EUR' | 'USDT';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>('USD');
  const { signOut } = useAuth();

  // Queries con TanStack Query
  const {
    data: dashboardData,
    isLoading: loadingSummary,
    refetch: refetchSummary
  } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => financeService.getDashboardSummary(),
  });

  const {
    data: transactions = [],
    isLoading: loadingTransactions,
    refetch: refetchTransactions
  } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: () => financeService.getRecentTransactions(),
  });

  const {
    data: accounts = [],
    isLoading: loadingAccounts,
    refetch: refetchAccounts
  } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => financeService.getAccounts(),
  });

  const loading = loadingSummary || loadingTransactions || loadingAccounts;
  const refreshing = false; // Manejado por refetch

  const onRefresh = async () => {
    await Promise.all([
      refetchSummary(),
      refetchTransactions(),
      refetchAccounts(),
    ]);
  };

  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return "0.00";
    return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#465fff" />
      </View>
    );
  }

  const currentBalance = dashboardData?.balances ? dashboardData.balances[selectedCurrency] : 0;
  const currentSymbol = dashboardData?.currency_symbols ? dashboardData.currency_symbols[selectedCurrency] : '$';
  const bcvRate = dashboardData?.rates?.USD || 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#465fff" />
        }
      >

        {/* Header Section */}
        <View className="flex-row justify-between items-center mt-6 mb-10">
          <View>
            <Typography variant="h2" weight="bold" className="text-white">Panel Central</Typography>
            <Typography variant="caption" className="text-ink-tertiary">Resumen de liquidez global</Typography>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/calculator')}
              className="w-12 h-12 rounded-2xl bg-surface-elevated justify-center items-center border border-white/5"
            >
              <Ionicons name="calculator-outline" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={signOut}
              className="w-12 h-12 rounded-2xl bg-surface-elevated justify-center items-center border border-white/5"
            >
              <Ionicons name="log-out-outline" size={22} color="#f43f5e" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Balance Card (The Living Vault) */}
        <GlassCard intensity="high" className="mb-8 relative" style={{ minHeight: 220 }}>
          <LinearGradient
            colors={
              selectedCurrency === 'USDT' ? ['#14b8a620', '#14b8a605'] :
                selectedCurrency === 'EUR' ? ['#3b82f620', '#3b82f605'] :
                  ['#465fff20', '#465fff05']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="absolute inset-0"
          />

          <View className="p-6">
            <View className="flex-row justify-between items-center mb-8">
              <View className="flex-row items-center">
                <View
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: selectedCurrency === 'USDT' ? '#14b8a6' : selectedCurrency === 'EUR' ? '#3b82f6' : '#465fff' }}
                />
                <Typography variant="label" weight="bold" className="text-white/80">Saldo Total</Typography>
              </View>

              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={() => setShowCurrencyMenu(!showCurrencyMenu)}
                  className="bg-white/5 px-3 py-1.5 rounded-xl flex-row items-center border border-white/5"
                >
                  <Typography variant="label" weight="bold" className="text-white mr-1.5">{selectedCurrency}</Typography>
                  <Ionicons name="chevron-down" size={12} color="white" className="opacity-60" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowBalance(!showBalance)}
                  className="w-9 h-9 bg-white/5 rounded-xl justify-center items-center border border-white/5"
                >
                  <Ionicons name={showBalance ? "eye-outline" : "eye-off-outline"} size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {showCurrencyMenu && (
              <View className="absolute top-16 right-6 w-32 bg-surface-overlay rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden">
                {(['USD', 'EUR', 'USDT'] as CurrencyType[]).map((cur) => (
                  <TouchableOpacity
                    key={cur}
                    onPress={() => { setSelectedCurrency(cur); setShowCurrencyMenu(false); }}
                    className={`p-4 ${selectedCurrency === cur ? 'bg-white/5' : ''} border-b border-white/5`}
                  >
                    <Typography weight={selectedCurrency === cur ? 'bold' : 'regular'} className={selectedCurrency === cur ? 'text-white' : 'text-ink-tertiary'}>
                      {cur}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View className="flex-row items-baseline mb-6">
              <Typography variant="balance" weight="bold" className="text-white">
                {showBalance ? `${currentSymbol}${formatCurrency(currentBalance)}` : '••••••'}
              </Typography>
              <Typography variant="caption" weight="bold" className="ml-2 text-white/60">
                {selectedCurrency}
              </Typography>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                <Ionicons name="trending-up" size={14} color="#14b8a6" />
                <Typography variant="label" weight="bold" className="ml-2 text-white">
                  BCV: {bcvRate.toFixed(2)} VES
                </Typography>
              </View>

              <View className="flex-row gap-4">
                <View className="items-end">
                  <Typography variant="label" weight="bold" className="text-white/60 mb-1">MENSUAL</Typography>
                  <Typography weight="bold" className="text-emerald-500 text-lg">
                    +${formatCurrency(dashboardData?.monthly_stats?.income_usd || 0)}
                  </Typography>
                </View>
              </View>
            </View>
          </View>
        </GlassCard>


        {/* Mis Cuentas Section */}
        <View className="mb-10">
          <View className="flex-row justify-between items-end mb-6">
            <View>
              {/* <Typography variant="label" weight="bold" className="mb-1"></Typography> */}
              <Typography variant="h3" weight="bold">Cuentas</Typography>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/accounts')}
              className="bg-surface-elevated px-4 py-2 rounded-xl border border-white/5"
            >
              <Typography className="text-ink-secondary" variant="caption" weight="bold">Ver todas</Typography>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
            contentContainerStyle={{ gap: 16 }}
          >
            {accounts.length > 0 ? (
              accounts.map((acc) => (
                <GlassCard
                  key={acc.id}
                  className="w-64 p-5 relative overflow-hidden"
                  intensity="medium"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  <LinearGradient
                    colors={[
                      acc.currency_detail?.code === 'USDT' ? '#14b8a610' :
                        acc.currency_detail?.code === 'EUR' ? '#3b82f610' :
                          acc.currency_detail?.code === 'VES' ? '#f59e0b10' : '#465fff10',
                      'transparent'
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.5, y: 0.5 }}
                    className="absolute inset-0"
                  />
                  <View className="flex-row items-center justify-between mb-6">
                    <View className="w-12 h-12 rounded-2xl bg-white/5 justify-center items-center border border-white/5 overflow-hidden">
                      {acc.display_icon ? (
                        <Image source={{ uri: acc.display_icon }} className="w-full h-full" resizeMode="cover" />
                      ) : (
                        <Typography className="text-2xl">
                          {acc.currency_detail?.code === 'VES' ? '🇻🇪' :
                            acc.currency_detail?.code === 'EUR' ? '🇪🇺' :
                              acc.currency_detail?.code === 'USDT' ? '🌐' : '🇺🇸'}
                        </Typography>
                      )}
                    </View>
                    <View className="bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                      <Typography variant="label" className="text-emerald-500 text-[8px]" weight="bold">Activa</Typography>
                    </View>
                  </View>

                  <View className="mb-6">
                    <Typography variant="caption" className="text-ink-tertiary mb-1">{acc.name}</Typography>
                    <Typography variant="h3" weight="bold" numberOfLines={1}>
                      {acc.currency_detail?.symbol} {formatCurrency(typeof acc.balance === 'string' ? parseFloat(acc.balance) : acc.balance)}
                    </Typography>
                  </View>

                  <TouchableOpacity
                    onPress={() => router.push(`/accounts/${acc.id}`)}
                    className="flex-row items-center self-start"
                  >
                    <Typography variant="label" className="text-ink-tertiary mr-1" weight="semibold">Ver detalles</Typography>
                    <Ionicons name="arrow-forward" size={12} color="#64748b" />
                  </TouchableOpacity>
                </GlassCard>
              ))
            ) : (
              <TouchableOpacity
                onPress={() => router.push('/accounts/create')}
                className="w-64 h-40 bg-white/5 rounded-3xl border border-dashed border-white/10 justify-center items-center"
              >
                <Ionicons name="add-circle-outline" size={32} color="#465fff" className="mb-2" />
                <Typography variant="caption" className="text-ink-tertiary">Vincular cuenta</Typography>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Recent Transactions */}
        <View className="flex-row justify-between items-end mb-6">
          <View>
            <Typography variant="label" weight="bold" className="mb-1">Historial</Typography>
            <Typography variant="h3" weight="bold">Actividad Reciente</Typography>
          </View>
          <TouchableOpacity>
            <Typography className="text-ink-tertiary" weight="bold" variant="caption">Ver todo</Typography>
          </TouchableOpacity>
        </View>

        <GlassCard intensity="medium" className="mb-10 relative overflow-hidden">
          <LinearGradient
            colors={['rgba(255,255,255,0.05)', 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.3 }}
            className="absolute inset-0"
          />
          <View className="p-4">
            {transactions.length > 0 ? (
              transactions.map((tx, index) => (
                <TouchableOpacity
                  key={tx.id}
                  className={`flex-row items-center py-4 ${index !== transactions.length - 1 ? 'border-b border-white/5' : ''}`}
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 bg-white/5 rounded-2xl justify-center items-center border border-white/5">
                      <Ionicons
                        name={(tx.display_icon || 'cash-outline') as any}
                        size={20}
                        color={tx.display_type === 'income' ? '#10b981' : '#f43f5e'}
                      />
                    </View>
                    <View className="flex-1 ml-4 mr-3">
                      <Typography weight="bold" numberOfLines={1} className="text-white mb-0.5">{tx.display_title || 'Sin descripción'}</Typography>
                      <Typography variant="label" className="text-ink-muted lowercase">{tx.date ? new Date(tx.date).toLocaleDateString() : '--'}</Typography>
                    </View>
                  </View>
                  <View className="items-end">
                    <Typography
                      weight="bold"
                      className={tx.display_type === 'income' ? 'text-emerald-500' : 'text-white'}
                    >
                      {tx.display_type === 'income' ? '+' : '-'}${parseFloat(tx.amount?.toString() || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="py-12 items-center">
                <Typography className="text-ink-muted">Sin movimientos registrados</Typography>
              </View>
            )}
          </View>
        </GlassCard>

        {/* Spacer for bottom Padding */}
        <View className="h-20" />
      </ScrollView>

      {/* Instant FAB Menu (Popup Estilo Select) */}
      {showFabMenu && (
        <View className="absolute bottom-24 right-8 w-48 bg-gray-900 rounded-3xl border border-gray-700 shadow-2xl overflow-hidden z-50">
          <TouchableOpacity
            onPress={() => { router.push('/transaction/new'); setShowFabMenu(false); }}
            className="flex-row items-center p-4 border-b border-gray-800"
          >
            <View className="w-8 h-8 bg-success-500/10 rounded-lg justify-center items-center mr-3">
              <Ionicons name="add-circle-outline" size={18} color="#12b76a" />
            </View>
            <Typography weight="semibold" className="text-gray-200">Movimiento</Typography>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { router.push('/transaction/new?type=TR'); setShowFabMenu(false); }}
            className="flex-row items-center p-4"
          >
            <View className="w-8 h-8 bg-brand-500/10 rounded-lg justify-center items-center mr-3">
              <Ionicons name="repeat-outline" size={18} color="#465fff" />
            </View>
            <Typography weight="semibold" className="text-gray-200">Transferencia</Typography>
          </TouchableOpacity>
        </View>
      )}

      {/* Action Components: Green Neon FAB */}
      {/* We can keep it or depend on the Layout FAB. Keeping it here since it was here originally */}
      <FAB
        onPress={() => setShowFabMenu(!showFabMenu)}
        backgroundColor="#14b8a6"
        iconColor="#000"
        iconName={showFabMenu ? "close" : "add"}
      />
    </SafeAreaView>
  );
}
