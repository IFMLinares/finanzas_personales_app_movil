import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomNumpadProps {
  onPress: (key: string) => void;
  onDelete: () => void;
  onClear?: () => void;
  onConfirm?: () => void;
  confirmColor?: string;
  confirmLabel?: string;
}

export const CustomNumpad: React.FC<CustomNumpadProps> = ({ 
  onPress, 
  onDelete, 
  onClear, 
  onConfirm,
  confirmColor = '#12b76a',
  confirmLabel
}) => {
  const numpadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '⌫'], 
  ];

  const ActionButton = ({ 
    children, 
    onPress: handlePress, 
    className = '', 
    style = {},
    activeOpacity = 0.7 
  }: any) => (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={handlePress}
      className={`rounded-2xl justify-center items-center border ${className}`}
      style={style}
    >
      {children}
    </TouchableOpacity>
  );

  const KeyText = ({ children }: { children: string }) => (
    <Text style={{ 
      fontFamily: 'Outfit_600SemiBold', 
      fontSize: 26, 
      color: 'white', 
      includeFontPadding: false, 
      paddingTop: 4 
    }}>
      {children}
    </Text>
  );

  return (
    <View className="flex-row px-3 py-2 gap-x-2">
      {/* Numbers Column (3 columns wide) */}
      <View className="flex-[3] gap-y-2">
        {numpadKeys.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row gap-x-2">
            {row.map((key, colIndex) => {
              const isDelete = key === '⌫';
              return (
                <TouchableOpacity
                  key={`${rowIndex}-${colIndex}`}
                  onPress={() => isDelete ? onDelete() : onPress(key)}
                  className="flex-1 aspect-[1.4/1] bg-gray-900 rounded-2xl justify-center items-center border border-gray-800 active:bg-gray-800"
                >
                  {isDelete ? (
                    <Ionicons name="backspace-outline" size={24} color="#94a3b8" />
                  ) : (
                    <KeyText>{key}</KeyText>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Actions Column (1 column wide - Shared 50/50 vertically) */}
      <View className="flex-1 gap-y-2">
        {/* Clear Button (Top Half) */}
        <ActionButton 
          onPress={onClear} 
          className="flex-1 bg-error-500/10 border-error-500/20"
        >
          <Ionicons name="trash-outline" size={26} color="#f04438" />
        </ActionButton>

        {/* Confirm Button (Bottom Half) */}
        <TouchableOpacity
          onPress={onConfirm}
          activeOpacity={0.8}
          className="flex-1 rounded-2xl justify-center items-center"
          style={{ backgroundColor: confirmColor }}
        >
          {confirmLabel ? (
            <Text style={{ fontFamily: 'Outfit_700Bold', color: 'white', fontSize: 10, textAlign: 'center' }}>{confirmLabel}</Text>
          ) : (
            <Ionicons name="checkmark-sharp" size={32} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomNumpad;
