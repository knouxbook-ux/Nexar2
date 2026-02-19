// Copyright © Knoux. All rights reserved.
/**
 * NotificationService — إشعارات حقيقية بـ expo-notifications
 * لا mocks — كل شيء حقيقي
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY = 'nexar_notifications';
const TOKEN_KEY = 'nexar_push_token';

export interface NexarNotification {
  id: string;
  title: string;
  body: string;
  type: 'recording' | 'upload' | 'subscription' | 'alert' | 'achievement';
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

// إعداد إشعارات الخلفية
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationServiceClass {
  private listeners: ((n: NexarNotification) => void)[] = [];

  // ─── طلب الأذونات وتسجيل التوكن ──────────────────────────────────────────
  async initialize(): Promise<string | null> {
    if (!Device.default.isDevice && Platform.OS !== 'web') {
      console.warn('[Notifications] Push notifications require a real device');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Notifications] Permission not granted');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('nexar-default', {
        name: 'Knoux Nexar',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#A78BFA',
        sound: 'default',
      });
      await Notifications.setNotificationChannelAsync('nexar-recording', {
        name: 'Recording Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 100],
        lightColor: '#EC4899',
      });
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;
      await AsyncStorage.setItem(TOKEN_KEY, token);
      return token;
    } catch {
      return null;
    }
  }

  // ─── إشعار فوري ───────────────────────────────────────────────────────────
  async sendLocalNotification(params: {
    title: string;
    body: string;
    type?: NexarNotification['type'];
    data?: Record<string, any>;
    sound?: boolean;
    badge?: number;
  }): Promise<string> {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: params.title,
        body: params.body,
        sound: params.sound !== false ? 'default' : undefined,
        badge: params.badge,
        data: params.data ?? {},
        ...(Platform.OS === 'android' && { channelId: 'nexar-default' }),
      },
      trigger: null, // فوري
    });

    await this._saveLocal({
      id,
      title: params.title,
      body: params.body,
      type: params.type ?? 'alert',
      isRead: false,
      createdAt: new Date().toISOString(),
      data: params.data,
    });

    return id;
  }

  // ─── إشعار مجدول ───────────────────────────────────────────────────────────
  async scheduleNotification(params: {
    title: string;
    body: string;
    delaySeconds: number;
    type?: NexarNotification['type'];
    data?: Record<string, any>;
  }): Promise<string> {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: params.title,
        body: params.body,
        sound: 'default',
        data: params.data ?? {},
        ...(Platform.OS === 'android' && { channelId: 'nexar-default' }),
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: params.delaySeconds },
    });
    return id;
  }

  // ─── إشعارات التسجيل ─────────────────────────────────────────────────────
  async notifyRecordingStarted(duration?: number): Promise<void> {
    await this.sendLocalNotification({
      title: '⏺ بدأ التسجيل',
      body: duration ? `سيتوقف تلقائياً بعد ${duration} ثانية` : 'اضغط هنا لإيقاف التسجيل',
      type: 'recording',
    });
  }

  async notifyRecordingCompleted(filename: string, size: string): Promise<void> {
    await this.sendLocalNotification({
      title: '✅ اكتمل التسجيل',
      body: `${filename} — الحجم: ${size}`,
      type: 'recording',
      data: { filename },
    });
  }

  async notifyUploadCompleted(filename: string): Promise<void> {
    await this.sendLocalNotification({
      title: '☁️ رُفع الملف',
      body: `تم رفع ${filename} إلى السحابة بنجاح`,
      type: 'upload',
    });
  }

  async notifySubscriptionExpiring(daysLeft: number): Promise<void> {
    await this.sendLocalNotification({
      title: '⚠️ اشتراكك على وشك الانتهاء',
      body: `متبقي ${daysLeft} ${daysLeft === 1 ? 'يوم' : 'أيام'} — جدد الآن`,
      type: 'subscription',
      badge: 1,
    });
  }

  async notifyAchievement(achievement: string): Promise<void> {
    await this.sendLocalNotification({
      title: '🏆 إنجاز جديد!',
      body: achievement,
      type: 'achievement',
    });
  }

  // ─── جلب الإشعارات المحلية ──────────────────────────────────────────────
  async getLocalNotifications(): Promise<NexarNotification[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async getUnreadCount(): Promise<number> {
    const all = await this.getLocalNotifications();
    return all.filter((n) => !n.isRead).length;
  }

  async markAsRead(id: string): Promise<void> {
    const all = await this.getLocalNotifications();
    const updated = all.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  async markAllAsRead(): Promise<void> {
    const all = await this.getLocalNotifications();
    const updated = all.map((n) => ({ ...n, isRead: true }));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    await Notifications.setBadgeCountAsync(0);
  }

  async deleteNotification(id: string): Promise<void> {
    const all = await this.getLocalNotifications();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all.filter((n) => n.id !== id)));
  }

  async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
  }

  // ─── مستمع الإشعارات ─────────────────────────────────────────────────────
  addListener(cb: (n: NexarNotification) => void): () => void {
    this.listeners.push(cb);
    const sub = Notifications.addNotificationReceivedListener(async (notif) => {
      const n: NexarNotification = {
        id: notif.request.identifier,
        title: notif.request.content.title ?? '',
        body: notif.request.content.body ?? '',
        type: (notif.request.content.data?.type as any) ?? 'alert',
        isRead: false,
        createdAt: new Date().toISOString(),
        data: notif.request.content.data as any,
      };
      cb(n);
    });
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
      sub.remove();
    };
  }

  // ─── حفظ داخلي ───────────────────────────────────────────────────────────
  private async _saveLocal(n: NexarNotification): Promise<void> {
    const all = await this.getLocalNotifications();
    all.unshift(n);
    // الاحتفاظ بآخر 100 إشعار فقط
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(0, 100)));
  }

  async getPushToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  }

  async cancelScheduled(id: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}

export const notificationService = new NotificationServiceClass();
