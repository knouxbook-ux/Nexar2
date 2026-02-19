// Copyright © Knoux. All rights reserved.
/**
 * 🖱️ Retouch Engine — Drag & Drop Handler
 * معالج السحب والإفلات للعناصر
 */
import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

interface DragDropHandlerProps {
  children: React.ReactNode;
  onDrop: (x: number, y: number) => void;
  initialX?: number;
  initialY?: number;
}

export function DragDropHandler({ children, onDrop, initialX = 0, initialY = 0 }: DragDropHandlerProps) {
  const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (e) => {
        const { pageX, pageY } = e.nativeEvent;
        onDrop(pageX, pageY);
        pan.flattenOffset();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[s.draggable, { transform: pan.getTranslateTransform() }]}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  draggable: { position: 'absolute', zIndex: 100 },
});
