import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassCardProps extends ViewProps {
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  children: React.ReactNode;
}

export function GlassCard({ 
  children, 
  className = '', 
  intensity = 'medium',
  style,
  ...props 
}: GlassCardProps) {
  
  const getIntensityStyles = () => {
    switch (intensity) {
      case 'low': return { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.05)' };
      case 'medium': return { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)' };
      case 'high': return { bg: 'rgba(255,255,255,0.12)', border: 'rgba(255,255,255,0.2)' };
      default: return { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)' };
    }
  };

  const { bg, border } = getIntensityStyles();

  return (
    <View 
      className={`rounded-3xl overflow-hidden ${className}`}
      style={[
        { 
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: border,
        },
        style
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
