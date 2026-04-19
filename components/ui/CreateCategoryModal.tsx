import React, { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import { Input } from './Input';
import { BaseBottomSheet } from './BaseBottomSheet';

interface CreateCategoryModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (name: string, icon: string) => Promise<void>;
  type: 'IN' | 'EX';
}

const AVAILABLE_ICONS = [
  'cart-outline', 'home-outline', 'car-outline', 'bus-outline', 
  'fast-food-outline', 'cafe-outline', 'gift-outline', 'medical-outline',
  'fitness-outline', 'shirt-outline', 'game-controller-outline', 'book-outline',
  'cash-outline', 'wallet-outline', 'briefcase-outline', 'card-outline'
];

export function CreateCategoryModal({ 
  isVisible, 
  onClose, 
  onSubmit,
  type 
}: CreateCategoryModalProps) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('grid-outline');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isVisible) {
      setName('');
      setSelectedIcon('grid-outline');
    }
  }, [isVisible]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit(name.trim(), selectedIcon);
      onClose();
    } catch (error) {
      console.error('Error in handleSave:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseBottomSheet
      isVisible={isVisible}
      onClose={onClose}
      title="Nueva Categoría"
    >
      <View className="px-8 mb-4">
        <Typography variant="caption" className="text-gray-500 mb-8 uppercase tracking-widest font-bold">
          Para {type === 'IN' ? 'Ingresos' : 'Gastos'}
        </Typography>

        <View className="gap-6">
          <Input
            label="Nombre de la categoría"
            placeholder="Ej: Netflix, Comida, etc."
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <View>
            <Typography variant="label" weight="bold" className="text-gray-500 mb-4 uppercase text-[10px]">Elegir Icono</Typography>
            <View className="flex-row flex-wrap gap-3">
              {AVAILABLE_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  className={`w-12 h-12 rounded-2xl items-center justify-center border ${
                    selectedIcon === icon ? 'bg-brand-500 border-brand-500' : 'bg-white/5 border-white/5'
                  }`}
                >
                  <Ionicons name={icon as any} size={20} color={selectedIcon === icon ? 'white' : '#64748b'} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={loading || !name}
            className={`w-full h-16 rounded-2xl items-center justify-center flex-row ${
              loading || !name ? 'bg-gray-800' : 'bg-brand-500'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                <Typography weight="bold" className="text-white ml-2">Crear Categoría</Typography>
              </>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onClose} className="mt-4 py-4 items-center mb-4">
          <Typography weight="semibold" className="text-gray-600">Cancelar</Typography>
        </TouchableOpacity>
      </View>
    </BaseBottomSheet>
  );
}
