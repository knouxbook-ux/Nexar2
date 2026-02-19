// Copyright © Knoux. All rights reserved.
/**
 * AdvancedNotificationsService - Smart notification system with scheduling and personalization
 */

export type NotificationType =
  | "recording_started"
  | "recording_completed"
  | "upload_progress"
  | "new_feature"
  | "subscription_reminder"
  | "referral_reward"
  | "system_update"
  | "promotional"
  | "reminder"
  | "achievement";

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  actionUrl?: string;
  priority: "low" | "normal" | "high";
}

export interface ScheduledNotification {
  id: string;
  userId: string;
  template: NotificationTemplate;
  scheduledTime: number;
  isActive: boolean;
  frequency?: "once" | "daily" | "weekly" | "monthly";
  endDate?: number;
  sentCount: number;
  lastSentTime?: number;
}

export interface UserNotificationPreferences {
  userId: string;
  enableNotifications: boolean;
  enableSoundNotifications: boolean;
  enableVibration: boolean;
  quietHoursStart?: number; // 0-23
  quietHoursEnd?: number; // 0-23
  notificationTypes: {
    [key in NotificationType]?: boolean;
  };
  subscriptionTier: "free" | "pro" | "premium";
}

export interface NotificationHistory {
  id: string;
  userId: string;
  notification: ScheduledNotification;
  sentTime: number;
  opened: boolean;
  openedTime?: number;
  actionTaken?: string;
}

class AdvancedNotificationsServiceClass {
  private templates: Map<string, NotificationTemplate> = new Map();
  private scheduledNotifications: Map<string, ScheduledNotification[]> = new Map();
  private userPreferences: Map<string, UserNotificationPreferences> = new Map();
  private notificationHistory: Map<string, NotificationHistory[]> = new Map();
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    const templates: NotificationTemplate[] = [
      {
        id: "template_recording_started",
        type: "recording_started",
        title: "Recording Started",
        body: "Your recording has started. Tap to view details.",
        priority: "high",
      },
      {
        id: "template_recording_completed",
        type: "recording_completed",
        title: "Recording Completed",
        body: "Your recording is ready. Tap to edit or share.",
        priority: "high",
      },
      {
        id: "template_upload_progress",
        type: "upload_progress",
        title: "Upload Progress",
        body: "Your file is being uploaded to the cloud.",
        priority: "normal",
      },
      {
        id: "template_new_feature",
        type: "new_feature",
        title: "New Feature Available",
        body: "Check out our latest features designed for you.",
        priority: "normal",
      },
      {
        id: "template_subscription_reminder",
        type: "subscription_reminder",
        title: "Upgrade to Premium",
        body: "Unlock unlimited features with Premium subscription.",
        priority: "normal",
      },
      {
        id: "template_referral_reward",
        type: "referral_reward",
        title: "Referral Reward Earned",
        body: "You earned a commission from your referral!",
        priority: "high",
      },
      {
        id: "template_system_update",
        type: "system_update",
        title: "App Update Available",
        body: "Update now to get the latest improvements.",
        priority: "normal",
      },
      {
        id: "template_achievement",
        type: "achievement",
        title: "Achievement Unlocked",
        body: "Congratulations! You've reached a new milestone.",
        priority: "normal",
      },
    ];

