// Copyright © Knoux. All rights reserved.
/**
 * KNOUX NEXAR PRO — Visual Effects
 * Glass UI · Connected to EffectsService (FFmpegKit)
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView, Text, View, TouchableOpacity, StyleSheet,
  Animated, Platform, Alert, ActivityIndicator, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { EffectsService } from '@/lib/services/effects-service';
import { StatusPill } from '@/components/glass-card';

const { width } = Dimensions.get('window');

type EffectType = 'particle' | 'chromakey' | 'hdr' | 'colorgrade' | 'blur' | 'glitch' | 'vignette';

interface EffectDef {
  id: string;
  name: string;
  icon: string;
  type: EffectType;
  color: string;
  desc: string;
}

const EFFECTS: EffectDef[] = [
  // Particles
  { id: 'snow',      name: 'Snow',         icon: '❄️',  type: 'particle',   color: '#60a5fa', desc: 'Falling snow particles' },
  { id: 'rain',      name: 'Rain',         icon: '🌧️', type: 'particle',   color: '#3b82f6', desc: 'Realistic rain overlay' },
  { id: 'confetti',  name: 'Confetti',     icon: '🎊',  type: 'particle',   color: '#f472b6', desc: 'Colorful confetti burst' },
  { id: 'sparkles',  name: 'Sparkles',     icon: '✨',  type: 'particle',   color: '#fbbf24', desc: 'Magic sparkle effect' },
  // VFX
  { id: 'chroma',    name: 'Chroma Key',   icon: '🟢',  type: 'chromakey',  color: '#4ade80', desc: 'Green screen removal' },
  { id: 'hdr',       name: 'HDR Boost',    icon: '☀️',  type: 'hdr',        color: '#f97316', desc: 'High dynamic range processing' },
  { id: 'blur',      name: 'Blur FX',      icon: '🌫️', type: 'blur',       color: '#94a3b8', desc: 'Background blur / bokeh' },
  { id: 'glitch',    name: 'Glitch',       icon: '⚡',  type: 'glitch',     color: '#a855f7', desc: 'Digital glitch distortion' },
  { id: 'vignette',  name: 'Vignette',     icon: '⭕',  type: 'vignette',   color: '#6b7280', desc: 'Dark edge vignette' },
  // Color Grades
  { id: 'warm',      name: 'Warm Grade',   icon: '🌅',  type: 'colorgrade', color: '#f97316', desc: 'Warm golden tone' },
  { id: 'cool',      name: 'Cool Grade',   icon: '🧊',  type: 'colorgrade', color: '#38bdf8', desc: 'Cool blue cinematic' },
  { id: 'vintage',   name: 'Vintage',      icon: '📷',  type: 'colorgrade', color: '#a78959', desc: 'Aged film look' },
  { id: 'cinematic', name: 'Cinematic',    icon: '🎬',  type: 'colorgrade', color: '#6366f1', desc: 'Teal & orange grade' },
  { id: 'noir',      name: 'Noir',         icon: '🎭',  type: 'colorgrade', color: '#e2e8f0', desc: 'Black & white high contrast' },
];

const CATEGORIES = [
  { id: 'all',        label: 'All',         icon: '🌟' },
  { id: 'particle',   label: 'Particles',   icon: '✨' },
  { id: 'colorgrade', label: 'Color Grade', icon: '🎨' },
  { id: 'vfx',        label: 'VFX',         icon: '⚡' },
];

export default function EffectsScreen() {
  const [activeEffects, setActiveEffects] = useState<string[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [category, setCategory] = useState('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
      setActiveEffects([]);
    }
  };

  const applyEffect = async (effect: EffectDef) => {
    if (!videoUri) {
      Alert.alert('No Video', 'Please pick a video first using the button above.');
      return;
    }
    if (activeEffects.includes(effect.id)) {
      setActiveEffects(prev => prev.filter(e => e !== effect.id));
      return;
    }
    setProcessingId(effect.id);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      let result;
      if (effect.type === 'particle') {
        result = await EffectsService.applyParticleEffect(videoUri, effect.id);
      } else if (effect.type === 'chromakey') {
        result = await EffectsService.applyChromaKey(videoUri, '#00ff00');
      } else if (effect.type === 'hdr') {
        result = await EffectsService.applyHDR(videoUri);
      } else if (effect.type === 'blur') {
        result = await EffectsService.applyBlur(videoUri, 10);
      } else if (effect.type === 'glitch') {
        result = await EffectsService.applyGlitch(videoUri);
      } else if (effect.type === 'vignette') {
        result = await EffectsService.applyVignette(videoUri, 0.6);
      } else {
        result = await EffectsService.applyColorGrade(videoUri, effect.id);
      }
      if (result && result.effectUri) {
        setVideoUri(result.effectUri);
        setActiveEffects(prev => [...prev, effect.id]);
      }
    } catch (err) {
      Alert.alert('Effect Error', err instanceof Error ? err.message : 'Effect failed. Make sure ffmpeg-kit-react-native is linked (EAS Build required).');
    } finally {
      setProcessingId(null);
    }
  };

  const isVFX = (type: EffectType) => ['chromakey', 'hdr', 'blur', 'glitch', 'vignette'].includes(type);

  const filtered = EFFECTS.filter(e => {
    if (category === 'all') return true;
    if (category === 'vfx') return isVFX(e.type);
    return e.type === category;
  });

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 20 }}>

            {/* ── Header ── */}
            <LinearGradient colors={['#F59E0B', '#EF4444']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
              <View style={{ flex: 1 }}>
                <Text style={s.headerTitle}>✨ Visual Effects</Text>
                <Text style={s.headerSub}>Particles · Color Grade · VFX · FFmpegKit</Text>
              </View>
              <StatusPill label={activeEffects.length > 0 ? `${activeEffects.length} ON` : 'IDLE'} type={activeEffects.length > 0 ? 'pro' : 'info'} />
            </LinearGradient>

            {/* ── Video Picker ── */}
            <TouchableOpacity onPress={pickVideo} activeOpacity={0.85} style={s.pickerBtn}>
              <LinearGradient colors={['rgba(245,158,11,0.15)', 'rgba(245,158,11,0.05)']} style={StyleSheet.absoluteFill} />
              <Text style={s.pickerIcon}>{videoUri ? '🎬' : '📁'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.pickerTitle}>{videoUri ? 'Video Selected' : 'Pick a Video'}</Text>
                <Text style={s.pickerSub} numberOfLines={1}>
                  {videoUri ? videoUri.split('/').pop() : 'Tap to select from your library'}
                </Text>
              </View>
              <Text style={s.pickerArrow}>→</Text>
            </TouchableOpacity>

            {/* ── Active Effects ── */}
            {activeEffects.length > 0 && (
              <View style={s.glassCard}>
                <LinearGradient colors={['rgba(16,185,129,0.12)', 'transparent']} style={StyleSheet.absoluteFill} />
                <Text style={s.settingTitle}>✅ Applied Effects</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {activeEffects.map((id) => {
                    const ef = EFFECTS.find(e => e.id === id);
                    if (!ef) return null;
                    return (
                      <TouchableOpacity key={id} onPress={() => applyEffect(ef)} style={[s.activePill, { borderColor: ef.color + '60' }]}>
                        <LinearGradient colors={[ef.color + '30', ef.color + '18']} style={StyleSheet.absoluteFill} />
                        <Text style={{ color: ef.color, fontSize: 13, fontWeight: '700' }}>{ef.icon} {ef.name} ×</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ── Category Filter ── */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategory(cat.id)}
                  style={[s.catBtn, category === cat.id && s.catBtnActive]}
                >
                  {category === cat.id && <LinearGradient colors={['#7C3AED', '#3B82F6']} style={StyleSheet.absoluteFill} />}
                  <Text style={[s.catTxt, category === cat.id && { color: '#fff' }]}>{cat.icon} {cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Effects Grid ── */}
            <View style={s.effectsGrid}>
              {filtered.map((effect) => {
                const isActive = activeEffects.includes(effect.id);
                const isProcessing = processingId === effect.id;
                return (
                  <TouchableOpacity
                    key={effect.id}
                    onPress={() => applyEffect(effect)}
                    activeOpacity={0.82}
                    style={[s.effectCard, isActive && { borderColor: effect.color + '70' }]}
                    disabled={!!processingId}
                  >
                    {isActive && (
                      <LinearGradient colors={[effect.color + '22', effect.color + '0a']} style={StyleSheet.absoluteFill} />
                    )}
                    {/* Color accent bar */}
                    <View style={[s.effectBar, { backgroundColor: effect.color }]} />
                    <View style={s.effectContent}>
                      <Text style={s.effectIcon}>{effect.icon}</Text>
                      <Text style={[s.effectName, isActive && { color: effect.color }]}>{effect.name}</Text>
                      <Text style={s.effectDesc}>{effect.desc}</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                        <View style={[s.effectTypePill, { backgroundColor: effect.color + '22' }]}>
                          <Text style={[s.effectTypeText, { color: effect.color }]}>{effect.type}</Text>
                        </View>
                        {isProcessing
                          ? <ActivityIndicator size="small" color={effect.color} />
                          : <Text style={{ color: isActive ? effect.color : 'rgba(255,255,255,0.3)', fontSize: 18, fontWeight: '900' }}>{isActive ? '✓' : '+'}</Text>
                        }
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── FFmpeg Status ── */}
            <View style={s.infoCard}>
              <LinearGradient colors={['rgba(167,139,250,0.08)', 'transparent']} style={StyleSheet.absoluteFill} />
              <Text style={s.infoTitle}>⚡ FFmpeg Status</Text>
              {[
                { label: 'ffmpeg-kit-react-native', note: 'Installed — needs EAS Build to link', ok: false },
                { label: 'expo-image-picker',        note: 'Ready — video selection', ok: true },
                { label: 'expo-file-system',         note: 'Ready — output management', ok: true },
                { label: 'Processing mode',          note: 'FFmpegKit.execute() — async pipeline', ok: true },
              ].map(item => (
                <View key={item.label} style={{ gap: 2, marginBottom: 4 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{item.label}</Text>
                  <Text style={{ color: item.ok ? '#4ade80' : '#fbbf24', fontSize: 11, fontWeight: '600' }}>
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

const CARD_W = (width - 52) / 2;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07070f' },
  header: { borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 },
  pickerBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', overflow: 'hidden' },
  pickerIcon: { fontSize: 28 },
  pickerTitle: { color: '#f1f0ff', fontSize: 14, fontWeight: '700' },
  pickerSub: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
  pickerArrow: { color: '#f59e0b', fontSize: 20, fontWeight: '700' },
  glassCard: { borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)', overflow: 'hidden', gap: 12 },
  settingTitle: { color: '#f1f0ff', fontSize: 14, fontWeight: '700' },
  activePill: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, overflow: 'hidden' },
  catBtn: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)' },
  catBtnActive: { borderColor: 'transparent' },
  catTxt: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' },
  effectsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  effectCard: { width: CARD_W, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.03)' },
  effectBar: { height: 3 },
  effectContent: { padding: 14 },
  effectIcon: { fontSize: 28, marginBottom: 8 },
  effectName: { color: '#f1f0ff', fontSize: 14, fontWeight: '700' },
  effectDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 3 },
  effectTypePill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  effectTypeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  infoCard: { borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(167,139,250,0.15)', overflow: 'hidden', gap: 8 },
  infoTitle: { color: '#A78BFA', fontSize: 13, fontWeight: '700', marginBottom: 4 },
});
