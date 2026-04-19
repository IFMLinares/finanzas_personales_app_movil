import React, { useRef } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Share, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Typography } from '@/components/ui/Typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { BackgroundAura } from '@/components/ui/BackgroundAura';
import { transactionService } from '@/services/transactionService';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const viewShotRef = useRef<any>(null);

  const { data: tx, isLoading } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionService.getTransactionById(id as string),
  });

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'IN': return { title: 'Ingreso Recibido', color: '#10b981', icon: 'arrow-down-circle' };
      case 'EX': return { title: 'Gasto Realizado', color: '#f43f5e', icon: 'arrow-up-circle' };
      case 'TR': return { title: 'Transferencia', color: '#3b82f6', icon: 'swap-horizontal' };
      default: return { title: 'Transacción', color: '#64748b', icon: 'help-circle' };
    }
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const handleShare = async () => {
    if (!tx || !viewShotRef.current) return;
    try {
      // Intentar primero compartir imagen (ticket profesional)
      const uri = await viewShotRef.current.capture();
      const isSharingAvailable = await Sharing.isAvailableAsync();
      
      if (isSharingAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Compartir Ticket Digital',
          UTI: 'public.png'
        });
      } else {
        // Fallback a texto si sharing no está disponible
        await Share.share({
          message: `${tx.title || 'Movimiento'}: ${tx.account_detail?.currency_detail?.symbol || '$'} ${tx.amount} en ${tx.account_detail?.name || 'Cuenta'}.`,
        });
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      Alert.alert('Error', 'No se pudo generar la imagen del ticket.');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center">
        <ActivityIndicator size="large" color="#465fff" />
      </View>
    );
  }

  if (!tx) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center p-6">
        <Typography className="text-white text-center">No se pudo cargar la transacción</Typography>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-white/10 px-6 py-2 rounded-xl">
          <Typography className="text-white">Regresar</Typography>
        </TouchableOpacity>
      </View>
    );
  }

  const config = getTransactionLabel(tx.type);

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <BackgroundAura 
        color={config.color} 
        size={500} 
        opacity={0.15} 
        top={-150}
        right={-100}
      />

      <View className="px-6 flex-row justify-between items-center py-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-white/10"
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Typography variant="h3" weight="bold" className="text-white">Detalle</Typography>
        <TouchableOpacity 
          onPress={handleShare}
          className="w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-white/10"
        >
          <Ionicons name="share-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-10" showsVerticalScrollIndicator={false}>
        {/* Digital Ticket Container */}
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
          <View className="bg-white rounded-3xl overflow-hidden p-0">
            <View className="p-8 items-center border-b border-gray-100 border-dashed">
              <View 
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: `${config.color}15` }}
              >
                <Ionicons name={config.icon as any} size={32} color={config.color} />
              </View>
              
              <Typography variant="caption" weight="bold" style={{ color: config.color }} className="uppercase tracking-widest mb-4">
                {config.title}
              </Typography>

              {tx.title && (
                <Typography variant="h3" weight="bold" className="text-gray-900 text-center mb-2 px-4" style={{ fontSize: 24 }}>
                  {tx.title}
                </Typography>
              )}
              
              <View className="flex-row items-baseline mb-2">
                <Typography className="text-gray-400 mr-2 text-xl" style={{ fontFamily: 'Outfit_400Regular' }}>
                  {tx.account_detail?.currency_detail?.symbol || '$'}
                </Typography>
                <Typography weight="bold" className="text-gray-900 text-5xl" style={{ fontFamily: 'monospace' }}>
                  {formatCurrency(tx.amount)}
                </Typography>
              </View>
              
              <Typography variant="caption" className="text-gray-400 italic">
                ID: TX-{tx.id.toString().padStart(6, '0')}
              </Typography>
            </View>

            <View className="p-8 pb-10">
              <View className="flex-row justify-between mb-6">
                <View className="flex-1">
                  <Typography variant="caption" className="text-gray-400 mb-1">FECHA</Typography>
                  <Typography weight="semibold" className="text-gray-800">
                    {new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(new Date(tx.date))}
                  </Typography>
                </View>
                <View className="flex-1 items-end">
                  <Typography variant="caption" className="text-gray-400 mb-1">CUENTA</Typography>
                  <Typography weight="semibold" className="text-gray-800">{tx.account_detail?.name || '-'}</Typography>
                </View>
              </View>

              <View className="flex-row justify-between mb-6">
                <View className="flex-1">
                  <Typography variant="caption" className="text-gray-400 mb-1">CATEGORÍA</Typography>
                  <Typography weight="semibold" className="text-gray-800">{tx.category_detail?.name || 'Sin categoría'}</Typography>
                </View>
                <View className="flex-1 items-end">
                  <Typography variant="caption" className="text-gray-400 mb-1">ESTADO</Typography>
                  <View className="bg-emerald-50 px-2 py-0.5 rounded-md flex-row items-center">
                    <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                    <Typography variant="caption" weight="bold" className="text-emerald-600">Completada</Typography>
                  </View>
                </View>
              </View>

              {tx.type === 'TR' && (
                <View className="bg-blue-50/50 p-4 rounded-2xl mb-6 border border-blue-100 border-dashed">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Typography variant="caption" className="text-blue-400">PARA</Typography>
                      <Typography weight="bold" className="text-blue-900" numberOfLines={1}>{tx.destination_account_detail?.name || 'Otra cuenta'}</Typography>
                    </View>
                    <Ionicons name="arrow-forward" size={16} color="#3b82f6" className="mx-2" />
                    <View className="items-end flex-1">
                      <Typography variant="caption" className="text-blue-400">RECIBIDO</Typography>
                      <Typography weight="bold" className="text-blue-900">
                        {tx.destination_account_detail?.currency_detail?.symbol || '$'} {formatCurrency(tx.destination_amount || tx.amount)}
                      </Typography>
                    </View>
                  </View>
                </View>
              )}

              <View className="mb-8">
                <Typography variant="caption" className="text-gray-400 mb-1">NOTAS</Typography>
                <Typography className="text-gray-700 leading-5">
                  {tx.notes || 'Ninguna descripción adjunta a este movimiento.'}
                </Typography>
              </View>

              {/* Perforated Divider */}
              <View className="flex-row justify-between items-center overflow-hidden h-6 mb-4">
                {Array.from({ length: 15 }).map((_, i) => (
                  <View key={i} className="w-3 h-3 rounded-full bg-gray-950 mx-1" />
                ))}
              </View>

              <View className="items-center">
                <Typography variant="caption" className="text-gray-300 italic uppercase tracking-widest text-[8px]" weight="bold">
                  Finanzas App • Digital Receipt
                </Typography>
              </View>
            </View>
          </View>
        </ViewShot>

        <TouchableOpacity 
          className="mt-8 mb-20 bg-white/5 border border-white/10 p-4 rounded-2xl flex-row items-center justify-center"
          onPress={() => {/* TODO: Implement Edit */}}
        >
          <Ionicons name="create-outline" size={20} color="#94a3b8" className="mr-2" />
          <Typography className="text-gray-400 ml-2" weight="bold">Editar transacción</Typography>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
