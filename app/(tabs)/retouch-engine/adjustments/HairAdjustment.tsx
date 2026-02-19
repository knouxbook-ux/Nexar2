// Copyright © Knoux. All rights reserved.
/**
 * 💇 Retouch Engine — Hair Adjustment
 * تعديلات الشعر واللون
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';

const HAIR_COLORS = [
  { name: 'أسود', color: '#1a1a1a' },
  { name: 'بني', color: '#6B4226' },
  { name: 'بني فاتح', color: '#C19A6B' },
  { name: 'أشقر', color: '#F5DEB3' },
  { name: 'أحمر', color: '#8B0000' },
  { name: 'أرجواني', color: '#6B238E' },
  { name: 'أزرق', color: '#1E3A5F' },
  { name: 'وردي', color: '#FF69B4' },
  { name: 'رمادي', color: '#808080' },
];

interface HairAdjustmentProps {
  onChange: (adjustments: Record<string, any>) => void;
}

export function HairAdjustment({ onChange }: HairAdjustmentProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [smoothness, setSmoothness] = useState(0.3);
  const [volume, setVolume] = useState(0.2);
  const [shine, setShine] = useState(0.4);

  const update = (updates: Record<string, any>) => {
    onChange({ color: selectedColor, smoothness, volume, shine, ...updates });
  };

  return (
    <View style={s.container}>
      <LinearGradient colors={['rgba(52,211,153,0.08)', 'transparent']} style={StyleSheet.absoluteFill} />
      <Text style={s.title}>💇 تعديلات الشعر</Text>

      {/* Color */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>🎨 تلوين الشعر</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
          <TouchableOpacity onPress={() => { setSelectedColor(null); update({ color: null }); }}
            style={[s.colorOpt, !selectedColor && s.colorOptActive]}>
            <Text style={{ fontSize: 9, color: '#9CA3AF' }}>طبيعي</Text>
          </TouchableOpacity>
          {HAIR_COLORS.map((hc) => (
            <TouchableOpacity key={hc.color} onPress={() => { setSelectedColor(hc.color); update({ color: hc.color }); }}
              style={[s.colorOpt, { backgroundColor: hc.color }, selectedColor === hc.color && s.colorOptActive]}>
              {selectedColor === hc.color && <Text style={s.check}>✓</Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sliders */}
      {[
        { label: '🌊 نعومة الشعر', value: smoothness, onChange: (v: number) => { setSmoothness(v); update({ smoothness: v }); }, color: '#34D399' },
        { label: '💨 حجم الشعر',   value: volume,     onChange: (v: number) => { setVolume(v);     update({ volume: v }); },     color: '#6EE7B7' },
        { label: '✨ لمعة الشعر',  value: shine,      onChange: (v: number) => { setShine(v);      update({ shine: v }); },      color: '#A7F3D0' },
      ].map((slider, i) => (
        <View key={i} style={s.row}>
          <View style={s.labelRow}>
            <Text style={s.label}>{slider.label}</Text>
            <Text style={[s.val, { color: slider.color }]}>{(slider.value * 100).toFixed(0)}%</Text>
          </View>
          <Slider
            style={{ width: '100%', height: 28 }}
            minimumValue={0} maximumValue={1} value={slider.value}
            onValueChange={slider.onChange}
            minimumTrackTintColor={slider.color}
            maximumTrackTintColor="rgba(255,255,255,0.1)"
            thumbTintColor={slider.color}
          />
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: { borderRadius: 16, padding: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(52,211,153,0.25)', gap: 10 },
  title: { color: '#34D399', fontSize: 14, fontWeight: '800' },
  section: { gap: 6 },
  sectionTitle: { color: '#9CA3AF', fontSize: 11, fontWeight: '700' },
  colorOpt: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  colorOptActive: { borderWidth: 2.5, borderColor: '#fff' },
  check: { color: '#fff', fontSize: 14, fontWeight: '900' },
  row: { gap: 2 },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  label: { flex: 1, color: '#d1d5db', fontSize: 12, fontWeight: '600' },
  val: { fontSize: 12, fontWeight: '700', minWidth: 32, textAlign: 'right' },
});
