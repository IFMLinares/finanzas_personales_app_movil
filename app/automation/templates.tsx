import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Typography } from '@/components/ui/Typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { BackgroundAura } from '@/components/ui/BackgroundAura';
import { automationService, ExpenseTemplate } from '@/services/automationService';
import { financeService, Category, Account } from '@/services/financeService';
import { TemplateModal } from '@/components/ui/TemplateModal';
import { formatCurrency, formatCurrencyWithSymbol } from '@/utils/formatters';

export default function TemplatesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [templates, setTemplates] = useState<ExpenseTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ExpenseTemplate | null>(null);

  // Stats / Context
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const fetchTemplates = async () => {
    try {
      const [data, cats, accs] = await Promise.all([
        automationService.getTemplates(),
        financeService.getCategories(),
        financeService.getAccounts()
      ]);
      setTemplates(data);
      setCategories(cats);
      setAccounts(accs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTemplates();
    }, [])
  );

  const handleCreate = async (data: any) => {
    await automationService.createTemplate(data);
    queryClient.invalidateQueries({ queryKey: ['expenseTemplates'] });
    fetchTemplates();
  };

  const handleUpdate = async (data: any) => {
    if (editingTemplate) {
      await automationService.updateTemplate(editingTemplate.id, data);
      queryClient.invalidateQueries({ queryKey: ['expenseTemplates'] });
      fetchTemplates();
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Eliminar Plantilla',
      '¿Estás seguro de que deseas eliminar esta plantilla rápida?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await automationService.deleteTemplate(id);
            queryClient.invalidateQueries({ queryKey: ['expenseTemplates'] });
            fetchTemplates();
          }
        }
      ]
    );
  };

  const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || 'Sin categoría';
  const getAccountName = (id: number) => accounts.find(a => a.id === id)?.name || 'Sin cuenta';

  if (loading) {
    return (
      <View className="flex-1 bg-gray-950 justify-center items-center">
        <ActivityIndicator size="large" color="#465fff" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <BackgroundAura
        color="#fbbf24"
        size={400}
        opacity={0.05}
        top={-100}
        right={-100}
      />

      <View className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mt-6 mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white/5 justify-center items-center"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Typography variant="h3" weight="bold" className="text-white">Plantillas Rápidas</Typography>
          <TouchableOpacity
            onPress={() => {
              setEditingTemplate(null);
              setShowModal(true);
            }}
            className="w-10 h-10 rounded-xl bg-brand-500/10 justify-center items-center"
          >
            <Ionicons name="add" size={20} color="#465fff" />
          </TouchableOpacity>
        </View>

        <Typography variant="caption" className="text-ink-tertiary mb-6">
          Estas plantillas aparecerán como botones de acceso rápido en tu Dashboard para registrar gastos recurrentes.
        </Typography>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {!Array.isArray(templates) || templates.length === 0 ? (
            <View className="py-20 items-center">
              <View className="w-20 h-20 rounded-full bg-white/5 items-center justify-center mb-4">
                <Ionicons name="flash-outline" size={32} color="#1e293b" />
              </View>
              <Typography className="text-ink-muted text-center px-10">No tienes plantillas creadas. Pulsa el botón + para añadir la primera.</Typography>
            </View>
          ) : (
            templates.map((template) => (
              <GlassCard key={template.id} className="p-5 mb-4 border border-white/5" intensity="medium">
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1">
                    <Typography variant="h3" weight="bold" className="text-white mb-1">{template.name}</Typography>
                    <View className="flex-row items-center">
                      <Typography weight="bold" className="text-brand-500 mr-2">
                        {formatCurrencyWithSymbol(template.amount, template.currency_detail?.symbol)}
                      </Typography>
                      <View className="w-1 h-1 rounded-full bg-white/20 mx-2" />
                      <Typography variant="caption" className="text-ink-tertiary">{getCategoryName(template.category)}</Typography>
                      <View className="w-1 h-1 rounded-full bg-white/20 mx-2" />
                      <Typography variant="caption" weight="bold" className="text-brand-500/80">{template.currency_detail?.code}</Typography>
                    </View>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => {
                        setEditingTemplate(template);
                        setShowModal(true);
                      }}
                      className="w-10 h-10 bg-white/5 rounded-xl items-center justify-center"
                    >
                      <Ionicons name="pencil-outline" size={18} color="#94a3b8" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(template.id)}
                      className="w-10 h-10 bg-rose-500/10 rounded-xl items-center justify-center"
                    >
                      <Ionicons name="trash-outline" size={18} color="#f43f5e" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="flex-row items-center bg-black/20 p-3 rounded-xl">
                  <Ionicons name="wallet-outline" size={14} color="#64748b" className="mr-2" />
                  <Typography variant="caption" className="text-ink-tertiary ml-2">Usará: {getAccountName(template.preferred_account)}</Typography>
                </View>
              </GlassCard>
            ))
          )}
        </ScrollView>
      </View>

      <TemplateModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={editingTemplate ? handleUpdate : handleCreate}
        initialData={editingTemplate}
        title={editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
      />
    </SafeAreaView>
  );
}
