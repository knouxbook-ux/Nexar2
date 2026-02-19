// Copyright © Knoux. All rights reserved.
/**
 * FeatureGate — مكوّن لحماية الميزات المدفوعة
 * يعرض تحذير الترقية إذا كان المستخدم لا يملك الخطة المطلوبة
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFeature } from '@/hooks/use-nexar-state';

interface FeatureGateProps {
  featureId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ featureId, children, fallback }: FeatureGateProps) {
  const access = useFeature(featureId);
  const router = useRouter();

  if (access.allowed) {
    return <>{children}</>;
  }

  if (fallback) return <>{fallback}</>;

  return (
    <View style={s.container}>
      <LinearGradient
        colors={['rgba(167,139,250,0.15)', 'rgba(167,139,250,0.05)']}
        style={StyleSheet.absoluteFill}
      />
      <Text style={s.icon}>🔒</Text>
      <Text style={s.title}>
        {access.requiredPlan === 'premium' ? 'Premium Feature' : 'Pro Feature'}
      </Text>
      <Text style={s.desc}>{access.reason}</Text>
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/subscriptions')}
        style={s.btn}
      >
        <LinearGradient colors={['#A78BFA', '#8B5CF6']} style={s.btnGrad}>
          <Text style={s.btnText}>
            Upgrade to {access.requiredPlan === 'premium' ? 'Premium 👑' : 'Pro ⚡'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

export function ProBadge({ featureId }: { featureId: string }) {
  const access = useFeature(featureId);
  if (access.allowed) return null;

  const isPremium = access.requiredPlan === 'premium';
  return (
    <View style={[s.badge, { backgroundColor: isPremium ? '#FCD34D22' : '#A78BFA22' }]}>
      <Text style={[s.badgeText, { color: isPremium ? '#FCD34D' : '#A78BFA' }]}>
        {isPremium ? '👑 PREMIUM' : '⚡ PRO'}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    borderRadius: 20, padding: 28, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)',
    overflow: 'hidden', gap: 10,
  },
  icon: { fontSize: 40, marginBottom: 4 },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  desc: { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center' },
  btn: { borderRadius: 20, overflow: 'hidden', marginTop: 8 },
  btnGrad: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '900' },
});
