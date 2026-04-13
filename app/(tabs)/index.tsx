import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { financeService, Transaction, DashboardResponse } from '@/services/financeService';
import { useAuth } from '@/contexts/AuthContext';
import { FAB } from '@/components/ui/FAB';

type CurrencyType = 'USD' | 'EUR' | 'USDT';

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
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

        {/* Main Balance Card (Blue Container) */}
        <View className="bg-brand-500 rounded-3xl p-6 shadow-xl mb-4">
          <View className="flex-row justify-between items-center mb-6">
            <Typography weight="semibold" className="opacity-80">Patrimonio Total</Typography>
            <View className="flex-row items-center gap-3">
              {/* Selector de Moneda Estilo Select */}
              <View className="z-50">
                <TouchableOpacity 
                  onPress={() => setShowCurrencyMenu(!showCurrencyMenu)}
                  className="bg-white/10 px-4 py-2 rounded-2xl flex-row items-center border border-white/5"
                >
                  <Typography variant="label" weight="bold" className="text-white mr-2">{selectedCurrency}</Typography>
                  <Ionicons name={showCurrencyMenu ? "chevron-up" : "chevron-down"} size={14} color="white" />
                </TouchableOpacity>

                {showCurrencyMenu && (
                  <View 
                    className="absolute top-12 right-0 w-28 bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden"
                    style={{ zIndex: 1000 }}
                  >
                    {(['USD', 'EUR', 'USDT'] as CurrencyType[]).map((cur) => (
                      <TouchableOpacity 
                        key={cur}
                        onPress={() => {
                          setSelectedCurrency(cur);
                          setShowCurrencyMenu(false);
                        }}
                        className={`p-4 items-center ${selectedCurrency === cur ? 'bg-brand-500/10' : ''} border-b border-gray-800/50`}
                      >
                        <Typography 
                          weight={selectedCurrency === cur ? 'bold' : 'regular'}
                          className={selectedCurrency === cur ? 'text-brand-500' : 'text-gray-300'}
                        >
                          {cur}
                        </Typography>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              {/* Botón de Balance Visible */}
              <TouchableOpacity 
                onPress={() => setShowBalance(!showBalance)}
                className="w-10 h-10 bg-white/10 rounded-2xl justify-center items-center border border-white/5"
              >
                <Ionicons name={showBalance ? "eye-outline" : "eye-off-outline"} size={18} color="white" />
              </TouchableOpacity>
            </View>
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

        <View className="bg-gray-800 rounded-3xl p-4 border border-gray-700 mb-6">
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

        {/* Spacer for bottom Padding */}
        <View className="h-20" />
      </ScrollView>

      {/* Instant FAB Menu (Popup Estilo Select) */}
      {showFabMenu && (
        <View className="absolute bottom-24 right-8 w-48 bg-gray-900 rounded-3xl border border-gray-700 shadow-2xl overflow-hidden z-50">
          <TouchableOpacity 
            onPress={() => { console.log('Nuevo movimiento'); setShowFabMenu(false); }}
            className="flex-row items-center p-4 border-b border-gray-800"
          >
            <View className="w-8 h-8 bg-success-500/10 rounded-lg justify-center items-center mr-3">
              <Ionicons name="add-circle-outline" size={18} color="#12b76a" />
            </View>
            <Typography weight="semibold" className="text-gray-200">Movimiento</Typography>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => { console.log('Nueva transferencia'); setShowFabMenu(false); }}
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
      <FAB 
        onPress={() => setShowFabMenu(!showFabMenu)} 
        backgroundColor="#a3e635"
        iconColor="#000"
        iconName={showFabMenu ? "close" : "add"}
      />
    </SafeAreaView>
  );
}