    templates.forEach((template) => {
      this.templates.set(template.id, template);
    });
  }

  initializeUserPreferences(userId: string, subscriptionTier: string): void {
    const preferences: UserNotificationPreferences = {
      userId,
      enableNotifications: true,
      enableSoundNotifications: true,
      enableVibration: true,
      quietHoursStart: 22,
      quietHoursEnd: 8,
      notificationTypes: {
        recording_started: true,
        recording_completed: true,
        upload_progress: true,
        new_feature: true,
        subscription_reminder: subscriptionTier === "free",
        referral_reward: true,
        system_update: true,
        promotional: subscriptionTier === "free",
        reminder: true,
        achievement: true,
      },
      subscriptionTier: subscriptionTier as "free" | "pro" | "premium",
    };

    this.userPreferences.set(userId, preferences);
  }

  getUserPreferences(userId: string): UserNotificationPreferences | undefined {
    return this.userPreferences.get(userId);
  }

  updateUserPreferences(
    userId: string,
    updates: Partial<UserNotificationPreferences>
  ): void {
    const preferences = this.userPreferences.get(userId);
    if (preferences) {
      Object.assign(preferences, updates);
      this.emit("preferencesUpdated", { userId, preferences });
    }
  }

  scheduleNotification(
    userId: string,
    templateId: string,
    scheduledTime: number,
    frequency?: "once" | "daily" | "weekly" | "monthly",
    endDate?: number
  ): ScheduledNotification | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    const preferences = this.userPreferences.get(userId);
    if (!preferences || !preferences.notificationTypes[template.type]) {
      return null; // User has disabled this notification type
    }

    const notification: ScheduledNotification = {
      id: `notif_${Date.now()}`,
      userId,
      template,
      scheduledTime,
      isActive: true,
      frequency,
      endDate,
      sentCount: 0,
    };

    if (!this.scheduledNotifications.has(userId)) {
      this.scheduledNotifications.set(userId, []);
    }
    this.scheduledNotifications.get(userId)!.push(notification);

    this.emit("notificationScheduled", { notification });
    return notification;
  }

  getScheduledNotifications(userId: string): ScheduledNotification[] {
    return this.scheduledNotifications.get(userId) || [];
  }

  cancelNotification(notificationId: string, userId: string): void {
    const notifications = this.scheduledNotifications.get(userId);
    if (notifications) {
      const index = notifications.findIndex((n) => n.id === notificationId);
      if (index !== -1) {
        notifications[index].isActive = false;
        this.emit("notificationCancelled", { notificationId });
      }
    }
  }

  sendNotification(userId: string, notification: ScheduledNotification): void {
    const preferences = this.userPreferences.get(userId);
    if (!preferences || !preferences.enableNotifications) return;

    // Check quiet hours
    const now = new Date();
    const currentHour = now.getHours();
    if (
      preferences.quietHoursStart !== undefined &&
      preferences.quietHoursEnd !== undefined
    ) {
      if (
        currentHour >= preferences.quietHoursStart ||
        currentHour < preferences.quietHoursEnd
      ) {
        if (notification.template.priority !== "high") {
          return; // Skip non-high priority notifications during quiet hours
        }
      }
    }

    // Record in history
    const history: NotificationHistory = {
      id: `hist_${Date.now()}`,
      userId,
      notification,
      sentTime: Date.now(),
      opened: false,
    };

    if (!this.notificationHistory.has(userId)) {
      this.notificationHistory.set(userId, []);
    }
    this.notificationHistory.get(userId)!.push(history);

    notification.sentCount++;
    notification.lastSentTime = Date.now();

    this.emit("notificationSent", { notification, history });
  }

  markNotificationAsOpened(notificationId: string, userId: string): void {
    const history = this.notificationHistory.get(userId);
    if (history) {
      const item = history.find((h) => h.id === notificationId);
      if (item) {
        item.opened = true;
        item.openedTime = Date.now();
        this.emit("notificationOpened", { notificationId });
      }
    }
  }

  getNotificationHistory(userId: string, limit: number = 20): NotificationHistory[] {
    const history = this.notificationHistory.get(userId) || [];
    return history.sort((a, b) => b.sentTime - a.sentTime).slice(0, limit);
  }

  getNotificationStats(userId: string): {
    totalSent: number;
    totalOpened: number;
    openRate: number;
  } {
    const history = this.notificationHistory.get(userId) || [];
    const totalSent = history.length;
    const totalOpened = history.filter((h) => h.opened).length;
    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;

    return { totalSent, totalOpened, openRate };
  }

  getSmartNotificationSuggestions(userId: string): ScheduledNotification[] {
    const preferences = this.userPreferences.get(userId);
    if (!preferences) return [];

    const suggestions: ScheduledNotification[] = [];

    // Suggest subscription reminder for free tier users
    if (preferences.subscriptionTier === "free") {
      const template = this.templates.get("template_subscription_reminder");
      if (template) {
        const suggestion: ScheduledNotification = {
          id: `suggest_${Date.now()}`,
          userId,
          template,
          scheduledTime: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
          isActive: false,
          frequency: "weekly",
          sentCount: 0,
        };
        suggestions.push(suggestion);
      }
    }

    return suggestions;
  }

  on(event: string, cb: Function): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(cb);
  }

  off(event: string, cb: Function): void {
    this.listeners.set(
      event,
      (this.listeners.get(event) || []).filter((c) => c !== cb)
    );
  }

  private emit(event: string, data: any): void {
    (this.listeners.get(event) || []).forEach((cb) => cb(data));
  }
}

export const AdvancedNotificationsService = new AdvancedNotificationsServiceClass();
