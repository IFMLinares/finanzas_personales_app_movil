import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { financeService, Transaction, DashboardResponse } from '@/services/financeService';
import { useAuth } from '@/contexts/AuthContext';
import { FAB } from '@/components/ui/FAB';
import { ActionBottomSheet } from '@/components/ui/ActionBottomSheet';

type CurrencyType = 'USD' | 'EUR' | 'USDT';

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
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

        {/* Main Balance Section: Patrimonio Total */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Typography variant="caption" className="text-gray-400">Patrimonio Total</Typography>
            <TouchableOpacity 
              onPress={() => setShowBalance(!showBalance)}
              className="bg-gray-800/50 p-2 rounded-full border border-gray-700"
            >
              <Ionicons name={showBalance ? "eye-outline" : "eye-off-outline"} size={18} color="#98a2b3" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row items-baseline mb-2">
            <Typography variant="balance" weight="bold" className="text-white text-5xl">
              {showBalance ? `${currentSymbol}${formatCurrency(currentBalance)}` : '••••••'}
            </Typography>
            <Typography className="ml-3 text-brand-500 text-xl font-[Outfit_600SemiBold] uppercase">
              {selectedCurrency}
            </Typography>
          </View>

          <View className="flex-row items-center">
            <View className="bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
              <Typography variant="label" className="text-brand-500 text-[10px]" weight="bold">Consolidado</Typography>
            </View>
            <Typography variant="caption" className="ml-3 text-gray-500 italic">
              Actualizado hace unos instantes
            </Typography>
          </View>
        </View>

        {/* New Summary Cards: Ingresos y Gastos */}
        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 bg-gray-800 rounded-[32px] p-5 border border-gray-700">
            <View className="w-10 h-10 bg-success-500/10 rounded-2xl justify-center items-center mb-3">
              <Ionicons name="arrow-down" size={20} color="#12b76a" />
            </View>
            <Typography variant="caption" className="text-gray-400 mb-1">Ingresos (Mes)</Typography>
            <Typography variant="h3" weight="bold" className="text-success-500">
              +${dashboardData?.monthly_stats?.income_usd?.toFixed(2) || "0.00"}
            </Typography>
          </View>

          <View className="flex-1 bg-gray-800 rounded-[32px] p-5 border border-gray-700">
            <View className="w-10 h-10 bg-error-500/10 rounded-2xl justify-center items-center mb-3">
              <Ionicons name="arrow-up" size={20} color="#f04438" />
            </View>
            <Typography variant="caption" className="text-gray-400 mb-1">Gastos (Mes)</Typography>
            <Typography variant="h3" weight="bold" className="text-white">
              -${dashboardData?.monthly_stats?.expenses_usd?.toFixed(2) || "0.00"}
            </Typography>
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

        {/* Mis Cuentas Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Typography variant="h3" weight="bold">Cuentas</Typography>
              <Typography variant="caption" className="text-gray-500">Distribución de saldos</Typography>
            </View>
            <TouchableOpacity className="bg-brand-500/10 px-4 py-2 rounded-2xl">
              <Typography className="text-brand-500" variant="caption" weight="bold">Gestionar</Typography>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="flex-row"
            contentContainerStyle={{ gap: 12 }}
          >
            {/* Account Card: Bolívares */}
            <View className="w-56 bg-gray-800 rounded-3xl p-5 border border-gray-700">
              <View className="flex-row items-center justify-between mb-4">
                <View className="w-10 h-10 rounded-full bg-gray-900 justify-center items-center mr-3 border border-gray-700">
                  <Typography className="text-xl">🇻🇪</Typography>
                </View>
                <View className="bg-success-500/20 px-2 py-1 rounded-lg">
                  <Typography variant="label" className="text-success-500 text-[8px]" weight="bold">Activa</Typography>
                </View>
              </View>
              
              <View className="mb-4">
                <Typography variant="caption" className="text-gray-500 mb-1">Bolívares</Typography>
                <Typography variant="h3" weight="bold">Bs 95.002,00</Typography>
              </View>

              <TouchableOpacity className="flex-row items-center">
                <Typography variant="caption" className="text-brand-500 mr-1" weight="semibold">Ver detalles</Typography>
                <Ionicons name="chevron-forward" size={14} color="#465fff" />
              </TouchableOpacity>
            </View>

            {/* Account Card: Dólares */}
            <View className="w-56 bg-gray-800 rounded-3xl p-5 border border-gray-700">
              <View className="flex-row items-center justify-between mb-4">
                <View className="w-10 h-10 rounded-full bg-gray-900 justify-center items-center mr-3 border border-gray-700">
                  <Typography className="text-xl">🇺🇸</Typography>
                </View>
                <View className="bg-gray-700/50 px-2 py-1 rounded-lg">
                  <Typography variant="label" className="text-gray-400 text-[8px]" weight="bold">Principal</Typography>
                </View>
              </View>
              
              <View className="mb-4">
                <Typography variant="caption" className="text-gray-500 mb-1">Dólares Cash</Typography>
                <Typography variant="h3" weight="bold">$ 0.00</Typography>
              </View>

              <TouchableOpacity className="flex-row items-center">
                <Typography variant="caption" className="text-brand-500 mr-1" weight="semibold">Ver detalles</Typography>
                <Ionicons name="chevron-forward" size={14} color="#465fff" />
              </TouchableOpacity>
            </View>
          </ScrollView>
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

      {/* Action Components */}
      <FAB onPress={() => setIsBottomSheetVisible(true)} />
      
      <ActionBottomSheet 
        isVisible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        onNewMovement={() => console.log('Nuevo movimiento')}
        onNewTransfer={() => console.log('Nueva transferencia')}
      />
    </SafeAreaView>
  );
}
