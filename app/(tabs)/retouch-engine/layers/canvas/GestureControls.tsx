// Copyright © Knoux. All rights reserved.
/**
 * 👋 Retouch Engine — Gesture Controls
 * أدوات التحكم بالإيماءات للكانفاس
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GestureControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFlipH?: () => void;
  onFlipV?: () => void;
  currentZoom?: number;
}

export function GestureControls({ onZoomIn, onZoomOut, onReset, onFlipH, onFlipV, currentZoom = 1 }: GestureControlsProps) {
  const controls = [
    { icon: '🔍+', label: 'تكبير', onPress: onZoomIn },
    { icon: '🔍-', label: 'تصغير', onPress: onZoomOut },
    { icon: '↩️', label: 'إعادة', onPress: onReset },
    { icon: '↔️', label: 'عكس أفقي', onPress: onFlipH ?? (() => {}) },
    { icon: '↕️', label: 'عكس رأسي', onPress: onFlipV ?? (() => {}) },
  ];

  return (
    <View style={s.container}>
      <LinearGradient colors={['rgba(10,10,20,0.95)', 'rgba(10,10,20,0.85)']} style={StyleSheet.absoluteFill} />
      {controls.map((ctrl, i) => (
        <TouchableOpacity key={i} onPress={ctrl.onPress} style={s.btn} activeOpacity={0.75}>
          <Text style={s.icon}>{ctrl.icon}</Text>
          <Text style={s.label}>{ctrl.label}</Text>
        </TouchableOpacity>
      ))}
      <View style={s.zoomDisplay}>
        <Text style={s.zoomText}>{(currentZoom * 100).toFixed(0)}%</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  btn: {
    alignItems: 'center', gap: 2, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)',
  },
  icon: { fontSize: 16 },
  label: { color: '#9CA3AF', fontSize: 9 },
  zoomDisplay: {
    marginLeft: 'auto', backgroundColor: 'rgba(167,139,250,0.2)',
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4,
  },
  zoomText: { color: '#A78BFA', fontSize: 12, fontWeight: '800' },
});
