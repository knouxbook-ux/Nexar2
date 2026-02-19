// Copyright © Knoux. All rights reserved.
/**
 * 🎭 Retouch Engine — Mask Panel
 * لوحة الأقنعة مع أدوات الاختيار
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type MaskTool = 'lasso' | 'polygon' | 'magic' | 'brush' | 'eraser' | 'ai';

interface MaskPanelProps {
  activeTool: MaskTool;
  onToolChange: (tool: MaskTool) => void;
  onApplyMask: () => void;
  onClearMask: () => void;
  onInvertMask: () => void;
}

const TOOLS: { id: MaskTool; icon: string; label: string; labelAr: string }[] = [
  { id: 'lasso',   icon: '🪢', label: 'Lasso',   labelAr: 'لاسو' },
  { id: 'polygon', icon: '🔷', label: 'Polygon',  labelAr: 'مضلع' },
  { id: 'magic',   icon: '✨', label: 'Magic',    labelAr: 'سحري' },
  { id: 'brush',   icon: '🖌️', label: 'Brush',    labelAr: 'فرشاة' },
  { id: 'eraser',  icon: '🧹', label: 'Eraser',   labelAr: 'ممحاة' },
  { id: 'ai',      icon: '🤖', label: 'AI Auto',  labelAr: 'ذكاء AI' },
];

export function MaskPanel({ activeTool, onToolChange, onApplyMask, onClearMask, onInvertMask }: MaskPanelProps) {
  return (
    <View style={s.container}>
      <LinearGradient colors={['rgba(124,58,237,0.12)', 'transparent']} style={StyleSheet.absoluteFill} />
      <Text style={s.title}>🎭 أقنعة التحديد</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
        {TOOLS.map((tool) => (
          <TouchableOpacity key={tool.id} onPress={() => onToolChange(tool.id)}
            style={[s.toolBtn, activeTool === tool.id && s.toolBtnActive]}>
            {activeTool === tool.id && (
              <LinearGradient colors={['#7C3AED', '#A855F7']} style={StyleSheet.absoluteFill} />
            )}
            <Text style={s.toolIcon}>{tool.icon}</Text>
            <Text style={[s.toolLabel, activeTool === tool.id && { color: '#fff' }]}>{tool.labelAr}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.actions}>
        <TouchableOpacity onPress={onApplyMask} style={s.actionBtn}>
          <LinearGradient colors={['#7C3AED', '#A855F7']} style={StyleSheet.absoluteFill} />
          <Text style={s.actionTxt}>✅ تطبيق</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onInvertMask} style={[s.actionBtn, s.actionBtnOutline]}>
          <Text style={[s.actionTxt, { color: '#A78BFA' }]}>🔄 عكس</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClearMask} style={[s.actionBtn, s.actionBtnDanger]}>
          <Text style={[s.actionTxt, { color: '#f87171' }]}>🗑️ مسح</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { borderRadius: 16, padding: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)', gap: 12 },
  title: { color: '#A78BFA', fontSize: 13, fontWeight: '800' },
  toolBtn: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  toolBtnActive: { borderColor: 'transparent' },
  toolIcon: { fontSize: 18 },
  toolLabel: { color: '#9CA3AF', fontSize: 10, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, overflow: 'hidden' },
  actionBtnOutline: { backgroundColor: 'rgba(167,139,250,0.1)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)' },
  actionBtnDanger: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  actionTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
