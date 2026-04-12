import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, onFocus, onBlur, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-[#AEB7C0] font-[Outfit_600SemiBold] mb-2 text-sm">
          {label}
        </Text>
      )}
      <View
        className={`bg-[#24303F] border rounded-xl h-14 px-4 flex-row items-center ${
          error ? 'border-red-500' : isFocused ? 'border-[#3C50E0]' : 'border-[#2E3A47]'
        }`}
      >
        <TextInput
          className="flex-1 text-white font-[Outfit_400Regular] text-base"
          placeholderTextColor="#8A99AF"
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
      </View>
      {error && (
        <Text className="text-red-500 text-xs mt-1 font-[Outfit_400Regular]">
          {error}
        </Text>
      )}
    </View>
  );
}
