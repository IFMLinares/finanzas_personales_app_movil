import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { financeService, Transaction, BalanceSummary } from '@/services/financeService';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<BalanceSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const { signOut } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balanceData, transactionsData] = await Promise.all([
        financeService.getBalanceSummary(),
        financeService.getRecentTransactions(),
      ]);
      setBalance(balanceData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#465fff" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View className="flex-row justify-between items-center mt-4 mb-8">
          <View>
            <Typography variant="caption" className="text-gray-400">Bienvenido de nuevo,</Typography>
            <Typography variant="h2" weight="bold" className="text-white">Dashboard</Typography>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity 
              onPress={signOut}
              className="w-12 h-12 rounded-full bg-gray-800 justify-center items-center border border-gray-700"
            >
              <Ionicons name="log-out-outline" size={24} color="#f04438" />
            </TouchableOpacity>
            <TouchableOpacity className="w-12 h-12 rounded-full bg-gray-800 justify-center items-center border border-gray-700">
              <Ionicons name="notifications-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Balance Card */}
        <View className="bg-brand-500 rounded-3xl p-6 shadow-xl mb-8">
          <View className="flex-row justify-between items-center mb-2">
            <Typography weight="semibold" className="opacity-80">Balance Total</Typography>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
              <Ionicons name={showBalance ? "eye-outline" : "eye-off-outline"} size={20} color="white" />
            </TouchableOpacity>
          </View>
          <Typography variant="balance" weight="bold">
            {showBalance ? `$${balance?.totalBalance.toLocaleString()}` : '••••••'}
          </Typography>
          <View className="flex-row mt-6 gap-4">
            <View className="flex-1 bg-white/10 p-3 rounded-2xl">
              <Typography variant="caption" className="text-white/70">Ingresos</Typography>
              <Typography weight="semibold" className="text-white text-lg">
                +${balance?.monthlyIncome.toLocaleString()}
              </Typography>
            </View>
            <View className="flex-1 bg-white/10 p-3 rounded-2xl">
              <Typography variant="caption" className="text-white/70">Gastos</Typography>
              <Typography weight="semibold" className="text-white text-lg">
                -${balance?.monthlyExpenses.toLocaleString()}
              </Typography>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Typography variant="h3" weight="semibold" className="mb-4">Acciones Rápidas</Typography>
        <View className="flex-row justify-between mb-8">
          {[
            { id: 'send', icon: 'send', label: 'Enviar' },
            { id: 'pay', icon: 'wallet', label: 'Pagar' },
            { id: 'topup', icon: 'add-circle', label: 'Recargar' },
            { id: 'more', icon: 'ellipsis-horizontal', label: 'Más' },
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
          <Typography variant="h3" weight="semibold">Transacciones</Typography>
          <TouchableOpacity>
            <Typography className="text-brand-500" weight="semibold">Ver todo</Typography>
          </TouchableOpacity>
        </View>

        <View className="bg-gray-800 rounded-3xl p-4 border border-gray-700 mb-10">
          {transactions.map((tx, index) => (
            <TouchableOpacity 
              key={tx.id} 
              className={`flex-row items-center justify-between py-4 ${index !== transactions.length - 1 ? 'border-b border-gray-700' : ''}`}
            >
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 bg-gray-900 rounded-2xl justify-center items-center">
                  <Ionicons name={tx.icon as any} size={22} color={tx.type === 'income' ? '#12b76a' : '#f04438'} />
                </View>
                <View>
                  <Typography weight="semibold">{tx.title}</Typography>
                  <Typography variant="caption" className="text-gray-500">{tx.category} • {tx.date}</Typography>
                </View>
              </View>
              <Typography 
                weight="bold" 
                className={tx.type === 'income' ? 'text-success-500' : 'text-white'}
              >
                {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
