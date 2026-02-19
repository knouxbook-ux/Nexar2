// Copyright © Knoux. All rights reserved.
/**
 * 🔍 Retouch Engine — Zoom Controls
 * أدوات التكبير والتصغير
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ZoomControlsProps {
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ZoomControls({ zoom, minZoom = 0.25, maxZoom = 5, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  const pct = Math.round(zoom * 100);

  return (
    <View style={s.container}>
      <LinearGradient colors={['rgba(10,10,20,0.9)', 'rgba(10,10,20,0.8)']} style={StyleSheet.absoluteFill} />
      <TouchableOpacity onPress={onZoomOut} disabled={zoom <= minZoom} style={[s.btn, zoom <= minZoom && s.btnDisabled]}>
        <Text style={[s.btnTxt, zoom <= minZoom && s.disabled]}>➖</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onReset} style={s.zoomLabel}>
        <Text style={s.zoomText}>{pct}%</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onZoomIn} disabled={zoom >= maxZoom} style={[s.btn, zoom >= maxZoom && s.btnDisabled]}>
        <Text style={[s.btnTxt, zoom >= maxZoom && s.disabled]}>➕</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 4 },
  btn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.35 },
  btnTxt: { color: '#A78BFA', fontSize: 16 },
  disabled: { color: '#6B7280' },
  zoomLabel: { paddingHorizontal: 12, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: 'rgba(167,139,250,0.15)' },
  zoomText: { color: '#A78BFA', fontSize: 13, fontWeight: '800' },
});
