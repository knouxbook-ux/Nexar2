// Copyright © Knoux. All rights reserved.
/**
 * 🪢 Retouch Engine — Lasso Selection
 * أداة التحديد بالحرية الكاملة
 */
import React, { useState, useRef } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

interface Point { x: number; y: number; }

interface LassoSelectionProps {
  onSelectionComplete: (points: Point[]) => void;
  width: number;
  height: number;
}

export function LassoSelection({ onSelectionComplete, width, height }: LassoSelectionProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX: x, locationY: y } = e.nativeEvent;
        setPoints([{ x, y }]);
        setIsDrawing(true);
      },
      onPanResponderMove: (e) => {
        const { locationX: x, locationY: y } = e.nativeEvent;
        setPoints((prev) => [...prev, { x, y }]);
      },
      onPanResponderRelease: () => {
        setIsDrawing(false);
        if (points.length > 3) {
          onSelectionComplete(points);
        }
        setPoints([]);
      },
    })
  ).current;

  const pointsString = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View style={[s.container, { width, height }]} {...panResponder.panHandlers}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {points.length > 1 && (
          <Polyline
            points={pointsString}
            stroke="#A78BFA"
            strokeWidth={2}
            fill="rgba(167,139,250,0.15)"
            strokeDasharray="6,3"
          />
        )}
      </Svg>
    </View>
  );
}

const s = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0 },
});
