import React, { useState } from 'react';
import { View, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';

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
    <View className="mb-6">
      {label && (
        <Typography variant="label" className="text-gray-500 mb-2 ml-1">
          {label}
        </Typography>
      )}
      <View
        className={`bg-transparent border-b h-14 px-1 flex-row items-center ${
          error ? 'border-error-500' : isFocused ? 'border-brand-500' : 'border-gray-800'
        }`}
      >
        <TextInput
          className="flex-1 text-white text-lg h-full"
          placeholderTextColor="#4b5563"
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
        <Typography variant="caption" className="text-error-500 mt-1 ml-1">
          {error}
        </Typography>
      )}
    </View>
  );
}
