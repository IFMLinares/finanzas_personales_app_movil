import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import { useToast } from '@/contexts/ToastContext';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export function ToastBox() {
  const { toast, isVisible, hideToast } = useToast();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-150)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: insets.top + (Platform.OS === 'ios' ? 10 : 20),
          useNativeDriver: true,
          tension: 60,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -150,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, insets.top, translateY, opacity]);

  if (!toast && !isVisible) return null;

  const bgColors = {
    success: 'rgba(18, 183, 106, 0.15)',
    error: 'rgba(240, 68, 56, 0.15)',
    info: 'rgba(70, 95, 255, 0.15)',
  };

  const borderColors = {
    success: 'rgba(18, 183, 106, 0.4)',
    error: 'rgba(240, 68, 56, 0.4)',
    info: 'rgba(70, 95, 255, 0.4)',
  };

  const icons = {
    success: 'checkmark-circle',
    error: 'alert-circle',
    info: 'information-circle',
  };

  const iconColors = {
    success: '#12b76a',
    error: '#f04438',
    info: '#465fff',
  };

  const currentType = toast?.type || 'info';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          zIndex: 9999,
          elevation: 9999,
        },
      ]}
      pointerEvents="none"
    >
      <View style={[styles.innerContainer, { borderColor: borderColors[currentType] }]}>
        <BlurView 
          intensity={80} 
          tint="dark" 
          style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} 
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: bgColors[currentType], borderRadius: 16 }]} />
        
        <View style={styles.content}>
          <Ionicons 
            name={icons[currentType] as any} 
            size={22} 
            color={iconColors[currentType]} 
            style={styles.icon} 
          />
          <Typography variant="body" weight="medium" style={styles.text}>
            {toast?.message}
          </Typography>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  icon: {
    marginRight: 12,
  },
  text: {
    color: '#fff',
    flex: 1,
  },
});
