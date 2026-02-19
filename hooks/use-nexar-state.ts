// Copyright © Knoux. All rights reserved.
/**
 * useNexarState — Hook مشترك للوصول للحالة العامة لـ Nexar
 * يُستخدم في جميع الشاشات للحصول على:
 * - حالة التسجيل الحالية
 * - حالة البث المباشر
 * - خطة الاشتراك
 * - الإشعارات غير المقروءة
 * - إحصاءات الاستخدام
 */

import { useState, useEffect, useCallback } from 'react';
import { nexarState, NexarGlobalState, nexarEvents, featureGuard, FeatureAccess } from '@/lib/nexar/NexarCore';

export function useNexarState() {
  const [state, setState] = useState<NexarGlobalState>(nexarState.get());

  useEffect(() => {
    const unsubscribe = nexarState.subscribe(setState);
    return unsubscribe;
  }, []);

  const checkFeature = useCallback((featureId: string): FeatureAccess => {
    return featureGuard.check(featureId);
  }, []);

  const canUse = useCallback((featureId: string): boolean => {
    return featureGuard.canUse(featureId);
  }, []);

  return {
    ...state,
    checkFeature,
    canUse,
    isPro: state.subscription === 'pro' || state.subscription === 'premium',
    isPremium: state.subscription === 'premium',
    isLoggedIn: state.userId !== null,
    storagePercent: state.storageLimit > 0
      ? Math.min(100, Math.round((state.storageUsed / state.storageLimit) * 100))
      : 0,
  };
}

// Hook للتفاعل مع أحداث بعينها
export function useNexarEvent(event: string, handler: (payload: any) => void) {
  useEffect(() => {
    const off = nexarEvents.on(event as any, handler);
    return off;
  }, [event, handler]);
}

// Hook لفحص ميزة واحدة بسرعة
export function useFeature(featureId: string) {
  const { subscription } = useNexarState();
  return featureGuard.check(featureId);
}
