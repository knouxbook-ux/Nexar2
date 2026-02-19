// Copyright © Knoux. All rights reserved.
/**
 * 🔔 KNOUX NEXAR PRO — Notifications Center
 * مركز الإشعارات الكامل
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Animated, SafeAreaView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'recording' | 'upload' | 'stream' | 'system' | 'subscription' | 'ai';
  read: boolean;
}

const MOCK_NOTIFS: Notification[] = [
  { id: '1', type: 'recording', title: '📹 تسجيل مكتمل', body: 'تم حفظ تسجيلك بجودة 1080p · 145 MB', time: 'منذ 5 دقائق', read: false },
  { id: '2', type: 'upload',    title: '☁️ رفع مكتمل',    body: 'تم رفع ملفك إلى السحابة بنجاح', time: 'منذ 12 دقيقة', read: false },
  { id: '3', type: 'ai',       title: '🤖 ترجمة جاهزة',  body: 'اكتملت ترجمة الفيديو — اضغط للمعاينة', time: 'منذ 30 دقيقة', read: false },
  { id: '4', type: 'stream',   title: '📡 انتهى البث',    body: 'بثك المباشر على YouTube انتهى · 1.2k مشاهد', time: 'منذ ساعة', read: true },
  { id: '5', type: 'subscription', title: '👑 Pro مفعّل', body: 'تم تفعيل اشتراكك الاحترافي بنجاح!', time: 'منذ يومين', read: true },
  { id: '6', type: 'system',   title: '🆕 تحديث متاح',    body: 'Nexar Pro v3.1 متاح — ميزات جديدة!', time: 'منذ 3 أيام', read: true },
];

const TYPE_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  recording:    { color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)', icon: '📹' },
  upload:       { color: '#10B981', bg: 'rgba(16,185,129,0.15)', icon: '☁️' },
  stream:       { color: '#EF4444', bg: 'rgba(239,68,68,0.15)', icon: '📡' },
  system:       { color: '#3B82F6', bg: 'rgba(59,130,246,0.15)', icon: '⚙️' },
  subscription: { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', icon: '👑' },
  ai:           { color: '#06B6D4', bg: 'rgba(6,182,212,0.15)', icon: '🤖' },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<Notification[]>(MOCK_NOTIFS);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const markRead = (id: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => setNotifs([]);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const renderItem = ({ item, index }: { item: Notification; index: number }) => {
    const cfg = TYPE_CONFIG[item.type];
    return (
      <TouchableOpacity onPress={() => markRead(item.id)} activeOpacity={0.8}>
        <Animated.View style={[
          styles.card,
          !item.read && styles.cardUnread,
          { borderLeftColor: cfg.color, backgroundColor: item.read ? 'rgba(255,255,255,0.02)' : cfg.bg },
        ]}>
          <View style={[styles.iconCircle, { backgroundColor: cfg.color + '25', borderColor: cfg.color + '50' }]}>
            <Text style={{ fontSize: 18 }}>{cfg.icon}</Text>
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[styles.cardTitle, { color: item.read ? '#d1d5db' : '#f1f0ff' }]}>{item.title}</Text>
              {!item.read && <View style={[styles.unreadDot, { backgroundColor: cfg.color }]} />}
            </View>
            <Text style={styles.cardBody} numberOfLines={2}>{item.body}</Text>
            <Text style={styles.cardTime}>{item.time}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#07070f', '#0f0a1a', '#07070f']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={{ color: '#A78BFA', fontSize: 22 }}>←</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>🔔 الإشعارات</Text>
              {unreadCount > 0 && (
                <Text style={styles.headerSub}>{unreadCount} إشعار غير مقروء</Text>
              )}
            </View>
            {unreadCount > 0 ? (
              <TouchableOpacity onPress={markAllRead} style={styles.actionBtn}>
                <Text style={{ color: '#A78BFA', fontSize: 12, fontWeight: '700' }}>قراءة الكل</Text>
              </TouchableOpacity>
            ) : notifs.length > 0 ? (
              <TouchableOpacity onPress={clearAll} style={styles.actionBtn}>
                <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '700' }}>مسح الكل</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* List */}
          {notifs.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 60, marginBottom: 16 }}>🔕</Text>
              <Text style={styles.emptyTitle}>لا توجد إشعارات</Text>
              <Text style={styles.emptySub}>ستظهر هنا إشعاراتك عند وصولها</Text>
            </View>
          ) : (
            <FlatList
              data={notifs}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(10,10,20,0.9)', gap: 12,
  },
  backBtn: { width: 36 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  headerSub: { color: '#A78BFA', fontSize: 11, marginTop: 2 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)' },
  card: {
    flexDirection: 'row', gap: 12, padding: 14,
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderLeftWidth: 3,
  },
  cardUnread: { borderColor: 'rgba(255,255,255,0.12)' },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardBody: { color: '#9CA3AF', fontSize: 12, lineHeight: 17 },
  cardTime: { color: '#6B7280', fontSize: 10 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptySub: { color: '#6B7280', fontSize: 14, textAlign: 'center', marginTop: 8 },
});
