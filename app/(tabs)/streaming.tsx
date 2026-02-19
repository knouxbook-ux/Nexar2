// Copyright © Knoux. All rights reserved.
/**
 * KNOUX NEXAR PRO — Live Streaming
 * Glass UI · Connected to StreamingService (RTMP)
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView, Text, View, TouchableOpacity,
  StyleSheet, Animated, Platform, TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { StreamingService } from '@/lib/services/streaming-service';
import type { StreamStatus, StreamQuality } from '@/lib/services/streaming-service';
import { StatusPill } from '@/components/glass-card';

type Platform_ = 'youtube' | 'twitch' | 'tiktok' | 'facebook';

const PLATFORMS: { id: Platform_; label: string; icon: string; color: string; rtmpBase: string }[] = [
  { id: 'youtube',  label: 'YouTube',  icon: '▶️',  color: '#FF0000', rtmpBase: 'rtmp://a.rtmp.youtube.com/live2/' },
  { id: 'twitch',   label: 'Twitch',   icon: '💜',  color: '#9146FF', rtmpBase: 'rtmp://live.twitch.tv/live/' },
  { id: 'tiktok' as Platform_,   label: 'TikTok',   icon: '🎵',  color: '#FF0050', rtmpBase: 'rtmp://push.tiktok.com/live/' },
  { id: 'facebook', label: 'Facebook', icon: '💙',  color: '#1877F2', rtmpBase: 'rtmps://live-api-s.facebook.com/rtmp/' },
];

const QUALITIES: StreamQuality[] = ['480p', '720p', '1080p'];

const STATUS_COLOR: Record<StreamStatus, string> = {
  idle: '#6b7280',
  connecting: '#fbbf24',
  live: '#ef4444',
  paused: '#f97316',
  error: '#ef4444',
  ended: '#6b7280',
};

export default function StreamingScreen() {
  const [status, setStatus] = useState<StreamStatus>('idle');
  const [quality, setQuality] = useState<StreamQuality>('720p');
  const [platform, setPlatform] = useState<Platform_>('youtube');
  const [streamKey, setStreamKey] = useState('');
  const [metrics, setMetrics] = useState({ duration: 0, viewerCount: 0, fps: 60, uploadSpeed: 0, bitrate: 0 });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const livePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const isLive = status === 'live';
    if (isLive) {
      Animated.loop(Animated.sequence([
        Animated.timing(livePulse, { toValue: 1.2, duration: 700, useNativeDriver: true }),
        Animated.timing(livePulse, { toValue: 1.0, duration: 700, useNativeDriver: true }),
      ])).start();
    } else {
      livePulse.stopAnimation(); livePulse.setValue(1);
    }
  }, [status]);

  useEffect(() => {
    const onStatus = (s: StreamStatus) => setStatus(s);
    const onMetrics = (m: any) => setMetrics(m);
    StreamingService.on('statusChanged', onStatus);
    StreamingService.on('metricsUpdated', onMetrics);
    return () => {
      StreamingService.off('statusChanged', onStatus);
      StreamingService.off('metricsUpdated', onMetrics);
    };
  }, []);

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
      : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const handleGo = async () => {
    if (status === 'live' || status === 'connecting') {
      await StreamingService.stopStream();
      return;
    }
    if (!streamKey.trim()) {
      Alert.alert('Stream Key Required', 'Enter your stream key from the platform dashboard.', [{ text: 'OK' }]);
      return;
    }
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const plat = PLATFORMS.find(p => p.id === platform)!;
      await StreamingService.initialize({
        platform,
        streamKey: streamKey.trim(),
        quality,
        frameRate: 60,
        videoBitrate: quality === '1080p' ? 6000 : quality === '720p' ? 4500 : 3000,
        audioBitrate: 128,
        adaptiveBitrate: true,
        lowLatencyMode: true,
      });
      await StreamingService.startStream();
    } catch (err) {
      Alert.alert('Stream Error', err instanceof Error ? err.message : 'Failed to start stream');
    }
  };

  const isLive = status === 'live';
  const isConnecting = status === 'connecting';
  const activePlatform = PLATFORMS.find(p => p.id === platform)!;

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 20 }}>

            {/* ── Header ── */}
            <LinearGradient colors={['#FF4500', '#FF6B35']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
              <View style={{ flex: 1 }}>
                <Text style={s.headerTitle}>📡 Live Streaming</Text>
                <Text style={s.headerSub}>RTMP · YouTube · Twitch · TikTok · Facebook</Text>
              </View>
              <Animated.View style={{ transform: [{ scale: isLive ? livePulse : new Animated.Value(1) }] }}>
                <StatusPill
                  label={isLive ? '🔴 LIVE' : isConnecting ? '⏳ CONNECTING' : '⚪ IDLE'}
                  type={isLive ? 'error' : isConnecting ? 'warning' : 'info'}
                />
              </Animated.View>
            </LinearGradient>

            {/* ── Live Metrics (shown when live) ── */}
            {isLive && (
              <View style={s.liveMetrics}>
                <LinearGradient colors={['rgba(239,68,68,0.15)', 'rgba(239,68,68,0.05)']} style={StyleSheet.absoluteFill} />
                <Text style={s.liveTitle}>🔴 ON AIR</Text>
                <View style={s.metricsGrid}>
                  {[
                    { icon: '⏱', label: 'Duration', value: formatDuration(metrics.duration) },
                    { icon: '👁', label: 'Viewers',  value: metrics.viewerCount.toLocaleString() },
                    { icon: '🎞', label: 'FPS',      value: `${metrics.fps}` },
                    { icon: '📶', label: 'Bitrate',  value: `${(metrics.uploadSpeed / 1000).toFixed(1)} Mbps` },
                  ].map(item => (
                    <View key={item.label} style={s.metricBox}>
                      <Text style={s.metricIcon}>{item.icon}</Text>
                      <Text style={s.metricVal}>{item.value}</Text>
                      <Text style={s.metricLabel}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ── Platform Selector ── */}
            <View style={s.glassCard}>
              <LinearGradient colors={['rgba(255,255,255,0.04)', 'transparent']} style={StyleSheet.absoluteFill} />
              <Text style={s.settingTitle}>Platform</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {PLATFORMS.map((plat) => (
                  <TouchableOpacity
                    key={plat.id}
                    onPress={() => !isLive && setPlatform(plat.id)}
                    disabled={isLive}
                    style={[s.platformBtn, platform === plat.id && { borderColor: plat.color + '80' }]}
                  >
                    {platform === plat.id && (
                      <LinearGradient colors={[plat.color + '25', plat.color + '0a']} style={StyleSheet.absoluteFill} />
                    )}
                    <Text style={s.platformIcon}>{plat.icon}</Text>
                    <Text style={[s.platformLabel, platform === plat.id && { color: plat.color }]}>{plat.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ── Stream Key ── */}
            <View style={s.glassCard}>
              <LinearGradient colors={['rgba(255,255,255,0.04)', 'transparent']} style={StyleSheet.absoluteFill} />
              <Text style={s.settingTitle}>Stream Key</Text>
              <Text style={s.settingDesc}>Get from {activePlatform.label} Studio → Live → Stream Settings</Text>
              <TextInput
                value={streamKey}
                onChangeText={setStreamKey}
                placeholder="Paste your stream key here…"
                placeholderTextColor="rgba(255,255,255,0.25)"
                secureTextEntry
                editable={!isLive}
                style={s.keyInput}
              />
            </View>

            {/* ── Quality ── */}
            <View style={s.glassCard}>
              <LinearGradient colors={['rgba(255,255,255,0.04)', 'transparent']} style={StyleSheet.absoluteFill} />
              <Text style={s.settingTitle}>Quality</Text>
              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                {QUALITIES.map((q) => (
                  <TouchableOpacity
                    key={q}
                    onPress={() => { if (!isLive) { setQuality(q); StreamingService.setQuality(q); } }}
                    disabled={isLive}
                    style={[s.qualityBtn, quality === q && s.qualityBtnActive]}
                  >
                    {quality === q && <LinearGradient colors={['#FF4500', '#FF6B35']} style={StyleSheet.absoluteFill} />}
                    <Text style={[s.qualityTxt, quality === q && { color: '#fff' }]}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ── Go Live Button ── */}
            <TouchableOpacity onPress={handleGo} activeOpacity={0.85} style={s.goBtnWrap}>
              <LinearGradient
                colors={isLive ? ['#ef4444', '#b91c1c'] : isConnecting ? ['#4b5563', '#374151'] : [activePlatform.color, activePlatform.color + 'aa']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.goBtn}>
                <Text style={s.goBtnText}>
                  {isLive ? '⏹  End Stream' : isConnecting ? '⏳  Connecting…' : `🔴  Go Live on ${activePlatform.label}`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* ── Pause (when live) ── */}
            {isLive && (
              <TouchableOpacity onPress={() => StreamingService.pauseStream()} activeOpacity={0.85} style={s.pauseBtnWrap}>
                <Text style={s.pauseBtnText}>⏸  Pause Stream</Text>
              </TouchableOpacity>
            )}

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
  liveMetrics: { borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', overflow: 'hidden' },
  liveTitle: { color: '#f87171', fontSize: 18, fontWeight: '900', letterSpacing: 2, textAlign: 'center', marginBottom: 16 },
  metricsGrid: { flexDirection: 'row', gap: 10 },
  metricBox: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 12 },
  metricIcon: { fontSize: 18, marginBottom: 4 },
  metricVal: { color: '#fff', fontSize: 16, fontWeight: '800' },
  metricLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10, marginTop: 2 },
  glassCard: { borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)', overflow: 'hidden', gap: 12 },
  settingTitle: { color: '#f1f0ff', fontSize: 14, fontWeight: '700' },
  settingDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  platformBtn: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', gap: 4 },
  platformIcon: { fontSize: 20 },
  platformLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600' },
  keyInput: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    padding: 14, color: '#f1f0ff', fontSize: 14, letterSpacing: 2,
  },
  qualityBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  qualityBtnActive: { borderColor: 'transparent' },
  qualityTxt: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },
  goBtnWrap: { borderRadius: 28, overflow: 'hidden' },
  goBtn: { paddingVertical: 18, alignItems: 'center', borderRadius: 28 },
  goBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  pauseBtnWrap: { borderRadius: 18, borderWidth: 1, borderColor: 'rgba(249,115,22,0.4)', paddingVertical: 14, alignItems: 'center' },
  pauseBtnText: { color: '#f97316', fontSize: 15, fontWeight: '700' },
});
