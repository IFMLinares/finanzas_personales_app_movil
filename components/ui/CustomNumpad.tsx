import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';

interface CustomNumpadProps {
  onPress: (key: string) => void;
  onDelete: () => void;
}

export const CustomNumpad: React.FC<CustomNumpadProps> = ({ onPress, onDelete }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];

  return (
    <View className="flex-row flex-wrap justify-between gap-y-3 px-4 py-2">
      {keys.map((key) => (
        <TouchableOpacity
          key={key}
          onPress={() => onPress(key)}
          className="w-[30%] aspect-[2/1] bg-gray-900 rounded-2xl justify-center items-center border border-gray-800 active:bg-gray-800"
        >
          <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 28, color: 'white', includeFontPadding: false, paddingTop: 6 }}>
            {key}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        onPress={onDelete}
        className="w-[30%] aspect-[2/1] bg-gray-900 rounded-2xl justify-center items-center border border-gray-800 active:bg-gray-800"
      >
        <Ionicons name="backspace-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default CustomNumpad;
