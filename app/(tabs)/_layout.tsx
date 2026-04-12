import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

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
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
