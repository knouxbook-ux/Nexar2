// Copyright © Knoux. All rights reserved.
/**
 * 🖼️ Retouch Engine — Canvas Renderer
 * عارض الكانفاس مع دعم التكبير والتحريك
 */
import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import {
  PanGestureHandler, PinchGestureHandler,
  GestureHandlerRootView, State,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle, useSharedValue,
  useAnimatedGestureHandler, withSpring,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface CanvasRendererProps {
  imageUri?: string;
  children?: React.ReactNode;
  onPress?: (x: number, y: number) => void;
}

export function CanvasRenderer({ imageUri, children, onPress }: CanvasRendererProps) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);

  const pinchHandler = useAnimatedGestureHandler({
    onActive: (event: any) => {
      scale.value = Math.max(0.5, Math.min(5, savedScale.value * event.scale));
    },
    onEnd: () => {
      savedScale.value = scale.value;
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
  });

  const panHandler = useAnimatedGestureHandler({
    onActive: (event: any) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    },
    onEnd: () => {
      if (scale.value <= 1) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureHandlerRootView style={s.root}>
      <PinchGestureHandler onGestureEvent={pinchHandler}>
        <Animated.View style={StyleSheet.absoluteFill}>
          <PanGestureHandler onGestureEvent={panHandler}>
            <Animated.View style={[s.canvas, animatedStyle]}>
              {imageUri ? (
                <Animated.Image
                  source={{ uri: imageUri }}
                  style={s.image}
                  resizeMode="contain"
                />
              ) : (
                <View style={s.placeholder}>
                  <Text style={s.placeholderIcon}>🖼️</Text>
                  <Text style={s.placeholderText}>اختر صورة للبدء</Text>
                  <Text style={s.placeholderSub}>اضغط على "اختر صورة" للاستيراد</Text>
                </View>
              )}
              {children}
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </PinchGestureHandler>
      {/* Zoom indicator */}
      {scale.value !== 1 && (
        <View style={s.zoomBadge}>
          <Text style={s.zoomText}>🔍 {(scale.value * 100).toFixed(0)}%</Text>
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000', borderRadius: 16, overflow: 'hidden' },
  canvas: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  placeholderIcon: { fontSize: 52 },
  placeholderText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  placeholderSub: { color: '#6B7280', fontSize: 13 },
  zoomBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  zoomText: { color: '#A78BFA', fontSize: 12, fontWeight: '700' },
});
