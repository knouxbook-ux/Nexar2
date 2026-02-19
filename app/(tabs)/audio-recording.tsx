// Copyright © Knoux. All rights reserved.
/**
 * KNOUX NEXAR PRO — Audio Recording
 * Glass UI · Connected to AudioRecordingService (expo-av)
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView, Text, View, TouchableOpacity, Switch,
  StyleSheet, Animated, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { audioRecordingService } from '@/lib/services/audio-recording-service';
import type { AudioRecordingStatus } from '@/lib/services/audio-recording-service';
import { StatusPill } from '@/components/glass-card';
import { useLanguage } from '@/lib/language-context';

type AudioSource = 'microphone' | 'system' | 'both';

const SOURCE_INFO: Record<AudioSource, { icon: string; desc: string }> = {
  microphone: { icon: '🎤', desc: 'External microphone only' },
  system:     { icon: '🔊', desc: 'System audio only' },
  both:       { icon: '🎵', desc: 'Mic + system combined' },
};

export default function AudioRecordingScreen() {
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioSource, setAudioSource] = useState<AudioSource>('microphone');
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [normalization, setNormalization] = useState(true);
  const [status, setStatus] = useState<AudioRecordingStatus>({
    isRecording: false,
    duration: 0,
    level: 0,
    fileSize: 0,
  });

  const levelAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const waveAnims = useRef(Array.from({ length: 12 }, () => new Animated.Value(0.15))).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const onLevel = (s: AudioRecordingStatus) => {
      setStatus(s);
      Animated.timing(levelAnim, { toValue: s.level / 100, duration: 120, useNativeDriver: false }).start();
    };
    audioRecordingService.on('levelUpdate', onLevel);
    return () => audioRecordingService.off('levelUpdate', onLevel);
  }, []);

  // Animate waveform bars when recording
  useEffect(() => {
    if (!isRecording) {
      waveAnims.forEach(a => Animated.timing(a, { toValue: 0.15, duration: 300, useNativeDriver: false }).start());
      return;
    }
    const anims = waveAnims.map((a, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(a, { toValue: Math.random() * 0.8 + 0.2, duration: 200 + i * 30, useNativeDriver: false }),
          Animated.timing(a, { toValue: Math.random() * 0.4 + 0.05, duration: 200 + i * 30, useNativeDriver: false }),
        ])
      )
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, [isRecording]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024, i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
  };

  const startRecording = async () => {
    setError(null);
    try {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await audioRecordingService.startRecording({
        audioSource,
        noiseReduction,
        normalization,
        sampleRate: 48000,
      });
      setIsRecording(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await audioRecordingService.stopRecording();
      setIsRecording(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop recording');
    }
  };

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 20 }}>

            {/* ── Header ── */}
            <LinearGradient colors={['#EF4444', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
              <View style={{ flex: 1 }}>
                <Text style={s.headerTitle}>🎵 Audio Studio</Text>
                <Text style={s.headerSub}>48kHz · Noise Reduction · Normalization</Text>
              </View>
              <StatusPill label={isRecording ? '● REC' : 'READY'} type={isRecording ? 'error' : 'success'} />
            </LinearGradient>

            {/* ── Error Banner ── */}
            {error && (
              <View style={s.errorBox}>
                <Text style={s.errorText}>❌ {error}</Text>
              </View>
            )}

            {/* ── Waveform + Timer ── */}
            <View style={s.statusCard}>
              <LinearGradient
                colors={isRecording ? ['rgba(239,68,68,0.18)', 'rgba(239,68,68,0.05)'] : ['rgba(255,255,255,0.05)', 'transparent']}
                style={StyleSheet.absoluteFill}
              />
              <View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 12 }}>
                <Text style={[s.timerText, { color: isRecording ? '#f87171' : '#A78BFA' }]}>
                  {formatTime(status.duration)}
                </Text>
                <Text style={s.timerLabel}>{isRecording ? '⏺ Recording…' : '⏸ Ready'}</Text>
              </View>

              {/* Waveform bars */}
              <View style={s.waveform}>
                {waveAnims.map((anim, i) => (
                  <Animated.View
                    key={i}
                    style={[s.waveBar, {
                      height: anim.interpolate({ inputRange: [0, 1], outputRange: [4, 48] }),
                      backgroundColor: isRecording
                        ? i % 3 === 0 ? '#f87171' : i % 3 === 1 ? '#A78BFA' : '#60a5fa'
                        : 'rgba(255,255,255,0.15)',
                    }]}
                  />
                ))}
              </View>

              {/* Level bar */}
              <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
                <Text style={s.levelLabel}>Level: {Math.round(status.level)}%</Text>
                <View style={s.levelTrack}>
                  <Animated.View
                    style={[s.levelFill, {
                      width: levelAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                    }]}
                  />
                </View>
              </View>

              <View style={s.statsRow}>
                {[
                  { label: 'File Size', value: formatSize(status.fileSize) },
                  { label: 'Sample Rate', value: '48 kHz' },
                  { label: 'Source', value: SOURCE_INFO[audioSource].icon },
                ].map((item) => (
                  <View key={item.label} style={s.statBox}>
                    <Text style={s.statVal}>{item.value}</Text>
                    <Text style={s.statLbl}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ── Audio Source ── */}
            <View style={s.glassCard}>
              <LinearGradient colors={['rgba(255,255,255,0.04)', 'transparent']} style={StyleSheet.absoluteFill} />
              <Text style={s.settingTitle}>Audio Source</Text>
              <View style={{ gap: 8 }}>
                {(['microphone', 'system', 'both'] as AudioSource[]).map((src) => (
                  <TouchableOpacity
                    key={src}
                    onPress={() => !isRecording && setAudioSource(src)}
                    disabled={isRecording}
                    style={[s.sourceBtn, audioSource === src && s.sourceBtnActive]}
                  >
                    {audioSource === src && (
                      <LinearGradient colors={['rgba(139,92,246,0.25)', 'rgba(139,92,246,0.1)']} style={StyleSheet.absoluteFill} />
                    )}
                    <Text style={s.sourceIcon}>{SOURCE_INFO[src].icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.sourceName, audioSource === src && { color: '#A78BFA' }]}>
                        {src.charAt(0).toUpperCase() + src.slice(1)}
                      </Text>
                      <Text style={s.sourceDesc}>{SOURCE_INFO[src].desc}</Text>
                    </View>
                    {audioSource === src && (
                      <View style={s.checkDot} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ── Processing Options ── */}
            <View style={s.glassCard}>
              <LinearGradient colors={['rgba(255,255,255,0.04)', 'transparent']} style={StyleSheet.absoluteFill} />
              <Text style={s.settingTitle}>Processing</Text>
              {[
                { label: 'Noise Reduction', desc: 'Remove background noise', value: noiseReduction, onChange: setNoiseReduction },
                { label: 'Normalization', desc: 'Equalize audio levels', value: normalization, onChange: setNormalization },
              ].map((opt) => (
                <View key={opt.label} style={s.toggleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.toggleLabel}>{opt.label}</Text>
                    <Text style={s.toggleDesc}>{opt.desc}</Text>
                  </View>
                  <Switch
                    value={opt.value}
                    onValueChange={opt.onChange}
                    disabled={isRecording}
                    trackColor={{ false: '#27272a', true: '#7C3AED' }}
                    thumbColor={opt.value ? '#A78BFA' : '#71717a'}
                  />
                </View>
              ))}
            </View>

            {/* ── Record Button ── */}
            <TouchableOpacity onPress={isRecording ? stopRecording : startRecording} activeOpacity={0.85} style={s.recordBtnWrap}>
              <LinearGradient
                colors={isRecording ? ['#ef4444', '#b91c1c'] : ['#EF4444', '#8B5CF6']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.recordBtn}>
                <Text style={s.recordBtnText}>
                  {isRecording ? '⏹  Stop Recording' : '⏺  Start Recording'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07070f' },
  header: { borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 },
  errorBox: { borderRadius: 14, padding: 14, backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  errorText: { color: '#f87171', fontSize: 13 },
  statusCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)' },
  timerText: { fontSize: 48, fontWeight: '900', letterSpacing: 2 },
  timerLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 4 },
  waveform: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, gap: 4, paddingHorizontal: 24, marginBottom: 8 },
  waveBar: { width: 4, borderRadius: 3, minHeight: 4 },
  levelLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 6 },
  levelTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  levelFill: { height: '100%', backgroundColor: '#A78BFA', borderRadius: 4 },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  statBox: { flex: 1, alignItems: 'center', padding: 14 },
  statVal: { color: '#f1f0ff', fontSize: 15, fontWeight: '700' },
  statLbl: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2 },
  glassCard: { borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)', overflow: 'hidden', gap: 12 },
  settingTitle: { color: '#f1f0ff', fontSize: 14, fontWeight: '700' },
  sourceBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  sourceBtnActive: { borderColor: 'rgba(139,92,246,0.5)' },
  sourceIcon: { fontSize: 22 },
  sourceName: { color: '#f1f0ff', fontSize: 13, fontWeight: '600' },
  sourceDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 1 },
  checkDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#A78BFA' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  toggleLabel: { color: '#f1f0ff', fontSize: 13, fontWeight: '600' },
  toggleDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 1 },
  recordBtnWrap: { borderRadius: 28, overflow: 'hidden' },
  recordBtn: { paddingVertical: 18, alignItems: 'center', borderRadius: 28 },
  recordBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
});
