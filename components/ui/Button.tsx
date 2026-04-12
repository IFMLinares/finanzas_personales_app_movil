import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'outline';
}

export function Button({ title, loading, variant = 'primary', style, ...props }: ButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className={`rounded-xl flex-row items-center justify-center px-6 ${
        isPrimary ? 'bg-[#3C50E0]' : 'border border-[#2E3A47] bg-transparent'
      } ${props.disabled || loading ? 'opacity-60' : ''}`}
      style={[{ height: 56, width: '100%' }, style]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFFFFF' : '#3C50E0'} />
      ) : (
        <Text
          className="text-lg font-[Outfit_600SemiBold] text-white"
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
