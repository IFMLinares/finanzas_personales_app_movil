import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { BackgroundAura } from '@/components/ui/BackgroundAura';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  const menuItems = [
    {
      title: 'Categorías',
      subtitle: 'Gestionar tipos de gastos e ingresos',
      icon: 'pricetag-outline',
      color: '#465fff',
      onPress: () => router.push('/category'),
    },
    {
      title: 'Cuentas',
      subtitle: 'Administrar tus bancos y billeteras',
      icon: 'wallet-outline',
      color: '#10b981',
      onPress: () => router.push('/accounts'),
    },
    {
      title: 'Calculadora',
      subtitle: 'Herramienta de conversión de divisas',
      icon: 'calculator-outline',
      color: '#f59e0b',
      onPress: () => router.push('/calculator'),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <BackgroundAura 
        color="#465fff" 
        size={400} 
        opacity={0.1} 
        top={-100}
        right={-100}
      />

      <View className="px-6 py-8">
        <Typography variant="h2" weight="bold" className="text-white">Ajustes</Typography>
        <Typography variant="caption" className="text-ink-tertiary">Gestión y configuración de la app</Typography>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          <Typography variant="label" weight="bold" className="text-white/40 mb-4 uppercase tracking-widest">Gestión</Typography>
          
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={item.onPress}
              activeOpacity={0.7}
              className="mb-4"
            >
              <GlassCard className="flex-row items-center p-4 border border-white/5" intensity="low">
                <View 
                  className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                
                <View className="flex-1">
                  <Typography weight="bold" className="text-white">{item.title}</Typography>
                  <Typography variant="caption" className="text-ink-tertiary">{item.subtitle}</Typography>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#334155" />
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mb-10">
          <Typography variant="label" weight="bold" className="text-white/40 mb-4 uppercase tracking-widest">Cuenta</Typography>
          
          <TouchableOpacity 
            onPress={signOut}
            activeOpacity={0.7}
          >
            <GlassCard className="flex-row items-center p-4 border border-white/5" intensity="low">
              <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4 bg-rose-500/10">
                <Ionicons name="log-out-outline" size={24} color="#f43f5e" />
              </View>
              
              <View className="flex-1">
                <Typography weight="bold" className="text-rose-400">Cerrar Sesión</Typography>
                <Typography variant="caption" className="text-rose-400/50">Finalizar sesión actual</Typography>
              </View>

              <Ionicons name="arrow-forward" size={20} color="#f43f5e" opacity={0.3} />
            </GlassCard>
          </TouchableOpacity>
        </View>

        <View className="items-center py-10">
          <Typography variant="caption" className="text-white/10 italic">Finanzas App v1.0.0</Typography>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
