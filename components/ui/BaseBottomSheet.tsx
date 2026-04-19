import React, { useEffect } from 'react';
import { View, TouchableOpacity, Modal, Pressable, DimensionValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  runOnJS 
} from 'react-native-reanimated';

interface BaseBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  backgroundColor?: string;
  maxHeight?: DimensionValue;
  showBlur?: boolean;
}

export function BaseBottomSheet({
  isVisible,
  onClose,
  children,
  title,
  backgroundColor = 'bg-gray-950',
  maxHeight = '90%',
  showBlur = true,
}: BaseBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(600);
  const backdropOpacity = useSharedValue(0);
  const [internalVisible, setInternalVisible] = React.useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setInternalVisible(true);
      translateY.value = withTiming(0, { duration: 250 });
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      // Animate out before hiding modal
      backdropOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(600, { duration: 250 }, () => {
        runOnJS(setInternalVisible)(false);
      });
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      transparent
      visible={internalVisible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View className="flex-1 justify-end">
        <Animated.View 
          className="absolute inset-0"
          style={backdropStyle}
        >
          <Pressable className="flex-1" onPress={handleClose}>
            {showBlur ? (
              <BlurView intensity={20} tint="dark" className="flex-1" />
            ) : (
              <View className="flex-1 bg-black/60" />
            )}
            <View className="absolute inset-0 bg-black/40" />
          </Pressable>
        </Animated.View>

        <Animated.View 
          className={`${backgroundColor} rounded-t-[40px] border-t border-white/10`}
          style={[
            animatedStyle, 
            { 
              maxHeight,
              paddingBottom: Math.max(insets.bottom, 20),
            }
          ]}
        >
          {/* Drag Indicator */}
          <View className="w-12 h-1.5 bg-white/10 rounded-full self-center mt-4 mb-6" />

          {title && (
            <View className="px-8 flex-row justify-between items-center mb-6">
              <Typography variant="h3" weight="bold" className="text-white">{title}</Typography>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close-circle-outline" size={28} color="#4b5563" />
              </TouchableOpacity>
            </View>
          )}

          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
