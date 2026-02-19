// Copyright © Knoux. All rights reserved.
/**
 * 📜 Retouch Engine — History Panel
 * سجل العمليات مع إمكانية التراجع والإعادة
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface HistoryEntry {
  id: string;
  action: string;
  timestamp: number;
  canUndo: boolean;
}

interface HistoryPanelProps {
  history: HistoryEntry[];
  currentIndex: number;
  onUndo: () => void;
  onRedo: () => void;
  onJumpTo: (index: number) => void;
}

export function HistoryPanel({ history, currentIndex, onUndo, onRedo, onJumpTo }: HistoryPanelProps) {
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return (
    <View style={s.container}>
      <LinearGradient colors={['rgba(124,58,237,0.1)', 'transparent']} style={StyleSheet.absoluteFill} />
      <View style={s.header}>
        <Text style={s.title}>📜 السجل</Text>
        <View style={s.btnRow}>
          <TouchableOpacity onPress={onUndo} disabled={!canUndo} style={[s.btn, !canUndo && s.btnDisabled]}>
            <Text style={[s.btnTxt, !canUndo && s.btnTxtDisabled]}>↩️ تراجع</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onRedo} disabled={!canRedo} style={[s.btn, !canRedo && s.btnDisabled]}>
            <Text style={[s.btnTxt, !canRedo && s.btnTxtDisabled]}>↪️ إعادة</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => onJumpTo(index)}
            style={[s.entry, index === currentIndex && s.entryActive]}>
            <Text style={s.entryText}>{item.action}</Text>
            <Text style={s.entryTime}>
              {new Date(item.timestamp).toLocaleTimeString('ar')}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ gap: 4, padding: 8 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)', backgroundColor: 'rgba(255,255,255,0.02)' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  title: { color: '#A78BFA', fontSize: 13, fontWeight: '800' },
  btnRow: { flexDirection: 'row', gap: 8 },
  btn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(167,139,250,0.15)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)' },
  btnDisabled: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' },
  btnTxt: { color: '#A78BFA', fontSize: 11, fontWeight: '700' },
  btnTxtDisabled: { color: 'rgba(255,255,255,0.25)' },
  entry: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.02)', flexDirection: 'row', justifyContent: 'space-between' },
  entryActive: { backgroundColor: 'rgba(167,139,250,0.2)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.4)' },
  entryText: { color: '#d1d5db', fontSize: 12 },
  entryTime: { color: '#6B7280', fontSize: 10 },
});
