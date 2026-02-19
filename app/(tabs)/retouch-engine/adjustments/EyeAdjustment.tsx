// Copyright © Knoux. All rights reserved.
/**
 * 👁️ Retouch Engine — Eye Adjustment
 * تعديلات العيون الاحترافية
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';

interface EyeAdjustmentProps {
  onChange: (adjustments: Record<string, number>) => void;
}

const EYE_PARAMS = [
  { key: 'enlarge',   labelAr: 'تكبير العيون',     min: 0, max: 1, default: 0.3, icon: '👁️' },
  { key: 'brighten',  labelAr: 'إضاءة بياض العين', min: 0, max: 1, default: 0.2, icon: '✨' },
  { key: 'iris',      labelAr: 'تعزيز القزحية',    min: 0, max: 1, default: 0.4, icon: '🔵' },
  { key: 'lashes',    labelAr: 'تعزيز الرموش',     min: 0, max: 1, default: 0.3, icon: '🖤' },
  { key: 'shadow',    labelAr: 'ظل العيون',         min: 0, max: 1, default: 0.0, icon: '💜' },
  { key: 'redEye',    labelAr: 'إزالة العين الحمراء', min: 0, max: 1, default: 0.9, icon: '🔴' },
];

export function EyeAdjustment({ onChange }: EyeAdjustmentProps) {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(EYE_PARAMS.map((p) => [p.key, p.default]))
  );

  const handleChange = (key: string, value: number) => {
    const newValues = { ...values, [key]: value };
    setValues(newValues);
    onChange(newValues);
  };

  return (
    <View style={s.container}>
      <LinearGradient colors={['rgba(99,102,241,0.1)', 'transparent']} style={StyleSheet.absoluteFill} />
      <Text style={s.title}>👁️ تعديلات العيون</Text>

      {EYE_PARAMS.map((param) => (
        <View key={param.key} style={s.row}>
          <View style={s.labelRow}>
            <Text style={s.icon}>{param.icon}</Text>
            <Text style={s.label}>{param.labelAr}</Text>
            <Text style={s.value}>{(values[param.key] * 100).toFixed(0)}%</Text>
          </View>
          <Slider
            style={{ width: '100%', height: 28 }}
            minimumValue={param.min}
            maximumValue={param.max}
            value={values[param.key]}
            onValueChange={(v) => handleChange(param.key, v)}
            minimumTrackTintColor="#6366F1"
            maximumTrackTintColor="rgba(255,255,255,0.1)"
            thumbTintColor="#818CF8"
          />
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: { borderRadius: 16, padding: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(99,102,241,0.25)', gap: 10 },
  title: { color: '#818CF8', fontSize: 14, fontWeight: '800', marginBottom: 4 },
  row: { gap: 2 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  icon: { fontSize: 14 },
  label: { flex: 1, color: '#d1d5db', fontSize: 12, fontWeight: '600' },
  value: { color: '#818CF8', fontSize: 12, fontWeight: '700', minWidth: 32, textAlign: 'right' },
});
