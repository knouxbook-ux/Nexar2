// Copyright © Knoux. All rights reserved.
/**
 * KNOUX NEXAR PRO — Screen Recording
 * Glass UI · Real service connection · Honest native module status
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView, Text, View, TouchableOpacity, Switch,
  StyleSheet, Animated, Platform, Alert, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { screenRecordingService } from '@/lib/services/screen-recording-service';
import type { RecordingStatus } from '@/lib/services/screen-recording-service';
import { StatusPill } from '@/components/glass-card';

// ── IMPORTANT: Set true only after npx expo prebuild + EAS Build ──────────────
const NATIVE_MODULE_LINKED = false;

type Resolution = '720p' | '1080p' | '4K';
type FPS = 24 | 30 | 60;

export default function ScreenRecordingScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolution, setResolution] = useState<Resolution>('1080p');
  const [frameRate, setFrameRate] = useState<FPS>(30);
  const [includeAudio, setIncludeAudio] = useState(true);
  const [status, setStatus] = useState<RecordingStatus>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    fileSize: 0,
    resolution: '1080p',
    frameRate: 30,
    filePath: '',
  });

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  }, [isRecording]);

  useEffect(() => {
    const onProgress = (s: RecordingStatus) => setStatus(s);
    screenRecordingService.on('recordingProgress', onProgress);
    return () => screenRecordingService.off('recordingProgress', onProgress);
  }, []);

  // Service emits duration in SECONDS
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
  };

  const startRecording = async () => {
    setError(null);
    if (!NATIVE_MODULE_LINKED) {
      Alert.alert(
        '⚠️ Native Build Required',
        'Screen recording requires Android MediaProjection (native module).\n\nSteps:\n1. npx expo prebuild\n2. eas build --platform android\n\nDoes NOT work in Expo Go.',
        [{ text: 'Understood' }]
      );
      return;
    }
    try {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await screenRecordingService.startRecording({
        resolution, frameRate, includeAudio,
        audioSource: includeAudio ? 'both' : 'internal',
      });
      setIsRecording(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await screenRecordingService.stopRecording();
      setIsRecording(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop recording');
    }
  };

  const RES: Resolution[] = ['720p', '1080p', '4K'];
  const FPS_LIST: FPS[] = [24, 30, 60];

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 20 }}>

            {/* ── Header ── */}
            <LinearGradient colors={['#7C3AED', '#3B82F6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
              <View style={{ flex: 1 }}>
                <Text style={s.headerTitle}>📹 Screen Recording</Text>
                <Text style={s.headerSub}>HD · 4K · FaceCam · Audio Capture</Text>
              </View>
              <StatusPill
                label={isRecording ? '● REC' : NATIVE_MODULE_LINKED ? 'READY' : 'NEEDS BUILD'}
                type={isRecording ? 'error' : NATIVE_MODULE_LINKED ? 'success' : 'warning'}
              />
            </LinearGradient>

            {/* ── Native Module Warning ── */}
            {!NATIVE_MODULE_LINKED && (
              <View style={s.warnBox}>
                <LinearGradient colors={['rgba(234,179,8,0.15)', 'rgba(234,179,8,0.05)']} style={StyleSheet.absoluteFill} />
                <Text style={s.warnTitle}>⚠️ Native Build Required</Text>
                <Text style={s.warnText}>
                  Screen capture uses Android MediaProjection API. This module requires a native build.{'\n\n'}
                  <Text style={{ color: '#fbbf24' }}>npx expo prebuild → eas build --platform android</Text>
                </Text>
              </View>
            )}

            {/* ── Error Banner ── */}
            {error && (
              <View style={s.errorBox}>
                <Text style={s.errorText}>❌ {error}</Text>
              </View>
            )}

            {/* ── Timer / Status Card ── */}
            <View style={s.statusCard}>
              <LinearGradient
                colors={isRecording ? ['rgba(239,68,68,0.18)', 'rgba(239,68,68,0.05)'] : ['rgba(255,255,255,0.05)', 'transparent']}
                style={StyleSheet.absoluteFill}
              />
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <Text style={[s.timerText, { color: isRecording ? '#f87171' : '#A78BFA' }]}>
                    {formatTime(status.duration)}
                  </Text>
                </Animated.View>
                <Text style={s.timerLabel}>{isRecording ? '⏺ Recording in progress…' : '⏸ Ready to record'}</Text>
              </View>
              <View style={s.statsRow}>
                {[
                  { label: 'File Size', value: formatSize(status.fileSize) },
                  { label: 'Resolution', value: status.resolution },
                  { label: 'FPS', value: `${status.frameRate} fps` },
                ].map((item) => (
                  <View key={item.label} style={s.statBox}>
                    <Text style={s.statVal}>{item.value}</Text>
                    <Text style={s.statLbl}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ── Resolution Selector ── */}
            <View style={s.glassCard}>
              <LinearGradient colors={['rgba(255,255,255,0.04)', 'transparent']} style={StyleSheet.absoluteFill} />
              <Text style={s.settingTitle}>Resolution</Text>
              <View style={s.optionRow}>
                {RES.map((res) => (
                  <TouchableOpacity key={res} onPress={() => !isRecording && setResolution(res)}
                    style={[s.optionBtn, resolution === res && s.optionBtnActive]} disabled={isRecording}>
                    {resolution === res && <LinearGradient colors={['#7C3AED', '#3B82F6']} style={StyleSheet.absoluteFill} />}
                    <Text style={[s.optionTxt, resolution === res && s.optionTxtActive]}>{res}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ── Frame Rate Selector ── */}
            <View style={s.glassCard}>
              <LinearGradient colors={['rgba(255,255,255,0.04)', 'transparent']} style={StyleSheet.absoluteFill} />
              <Text style={s.settingTitle}>Frame Rate</Text>
              <View style={s.optionRow}>
                {FPS_LIST.map((fps) => (
                  <TouchableOpacity key={fps} onPress={() => !isRecording && setFrameRate(fps)}
                    style={[s.optionBtn, frameRate === fps && s.optionBtnActive]} disabled={isRecording}>
                    {frameRate === fps && <LinearGradient colors={['#7C3AED', '#3B82F6']} style={StyleSheet.absoluteFill} />}
                    <Text style={[s.optionTxt, frameRate === fps && s.optionTxtActive]}>{fps} fps</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ── Audio Toggle ── */}
            <View style={[s.glassCard, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
              <LinearGradient colors={['rgba(255,255,255,0.04)', 'transparent']} style={StyleSheet.absoluteFill} />
              <View>
                <Text style={s.settingTitle}>Include Audio</Text>
                <Text style={s.settingDesc}>System sound + microphone</Text>
              </View>
              <Switch value={includeAudio} onValueChange={setIncludeAudio} disabled={isRecording}
                trackColor={{ false: '#27272a', true: '#7C3AED' }} thumbColor={includeAudio ? '#A78BFA' : '#71717a'} />
            </View>

            {/* ── Record Button ── */}
            <TouchableOpacity onPress={isRecording ? stopRecording : startRecording} activeOpacity={0.85} style={s.recordBtnWrap}>
              <LinearGradient
                colors={isRecording ? ['#ef4444', '#b91c1c'] : NATIVE_MODULE_LINKED ? ['#7C3AED', '#3B82F6'] : ['#4b5563', '#374151']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.recordBtn}>
                <Text style={s.recordBtnText}>
                  {isRecording ? '⏹  Stop Recording' : NATIVE_MODULE_LINKED ? '⏺  Start Recording' : '🔒  Requires Native Build'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* ── Service Status Info ── */}
            <View style={s.infoCard}>
              <LinearGradient colors={['rgba(167,139,250,0.08)', 'transparent']} style={StyleSheet.absoluteFill} />
              <Text style={s.infoTitle}>ℹ️ Component Status</Text>
              {[
                { label: 'expo-screen-capture', ok: true, note: 'Installed' },
                { label: 'NexarScreenCapture Native Module', ok: NATIVE_MODULE_LINKED, note: NATIVE_MODULE_LINKED ? 'Linked' : 'Needs: npx expo prebuild' },
                { label: 'FOREGROUND_SERVICE_MEDIA_PROJECTION', ok: true, note: 'Declared in AndroidManifest' },
                { label: 'expo-media-library', ok: true, note: 'Installed — saves recordings' },
                { label: 'expo-file-system', ok: true, note: 'Installed — file path management' },
              ].map((item) => (
                <View key={item.label} style={s.infoRow}>
                  <Text style={s.infoLabel} numberOfLines={1}>{item.label}</Text>
                  <Text style={[s.infoStatus, { color: item.ok ? '#4ade80' : '#fbbf24' }]}>
                    {item.ok ? '✅' : '⚠️'} {item.note}
                  </Text>
                </View>
              ))}
            </View>

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
  warnBox: { borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(234,179,8,0.35)', overflow: 'hidden' },
  warnTitle: { color: '#fbbf24', fontWeight: '700', fontSize: 14, marginBottom: 6 },
  warnText: { color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 18 },
  errorBox: { borderRadius: 14, padding: 14, backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  errorText: { color: '#f87171', fontSize: 13 },
  statusCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)' },
  timerText: { fontSize: 52, fontWeight: '900', letterSpacing: 2 },
  timerLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 4 },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  statBox: { flex: 1, alignItems: 'center', padding: 14 },
  statVal: { color: '#f1f0ff', fontSize: 15, fontWeight: '700' },
  statLbl: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2 },
  glassCard: { borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)', overflow: 'hidden', gap: 12 },
  settingTitle: { color: '#f1f0ff', fontSize: 14, fontWeight: '700' },
  settingDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  optionRow: { flexDirection: 'row', gap: 10 },
  optionBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', overflow: 'hidden' },
  optionBtnActive: { borderColor: 'transparent' },
  optionTxt: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '600' },
  optionTxtActive: { color: '#fff' },
  recordBtnWrap: { borderRadius: 28, overflow: 'hidden' },
  recordBtn: { paddingVertical: 18, alignItems: 'center', borderRadius: 28 },
  recordBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  infoCard: { borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(167,139,250,0.15)', overflow: 'hidden', gap: 10 },
  infoTitle: { color: '#A78BFA', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  infoRow: { gap: 4 },
  infoLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
  infoStatus: { fontSize: 11, fontWeight: '600' },
});
