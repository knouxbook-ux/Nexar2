// Copyright © Knoux. All rights reserved.
/**
 * KNOUX NEXAR PRO — Home Screen
 * Full glassmorphism design. All cards navigate to real screens.
 */
import React, { useRef, useEffect, useState } from 'react';
import {
  ScrollView, Text, View, TouchableOpacity, Dimensions,
  Animated, StatusBar, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useLanguage } from '@/lib/language-context';
import { GlassCard, StatCard, StatusPill } from '@/components/glass-card';
import { useNexarState } from '@/hooks/use-nexar-state';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

// ── All real routes ───────────────────────────────────────────────────────────
const SECTIONS = [
  {
    icon: '🎨', label: 'Retouch Studio', sub: '85+ AI services',
    route: '/(tabs)/nexar-retouch', gradient: ['#EC4899','#F43F5E'] as const,
    badge: 'NEW', glow: '#EC4899',
  },
  {
    icon: '📹', label: 'Screen Record', sub: '4K · 60fps · Overlay',
    route: '/(tabs)/screen-recording', gradient: ['#8B5CF6','#6D28D9'] as const,
    badge: 'PRO', glow: '#8B5CF6',
  },
  {
    icon: '✂️', label: 'Video Editing', sub: 'Trim · Color · Export',
    route: '/(tabs)/video-editing', gradient: ['#6366F1','#4F46E5'] as const,
    glow: '#6366F1',
  },
  {
    icon: '✨', label: 'VFX Effects', sub: '30+ filters & FX',
    route: '/(tabs)/effects', gradient: ['#F59E0B','#EF4444'] as const,
    glow: '#F59E0B',
  },
  {
    icon: '🎵', label: 'Audio Studio', sub: 'Record · Mix · EQ',
    route: '/(tabs)/audio-recording', gradient: ['#10B981','#059669'] as const,
    glow: '#10B981',
  },
  {
    icon: '🤖', label: 'AI Tools', sub: 'Subtitles · Highlights',
    route: '/(tabs)/ai-features', gradient: ['#06B6D4','#0891B2'] as const,
    badge: 'AI', glow: '#06B6D4',
  },
  {
    icon: '📡', label: 'Live Stream', sub: 'YouTube · Twitch · FB',
    route: '/(tabs)/streaming', gradient: ['#FF4500','#EF4444'] as const,
    glow: '#FF4500',
  },
  {
    icon: '☁️', label: 'Cloud Sync', sub: 'AES-256 encrypted',
    route: '/(tabs)/cloud-sync', gradient: ['#3B82F6','#2563EB'] as const,
    glow: '#3B82F6',
  },
  {
    icon: '📊', label: 'Analytics', sub: 'Sessions · Stats',
    route: '/(tabs)/analytics', gradient: ['#A855F7','#9333EA'] as const,
    glow: '#A855F7',
  },
  {
    icon: '💳', label: 'Subscriptions', sub: 'Free · Pro · Premium',
    route: '/(tabs)/subscriptions', gradient: ['#F97316','#EA580C'] as const,
    glow: '#F97316',
  },
  {
    icon: '🔑', label: 'License Keys', sub: 'Activate & manage',
    route: '/(tabs)/license-keys', gradient: ['#EAB308','#CA8A04'] as const,
    glow: '#EAB308',
  },
  {
    icon: '📷', label: 'Multi-Camera', sub: 'PiP · Dual record',
    route: '/(tabs)/multi-camera', gradient: ['#14B8A6','#0D9488'] as const,
    glow: '#14B8A6',
  },
  {
    icon: '👋', label: 'Gesture Ctrl', sub: 'Swipe · Pinch · Tap',
    route: '/(tabs)/gesture-control', gradient: ['#8B5CF6','#A855F7'] as const,
    glow: '#8B5CF6',
  },
  {
    icon: '💄', label: 'Beauty & Makeup', sub: 'AI face enhance',
    route: '/(tabs)/beauty-makeup', gradient: ['#F472B6','#EC4899'] as const,
    glow: '#F472B6',
  },
  {
    icon: '🎁', label: 'Referrals', sub: 'Earn rewards',
    route: '/(tabs)/referrals', gradient: ['#34D399','#10B981'] as const,
    glow: '#34D399',
  },
  {
    icon: '⭐', label: 'Reviews', sub: 'Ratings & feedback',
    route: '/(tabs)/ratings-reviews', gradient: ['#FBBF24','#F59E0B'] as const,
    glow: '#FBBF24',
  },
];

