import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Typography } from '@/components/ui/Typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { BackgroundAura } from '@/components/ui/BackgroundAura';
import { financeService, Category } from '@/services/financeService';
import { useToast } from '@/contexts/ToastContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function CategoryListScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'EX' | 'IN'>('EX');
  const [expandedParents, setExpandedParents] = useState<Set<number | string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{ visible: boolean; id: string | number; name: string }>({ visible: false, id: '', name: '' });

  const { data: categories = [], isLoading, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: () => financeService.getCategories(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => financeService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showToast({ message: 'Categoría eliminada correctamente', type: 'success' });
      setDeleteConfirm({ visible: false, id: '', name: '' });
    },
    onError: (error: any) => {
      showToast({ message: 'No se pudo eliminar la categoría. Verifique que no tenga transacciones asociadas.', type: 'error' });
      setDeleteConfirm({ visible: false, id: '', name: '' });
    }
  });

  const toggleExpand = (id: number | string) => {
    const newExpanded = new Set(expandedParents);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedParents(newExpanded);
  };

  const handleDelete = (id: string | number, name: string) => {
    setDeleteConfirm({ visible: true, id, name });
  };

  const renderCategoryItem = (item: Category, isChild: boolean = false) => {
    const hasChildren = !isChild && categories.some(c => c.parent === item.id);
    const isExpanded = expandedParents.has(item.id);

    return (
      <View key={item.id} className="mb-2">
        <GlassCard 
          className={`flex-row items-center p-4 border border-white/5 ${isChild ? 'ml-8 bg-white/2' : ''}`}
          intensity="low"
        >
          <View 
            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: activeTab === 'EX' ? '#f43f5e15' : '#10b98115' }}
          >
            <Ionicons 
              name={(item.icon || (isChild ? 'bookmark-outline' : 'folder-outline')) as any} 
              size={20} 
              color={activeTab === 'EX' ? '#f43f5e' : '#10b981'} 
            />
          </View>
          
          <View className="flex-1">
            <Typography weight="semibold" className="text-white">{item.name}</Typography>
          </View>

          <View className="flex-row items-center">
            {hasChildren && (
              <TouchableOpacity onPress={() => toggleExpand(item.id)} className="p-2">
                <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={18} color="#64748b" />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={() => router.push({ pathname: '/category/edit' as any, params: { id: item.id } })}
              className="p-2 ml-1"
            >
              <Ionicons name="create-outline" size={18} color="#465fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} className="p-2 ml-1">
              <Ionicons name="trash-outline" size={18} color="#f43f5e" opacity={0.7} />
            </TouchableOpacity>
          </View>
        </GlassCard>

        {isExpanded && !isChild && (
          <View>
            {categories
              .filter(c => c.parent === item.id)
              .map(child => renderCategoryItem(child, true))
            }
          </View>
        )}
      </View>
    );
  };

  const filteredParents = categories.filter(c => c.type === activeTab && !c.parent);

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <BackgroundAura 
        color={activeTab === 'EX' ? '#f43f5e' : '#10b981'} 
        size={400} 
        opacity={0.1} 
        top={-100}
        right={-100}
      />

      <View className="px-6 py-4 flex-row items-center">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-4 border border-white/10"
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Typography variant="h2" weight="bold" className="text-white">Categorías</Typography>
      </View>

      <View className="px-6 mb-6">
        <View className="flex-row bg-white/5 p-1 rounded-2xl border border-white/10">
          <TouchableOpacity 
            onPress={() => setActiveTab('EX')}
            className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'EX' ? 'bg-rose-500/20' : ''}`}
          >
            <Typography weight="bold" className={activeTab === 'EX' ? 'text-rose-400' : 'text-gray-500'}>Gastos</Typography>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('IN')}
            className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'IN' ? 'bg-emerald-500/20' : ''}`}
          >
            <Typography weight="bold" className={activeTab === 'IN' ? 'text-emerald-400' : 'text-gray-500'}>Ingresos</Typography>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#465fff" />
        }
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#465fff" className="mt-10" />
        ) : filteredParents.length > 0 ? (
          filteredParents.map(parent => renderCategoryItem(parent))
        ) : (
          <View className="items-center justify-center pt-20">
            <Ionicons name="pricetag-outline" size={64} color="#1e293b" />
            <Typography className="text-gray-500 mt-4">No hay categorías para este tipo</Typography>
          </View>
        )}
        <View className="h-24" />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        onPress={() => router.push({ pathname: '/category/edit' as any, params: { type: activeTab } })}
        className="absolute bottom-10 right-8 w-16 h-16 rounded-full bg-brand-500 items-center justify-center shadow-xl shadow-brand-500/40"
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <ConfirmModal
        isVisible={deleteConfirm.visible}
        title="Eliminar Categoría"
        message={`¿Estás seguro de que deseas eliminar "${deleteConfirm.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        isDestructive={true}
        onCancel={() => setDeleteConfirm({ visible: false, id: '', name: '' })}
        onConfirm={() => deleteMutation.mutate(deleteConfirm.id)}
      />
    </SafeAreaView>
  );
}
