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

export default function DashboardV2Screen() {
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
              className="w-11 h-11 rounded-3xl bg-gray-800 justify-center items-center border border-gray-700"
            >
              <Ionicons name="log-out-outline" size={22} color="#f04438" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Balance Card (Blue Container as requested) */}
        <View className="bg-brand-500 rounded-3xl p-6 shadow-xl mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Typography weight="semibold" className="opacity-80">Balance Total General</Typography>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
              <Ionicons name={showBalance ? "eye-outline" : "eye-off-outline"} size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row items-baseline mb-4">
            <Typography variant="balance" weight="bold" className="text-4xl text-white">
              {showBalance ? `${currentSymbol}${formatCurrency(currentBalance)}` : '••••••'}
            </Typography>
            <Typography className="ml-2 text-white/70 text-lg font-[Outfit_600SemiBold] uppercase">
              {selectedCurrency}
            </Typography>
          </View>

          {/* Exchange Rate Pill inside card */}
          <View className="mb-6 flex-row items-center bg-black/10 self-start px-3 py-1 rounded-full">
            <Ionicons name="trending-up-outline" size={14} color="white" className="opacity-80" />
            <Typography variant="caption" className="ml-2 text-white/90">
              Tasa BCV: 1 USD = {bcvRate.toFixed(2)} VES
            </Typography>
          </View>

          {/* Integrated Income/Expense Stats inside the card */}
          <View className="flex-row gap-4">
            <View className="flex-1 bg-white/10 p-4 rounded-2xl">
              <Typography variant="caption" className="text-white/70">Ingresos (Mes)</Typography>
              <View className="flex-row items-center">
                <Typography weight="bold" className="text-white text-lg">
                  +{formatCurrency(dashboardData?.monthly_stats?.income_usd || 0)}
                </Typography>
                <Typography variant="label" className="ml-1 text-white/50 text-[10px]">USD</Typography>
              </View>
            </View>
            <View className="flex-1 bg-white/10 p-4 rounded-2xl">
              <Typography variant="caption" className="text-white/70">Gastos (Mes)</Typography>
              <View className="flex-row items-center">
                <Typography weight="bold" className="text-white text-lg">
                  -{formatCurrency(dashboardData?.monthly_stats?.expenses_usd || 0)}
                </Typography>
                <Typography variant="label" className="ml-1 text-white/50 text-[10px]">USD</Typography>
              </View>
            </View>
          </View>
        </View>

        {/* Currency Switcher Chips below card */}
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

        {/* Mis Saldos Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Typography variant="h3" weight="bold">Mis Saldos</Typography>
            <TouchableOpacity>
              <Typography className="text-gray-500" variant="caption">Ver todos</Typography>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="flex-row overflow-visible"
            contentContainerStyle={{ gap: 16 }}
          >
            {/* Account Card: Bolívares */}
            <View className="w-64 bg-gray-800 rounded-[32px] p-6 border border-gray-700">
               <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-gray-900 justify-center items-center mr-3 border border-gray-700">
                  <Typography className="text-xl">🇻🇪</Typography>
                </View>
                <Typography weight="semibold" className="text-gray-300">Bolívares</Typography>
              </View>
              
              <View className="mb-6">
                <Typography variant="h2" weight="bold">Bs</Typography>
                <Typography variant="balance" weight="bold">95.002,00</Typography>
                <Typography variant="caption" className="text-gray-500 mt-1">≈ $199.40</Typography>
              </View>

              <TouchableOpacity className="flex-row justify-between items-center pt-4 border-t border-white/5">
                <Typography variant="caption" weight="semibold" className="text-gray-400">Detalles</Typography>
                <Ionicons name="chevron-forward" size={16} color="#4b5563" />
              </TouchableOpacity>
            </View>

            {/* Account Card: Dólares */}
            <View className="w-64 bg-gray-800 rounded-[32px] p-6 border border-gray-700">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-gray-900 justify-center items-center mr-3 border border-gray-700">
                  <Typography className="text-xl">🇺🇸</Typography>
                </View>
                <Typography weight="semibold" className="text-gray-300">Dólares</Typography>
              </View>
              
              <View className="mb-6">
                <Typography variant="balance" weight="bold">$ 0.00</Typography>
                <Typography variant="caption" className="text-gray-500 mt-1">Saldo disponible</Typography>
              </View>

              <TouchableOpacity className="flex-row justify-between items-center pt-4 border-t border-white/5">
                <Typography variant="caption" weight="semibold" className="text-gray-400">Detalles</Typography>
                <Ionicons name="chevron-forward" size={16} color="#4b5563" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Spacer for bottom Padding */}
        <View className="h-20" />
      </ScrollView>

      {/* Action Components: Green Neon FAB for V2 */}
      <FAB 
        onPress={() => setIsBottomSheetVisible(true)} 
        backgroundColor="#a3e635"
        iconColor="#000"
      />
      
      <ActionBottomSheet 
        isVisible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        onNewMovement={() => console.log('Nuevo movimiento')}
        onNewTransfer={() => console.log('Nueva transferencia')}
      />
    </SafeAreaView>
  );
}
