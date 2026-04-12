import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
}

export function Input({ 
  label, 
  error, 
  onFocus, 
  onBlur, 
  secureTextEntry,
  autoCapitalize,
  ...props 
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Determinar si es un campo de contraseña y aplicar reglas de usuario
  const isPassword = secureTextEntry || props.textContentType === 'password';
  
  // Deshabilitar autocapitalización en contraseñas por defecto si no se especifica
  const effectiveAutoCapitalize = isPassword ? 'none' : autoCapitalize;

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
          className="flex-1 text-white font-[Outfit_400Regular] text-base h-full"
          placeholderTextColor="#8A99AF"
          secureTextEntry={isPassword && !isPasswordVisible}
          autoCapitalize={effectiveAutoCapitalize}
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
        
        {isPassword && (
          <TouchableOpacity 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            className="h-full justify-center pl-2"
          >
            <Ionicons 
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
              size={22} 
              color={isPasswordVisible ? '#3C50E0' : '#8A99AF'} 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-red-500 text-xs mt-1 font-[Outfit_400Regular]">
          {error}
        </Text>
      )}
    </View>
  );
}
