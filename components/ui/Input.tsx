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
  const [internalError, setInternalError] = useState(error);

  React.useEffect(() => {
    setInternalError(error);
  }, [error]);

  const handleChangeText = (text: string) => {
    if (internalError) {
      setInternalError(undefined);
    }
    props.onChangeText?.(text);
  };

  // Determinar si es un campo de contraseña y aplicar reglas de usuario
  const isPassword = secureTextEntry || props.textContentType === 'password';

  // Deshabilitar autocapitalización en contraseñas por defecto si no se especifica
  const effectiveAutoCapitalize = isPassword ? 'none' : autoCapitalize;

  return (
    <View className="mb-6">
      {label && (
        <Typography variant="label" className="text-white/90 mb-2 ml-1">
          {label}
        </Typography>
      )}
      <View
        className={`bg-white/5 border rounded-2xl h-14 px-4 flex-row items-center transition-colors ${internalError ? 'border-error-500/50' : isFocused ? 'border-brand-500 bg-brand-500/5' : 'border-white/10'
          }`}
      >
        <TextInput
          className="flex-1 text-white text-base h-full"
          placeholderTextColor="rgba(255, 255, 255, 0.7)"
          secureTextEntry={isPassword && !isPasswordVisible}
          autoCapitalize={effectiveAutoCapitalize}
          selectionColor="#465fff"
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
          onChangeText={handleChangeText}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            className="h-full justify-center pl-2"
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={isFocused ? '#465fff' : 'rgba(255, 255, 255, 0.6)'}
            />
          </TouchableOpacity>
        )}
      </View>
      {internalError && (
        <Typography variant="caption" className="text-error-500 mt-1 ml-1">
          {internalError}
        </Typography>
      )}
    </View>
  );
}
