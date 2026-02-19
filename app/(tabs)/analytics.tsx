// Copyright © Knoux. All rights reserved.
/**
 * KNOUX NEXAR PRO — Analytics Screen
 * Connected to real AnalyticsService (AsyncStorage + Vexo).
 * No fake data generation — reads actual stored sessions.
 */
import React, { useState, useEffect } from 'react';
import {
  ScrollView, Text, View, StyleSheet, TouchableOpacity, Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnalyticsService } from '@/lib/services/analytics-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '@/lib/language-context';
import { StatCard, SectionHeader, StatusPill } from '@/components/glass-card';
import { useNexarState } from '@/hooks/use-nexar-state';

const { width } = Dimensions.get('window');

// ── Simple bar chart (no external dependency needed) ─────────────────────────
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
      <View style={{ height: '100%', width: `${pct * 100}%`, backgroundColor: color, borderRadius: 4 }} />
    </View>
  );
}

function BarChart({ data, color = '#A78BFA' }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <View style={{ gap: 10 }}>
      {data.map((d, i) => (
        <View key={i} style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{d.label}</Text>
            <Text style={{ color, fontSize: 12, fontWeight: '700' }}>{d.value}</Text>
          </View>
          <MiniBar value={d.value} max={max} color={color} />
        </View>
      ))}
    </View>
  );
}

