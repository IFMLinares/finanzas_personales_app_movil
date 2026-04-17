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
      case 'h1': return 'text-3xl tracking-tightest';
      case 'h2': return 'text-2xl tracking-tighter';
      case 'h3': return 'text-xl tracking-tight';
      case 'body': return 'text-base';
      case 'caption': return 'text-sm';
      case 'label': return 'text-[10px] uppercase tracking-widest';
      case 'balance': return 'text-4xl tracking-tightest';
      default: return 'text-base';
    }
  };

  const getTextColorClass = () => {
    switch (variant) {
      case 'caption': return 'text-ink-secondary';
      case 'label': return 'text-ink-tertiary';
      case 'body': return 'text-ink-primary';
      default: return 'text-ink-primary';
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

  const hasColorOverride = className.includes('text-');

  return (
    <Text
      className={`${hasColorOverride ? '' : getTextColorClass()} ${getVariantClass()} ${getWeightClass()} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
}
