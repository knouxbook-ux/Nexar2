// Copyright © Knoux. All rights reserved.
/**
 * 🎬 Retouch Engine — Video Enhancer
 * معزز الفيديو بالذكاء الاصطناعي
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface VideoEnhancerProps {
  videoUri?: string;
  onEnhanceComplete?: (enhancedUri: string) => void;
}

const ENHANCE_OPTIONS = [
  { id: 'upscale4k',   icon: '📺', labelAr: 'ترقية إلى 4K',         color: '#8B5CF6', desc: 'AI Upscaling 4x' },
  { id: 'upscale8k',   icon: '🖥️', labelAr: 'ترقية إلى 8K',         color: '#EC4899', desc: 'AI Upscaling 8x' },
  { id: 'stabilize',   icon: '📷', labelAr: 'تثبيت الصورة',          color: '#10B981', desc: 'AI Stabilization' },
  { id: 'denoise',     icon: '🔇', labelAr: 'إزالة التشويش',         color: '#3B82F6', desc: 'Video Denoising' },
  { id: 'colorGrade',  icon: '🎨', labelAr: 'تدريج الألوان',          color: '#F59E0B', desc: 'AI Color Grading' },
  { id: 'slow',        icon: '🐌', labelAr: 'Slow Motion AI',        color: '#06B6D4', desc: 'Frame Interpolation' },
  { id: 'hdrEnhance',  icon: '✨', labelAr: 'تحسين HDR',             color: '#EF4444', desc: 'HDR Tone Mapping' },
  { id: 'sharpness',   icon: '🔍', labelAr: 'تحسين الحدة',           color: '#A855F7', desc: 'Edge Enhancement' },
];

export function VideoEnhancer({ videoUri, onEnhanceComplete }: VideoEnhancerProps) {
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set(['denoise', 'stabilize']));
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleEnhance = async () => {
    if (!videoUri) {
      Alert.alert('⚠️ لا يوجد فيديو', 'يرجى اختيار فيديو أولاً');
      return;
    }
    if (selectedOptions.size === 0) {
      Alert.alert('⚠️', 'اختر خيار تحسين واحد على الأقل');
      return;
    }
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsProcessing(true);
    setProgress(0);

    // Simulate processing
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) { clearInterval(interval); return p; }
        return p + Math.random() * 8;
      });
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setIsProcessing(false);
      onEnhanceComplete?.(videoUri);
      Alert.alert('✅ تم التحسين', `تم تطبيق ${selectedOptions.size} تحسين على الفيديو بنجاح!`);
    }, 3000);
  };

  return (
    <View style={s.container}>
      <LinearGradient colors={['rgba(139,92,246,0.1)', 'transparent']} style={StyleSheet.absoluteFill} />
      <Text style={s.title}>🎬 معزز الفيديو AI</Text>

      <View style={s.grid}>
        {ENHANCE_OPTIONS.map((opt) => {
          const selected = selectedOptions.has(opt.id);
          return (
            <TouchableOpacity key={opt.id} onPress={() => toggleOption(opt.id)} activeOpacity={0.8}
              style={[s.card, selected && { borderColor: opt.color + '80', backgroundColor: opt.color + '15' }]}>
              {selected && <LinearGradient colors={[opt.color + '20', opt.color + '08']} style={StyleSheet.absoluteFill} />}
              <View style={s.cardHeader}>
                <Text style={s.cardIcon}>{opt.icon}</Text>
                {selected && <View style={[s.checkBadge, { backgroundColor: opt.color }]}>
                  <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>✓</Text>
                </View>}
              </View>
              <Text style={[s.cardName, selected && { color: opt.color }]}>{opt.labelAr}</Text>
              <Text style={s.cardDesc}>{opt.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isProcessing && (
        <View style={s.progressContainer}>
          <Text style={s.progressLabel}>⚙️ جاري التحسين... {progress.toFixed(0)}%</Text>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${progress}%` as any }]} />
          </View>
        </View>
      )}

      <TouchableOpacity onPress={handleEnhance} disabled={isProcessing} activeOpacity={0.85}>
        <LinearGradient
          colors={isProcessing ? ['#374151', '#374151'] : ['#7C3AED', '#A855F7']}
          style={s.enhanceBtn}
        >
          {isProcessing
            ? <><ActivityIndicator size="small" color="#fff" /><Text style={s.enhanceBtnTxt}>يعالج...</Text></>
            : <Text style={s.enhanceBtnTxt}>🚀 تحسين الفيديو ({selectedOptions.size})</Text>
          }
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { borderRadius: 16, padding: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(139,92,246,0.25)', gap: 12 },
  title: { color: '#A78BFA', fontSize: 14, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { width: '47%', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', gap: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardIcon: { fontSize: 22 },
  checkBadge: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  cardName: { color: '#f1f0ff', fontSize: 12, fontWeight: '700' },
  cardDesc: { color: '#6B7280', fontSize: 9 },
  progressContainer: { gap: 6 },
  progressLabel: { color: '#A78BFA', fontSize: 12, fontWeight: '700' },
  progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: '#7C3AED' },
  enhanceBtn: { borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  enhanceBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
