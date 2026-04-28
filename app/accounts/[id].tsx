import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { financeService, Account } from '@/services/financeService';
import { LinearGradient } from 'expo-linear-gradient';
import { formatCurrency, formatCurrencyWithSymbol } from '@/utils/formatters';

export default function AccountDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchAccount();
  }, [id]);

  const fetchAccount = async () => {
    try {
      const data = await financeService.getAccount(id as string);
      setAccount(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <View className="flex-1 bg-gray-950 justify-center items-center">
        <ActivityIndicator size="large" color="#465fff" />
      </View>
    );
  }

  if (!account) return null;

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mt-6 mb-10">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white/5 justify-center items-center"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Typography variant="h3" weight="bold" className="text-white">Detalles</Typography>
          <TouchableOpacity 
            onPress={() => router.push(`/accounts/edit/${id}`)}
            className="w-10 h-10 rounded-xl bg-white/5 justify-center items-center"
          >
            <Ionicons name="create-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <GlassCard intensity="high" className="mb-8 overflow-hidden">
          <LinearGradient
            colors={['#465fff20', '#465fff05']}
            className="absolute inset-0"
          />
          <View className="p-8 items-center">
            <View className="w-20 h-20 rounded-3xl bg-white/5 justify-center items-center border border-white/10 mb-6 overflow-hidden">
              {account.display_icon ? (
                <Image source={{ uri: account.display_icon }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <Typography className="text-4xl">
                  {account.currency_detail?.code === 'VES' ? '🇻🇪' :
                   account.currency_detail?.code === 'EUR' ? '🇪🇺' :
                   account.currency_detail?.code === 'USDT' ? '🌐' : '🇺🇸'}
                </Typography>
              )}
            </View>
            
            <Typography variant="caption" className="text-ink-tertiary mb-2 uppercase tracking-widest">{account.name}</Typography>
            <Typography variant="balance" weight="bold" className="text-white mb-2">
              {formatCurrencyWithSymbol(account.balance, account.currency_detail?.symbol)}
            </Typography>
            <Typography variant="label" weight="bold" className="text-brand-400">
              {account.currency_detail?.name}
            </Typography>
          </View>
        </GlassCard>

        {/* Quick Stats */}
        <View className="flex-row gap-4 mb-10">
          <GlassCard className="flex-1 p-5" intensity="low">
            <Typography variant="label" className="text-ink-tertiary mb-2">Estado</Typography>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
              <Typography weight="bold" className="text-white">Activa</Typography>
            </View>
          </GlassCard>
          <GlassCard className="flex-1 p-5" intensity="low">
            <Typography variant="label" className="text-ink-tertiary mb-2">Moneda</Typography>
            <Typography weight="bold" className="text-white">{account.currency_detail?.code}</Typography>
          </GlassCard>
        </View>

        {/* Info List */}
        <View className="mb-10">
          <Typography variant="h3" weight="bold" className="mb-6">Información</Typography>
          <GlassCard intensity="low" className="p-2">
            <View className="p-4 flex-row justify-between border-b border-white/5">
              <Typography className="text-ink-tertiary">Tipo</Typography>
              <Typography weight="semibold" className="text-white">Cuenta de Liquidez</Typography>
            </View>
            <View className="p-4 flex-row justify-between">
              <Typography className="text-ink-tertiary">ID de Cuenta</Typography>
              <Typography weight="semibold" className="text-white">#{id}</Typography>
            </View>
          </GlassCard>
        </View>

        {/* Actions */}
        <View className="gap-4">
           <Button 
            title="Nuevo Movimiento" 
            onPress={() => router.push(`/transaction/new?account_id=${id}`)}
          />
           <Button 
            title="Editar Cuenta" 
            variant="outline"
            onPress={() => router.push(`/accounts/edit/${id}`)}
          />
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
