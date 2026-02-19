// Copyright © Knoux. All rights reserved.
/**
 * GlassCard — Glassmorphism card component for Knoux Nexar Pro
 * Supports gradient border, glow effects, and badge overlays.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GlassCardProps {
  children?: React.ReactNode;
  onPress?: () => void;
  gradient?: readonly [string, string, ...string[]];
  style?: ViewStyle;
  innerStyle?: ViewStyle;
  /** Show a floating badge at top-right */
  badge?: { label: string; color: string };
  /** Accent glow color at bottom */
  glowColor?: string;
  disabled?: boolean;
}

export interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  color?: string;
  style?: ViewStyle;
}

export interface FeatureRowProps {
  icon: string;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  color?: string;
}

export interface SectionHeaderProps {
  icon: string;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
}

export interface StatusPillProps {
  label: string;
  type?: 'success' | 'warning' | 'error' | 'info' | 'pro';
}

// ── GlassCard ─────────────────────────────────────────────────────────────────

export function GlassCard({
  children,
  onPress,
  gradient,
  style,
  innerStyle,
  badge,
  glowColor,
  disabled,
}: GlassCardProps) {
  const card = (
    <View style={[s.glass, style]}>
      {gradient ? (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
        />
      ) : null}
      {glowColor ? (
        <View style={[s.glow, { backgroundColor: glowColor + '22' }]} />
      ) : null}
      <View style={[s.innerContent, innerStyle]}>{children}</View>
      {badge ? (
        <View style={[s.badge, { backgroundColor: badge.color }]}>
          <Text style={s.badgeText}>{badge.label}</Text>
        </View>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={onPress}
        disabled={disabled}
        style={{ borderRadius: 20 }}
      >
        {card}
      </TouchableOpacity>
    );
  }
  return card;
}

// ── StatCard ──────────────────────────────────────────────────────────────────

export function StatCard({ icon, value, label, color = '#A78BFA', style }: StatCardProps) {
  return (
    <View style={[s.statCard, style]}>
      <Text style={s.statIcon}>{icon}</Text>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ── FeatureRow ────────────────────────────────────────────────────────────────

export function FeatureRow({ icon, title, subtitle, rightElement, onPress, color = '#A78BFA' }: FeatureRowProps) {
  const content = (
    <View style={s.rowWrap}>
      <View style={[s.rowIcon, { backgroundColor: color + '22' }]}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={s.rowText}>
        <Text style={s.rowTitle}>{title}</Text>
        {subtitle ? <Text style={s.rowSub}>{subtitle}</Text> : null}
      </View>
      {rightElement ? <View style={s.rowRight}>{rightElement}</View> : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.75} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

// ── SectionHeader ─────────────────────────────────────────────────────────────

export function SectionHeader({ icon, title, subtitle, rightElement, style }: SectionHeaderProps) {
  return (
    <View style={[s.secHead, style]}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 20 }}>{icon}</Text>
          <Text style={s.secTitle}>{title}</Text>
        </View>
        {subtitle ? <Text style={s.secSub}>{subtitle}</Text> : null}
      </View>
      {rightElement}
    </View>
  );
}

// ── StatusPill ────────────────────────────────────────────────────────────────

const PILL_COLORS: Record<string, { bg: string; text: string }> = {
  success: { bg: '#16a34a33', text: '#4ade80' },
  warning: { bg: '#d9770633', text: '#fbbf24' },
  error:   { bg: '#dc262633', text: '#f87171' },
  info:    { bg: '#0ea5e933', text: '#38bdf8' },
  pro:     { bg: '#7c3aed33', text: '#A78BFA' },
};

export function StatusPill({ label, type = 'info' }: StatusPillProps) {
  const colors = PILL_COLORS[type];
  return (
    <View style={[s.pill, { backgroundColor: colors.bg }]}>
      <Text style={[s.pillText, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────

export function GlassDivider() {
  return <View style={s.divider} />;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  glass: {
    backgroundColor: 'rgba(255,255,255,0.042)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  innerContent: {
    padding: 16,
  },
  glow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    borderRadius: 20,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // StatCard
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    padding: 16,
    gap: 4,
  },
  statIcon:  { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '900', color: '#A78BFA' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.50)', textAlign: 'center' },

  // FeatureRow
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText:  { flex: 1, gap: 2 },
  rowTitle: { color: '#f1f0ff', fontSize: 14, fontWeight: '600' },
  rowSub:   { color: 'rgba(255,255,255,0.45)', fontSize: 12 },
  rowRight: { marginLeft: 8 },

  // SectionHeader
  secHead:  { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  secTitle: { color: '#f1f0ff', fontSize: 18, fontWeight: '800' },
  secSub:   { color: 'rgba(255,255,255,0.50)', fontSize: 13, marginTop: 2 },

  // StatusPill
  pill:     { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { fontSize: 11, fontWeight: '700' },

  // Divider
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginVertical: 4 },
});
