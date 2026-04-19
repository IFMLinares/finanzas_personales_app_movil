import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { financeService, Account } from '@/services/financeService';
import { formatCurrency } from '@/utils/formatters';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';

export default function AccountsListScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      const data = await financeService.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleReorder = async (newData: Account[]) => {
    setAccounts(newData);
    const ids = newData.map(acc => acc.id);
    await financeService.reorderAccounts(ids);
  };



  const renderItem = ({ item, drag, isActive }: RenderItemParams<Account>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          onPress={() => router.push(`/accounts/${item.id}`)}
          className="mb-4"
        >
          <GlassCard
            intensity={isActive ? "high" : "medium"}
            className={`p-4 flex-row items-center border relative overflow-hidden ${isActive ? 'border-brand-500' : 'border-white/10'}`}
          >
            <LinearGradient
              colors={[
                item.currency_detail?.code === 'USDT' ? '#14b8a610' :
                  item.currency_detail?.code === 'EUR' ? '#3b82f610' :
                    item.currency_detail?.code === 'VES' ? '#f59e0b10' : '#465fff10',
                'transparent'
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.4, y: 0.4 }}
              className="absolute inset-0"
            />
            {/* Handle / Reorder icon */}
            <View className="mr-4 opacity-30">
              <Ionicons name="reorder-two-outline" size={24} color="white" />
            </View>

            {/* Icon fallback or custom */}
            <View className="w-12 h-12 rounded-2xl bg-white/5 justify-center items-center border border-white/5 overflow-hidden mr-4">
              {item.display_icon ? (
                <Image source={{ uri: item.display_icon }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <LinearGradient
                  colors={['#1e293b', '#0f172a']}
                  className="w-full h-full items-center justify-center"
                >
                  <Ionicons 
                    name={item.currency_detail?.code === 'VES' ? "cash-outline" : "logo-usd"} 
                    size={20} 
                    color="#94a3b8" 
                  />
                </LinearGradient>
              )}
            </View>

            <View className="flex-1">
              <Typography weight="bold" className="text-white">{item.name}</Typography>
              <Typography variant="label" className="text-ink-tertiary">
                {item.currency_detail?.code}
              </Typography>
            </View>

            <View className="items-end">
              <Typography weight="bold" className="text-white">
                {item.currency_detail?.symbol}{formatCurrency(item.balance)}
              </Typography>
            </View>

            <Ionicons name="chevron-forward" size={16} color="#475569" className="ml-3" />
          </GlassCard>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-950 justify-center items-center">
        <ActivityIndicator size="large" color="#465fff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-gray-950">
        <View className="flex-1 px-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mt-6 mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-xl bg-white/5 justify-center items-center"
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <Typography variant="h3" weight="bold" className="text-white">Mis Cuentas</Typography>
            <TouchableOpacity
              onPress={() => router.push('/accounts/create')}
              className="w-10 h-10 rounded-xl bg-brand-500/10 justify-center items-center"
            >
              <Ionicons name="add" size={20} color="#465fff" />
            </TouchableOpacity>
          </View>

          <Typography variant="caption" className="text-ink-tertiary mb-6">
            Deja presionado para reordenar cómo aparecerán en el Dashboard.
          </Typography>

          <DraggableFlatList
            data={accounts}
            onDragEnd={({ data }) => handleReorder(data)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={
              <View className="py-20 items-center">
                <Ionicons name="wallet-outline" size={48} color="#1e293b" />
                <Typography className="text-ink-muted mt-4">No tienes cuentas registradas</Typography>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
