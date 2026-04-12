import { Text, TextProps } from 'react-native';
import React from 'react';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label' | 'balance';
  weight?: 'regular' | 'semibold' | 'bold';
  className?: string;
}

export function Typography({
  variant = 'body',
  weight = 'regular',
  className = '',
  style,
  children,
  ...props
}: TypographyProps) {
  
  const getVariantClass = () => {
    switch (variant) {
      case 'h1': return 'text-3xl tracking-tight';
      case 'h2': return 'text-2xl tracking-tight';
      case 'h3': return 'text-xl';
      case 'body': return 'text-base';
      case 'caption': return 'text-sm opacity-60';
      case 'label': return 'text-xs uppercase tracking-widest opacity-50';
      case 'balance': return 'text-4xl tracking-tighter';
      default: return 'text-base';
    }
  };

  const getWeightClass = () => {
    switch (weight) {
      case 'regular': return 'font-outfit';
      case 'semibold': return 'font-outfitSemiBold';
      case 'bold': return 'font-outfitBold';
      default: return 'font-outfit';
    }
  };

  return (
    <Text
      className={`text-white ${getVariantClass()} ${getWeightClass()} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
}
