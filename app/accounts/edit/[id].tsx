import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { financeService, Account } from '@/services/financeService';
import * as ImagePicker from 'expo-image-picker';
import { useToast } from '@/contexts/ToastContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function EditAccountScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { showToast } = useToast();
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  useEffect(() => {
    if (id) fetchAccount();
  }, [id]);

  const fetchAccount = async () => {
    try {
      const data = await financeService.getAccount(id as string);
      if (data) {
        setAccount(data);
        setName(data.name);
        setIconUrl(data.icon_url || '');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast({ message: 'Necesitamos acceso a tu galería para subir un ícono.', type: 'error' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const initiateSave = () => {
    if (!name.trim()) {
      showToast({ message: 'El nombre de la cuenta es obligatorio.', type: 'error' });
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setShowSaveConfirm(false);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('icon_url', iconUrl);
      
      if (selectedImage) {
        const uriParts = selectedImage.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formData.append('icon_image', {
          uri: selectedImage,
          name: `account_icon_${id}.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      await financeService.updateAccount(id as string, formData);
      showToast({ message: 'Cuenta actualizada correctamente', type: 'success' });
      router.back();
    } catch (error) {
      console.error(error);
      showToast({ message: 'No se pudo actualizar la cuenta.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-950 justify-center items-center">
        <ActivityIndicator size="large" color="#465fff" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mt-6 mb-10">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white/5 justify-center items-center"
          >
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
          <Typography variant="h3" weight="bold" className="text-white">Editar Cuenta</Typography>
          <View className="w-10" />
        </View>

        {/* Icon Preview & Selector */}
        <View className="items-center mb-10">
          <TouchableOpacity 
            onPress={pickImage}
            className="w-24 h-24 rounded-3xl bg-white/5 justify-center items-center border border-dashed border-white/20 overflow-hidden"
          >
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} className="w-full h-full" />
            ) : account?.display_icon ? (
              <Image source={{ uri: account.display_icon }} className="w-full h-full" />
            ) : (
              <View className="items-center">
                <Ionicons name="image-outline" size={32} color="#475569" />
                <Typography variant="label" className="text-ink-tertiary mt-1">Cambiar</Typography>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedImage(null)} className="mt-4">
             <Typography variant="caption" className="text-rose-500">Eliminar selección</Typography>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="gap-6 mb-10">
          <View>
            <Typography variant="label" weight="bold" className="mb-2 ml-1">Nombre de la cuenta</Typography>
            <Input 
              value={name}
              onChangeText={setName}
              placeholder="Ej: Banesco Ahorro"
            />
          </View>

          <View>
            <Typography variant="label" weight="bold" className="mb-2 ml-1">URL de ícono externo (opcional)</Typography>
            <Input 
              value={iconUrl}
              onChangeText={setIconUrl}
              placeholder="https://ejemplo.com/logo.png"
            />
            <Typography variant="caption" className="text-ink-muted mt-2 ml-1">
              Si subes una imagen, esta tendrá prioridad sobre la URL.
            </Typography>
          </View>
        </View>

        <Button 
          title="Guardar Cambios" 
          onPress={initiateSave}
          disabled={saving}
        />
        
        <View className="h-20" />
      </ScrollView>

      <ConfirmModal
        isVisible={showSaveConfirm}
        title="Guardar Cambios"
        message="¿Estás seguro de que deseas guardar los cambios realizados en esta cuenta?"
        confirmText={saving ? "Guardando..." : "Guardar"}
        onCancel={() => setShowSaveConfirm(false)}
        onConfirm={handleSave}
      />
    </SafeAreaView>
  );
}
