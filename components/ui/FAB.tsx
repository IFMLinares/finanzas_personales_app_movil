import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface FABProps {
  onPress: () => void;
  style?: ViewStyle;
  backgroundColor?: string;
  iconColor?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export function FAB({ 
  onPress, 
  style, 
  backgroundColor = "#465fff", 
  iconColor = "#fff",
  iconName = "add"
}: FABProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      className="absolute bottom-6 right-6 w-16 h-16 rounded-full justify-center items-center shadow-2xl"
      style={[
        styles.elevation, 
        { backgroundColor },
        style
      ]}
    >
      <Ionicons name={iconName as any} size={32} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  elevation: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 15,
  },
});
