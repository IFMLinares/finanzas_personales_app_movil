import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#465fff', // brand-500
        tabBarInactiveTintColor: '#667085', // gray-500
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0d14', // gray-dark
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 + insets.bottom : 64 + insets.bottom,
          paddingBottom: Platform.OS === 'ios' ? 20 + insets.bottom : insets.bottom + 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Outfit_600SemiBold',
          fontSize: 12,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Patrimonio',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <Ionicons name={focused ? 'pie-chart' : 'pie-chart-outline'} size={24} color={color} />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={24} color={color} />
            </View>
          ),
        }}
      />

      {/* Phantom Screen for FAB */}
      <Tabs.Screen
        name="create_action"
        options={{
          title: '',
          href: null,
          tabBarIcon: ({ focused }) => (
            <View className="items-center justify-center" style={{ marginTop: -24 }}>
              <View className="h-16 w-16 bg-brand-500 rounded-full items-center justify-center shadow-lg shadow-brand-500/50 border-4 border-[#07090e]">
                <Ionicons name="add" size={32} color="white" />
              </View>
            </View>
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            router.push('/transaction/create');
          },
        })}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Más',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
