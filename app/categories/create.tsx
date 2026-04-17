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
      <View className="flex-row items-center px-5 py-4 border-b border-gray-900">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Typography variant="h3" weight="bold">Nueva Categoría</Typography>
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        <View className="mb-6">
          <Typography variant="label" className="text-gray-400 mb-2">Nombre</Typography>
          <Input 
            placeholder="Ej: Alimentación, Salario..." 
            value={name} 
            onChangeText={setName}
            className="bg-gray-900 border-gray-800 text-white"
          />
        </View>

        <View className="mb-6">
          <Typography variant="label" className="text-gray-400 mb-2">Tipo</Typography>
          <View className="flex-row bg-gray-900 p-1 rounded-2xl">
            <TouchableOpacity 
              onPress={() => setType('EX')}
              className={`flex-1 py-3 rounded-xl items-center ${type === 'EX' ? 'bg-gray-800' : ''}`}
            >
              <Typography weight="bold" className={type === 'EX' ? 'text-white' : 'text-gray-500'}>Gasto</Typography>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setType('IN')}
              className={`flex-1 py-3 rounded-xl items-center ${type === 'IN' ? 'bg-gray-800' : ''}`}
            >
              <Typography weight="bold" className={type === 'IN' ? 'text-white' : 'text-gray-500'}>Ingreso</Typography>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-6">
          <Typography variant="label" className="text-gray-400 mb-2">Color</Typography>
          <View className="flex-row flex-wrap gap-3">
            {AVAILABLE_COLORS.map(color => (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                style={{ backgroundColor: color }}
                className={`w-10 h-10 rounded-full border-2 ${selectedColor === color ? 'border-white' : 'border-transparent'}`}
              />
            ))}
          </View>
        </View>

        <View className="mb-10">
          <Typography variant="label" className="text-gray-400 mb-2">Icono</Typography>
          <View className="flex-row flex-wrap gap-4">
            {AVAILABLE_ICONS.map(icon => (
              <TouchableOpacity
                key={icon}
                onPress={() => setSelectedIcon(icon)}
                className={`w-14 h-14 rounded-2xl justify-center items-center border ${selectedIcon === icon ? 'bg-gray-800 border-brand-500' : 'bg-gray-900 border-gray-800'}`}
              >
                {renderIcon(icon, selectedIcon === icon ? selectedColor : '#667085')}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button 
          label="Guardar Categoría" 
          onPress={handleCreate} 
          loading={mutation.isPending}
          className="bg-brand-500 h-14 rounded-2xl mb-10"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
