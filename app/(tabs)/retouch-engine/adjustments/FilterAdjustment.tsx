// Copyright © Knoux. All rights reserved.
/**
 * 🌈 Retouch Engine — Filter Adjustment
 * فلاتر الألوان والمؤثرات الاحترافية
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';

interface Filter { id: string; name: string; nameAr: string; icon: string; gradient: [string, string]; }

const FILTERS: Filter[] = [
  { id: 'none',     name: 'None',      nameAr: 'بدون',      icon: '⬜', gradient: ['#374151', '#1F2937'] },
  { id: 'vivid',    name: 'Vivid',     nameAr: 'نابض',      icon: '🌈', gradient: ['#EC4899', '#8B5CF6'] },
  { id: 'warm',     name: 'Warm',      nameAr: 'دافئ',      icon: '🌅', gradient: ['#F59E0B', '#EF4444'] },
  { id: 'cool',     name: 'Cool',      nameAr: 'بارد',      icon: '❄️', gradient: ['#3B82F6', '#06B6D4'] },
  { id: 'cinema',   name: 'Cinema',    nameAr: 'سينما',     icon: '🎬', gradient: ['#1F2937', '#4B5563'] },
  { id: 'vintage',  name: 'Vintage',   nameAr: 'كلاسيكي',   icon: '📷', gradient: ['#B45309', '#78350F'] },
  { id: 'neon',     name: 'Neon Glow', nameAr: 'نيون',      icon: '💜', gradient: ['#7C3AED', '#EC4899'] },
  { id: 'hdr',      name: 'HDR',       nameAr: 'HDR',       icon: '✨', gradient: ['#F59E0B', '#10B981'] },
  { id: 'noir',     name: 'Film Noir', nameAr: 'أبيض أسود', icon: '🖤', gradient: ['#111827', '#374151'] },
  { id: 'cyberpunk',name: 'Cyberpunk', nameAr: 'سايبربانك', icon: '🤖', gradient: ['#7C3AED', '#06B6D4'] },
];

const COLOR_PARAMS = [
  { key: 'brightness', labelAr: 'السطوع',      color: '#FBBF24', min: -1, max: 1, default: 0 },
  { key: 'contrast',   labelAr: 'التباين',      color: '#F87171', min: -1, max: 1, default: 0 },
  { key: 'saturation', labelAr: 'التشبع',       color: '#34D399', min: -1, max: 1, default: 0 },
  { key: 'temperature',labelAr: 'درجة الحرارة', color: '#F59E0B', min: -1, max: 1, default: 0 },
  { key: 'tint',       labelAr: 'اللون الأخضر', color: '#A78BFA', min: -1, max: 1, default: 0 },
  { key: 'sharpness',  labelAr: 'الحدة',        color: '#60A5FA', min: 0,  max: 1, default: 0.3 },
];

interface FilterAdjustmentProps {
  onChange: (filter: string, colorValues: Record<string, number>) => void;
}

export function FilterAdjustment({ onChange }: FilterAdjustmentProps) {
  const [activeFilter, setActiveFilter] = useState('none');
  const [colorValues, setColorValues] = useState<Record<string, number>>(
    Object.fromEntries(COLOR_PARAMS.map((p) => [p.key, p.default]))
  );

  const handleFilterSelect = (filter: string) => {
    setActiveFilter(filter);
    onChange(filter, colorValues);
  };

  const handleColorChange = (key: string, value: number) => {
    const newValues = { ...colorValues, [key]: value };
    setColorValues(newValues);
    onChange(activeFilter, newValues);
  };

  return (
    <View style={s.container}>
      <LinearGradient colors={['rgba(245,158,11,0.08)', 'transparent']} style={StyleSheet.absoluteFill} />
      <Text style={s.title}>🌈 الفلاتر والألوان</Text>

      {/* Filter Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {FILTERS.map((filter) => (
          <TouchableOpacity key={filter.id} onPress={() => handleFilterSelect(filter.id)}
            style={[s.filterBtn, activeFilter === filter.id && s.filterBtnActive]}>
            <LinearGradient colors={filter.gradient} style={StyleSheet.absoluteFill} />
            <Text style={s.filterIcon}>{filter.icon}</Text>
            <Text style={s.filterName}>{filter.nameAr}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Color Adjustments */}
      <Text style={s.sectionTitle}>🎨 ضبط الألوان</Text>
      {COLOR_PARAMS.map((param) => (
        <View key={param.key} style={s.row}>
          <View style={s.labelRow}>
            <Text style={s.label}>{param.labelAr}</Text>
            <Text style={[s.value, { color: param.color }]}>
              {colorValues[param.key] >= 0 ? '+' : ''}{(colorValues[param.key] * 100).toFixed(0)}
            </Text>
          </View>
          <Slider
            style={{ width: '100%', height: 28 }}
            minimumValue={param.min} maximumValue={param.max}
            value={colorValues[param.key]}
            onValueChange={(v) => handleColorChange(param.key, v)}
            minimumTrackTintColor={param.color}
            maximumTrackTintColor="rgba(255,255,255,0.1)"
            thumbTintColor={param.color}
          />
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: { borderRadius: 16, padding: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)', gap: 10 },
  title: { color: '#FBBF24', fontSize: 14, fontWeight: '800' },
  filterBtn: { width: 70, alignItems: 'center', padding: 10, borderRadius: 14, overflow: 'hidden', gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  filterBtnActive: { borderColor: '#fff', borderWidth: 2 },
  filterIcon: { fontSize: 20 },
  filterName: { color: '#fff', fontSize: 9, fontWeight: '700', textAlign: 'center' },
  sectionTitle: { color: '#9CA3AF', fontSize: 11, fontWeight: '700', marginTop: 4 },
  row: { gap: 2 },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  label: { flex: 1, color: '#d1d5db', fontSize: 12, fontWeight: '600' },
  value: { fontSize: 12, fontWeight: '800', minWidth: 32, textAlign: 'right' },
});
