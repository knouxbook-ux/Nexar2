// Copyright © Knoux. All rights reserved.
/**
 * 🔷 Retouch Engine — Polygon Selection
 * أداة التحديد بالمضلع
 */
import React, { useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Svg, { Polygon, Circle, Line } from 'react-native-svg';

interface Point { x: number; y: number; }

interface PolygonSelectionProps {
  onSelectionComplete: (points: Point[]) => void;
  width: number;
  height: number;
}

export function PolygonSelection({ onSelectionComplete, width, height }: PolygonSelectionProps) {
  const [points, setPoints] = useState<Point[]>([]);

  const handlePress = (e: any) => {
    const { locationX: x, locationY: y } = e.nativeEvent;
    // Close polygon if clicking near first point
    if (points.length > 2) {
      const first = points[0];
      const dist = Math.sqrt(Math.pow(x - first.x, 2) + Math.pow(y - first.y, 2));
      if (dist < 20) {
        onSelectionComplete(points);
        setPoints([]);
        return;
      }
    }
    setPoints((prev) => [...prev, { x, y }]);
  };

  const pointsString = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={[StyleSheet.absoluteFill, { width, height }]}>
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          {points.length > 1 && (
            <Polygon
              points={pointsString}
              stroke="#EC4899"
              strokeWidth={2}
              fill="rgba(236,72,153,0.15)"
              strokeDasharray="6,3"
            />
          )}
          {points.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={5}
              fill={i === 0 ? '#EC4899' : '#A78BFA'} stroke="#fff" strokeWidth={1.5} />
          ))}
          {points.length > 1 && (
            <Line
              x1={points[points.length-1].x} y1={points[points.length-1].y}
              x2={points[0].x} y2={points[0].y}
              stroke="#EC4899" strokeWidth={1} strokeDasharray="4,4" opacity={0.5} />
          )}
        </Svg>
      </View>
    </TouchableWithoutFeedback>
  );
}
