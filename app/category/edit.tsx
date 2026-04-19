import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Typography } from '@/components/ui/Typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { BackgroundAura } from '@/components/ui/BackgroundAura';
import { financeService, Category } from '@/services/financeService';
import { Button } from '@/components/ui/Button';

const ICON_OPTIONS = [
  'cart-outline', 'fast-food-outline', 'bus-outline', 'home-outline', 
  'medical-outline', 'school-outline', 'fitness-outline', 'gift-outline',
  'game-controller-outline', 'shirt-outline', 'diamond-outline', 'car-outline',
  'airplane-outline', 'cafe-outline', 'restaurant-outline', 'construct-outline',
  'cash-outline', 'card-outline', 'wallet-outline', 'trending-up-outline',
  'business-outline', 'briefcase-outline', 'stats-chart-outline', 'pie-chart-outline'
];

export default function CategoryEditScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id, type: initialType } = useLocalSearchParams();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [type, setType] = useState<'EX' | 'IN'>((initialType as any) || 'EX');
  const [icon, setIcon] = useState('pricetag-outline');
  const [parent, setParent] = useState<number | string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => financeService.getCategories(),
  });

  const { data: categoryData, isLoading: isLoadingCategory } = useQuery({
    queryKey: ['category', id],
    queryFn: () => categories.find(c => c.id.toString() === id?.toString()),
    enabled: isEditing && categories.length > 0,
  });

  useEffect(() => {
    if (categoryData) {
      setName(categoryData.name);
      setType(categoryData.type);
      setIcon(categoryData.icon || 'pricetag-outline');
      setParent(categoryData.parent || null);
    }
  }, [categoryData]);

  const mutation = useMutation({
    mutationFn: (data: any) => 
      isEditing 
        ? financeService.updateCategory(id as string, data) 
        : financeService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      Alert.alert('Éxito', `Categoría ${isEditing ? 'actualizada' : 'creada'} correctamente`);
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Error', 'No se pudo guardar la categoría. Por favor, intente de nuevo.');
    }
  });

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    mutation.mutate({
      name: name.trim(),
      type,
      icon,
      parent: parent === 'none' ? null : parent
    });
  };

  const potentialParents = categories.filter(c => c.type === type && !c.parent && c.id.toString() !== id?.toString());

  if (isEditing && isLoadingCategory) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center">
        <ActivityIndicator size="large" color="#465fff" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <BackgroundAura 
        color={type === 'EX' ? '#f43f5e' : '#10b981'} 
        size={400} 
        opacity={0.1} 
        top={-100}
        right={-100}
      />

      <View className="px-6 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-4 border border-white/10"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Typography variant="h3" weight="bold" className="text-white">
            {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
          </Typography>
        </View>
        <TouchableOpacity 
          onPress={handleSave}
          disabled={mutation.isPending}
        >
          <Typography weight="bold" className="text-brand-500">Guardar</Typography>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Typography variant="caption" className="text-white/60 mb-2 uppercase tracking-widest pl-1">Nombre</Typography>
          <View className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
            <TextInput
              className="text-white text-lg font-medium"
              placeholder="Ej: Restaurantes"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        <View className="mb-6">
          <Typography variant="caption" className="text-white/60 mb-2 uppercase tracking-widest pl-1">Tipo</Typography>
          <View className="flex-row bg-white/5 p-1 rounded-2xl border border-white/10 opacity-70">
            <TouchableOpacity 
              disabled={isEditing}
              onPress={() => setType('EX')}
              className={`flex-1 py-3 rounded-xl items-center ${type === 'EX' ? 'bg-rose-500/20' : ''}`}
            >
              <Typography weight="bold" className={type === 'EX' ? 'text-rose-400' : 'text-gray-500'}>Gasto</Typography>
            </TouchableOpacity>
            <TouchableOpacity 
              disabled={isEditing}
              onPress={() => setType('IN')}
              className={`flex-1 py-3 rounded-xl items-center ${type === 'IN' ? 'bg-emerald-500/20' : ''}`}
            >
              <Typography weight="bold" className={type === 'IN' ? 'text-emerald-400' : 'text-gray-500'}>Ingreso</Typography>
            </TouchableOpacity>
          </View>
          {isEditing && (
            <Typography variant="caption" className="text-gray-500 mt-2 italic text-center">
              No se puede cambiar el tipo de una categoría existente.
            </Typography>
          )}
        </View>

        <View className="mb-6">
          <Typography variant="caption" className="text-white/60 mb-2 uppercase tracking-widest pl-1">Categoría Padre</Typography>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            <TouchableOpacity
              onPress={() => setParent('none')}
              className={`px-4 py-3 rounded-2xl mr-2 border ${!parent || parent === 'none' ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10'}`}
            >
              <Typography className={!parent || parent === 'none' ? 'text-white' : 'text-gray-500'}>Ninguna (Principal)</Typography>
            </TouchableOpacity>
            {potentialParents.map(p => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setParent(p.id)}
                className={`px-4 py-3 rounded-2xl mr-2 border ${parent === p.id ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10'}`}
              >
                <Typography className={parent === p.id ? 'text-white' : 'text-gray-500'}>{p.name}</Typography>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="mb-10">
          <Typography variant="caption" className="text-white/60 mb-3 uppercase tracking-widest pl-1">Icono</Typography>
          <View className="flex-row flex-wrap justify-between">
            {ICON_OPTIONS.map(iconName => (
              <TouchableOpacity
                key={iconName}
                onPress={() => setIcon(iconName)}
                className={`w-[22%] aspect-square rounded-2xl items-center justify-center mb-4 border ${icon === iconName ? 'bg-white/10 border-white/40 border-2' : 'bg-white/5 border-white/10'}`}
              >
                <Ionicons 
                  name={iconName as any} 
                  size={24} 
                  color={icon === iconName ? (type === 'EX' ? '#f43f5e' : '#10b981') : '#4b5563'} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="px-6 py-4 border-t border-white/5 bg-gray-950">
        <Button 
          label={isEditing ? 'Actualizar Categoría' : 'Crear Categoría'}
          onPress={handleSave}
          loading={mutation.isPending}
          disabled={!name.trim()}
        />
      </View>

      {mutation.isPending && (
        <View className="absolute inset-0 bg-black/40 items-center justify-center">
          <GlassCard className="p-6 items-center">
            <ActivityIndicator color="#465fff" />
            <Typography className="text-white mt-4">Guardando...</Typography>
          </GlassCard>
        </View>
      )}
    </SafeAreaView>
  );
}
