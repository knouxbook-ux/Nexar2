// Copyright © Knoux. All rights reserved.
/**
 * 💋 Retouch Engine — Lip Adjustment
 * تعديلات الشفاه الاحترافية
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';

const LIP_COLORS = [
  '#EF4444', '#E11D48', '#DB2777', '#EC4899', '#F472B6',
  '#9F1239', '#881337', '#7C2D12', '#92400E', '#78350F',
  '#FF8C94', '#FFB7C5', '#FF6B6B', '#C71585', '#8B0000',
];

const LIP_PARAMS = [
  { key: 'plump',    labelAr: 'تكبير الشفاه',   default: 0.2 },
  { key: 'smooth',   labelAr: 'تنعيم الشفاه',   default: 0.5 },
  { key: 'gloss',    labelAr: 'لمعة الشفاه',    default: 0.3 },
  { key: 'contour',  labelAr: 'إبراز الحدود',   default: 0.4 },
];

interface LipAdjustmentProps {
  onChange: (adjustments: Record<string, any>) => void;
}

export function LipAdjustment({ onChange }: LipAdjustmentProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(LIP_PARAMS.map((p) => [p.key, p.default]))
  );

  const handleChange = (key: string, value: number) => {
    const newValues = { ...values, [key]: value };
    setValues(newValues);
    onChange({ ...newValues, color: selectedColor });
  };

  return (
    <View style={s.container}>
      <LinearGradient colors={['rgba(236,72,153,0.1)', 'transparent']} style={StyleSheet.absoluteFill} />
      <Text style={s.title}>💋 تعديلات الشفاه</Text>

      {/* Color Palette */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>🎨 لون الشفاه</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
          <TouchableOpacity onPress={() => { setSelectedColor(null); onChange({ ...values, color: null }); }}
            style={[s.colorBtn, s.clearBtn, !selectedColor && s.colorBtnActive]}>
            <Text style={{ fontSize: 10, color: '#9CA3AF' }}>طبيعي</Text>
          </TouchableOpacity>
          {LIP_COLORS.map((color) => (
            <TouchableOpacity key={color} onPress={() => { setSelectedColor(color); onChange({ ...values, color }); }}
              style={[s.colorBtn, { backgroundColor: color }, selectedColor === color && s.colorBtnActive]}>
              {selectedColor === color && <Text style={s.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sliders */}
      {LIP_PARAMS.map((param) => (
        <View key={param.key} style={s.row}>
          <View style={s.labelRow}>
            <Text style={s.label}>{param.labelAr}</Text>
            <Text style={s.value}>{(values[param.key] * 100).toFixed(0)}%</Text>
          </View>
          <Slider
            style={{ width: '100%', height: 28 }}
            minimumValue={0} maximumValue={1}
            value={values[param.key]}
            onValueChange={(v) => handleChange(param.key, v)}
            minimumTrackTintColor="#EC4899"
            maximumTrackTintColor="rgba(255,255,255,0.1)"
            thumbTintColor="#F472B6"
          />
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: { borderRadius: 16, padding: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(236,72,153,0.25)', gap: 10 },
  title: { color: '#F472B6', fontSize: 14, fontWeight: '800' },
  section: { gap: 8 },
  sectionTitle: { color: '#9CA3AF', fontSize: 11, fontWeight: '700' },
  colorBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  clearBtn: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  colorBtnActive: { borderWidth: 2, borderColor: '#fff' },
  checkmark: { color: '#fff', fontSize: 16, fontWeight: '900' },
  row: { gap: 2 },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  label: { flex: 1, color: '#d1d5db', fontSize: 12, fontWeight: '600' },
  value: { color: '#F472B6', fontSize: 12, fontWeight: '700', minWidth: 32, textAlign: 'right' },
});