// ── Quick access row ──────────────────────────────────────────────────────────
const QUICK = [
  { icon: '⚡', label: 'NEXAR', route: '/(tabs)/nexar-dashboard', color: '#A78BFA' },
  { icon: '🔔', label: 'Alerts', route: '/(tabs)/notifications-advanced', color: '#F472B6' },
  { icon: '👤', label: 'Admin', route: '/(tabs)/admin-dashboard', color: '#06B6D4' },
  { icon: '💬', label: 'Chat', route: '/(tabs)/live-chat', color: '#4ade80' },
  { icon: '💳', label: 'Pay', route: '/(tabs)/payment', color: '#FBBF24' },
  { icon: '🛠️', label: 'Dev', route: '/(tabs)/developer', color: '#F87171' },
];

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({ item, index }: { item: typeof SECTIONS[0]; index: number }) {
  const router = useRouter();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1, duration: 400, delay: index * 55, useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(item.route as any);
  };

  return (
    <Animated.View style={{
      width: CARD_W,
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0,1], outputRange: [24, 0] }) }],
    }}>
      <TouchableOpacity activeOpacity={0.8} onPress={handlePress} style={{ borderRadius: 20 }}>
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.10)',
          overflow: 'hidden',
          minHeight: 140,
        }}>
          <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ ...StyleSheet.absoluteFillObject, opacity: 0.18, borderRadius: 20 }}
          />
          {/* Glow blob */}
          <View style={{
            position: 'absolute', bottom: -20, right: -20,
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: item.glow + '33',
          }} />

          <View style={{ padding: 16, flex: 1 }}>
            {item.badge ? (
              <View style={{
                alignSelf: 'flex-start', backgroundColor: item.gradient[0] + 'cc',
                borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8,
              }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>{item.badge}</Text>
              </View>
            ) : <View style={{ height: 23, marginBottom: 8 }} />}
            <Text style={{ fontSize: 30, marginBottom: 8 }}>{item.icon}</Text>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800', lineHeight: 18 }}>{item.label}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 4 }}>{item.sub}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

import { StyleSheet } from 'react-native';

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const { language } = useLanguage();
  const nexar = useNexarState();
  const isAr = language === 'ar';

  return (
    <View style={{ flex: 1, backgroundColor: '#07070f' }}>
      <StatusBar barStyle="light-content" backgroundColor="#07070f" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#13112a', '#07070f']}
          style={{ paddingTop: Platform.OS === 'ios' ? 60 : 44, paddingHorizontal: 20, paddingBottom: 28 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: 'rgba(167,139,250,0.7)', fontSize: 11, fontWeight: '900', letterSpacing: 5 }}>
                KNOUX
              </Text>
              <Text style={{ color: '#fff', fontSize: 34, fontWeight: '900', letterSpacing: 2, marginTop: 2 }}>
                NEXAR PRO
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>
                Professional Media Suite
              </Text>
            </View>
            <StatusPill label="v3.0" type="pro" />
          </View>

          {/* Stats row */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
            <StatCard icon="⚡" value={nexar.isRecording ? '🔴 REC' : '38+'} label={nexar.isRecording ? 'Recording' : 'Services'} style={{ backgroundColor: 'rgba(167,139,250,0.12)', borderColor: 'rgba(167,139,250,0.25)' }} color="#A78BFA" />
            <StatCard icon={nexar.subscription === 'free' ? '🎁' : nexar.subscription === 'pro' ? '⚡' : '👑'} value={nexar.subscription.toUpperCase()} label="Plan" style={{ backgroundColor: 'rgba(236,72,153,0.12)', borderColor: 'rgba(236,72,153,0.25)' }} color="#F472B6" />
            <StatCard icon="🌐" value="3" label="Languages" style={{ backgroundColor: 'rgba(6,182,212,0.12)', borderColor: 'rgba(6,182,212,0.25)' }} color="#22d3ee" />
          </View>
        </LinearGradient>

        {/* ── Quick Access ────────────────────────────────────────────── */}
        <View style={{ marginHorizontal: 16, marginBottom: 8 }}>
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 12 }}>⚡ Quick Access</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {QUICK.map((q, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(q.route as any);
                }}
                activeOpacity={0.78}
                style={{
                  alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: q.color + '40',
                  minWidth: 70,
                }}
              >
                <Text style={{ fontSize: 22, marginBottom: 4 }}>{q.icon}</Text>
                <Text style={{ color: q.color, fontSize: 10, fontWeight: '700' }}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Feature Grid ────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 16 }}>
            🌟 All Features ({SECTIONS.length})
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {SECTIONS.map((item, index) => (
              <FeatureCard key={item.route} item={item} index={index} />
            ))}
          </View>
        </View>

        {/* ── Dev Footer ──────────────────────────────────────────────── */}
        <View style={{ marginHorizontal: 16, marginTop: 28, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)' }}>
          <LinearGradient
            colors={['rgba(139,92,246,0.18)', 'rgba(99,102,241,0.08)']}
            style={{ padding: 24, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 36, marginBottom: 8 }}>👨‍💻</Text>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Eng. Sadek Elgazar</Text>
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 4 }}>Knoux · Abu Dhabi, UAE</Text>
            <TouchableOpacity
              onPress={() => router.push('/about' as any)}
              style={{ marginTop: 16, backgroundColor: '#8B5CF6', paddingHorizontal: 28, paddingVertical: 11, borderRadius: 22 }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Contact Developer</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}
