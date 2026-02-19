// Copyright © Knoux. All rights reserved.
/**
 * NexarStatusBar — شريط الحالة الحي
 * يظهر مؤشرات حية: التسجيل، البث، الإشعارات
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useNexarState } from '@/hooks/use-nexar-state';

export function NexarStatusBar() {
  const router = useRouter();
  const { isRecording, isStreaming, currentViewers, unreadNotifications } = useNexarState();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const isActive = isRecording || isStreaming;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  if (!isActive && unreadNotifications === 0) return null;

  return (
    <View style={styles.container}>
      {isRecording && (
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/screen-recording')}
          style={styles.pill}
        >
          <Animated.View style={[styles.dot, { opacity: pulseAnim, backgroundColor: '#EF4444' }]} />
          <Text style={styles.text}>REC</Text>
        </TouchableOpacity>
      )}

      {isStreaming && (
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/streaming')}
          style={[styles.pill, { borderColor: 'rgba(255,68,0,0.4)' }]}
        >
          <Animated.View style={[styles.dot, { opacity: pulseAnim, backgroundColor: '#FF4500' }]} />
          <Text style={styles.text}>LIVE {currentViewers > 0 ? `· ${currentViewers}` : ''}</Text>
        </TouchableOpacity>
      )}

      {unreadNotifications > 0 && (
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/notifications-advanced')}
          style={[styles.pill, { borderColor: 'rgba(167,139,250,0.4)' }]}
        >
          <Text style={[styles.text, { color: '#A78BFA' }]}>
            🔔 {unreadNotifications > 99 ? '99+' : unreadNotifications}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    zIndex: 999,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(10,10,15,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
