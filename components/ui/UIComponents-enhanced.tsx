/**
 * ═══════════════════════════════════════════════════════════════
 * 🎨 NEXAR PRO - REUSABLE UI COMPONENTS
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// ==================== GRADIENT BUTTON ====================

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  colors?: string[];
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
  colors = ['#a855f7', '#ec4899'],
}) => (
  <TouchableOpacity
    style={[styles.gradientButton, disabled && styles.disabled]}
    onPress={onPress}
    disabled={disabled || loading}
  >
    <LinearGradient
      colors={colors}
      style={styles.gradientButtonInner}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <>
          {icon && <Text style={styles.buttonIcon}>{icon}</Text>}
          <Text style={styles.buttonText}>{title}</Text>
        </>
      )}
    </LinearGradient>
  </TouchableOpacity>
);

// ==================== GLASS CARD ====================

interface GlassCardProps {
  children: React.ReactNode;
  intensity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, intensity = 40 }) => (
  <BlurView intensity={intensity} style={styles.glassCard}>
    <LinearGradient
      colors={['rgba(168, 85, 247, 0.2)', 'rgba(236, 72, 153, 0.2)']}
      style={styles.glassCardGradient}
    >
      {children}
    </LinearGradient>
  </BlurView>
);

// ==================== PROGRESS BAR ====================

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 6,
  color = '#a855f7',
  backgroundColor = 'rgba(168, 85, 247, 0.2)',
}) => (
  <View style={[styles.progressBarContainer, { height, backgroundColor }]}>
    <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: color }]} />
  </View>
);

// ==================== ICON BUTTON ====================

interface IconButtonProps {
  icon: string;
  onPress: () => void;
  size?: number;
  disabled?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 50,
  disabled = false,
}) => (
  <TouchableOpacity
    style={[styles.iconButton, { width: size, height: size, borderRadius: size / 2 }]}
    onPress={onPress}
    disabled={disabled}
  >
    <BlurView intensity={50} style={styles.iconButtonBlur}>
      <Text style={styles.iconButtonText}>{icon}</Text>
    </BlurView>
  </TouchableOpacity>
);

// ==================== BADGE ====================

interface BadgeProps {
  text: string;
  color?: string;
}

export const Badge: React.FC<BadgeProps> = ({ text, color = '#a855f7' }) => (
  <View style={[styles.badge, { backgroundColor: color }]}>
    <Text style={styles.badgeText}>{text}</Text>
  </View>
);

// ==================== STYLES ====================

const styles = StyleSheet.create({
  gradientButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  gradientButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.5,
  },
  glassCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassCardGradient: {
    padding: 20,
  },
  progressBarContainer: {
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  iconButton: {
    overflow: 'hidden',
  },
  iconButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    fontSize: 24,
    color: '#ffffff',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default {
  GradientButton,
  GlassCard,
  ProgressBar,
  IconButton,
  Badge,
};
