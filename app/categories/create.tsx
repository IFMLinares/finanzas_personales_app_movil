import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as LucideIcons from 'lucide-react-native';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { financeService } from '@/services/financeService';

const AVAILABLE_COLORS = [
  '#465fff', // brand
  '#12b76a', // success
  '#f04438', // error
  '#f79009', // warning
  '#667085', // gray-500
  '#3641f5', // brand-600
  '#7a5af8', // purple
  '#ee46bc', // pink
];

const AVAILABLE_ICONS = [
  'Wallet', 'ShoppingCart', 'Car', 'Home', 'Utensils',
  'Zap', 'Coffee', 'Gift', 'Heart', 'Music',
  'Briefcase', 'Plane', 'Smartphone', 'Stethoscope', 'Gamepad'
];

export default function CreateCategoryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);
  const [type, setType] = useState<'EX' | 'IN'>('EX');

  const mutation = useMutation({
    mutationFn: (data: any) => financeService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Error', 'No se pudo crear la categoría.');
      console.error(error);
    }
  });

  const handleCreate = () => {
    if (!name) {
      Alert.alert('Error', 'El nombre es obligatorio.');
      return;
    }

    mutation.mutate({
      name,
      type,
      // En una implementación real, enviaríamos el nombre del icono y el hex del color
      // El backend debería estar preparado para recibir estos metadatos extras o notes
    });
  };

  const renderIcon = (iconName: string, color: string, size: number = 24) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent color={color} size={size} /> : null;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <View className="flex-row items-center px-6 py-4 border-b border-white/5 bg-gray-950/80">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 rounded-xl bg-white/5 justify-center items-center">
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
        <Typography variant="h3" weight="bold">Nueva Categoría</Typography>
      </View>

      <ScrollView className="flex-1 px-6 pt-10" showsVerticalScrollIndicator={false}>
        <View className="mb-10">
          <Typography variant="h1" weight="bold" className="text-white mb-2">Clasificación</Typography>
          <Typography variant="body" className="text-ink-secondary">Crea una etiqueta para segmentar tus activos.</Typography>
        </View>

        <GlassCard intensity="medium" className="p-8 mb-10">
          <View className="mb-8">
            <Input
              label="Nombre de Etiqueta"
              placeholder="Ej: Alimentación, Salario..."
              value={name}
              onChangeText={setName}
            />
          </View>

          <View className="mb-8">
            <Typography variant="label" className="text-ink-tertiary mb-3 ml-1">Naturaleza</Typography>
            <View className="flex-row bg-white/5 p-1 rounded-2xl border border-white/5">
              <TouchableOpacity
                onPress={() => setType('EX')}
                className={`flex-1 py-3 rounded-xl items-center ${type === 'EX' ? 'bg-brand-500/20' : ''}`}
              >
                <Typography weight="bold" className={type === 'EX' ? 'text-brand-500' : 'text-ink-muted'}>Gasto</Typography>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setType('IN')}
                className={`flex-1 py-3 rounded-xl items-center ${type === 'IN' ? 'bg-emerald-500/20' : ''}`}
              >
                <Typography weight="bold" className={type === 'IN' ? 'text-emerald-500' : 'text-ink-muted'}>Ingreso</Typography>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-8">
            <Typography variant="label" className="text-ink-tertiary mb-3 ml-1">Firma Cromática</Typography>
            <View className="flex-row flex-wrap gap-4 px-1">
              {AVAILABLE_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-9 h-9 rounded-full border-2 ${selectedColor === color ? 'border-white' : 'border-transparent'}`}
                />
              ))}
            </View>
          </View>

          <View className="mb-10">
            <Typography variant="label" className="text-ink-tertiary mb-4 ml-1">Identidad Visual</Typography>
            <View className="flex-row flex-wrap gap-4">
              {AVAILABLE_ICONS.map(icon => (
                <TouchableOpacity
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  className={`w-14 h-14 rounded-2xl justify-center items-center border ${selectedIcon === icon
                      ? 'bg-white/10 border-brand-500'
                      : 'bg-white/5 border-white/5'
                    }`}
                >
                  {renderIcon(icon, selectedIcon === icon ? selectedColor : '#475569')}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title="Guardar Categoría"
            onPress={handleCreate}
            loading={mutation.isPending}
          />
        </GlassCard>

        <View className="items-center mb-10">
          <Typography variant="caption" className="text-ink-muted text-center px-10">
            Esta clasificación estará disponible para todas tus cuentas.
          </Typography>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
