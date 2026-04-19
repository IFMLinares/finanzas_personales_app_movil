import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Typography } from '@/components/ui/Typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { transactionService } from '@/services/transactionService';
import { BackgroundAura } from '@/components/ui/BackgroundAura';
import { DateFilterBottomSheet } from '@/components/ui/DateFilterBottomSheet';

export default function HistoryScreen() {
  const getStartOfMonth = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  };

  const getEndOfMonth = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
  };

  const [search, setSearch] = useState('');
  const [type, setType] = useState<'IN' | 'EX' | 'TR' | undefined>(undefined);
  const [startDate, setStartDate] = useState(getStartOfMonth());
  const [endDate, setEndDate] = useState(getEndOfMonth());
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const router = useRouter();

  const getAuraColor = () => {
    switch (type) {
      case 'IN': return '#10b981';
      case 'EX': return '#f43f5e';
      case 'TR': return '#3b82f6';
      default: return '#465fff';
    }
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['transactions', { search, type, startDate, endDate, page, pageSize }],
    queryFn: () => transactionService.getTransactions({
      search,
      type,
      date_from: startDate,
      date_to: endDate,
      page,
      page_size: pageSize
    }),
  });

  const transactions = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'IN': return { name: 'arrow-down-circle', color: '#10b981' };
      case 'EX': return { name: 'arrow-up-circle', color: '#f43f5e' };
      case 'TR': return { name: 'swap-horizontal-outline', color: '#465fff' };
      default: return { name: 'help-circle-outline', color: '#64748b' };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={['top']}>
      <BackgroundAura
        color={getAuraColor()}
        size={400}
        opacity={0.12}
        top={-100}
        right={-100}
      />

      <View className="px-6 pt-4 pb-2">
        <Typography variant="h2" weight="bold" className="text-white mb-6">Historial</Typography>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white/5 border border-white/10 px-4 h-12 rounded-2xl mb-4">
          <Ionicons name="search" size={18} color="#64748b" />
          <TextInput
            placeholder="Buscar por nota o categoría..."
            placeholderTextColor="#4b5563"
            className="flex-1 ml-3 text-white font-medium"
            value={search}
            onChangeText={(text) => { setSearch(text); setPage(1); }}
            style={{ fontFamily: 'Outfit_500Medium' }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); setPage(1); }}>
              <Ionicons name="close-circle" size={18} color="#4b5563" />
            </TouchableOpacity>
          )}
        </View>

        {/* Range Selector Button */}
        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          className="flex-row items-center bg-white/5 border border-white/10 px-4 py-3 rounded-2xl mb-6"
        >
          <View className="w-10 h-10 bg-brand-500/10 rounded-xl justify-center items-center mr-3">
            <Ionicons name="calendar-outline" size={20} color="#465fff" />
          </View>
          <View className="flex-1">
            <Typography variant="caption" className="text-gray-500">Rango de fechas</Typography>
            <Typography weight="semibold" className="text-white">
              {startDate === endDate ? (
                startDate === new Date().toISOString().split('T')[0] ? 'Hoy' : startDate
              ) : (
                `${startDate} - ${endDate}`
              )}
            </Typography>
          </View>
          <Ionicons name="options-outline" size={20} color="#64748b" />
        </TouchableOpacity>

        {/* Row 1: Type Filters */}
        <View className="flex-row mb-4">
          <TouchableOpacity
            onPress={() => { setType(undefined); setPage(1); }}
            className={`flex-1 py-3 rounded-2xl items-center mr-2 border ${!type ? 'bg-brand-500 border-brand-500 shadow-lg shadow-brand-500/20' : 'bg-white/5 border-white/10'}`}
          >
            <Typography variant="label" weight="bold" className={!type ? 'text-white' : 'text-gray-400'}>Todo</Typography>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setType('EX'); setPage(1); }}
            className={`flex-1 py-3 rounded-2xl items-center mr-2 border ${type === 'EX' ? 'bg-rose-500/20 border-rose-500/30' : 'bg-white/5 border-white/10'}`}
          >
            <Typography variant="label" weight="bold" className={type === 'EX' ? 'text-rose-400' : 'text-gray-400'}>Gastos</Typography>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setType('IN'); setPage(1); }}
            className={`flex-1 py-3 rounded-2xl items-center mr-2 border ${type === 'IN' ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}
          >
            <Typography variant="label" weight="bold" className={type === 'IN' ? 'text-emerald-400' : 'text-gray-400'}>Ingresos</Typography>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setType('TR'); setPage(1); }}
            className={`flex-1 py-3 rounded-2xl items-center border ${type === 'TR' ? 'bg-blue-500/20 border-blue-500/30' : 'bg-white/5 border-white/10'}`}
          >
            <Typography variant="label" weight="bold" className={type === 'TR' ? 'text-blue-400' : 'text-gray-400'}>Transf.</Typography>
          </TouchableOpacity>
        </View>

        {/* Row 2: Pagination Controls & Page Size */}
        <View className="flex-row mb-6 items-center justify-between">
          <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-2 py-1">
            <TouchableOpacity
              onPress={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`w-10 h-10 rounded-xl items-center justify-center ${page === 1 ? 'opacity-20' : ''}`}
            >
              <Ionicons name="chevron-back" size={20} color="white" />
            </TouchableOpacity>

            <View className="px-4">
              <Typography variant="caption" weight="bold" className="text-white">
                Página {page} / {totalPages || 1}
              </Typography>
            </View>

            <TouchableOpacity
              onPress={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={`w-10 h-10 rounded-xl items-center justify-center ${page >= totalPages ? 'opacity-20' : ''}`}
            >
              <Ionicons name="chevron-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-3 py-1.5">
            {[10, 20, 50].map((size) => (
              <TouchableOpacity
                key={size}
                onPress={() => { setPageSize(size); setPage(1); }}
                className={`w-8 h-8 rounded-lg items-center justify-center ${pageSize === size ? 'bg-brand-500/20' : ''}`}
              >
                <Typography variant="caption" weight="bold" className={pageSize === size ? 'text-brand-500' : 'text-gray-400'}>{size}</Typography>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#465fff" />
        }
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#465fff" style={{ marginTop: 40 }} />
        ) : transactions.length > 0 ? (
          <>
            {transactions.map((tx, index) => {
              const iconConfig = getTransactionIcon(tx.type);
              return (
                <TouchableOpacity
                  key={tx.id}
                  onPress={() => router.push(`/transaction/${tx.id}` as any)}
                  activeOpacity={0.7}
                >
                  <GlassCard
                    className="mb-3 p-4 flex-row items-center border border-white/5"
                    intensity="low"
                  >
                    <View
                      className="w-12 h-12 rounded-2xl justify-center items-center mr-4"
                      style={{ backgroundColor: `${iconConfig.color}15` }}
                    >
                      <Ionicons name={iconConfig.name as any} size={22} color={iconConfig.color} />
                    </View>

                    <View className="flex-1">
                      <Typography weight="bold" className="text-white">{tx.title || tx.category_detail?.name || 'Varios'}</Typography>
                      <Typography variant="caption" className="text-gray-500" numberOfLines={1}>
                        {tx.notes || (tx.type === 'TR' ? `Transferencia ${tx.account_detail?.name}` : tx.account_detail?.name)}
                      </Typography>
                    </View>

                    <View className="items-end">
                      <Typography weight="bold" style={{ color: iconConfig.color }}>
                        {tx.type === 'IN' ? '+' : tx.type === 'EX' ? '-' : ''}
                        {tx.account_detail?.currency_detail?.symbol || '$'} {formatCurrency(parseFloat(tx.amount.toString()))}
                      </Typography>
                      <Typography variant="caption" className="text-gray-600">
                        {new Intl.DateTimeFormat('es-ES', {
                          day: 'numeric',
                          month: 'long'
                        }).format(new Date(tx.date))}
                      </Typography>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              );
            })}
          </>
        ) : (
          <View className="items-center justify-center pt-20">
            <Ionicons name="document-text-outline" size={64} color="#1e293b" />
            <Typography className="text-gray-500 mt-4" weight="semibold">No hay movimientos encontrados</Typography>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>

      <DateFilterBottomSheet
        isVisible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        startDate={startDate}
        endDate={endDate}
        onSelectRange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
          setPage(1);
        }}
      />
    </SafeAreaView>
  );
}

