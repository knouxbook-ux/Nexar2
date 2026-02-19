// Copyright © Knoux. All rights reserved.
/**
 * 🎨 Retouch Engine — Preset Panel
 * لوحة الإعدادات المسبقة الاحترافية
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Preset {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  category: 'skin' | 'portrait' | 'beauty' | 'cinematic' | 'custom';
  filters: Record<string, number>;
  isBuiltIn?: boolean;
}

const BUILT_IN_PRESETS: Preset[] = [
  { id: 'natural',    name: 'Natural',     nameAr: 'طبيعي',          icon: '🌿', category: 'skin',      filters: { smooth: 0.3, glow: 0.2, sharpen: 0.4 }, isBuiltIn: true },
  { id: 'glow',       name: 'Glow',        nameAr: 'متألق',          icon: '✨', category: 'beauty',    filters: { smooth: 0.6, glow: 0.7, brightness: 0.3 }, isBuiltIn: true },
  { id: 'portrait',   name: 'Portrait',    nameAr: 'بورتريه',        icon: '📸', category: 'portrait',  filters: { smooth: 0.5, sharpen: 0.3, contrast: 0.2 }, isBuiltIn: true },
  { id: 'cinema',     name: 'Cinematic',   nameAr: 'سينمائي',        icon: '🎬', category: 'cinematic', filters: { contrast: 0.5, saturation: -0.2, temperature: -0.1 }, isBuiltIn: true },
  { id: 'glamour',    name: 'Glamour',     nameAr: 'جلامور',         icon: '💄', category: 'beauty',    filters: { smooth: 0.8, glow: 0.5, lips: 0.6, eyes: 0.5 }, isBuiltIn: true },
  { id: 'fresh',      name: 'Fresh Skin',  nameAr: 'بشرة منتعشة',   icon: '💧', category: 'skin',      filters: { smooth: 0.4, brightness: 0.2, saturation: 0.1 }, isBuiltIn: true },
];

interface PresetPanelProps {
  onApplyPreset: (preset: Preset) => void;
  onSavePreset?: (name: string, filters: Record<string, number>) => void;
}

export function PresetPanel({ onApplyPreset, onSavePreset }: PresetPanelProps) {
  const [presets, setPresets] = useState<Preset[]>(BUILT_IN_PRESETS);
  const [activeCategory, setActiveCategory] = useState<Preset["category"] | 'all'>('all');
  const [showSave, setShowSave] = useState(false);
  const [newName, setNewName] = useState('');

  const categories = ['all', 'skin', 'portrait', 'beauty', 'cinematic', 'custom'] as const;
  const catLabels: Record<string, string> = {
    all: 'الكل', skin: 'البشرة', portrait: 'بورتريه', beauty: 'الجمال', cinematic: 'سينمائي', custom: 'مخصص',
  };

  const filtered = activeCategory === 'all' ? presets : presets.filter((p) => p.category === activeCategory);

  return (
    <View style={s.container}>
      <LinearGradient colors={['rgba(236,72,153,0.08)', 'transparent']} style={StyleSheet.absoluteFill} />
      <Text style={s.title}>🎨 الإعدادات المسبقة</Text>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {categories.map((cat) => (
          <TouchableOpacity key={cat} onPress={() => setActiveCategory(cat)}
            style={[s.catBtn, activeCategory === cat && s.catBtnActive]}>
            {activeCategory === cat && <LinearGradient colors={['#EC4899', '#A855F7']} style={StyleSheet.absoluteFill} />}
            <Text style={[s.catTxt, activeCategory === cat && { color: '#fff' }]}>{catLabels[cat]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Presets Grid */}
      <View style={s.grid}>
        {filtered.map((preset) => (
          <TouchableOpacity key={preset.id} onPress={() => onApplyPreset(preset)} style={s.presetCard} activeOpacity={0.8}>
            <LinearGradient colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']} style={StyleSheet.absoluteFill} />
            <Text style={s.presetIcon}>{preset.icon}</Text>
            <Text style={s.presetName}>{preset.nameAr}</Text>
            {preset.isBuiltIn && <View style={s.builtInBadge}><Text style={s.builtInTxt}>✓</Text></View>}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { borderRadius: 16, padding: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(236,72,153,0.2)', gap: 12 },
  title: { color: '#F472B6', fontSize: 14, fontWeight: '800' },
  catBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  catBtnActive: { borderColor: 'transparent' },
  catTxt: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetCard: {
    width: '30%', alignItems: 'center', padding: 12, borderRadius: 14, gap: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden',
  },
  presetIcon: { fontSize: 24 },
  presetName: { color: '#f1f0ff', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  builtInBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(167,139,250,0.3)', borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  builtInTxt: { color: '#A78BFA', fontSize: 9, fontWeight: '900' },
});
