import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  ViewStyle,
  StyleProp,
  DimensionValue,
} from 'react-native';
import { BorderRadius } from '../../theme/theme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  minOpacity?: number;
  maxOpacity?: number;
  duration?: number;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.md,
  style,
  minOpacity = 0.3,
  maxOpacity = 0.7,
  duration = 850,
}: SkeletonProps) {
  const opacityAnim = useRef(new Animated.Value(minOpacity)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: maxOpacity,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: minOpacity,
          duration,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacityAnim, minOpacity, maxOpacity, duration]);

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width,
          height,
          borderRadius,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
}

// ── Subcomponentes rápidos útiles ──

export function SkeletonCircle({
  size = 48,
  style,
}: {
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  );
}

export function SkeletonLine({
  width = '100%',
  height = 14,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Skeleton
      width={width}
      height={height}
      borderRadius={BorderRadius.xs}
      style={style}
    />
  );
}

Skeleton.Circle = SkeletonCircle;
Skeleton.Line = SkeletonLine;

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: '#D1D5DB', // Neutral gray (Gray300)
  },
});

export default Skeleton;
