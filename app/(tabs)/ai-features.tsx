// Copyright © Knoux. All rights reserved.
/**
 * KNOUX NEXAR PRO — AI Features Screen
 * Real connection to AIService (OpenAI API).
 * Honest degradation: shows API key requirement clearly.
 * All buttons connect to real service methods.
 */
import React, { useState } from 'react';
import {
  ScrollView, Text, View, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import { AIService, AIServiceError } from '@/lib/services/ai-service';
import { useLanguage } from '@/lib/language-context';
import { SectionHeader, StatusPill, GlassDivider } from '@/components/glass-card';

const aiService = AIService.getInstance();

// ── Feature card ──────────────────────────────────────────────────────────────
function AIFeatureCard({
  icon, title, subtitle, onPress, loading, result, resultType = 'text', color = '#06B6D4', requiresKey = true,
}: {
  icon: string; title: string; subtitle: string;
  onPress: () => void; loading: boolean;
  result?: string | number | null;
  resultType?: 'text' | 'count';
  color?: string;
  requiresKey?: boolean;
}) {
  return (
    <View style={[s.featureCard, { borderColor: color + '30' }]}>
      <LinearGradient colors={[color + '18', 'transparent']} style={{ ...StyleSheet.absoluteFillObject, borderRadius: 16 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: color + '22', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 22 }}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.featureTitle}>{title}</Text>
          <Text style={s.featureSub}>{subtitle}</Text>
        </View>
        {requiresKey && <StatusPill label="API KEY" type="warning" />}
      </View>

      {result != null && (
        <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: color, fontSize: 13, lineHeight: 18 }}>
            {resultType === 'count' ? `${result} items found` : String(result)}
          </Text>
        </View>
      )}

      <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.8}>
        <LinearGradient
          colors={loading ? ['#333','#444'] : [color, color + 'cc']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={s.featureBtn}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={s.featureBtnText}>Run</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function AIFeaturesScreen() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [videoPath, setVideoPath] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string | number | null>>({});
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  const handleError = (key: string, err: unknown) => {
    const msg = err instanceof AIServiceError
      ? `[${err.code}] ${err.message}`
      : err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('NO_API_KEY') || msg.includes('API key')) {
      setApiKeyMissing(true);
    }
    Alert.alert('AI Error', msg);
    setResults(r => ({ ...r, [key]: null }));
  };

  const pickVideo = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'video/*' });
      if (!res.canceled && res.assets[0]) {
        setVideoPath(res.assets[0].uri);
      }
    } catch { /* user cancelled */ }
  };

  const runSubtitles = async () => {
    if (!videoPath) { Alert.alert('No video', 'Please select a video file first.'); return; }
    setLoading('subtitles');
    try {
      const subs = await aiService.generateSubtitles({
        videoPath,
        language: isAr ? 'ar' : 'en',
        format: 'srt',
      });
      setResults(r => ({ ...r, subtitles: subs.length }));
    } catch (err) { handleError('subtitles', err); }
    finally { setLoading(null); }
  };

  const runHighlights = async () => {
    if (!videoPath) { Alert.alert('No video', 'Please select a video file first.'); return; }
    setLoading('highlights');
    try {
      const hl = await aiService.detectHighlights({ videoPath, maxHighlights: 5 });
      setResults(r => ({ ...r, highlights: hl.length }));
    } catch (err) { handleError('highlights', err); }
    finally { setLoading(null); }
  };

  const runSceneDetect = async () => {
    if (!videoPath) { Alert.alert('No video', 'Please select a video file first.'); return; }
    setLoading('scenes');
    try {
      const scenes = await aiService.detectScenes({ videoPath });
      setResults(r => ({ ...r, scenes: scenes.length }));
    } catch (err) { handleError('scenes', err); }
    finally { setLoading(null); }
  };

  const runAudioEnhance = async () => {
    if (!videoPath) { Alert.alert('No video', 'Please select a video file first.'); return; }
    setLoading('audio');
    try {
      const outputPath = videoPath.replace(/(\.[^.]+)$/, '_enhanced$1');
      const success = await aiService.enhanceAudio({
        videoPath,
        outputPath,
        removeNoise: true,
        normalizeVolume: true,
        enhanceVoice: true,
      });
      setResults(r => ({ ...r, audio: success ? `✅ Enhanced audio saved` : '❌ Enhancement failed' }));
    } catch (err) { handleError('audio', err); }
    finally { setLoading(null); }
  };

  const runModeration = async () => {
    if (!videoPath) { Alert.alert('No video', 'Please select a video file first.'); return; }
    setLoading('moderation');
    try {
      const mod = await aiService.moderateContent(videoPath);
      const safe = mod.isAppropriate;
      const flags = Object.entries(mod.flags ?? {})
        .filter(([, v]) => (v as number) > 0.5)
        .map(([k]) => k).join(', ');
      setResults(r => ({
        ...r,
        moderation: safe ? `✅ Content is Safe (${Math.round(mod.confidence * 100)}% confidence)` : `⚠️ Issues detected: ${flags || 'check flags'}`,
      }));
    } catch (err) { handleError('moderation', err); }
    finally { setLoading(null); }
  };

  const L = (ar: string, en: string) => isAr ? ar : en;

  const FEATURES = [
    { key: 'subtitles', icon: '📝', title: L('توليد الترجمة','Auto Subtitles'), sub: L('توليد SRT/VTT بالذكاء الاصطناعي','AI-generated SRT/VTT captions'), color: '#06B6D4', run: runSubtitles },
    { key: 'highlights', icon: '⭐', title: L('أبرز المشاهد','Highlight Detection'), sub: L('أفضل اللحظات تلقائياً','Auto-detect best moments'), color: '#F59E0B', run: runHighlights },
    { key: 'scenes', icon: '🎬', title: L('تحليل المشاهد','Scene Detection'), sub: L('تحديد قطع المشاهد','Detect scene cuts & transitions'), color: '#A855F7', run: runSceneDetect },
    { key: 'audio', icon: '🔊', title: L('تحسين الصوت','Audio Enhancement'), sub: L('تقليل الضوضاء AI','AI noise reduction'), color: '#10B981', run: runAudioEnhance },
    { key: 'moderation', icon: '🛡️', title: L('فلترة المحتوى','Content Moderation'), sub: L('كشف المحتوى غير اللائق','Detect inappropriate content'), color: '#EF4444', run: runModeration },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#07070f' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient
          colors={['#0a1628', '#07070f']}
          style={{ paddingTop: Platform.OS === 'ios' ? 60 : 44, paddingHorizontal: 20, paddingBottom: 24 }}
        >
          <Text style={s.headerLabel}>NEXAR</Text>
          <Text style={s.headerTitle}>🤖 {L('أدوات الذكاء الاصطناعي','AI Tools')}</Text>
          <Text style={s.headerSub}>{L('مدعوم بـ OpenAI GPT-4o','Powered by OpenAI GPT-4o')}</Text>
        </LinearGradient>

        <View style={{ paddingHorizontal: 16, gap: 16 }}>

          {/* API Key Warning */}
          {apiKeyMissing && (
            <View style={s.warnBox}>
              <Text style={s.warnTitle}>🔑 OpenAI API Key Required</Text>
              <Text style={s.warnText}>
                AI features require an OpenAI API key. Add it to your{' '}
                <Text style={{ color: '#A78BFA', fontFamily: 'monospace' }}>.env</Text> file:{'\n'}
                <Text style={{ color: '#A78BFA', fontFamily: 'monospace' }}>OPENAI_API_KEY=sk-...</Text>
              </Text>
            </View>
          )}

          {/* Video selector */}
          <View style={s.glassCard}>
            <SectionHeader icon="📂" title={L('اختر ملف الفيديو','Select Video File')} subtitle={L('مطلوب لجميع الميزات','Required for all AI features')} />
            <TouchableOpacity onPress={pickVideo} style={s.pickBtn} activeOpacity={0.8}>
              <Text style={{ fontSize: 20, marginBottom: 6 }}>📂</Text>
              {videoPath ? (
                <Text style={{ color: '#4ade80', fontSize: 13, textAlign: 'center' }} numberOfLines={2}>
                  ✅ {videoPath.split('/').pop()}
                </Text>
              ) : (
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Tap to select video file</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Feature cards */}
          {FEATURES.map(f => (
            <AIFeatureCard
              key={f.key}
              icon={f.icon}
              title={f.title}
              subtitle={f.sub}
              onPress={f.run}
              loading={loading === f.key}
              result={results[f.key] ?? null}
              resultType={f.key === 'audio' || f.key === 'moderation' ? 'text' : 'count'}
              color={f.color}
            />
          ))}

          {/* Info */}
          <View style={[s.glassCard, { borderColor: 'rgba(6,182,212,0.25)' }]}>
            <Text style={{ color: '#22d3ee', fontWeight: '700', marginBottom: 8 }}>ℹ️ Technical Notes</Text>
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 20 }}>
              • Subtitle generation uses <Text style={{ color: '#A78BFA' }}>Whisper API</Text>{'\n'}
              • Highlight detection uses <Text style={{ color: '#A78BFA' }}>GPT-4 Vision</Text>{'\n'}
              • Audio enhancement uses <Text style={{ color: '#A78BFA' }}>FFmpegKit + AI filters</Text>{'\n'}
              • All results stored locally via <Text style={{ color: '#A78BFA' }}>expo-file-system</Text>
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
  },
  featureCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  featureTitle: { color: '#f1f0ff', fontSize: 14, fontWeight: '700' },
  featureSub:   { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  featureBtn: { borderRadius: 12, paddingVertical: 11, alignItems: 'center' },
  featureBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  pickBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
    marginTop: 12,
  },
  warnBox: {
    backgroundColor: 'rgba(251,191,36,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.30)',
    padding: 16,
  },
  warnTitle: { color: '#fbbf24', fontWeight: '800', fontSize: 14, marginBottom: 6 },
  warnText:  { color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 20 },
});