export default function AnalyticsScreen() {
  const { language } = useLanguage();
  const nexar = useNexarState();
  const isAr = language === 'ar';

  const [summary, setSummary] = useState({
    totalSessions: 0,
    totalTime: '0s',
    totalSize: '0 B',
    avgSession: '0s',
    successRate: 100,
  });
  const [weeklyData, setWeeklyData] = useState<{ label: string; value: number }[]>([]);
  const [typeData, setTypeData] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const raw = AnalyticsService.getTotalStats();
      setSummary({
        totalSessions: raw.totalSessions + nexar.sessionsToday,
        totalTime: raw.totalTime,
        totalSize: raw.totalSize,
        avgSession: raw.averageSessionTime,
        successRate: raw.successRate,
      });

      // Weekly approximation from daily stats
      const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      const daily = await AnalyticsService.getWeeklyStats?.() ?? [];
      if (daily.length) {
        setWeeklyData(daily.map((d: any, i: number) => ({ label: days[i] ?? `D${i+1}`, value: d.totalSessions ?? 0 })));
      } else {
        // No data — show zeros honestly
        setWeeklyData(days.map(d => ({ label: d, value: 0 })));
      }

      // Type breakdown from real local analytics sessions
      try {
        const rawSessions = await AsyncStorage.getItem('nexar_analytics_sessions');
        if (rawSessions) {
          const sessions = JSON.parse(rawSessions) as any[];
          const counts: Record<string, number> = {
            Screen: 0, Audio: 0, Video: 0, Stream: 0, Retouch: 0, AI: 0,
          };
          sessions.forEach((s) => {
            if (s.recordingType === 'screen') counts['Screen']++;
            else if (s.recordingType === 'audio') counts['Audio']++;
            else if (s.recordingType === 'video') counts['Video']++;
            else if (s.recordingType === 'stream') counts['Stream']++;
            else if (s.recordingType === 'retouch') counts['Retouch']++;
            else if (s.recordingType === 'ai') counts['AI']++;
          });
          setTypeData(Object.entries(counts).map(([label, value]) => ({ label, value })));
        } else {
          setTypeData([
            { label: 'Screen', value: 0 }, { label: 'Audio', value: 0 },
            { label: 'Video', value: 0 }, { label: 'Stream', value: 0 },
            { label: 'Retouch', value: 0 }, { label: 'AI', value: 0 },
          ]);
        }
      } catch {
        setTypeData([
          { label: 'Screen', value: 0 }, { label: 'Audio', value: 0 },
          { label: 'Video', value: 0 }, { label: 'Stream', value: 0 },
          { label: 'Retouch', value: 0 }, { label: 'AI', value: 0 },
        ]);
      }
    } catch (err) {
      console.error('[Analytics] Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const L = (ar: string, en: string) => isAr ? ar : en;

  return (
    <View style={{ flex: 1, backgroundColor: '#07070f' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient
          colors={['#0f0e1a', '#07070f']}
          style={{ paddingTop: Platform.OS === 'ios' ? 60 : 44, paddingHorizontal: 20, paddingBottom: 24 }}
        >
          <Text style={s.headerLabel}>NEXAR</Text>
          <Text style={s.headerTitle}>📊 {L('التحليلات','Analytics')}</Text>
          <Text style={s.headerSub}>{L('إحصائيات وتقارير الجلسات الحقيقية','Real session statistics & insights')}</Text>
        </LinearGradient>

        <View style={{ paddingHorizontal: 16, gap: 16 }}>

          {/* No data notice */}
          {!loading && summary.totalSessions === 0 && (
            <View style={s.emptyBox}>
              <Text style={s.emptyIcon}>📭</Text>
              <Text style={s.emptyTitle}>{L('لا توجد جلسات بعد','No sessions yet')}</Text>
              <Text style={s.emptySub}>{L('ابدأ التسجيل لرؤية الإحصائيات هنا','Start recording to see your stats here')}</Text>
            </View>
          )}

          {/* Stats grid */}
          <View style={s.glassCard}>
            <SectionHeader icon="⚡" title={L('ملخص سريع','Quick Summary')} />
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
              <StatCard icon="🎬" value={String(summary.totalSessions)} label={L('الجلسات','Sessions')} color="#A78BFA" />
              <StatCard icon="✅" value={`${summary.successRate}%`} label={L('نجاح','Success')} color="#4ade80" />
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <StatCard icon="⏱️" value={summary.totalTime} label={L('إجمالي الوقت','Total Time')} color="#22d3ee" />
              <StatCard icon="💾" value={summary.totalSize} label={L('الحجم الكلي','Total Size')} color="#fbbf24" />
            </View>
          </View>

          {/* Weekly chart */}
          <View style={s.glassCard}>
            <SectionHeader icon="📅" title={L('نشاط الأسبوع','Weekly Activity')} subtitle={L('آخر 7 أيام','Last 7 days')} />
            <BarChart data={weeklyData} color="#A78BFA" />
            {summary.totalSessions === 0 && (
              <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center', marginTop: 12 }}>
                {L('سيظهر النشاط بعد بدء الجلسات','Activity will appear after you start sessions')}
              </Text>
            )}
          </View>

          {/* Type breakdown */}
          <View style={s.glassCard}>
            <SectionHeader icon="🎨" title={L('حسب النوع','By Recording Type')} />
            <BarChart data={typeData} color="#F472B6" />
          </View>

          {/* Metrics */}
          <View style={s.glassCard}>
            <SectionHeader icon="📈" title={L('المقاييس','Metrics')} />
            {[
              { label: L('متوسط الجلسة','Avg Session Duration'), value: summary.avgSession },
              { label: L('إجمالي الجلسات','Total Sessions'), value: String(summary.totalSessions) },
              { label: L('نسبة النجاح','Success Rate'), value: `${summary.successRate}%` },
              { label: L('التخزين المستخدم','Storage Used'), value: summary.totalSize },
            ].map(m => (
              <View key={m.label} style={s.metricRow}>
                <Text style={s.metricLabel}>{m.label}</Text>
                <Text style={s.metricValue}>{m.value}</Text>
              </View>
            ))}
          </View>

          {/* Data source note */}
          <View style={[s.glassCard, { borderColor: 'rgba(6,182,212,0.25)' }]}>
            <Text style={{ color: '#22d3ee', fontWeight: '700', marginBottom: 6 }}>ℹ️ Data Source</Text>
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 20 }}>
              Statistics are read from{' '}
              <Text style={{ color: '#A78BFA' }}>AsyncStorage</Text> via{' '}
              <Text style={{ color: '#A78BFA' }}>AnalyticsService</Text>.
              Remote analytics are reported via{' '}
              <Text style={{ color: '#A78BFA' }}>Vexo</Text> in production builds.
            </Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  headerLabel: { color: 'rgba(167,139,250,0.7)', fontSize: 11, fontWeight: '900', letterSpacing: 5 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 4 },
  headerSub:   { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: 20,
    overflow: 'hidden',
  },
  emptyBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon:  { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptySub:   { color: 'rgba(255,255,255,0.45)', fontSize: 13, textAlign: 'center' },
  metricRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  metricLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 14 },
  metricValue: { color: '#f1f0ff', fontSize: 14, fontWeight: '700' },
});
