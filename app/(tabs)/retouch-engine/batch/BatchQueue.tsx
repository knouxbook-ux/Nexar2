// Copyright © Knoux. All rights reserved.
/**
 * 📦 Retouch Engine — Batch Queue
 * قائمة انتظار المعالجة الجماعية
 */
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface BatchItem {
  id: string;
  name: string;
  uri: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress?: number;
}

interface BatchQueueProps {
  items: BatchItem[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onProcessAll: () => void;
  isProcessing: boolean;
}

const STATUS_CONFIG = {
  pending:    { color: '#9CA3AF', icon: '⏳', label: 'في الانتظار' },
  processing: { color: '#F59E0B', icon: '⚙️', label: 'يعالج...' },
  done:       { color: '#10B981', icon: '✅', label: 'مكتمل' },
  error:      { color: '#EF4444', icon: '❌', label: 'خطأ' },
};

export function BatchQueue({ items, onRemove, onClearAll, onProcessAll, isProcessing }: BatchQueueProps) {
  const pendingCount = items.filter((i) => i.status === 'pending').length;
  const doneCount = items.filter((i) => i.status === 'done').length;

  return (
    <View style={s.container}>
      <LinearGradient colors={['rgba(124,58,237,0.1)', 'transparent']} style={StyleSheet.absoluteFill} />

      <View style={s.header}>
        <View>
          <Text style={s.title}>📦 قائمة المعالجة</Text>
          <Text style={s.subtitle}>{items.length} ملف · {doneCount} مكتمل · {pendingCount} في الانتظار</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {items.length > 0 && (
            <TouchableOpacity onPress={onClearAll} style={s.clearBtn}>
              <Text style={{ color: '#f87171', fontSize: 11, fontWeight: '700' }}>مسح الكل</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 8 }}
        renderItem={({ item }) => {
          const cfg = STATUS_CONFIG[item.status];
          return (
            <View style={[s.item, { borderLeftColor: cfg.color }]}>
              <Text style={s.itemIcon}>{cfg.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={[s.itemStatus, { color: cfg.color }]}>{cfg.label}</Text>
                {item.status === 'processing' && item.progress !== undefined && (
                  <View style={s.progressBar}>
                    <View style={[s.progressFill, { width: `${item.progress}%` as any, backgroundColor: cfg.color }]} />
                  </View>
                )}
              </View>
              {item.status !== 'processing' && (
                <TouchableOpacity onPress={() => onRemove(item.id)} style={s.removeBtn}>
                  <Text style={{ color: '#6B7280', fontSize: 16 }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>📂</Text>
            <Text style={s.emptyText}>لا توجد ملفات في القائمة</Text>
          </View>
        }
      />

      {pendingCount > 0 && (
        <TouchableOpacity onPress={onProcessAll} disabled={isProcessing} activeOpacity={0.85}>
          <LinearGradient
            colors={isProcessing ? ['#374151', '#374151'] : ['#7C3AED', '#A855F7']}
            style={s.processBtn}
          >
            {isProcessing
              ? <><ActivityIndicator size="small" color="#fff" /><Text style={s.processBtnTxt}>جاري المعالجة...</Text></>
              : <Text style={s.processBtnTxt}>🚀 معالجة {pendingCount} ملف</Text>
            }
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { borderRadius: 16, padding: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)', gap: 12 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { color: '#A78BFA', fontSize: 14, fontWeight: '800' },
  subtitle: { color: '#6B7280', fontSize: 11, marginTop: 2 },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.1)' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderLeftWidth: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  itemIcon: { fontSize: 18 },
  itemName: { color: '#f1f0ff', fontSize: 13, fontWeight: '600' },
  itemStatus: { fontSize: 11, marginTop: 2 },
  progressBar: { height: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 4 },
  progressFill: { height: 3, borderRadius: 2 },
  removeBtn: { width: 28, alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: 20 },
  emptyText: { color: '#6B7280', fontSize: 13 },
  processBtn: { borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  processBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
