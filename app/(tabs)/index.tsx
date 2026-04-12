import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { financeService, Transaction, DashboardResponse } from '@/services/financeService';
import { useAuth } from '@/contexts/AuthContext';

type CurrencyType = 'USD' | 'EUR' | 'USDT';

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>('USD');
  const { signOut } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashData, transactionsData] = await Promise.all([
        financeService.getDashboardSummary(),
        financeService.getRecentTransactions(),
      ]);
      setDashboardData(dashData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
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
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#465fff" />
        }
      >
        
        {/* Header Section */}
        <View className="flex-row justify-between items-center mt-4 mb-8">
          <View>
            <Typography variant="caption" className="text-gray-400">Panel de Control</Typography>
            <Typography variant="h2" weight="bold" className="text-white">Mis Finanzas</Typography>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity 
              onPress={signOut}
              className="w-11 h-11 rounded-full bg-gray-800 justify-center items-center border border-gray-700"
            >
              <Ionicons name="log-out-outline" size={22} color="#f04438" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Balance Card */}
        <View className="bg-brand-500 rounded-3xl p-6 shadow-xl mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Typography weight="semibold" className="opacity-80">Balance Total General</Typography>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
              <Ionicons name={showBalance ? "eye-outline" : "eye-off-outline"} size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row items-baseline">
            <Typography variant="balance" weight="bold">
              {showBalance ? `${currentSymbol}${formatCurrency(currentBalance)}` : '••••••'}
            </Typography>
            <Typography className="ml-2 text-white/70 text-lg font-[Outfit_600SemiBold] uppercase">
              {selectedCurrency}
            </Typography>
          </View>

          {/* Exchange Rate Info */}
          <View className="mt-2 flex-row items-center bg-black/10 self-start px-3 py-1 rounded-full">
            <Ionicons name="trending-up-outline" size={14} color="white" className="opacity-80" />
            <Typography variant="caption" className="ml-2 text-white/90">
              Tasa BCV: 1 USD = {bcvRate.toFixed(2)} VES
            </Typography>
          </View>

          <View className="flex-row mt-6 gap-4">
            <View className="flex-1 bg-white/10 p-3 rounded-2xl">
              <Typography variant="caption" className="text-white/70">Ingresos (Mes)</Typography>
              <View className="flex-row items-center">
                <Typography weight="semibold" className="text-white text-lg">
                  +{dashboardData?.monthly_stats?.income_usd?.toFixed(2) || "0.00"}
                </Typography>
                <Typography variant="caption" className="ml-1 text-white/50">USD</Typography>
              </View>
            </View>
            <View className="flex-1 bg-white/10 p-3 rounded-2xl">
              <Typography variant="caption" className="text-white/70">Gastos (Mes)</Typography>
              <View className="flex-row items-center">
                <Typography weight="semibold" className="text-white text-lg">
                  -{dashboardData?.monthly_stats?.expenses_usd?.toFixed(2) || "0.00"}
                </Typography>
                <Typography variant="caption" className="ml-1 text-white/50">USD</Typography>
              </View>
            </View>
          </View>
        </View>

        {/* Currency Switcher Chips */}
        <View className="flex-row gap-2 mb-8 justify-center">
          {(['USD', 'EUR', 'USDT'] as CurrencyType[]).map((cur) => (
            <TouchableOpacity
              key={cur}
              onPress={() => setSelectedCurrency(cur)}
              className={`px-6 py-2 rounded-full border ${selectedCurrency === cur ? 'bg-brand-500 border-brand-500' : 'bg-gray-800 border-gray-700'}`}
            >
              <Typography 
                weight={selectedCurrency === cur ? 'bold' : 'regular'}
                className={selectedCurrency === cur ? 'text-white' : 'text-gray-400'}
              >
                {cur}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="flex-row justify-between mb-8">
          {[
            { id: 'send', icon: 'send', label: 'Enviar' },
            { id: 'pay', icon: 'wallet', label: 'Pagar' },
            { id: 'topup', icon: 'add-circle', label: 'Recargar' },
            { id: 'more', icon: 'ellipsis-horizontal', label: 'Cuentas' },
          ].map(action => (
            <View key={action.id} className="items-center">
              <TouchableOpacity className="w-16 h-16 bg-gray-800 rounded-2xl justify-center items-center mb-2 border border-gray-700">
                <Ionicons name={action.icon as any} size={26} color="#465fff" />
              </TouchableOpacity>
              <Typography variant="caption" className="text-gray-400">{action.label}</Typography>
            </View>
          ))}
        </View>

        {/* Recent Transactions */}
        <View className="flex-row justify-between items-center mb-4">
          <Typography variant="h3" weight="semibold">Transacciones Recientes</Typography>
          <TouchableOpacity>
            <Typography className="text-brand-500" weight="semibold">Ver todo</Typography>
          </TouchableOpacity>
        </View>

        <View className="bg-gray-800 rounded-3xl p-4 border border-gray-700 mb-10">
          {transactions.length > 0 ? (
            transactions.map((tx, index) => (
              <TouchableOpacity 
                key={tx.id} 
                className={`flex-row items-center justify-between py-4 ${index !== transactions.length - 1 ? 'border-b border-gray-700' : ''}`}
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-12 h-12 bg-gray-900 rounded-2xl justify-center items-center">
                    <Ionicons name={(tx.display_icon || 'cash-outline') as any} size={22} color={tx.display_type === 'income' ? '#12b76a' : '#f04438'} />
                  </View>
                  <View className="flex-1">
                    <Typography weight="semibold" numberOfLines={1}>{tx.display_title || 'Sin descripción'}</Typography>
                    <Typography variant="caption" className="text-gray-500">{tx.date ? new Date(tx.date).toLocaleDateString() : '--'}</Typography>
                  </View>
                </View>
                <Typography 
                  weight="bold" 
                  className={tx.display_type === 'income' ? 'text-success-500' : 'text-white'}
                >
                  {tx.display_type === 'income' ? '+' : '-'}${parseFloat(tx.amount?.toString() || "0").toFixed(2)}
                </Typography>
              </TouchableOpacity>
            ))
          ) : (
            <View className="py-8 items-center">
              <Typography className="text-gray-500">No hay transacciones recientes</Typography>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
