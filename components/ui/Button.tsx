import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { Typography } from './Typography';

interface ButtonProps extends TouchableOpacityProps {
  label?: string;
  title?: string;
  loading?: boolean;
  variant?: 'primary' | 'outline';
}

export function Button({ label, title, loading, variant = 'primary', style, ...props }: ButtonProps) {
  const isPrimary = variant === 'primary';
  const text = label || title || '';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className={`rounded-2xl flex-row items-center justify-center px-6 ${
        isPrimary ? 'bg-brand-500' : 'border border-gray-800 bg-transparent'
      } ${props.disabled || loading ? 'opacity-50' : ''}`}
      style={[{ height: 56, width: '100%' }, style]}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Typography 
          weight="bold" 
          className="text-white text-lg first-letter:uppercase"
        >
          {text}
        </Typography>
      )}
    </TouchableOpacity>
  );
}
