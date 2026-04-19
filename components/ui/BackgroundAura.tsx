import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface AuraProps {
  color?: string;
  size?: number;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  opacity?: number;
}

export function BackgroundAura({ 
  color = '#465fff', 
  size = 300, 
  top, 
  left, 
  right, 
  bottom,
  opacity = 0.15 
}: AuraProps) {
  return (
    <View 
      pointerEvents="none"
      style={[
        styles.container, 
        { 
          width: size, 
          height: size, 
          top: top as any, 
          left: left as any, 
          right: right as any, 
          bottom: bottom as any,
          opacity: opacity
        }
      ]}
    >
      <Svg height="100%" width="100%" viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient
            id="grad"
            cx={size / 2}
            cy={size / 2}
            rx={size / 2}
            ry={size / 2}
            fx={size / 2}
            fy={size / 2}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#grad)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: -1,
  },
});
