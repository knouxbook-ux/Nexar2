// Copyright © Knoux. All rights reserved.
/**
 * ⚡ NEXAR CORE v3.0
 * المنسّق المركزي الذي يربط جميع الخدمات ببعضها
 * - EventBus: نظام أحداث عبر الخدمات
 * - SessionManager: إدارة الجلسات الحية
 * - FeatureGuard: حارس الميزات حسب الاشتراك
 * - NexarState: الحالة العامة المشتركة
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ═══════════════════════════════════════════════════════════
// EVENT BUS — نظام الأحداث المشتركة بين جميع الخدمات
// ═══════════════════════════════════════════════════════════

type NexarEventName =
  | 'recording:started'
  | 'recording:stopped'
  | 'recording:paused'
  | 'stream:started'
  | 'stream:stopped'
  | 'stream:viewerUpdate'
  | 'ai:analysisComplete'
  | 'ai:subtitlesGenerated'
  | 'subscription:upgraded'
  | 'subscription:downgraded'
  | 'notification:new'
  | 'auth:loggedIn'
  | 'auth:loggedOut'
  | 'analytics:sessionTrack'
  | 'cloud:uploadComplete'
  | 'cloud:uploadProgress'
  | 'retouch:applied'
  | 'audio:recorded'
  | 'video:exported';

type EventPayload = Record<string, any>;
type EventListener = (payload: EventPayload) => void;

class EventBus {
  private listeners: Map<NexarEventName, EventListener[]> = new Map();

  on(event: NexarEventName, listener: EventListener): () => void {
    const existing = this.listeners.get(event) ?? [];
    this.listeners.set(event, [...existing, listener]);
    return () => this.off(event, listener);
  }

  off(event: NexarEventName, listener: EventListener): void {
    const existing = this.listeners.get(event) ?? [];
    this.listeners.set(event, existing.filter(l => l !== listener));
  }

  emit(event: NexarEventName, payload: EventPayload = {}): void {
    const listeners = this.listeners.get(event) ?? [];
    const enriched = { ...payload, _event: event, _time: Date.now() };
    listeners.forEach(l => {
      try { l(enriched); } catch (e) { console.warn(`[EventBus] Error in listener for ${event}:`, e); }
    });
    // Log all events in dev
    if (__DEV__) console.log(`[NexarEvent] ${event}`, payload);
  }
}

export const nexarEvents = new EventBus();

// ═══════════════════════════════════════════════════════════
// SESSION MANAGER — إدارة جلسات الخدمات الحية
// ═══════════════════════════════════════════════════════════

export type ActiveSession = {
  id: string;
  type: 'recording' | 'stream' | 'audio' | 'ai' | 'retouch';
  startedAt: number;
  duration: number;
  meta: Record<string, any>;
};

const SESSIONS_KEY = '@nexar_active_sessions_v3';

class SessionManager {
  private activeSessions: Map<string, ActiveSession> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  async start(type: ActiveSession['type'], meta: Record<string, any> = {}): Promise<string> {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const session: ActiveSession = {
      id, type,
      startedAt: Date.now(),
      duration: 0,
      meta,
    };
    this.activeSessions.set(id, session);

    // Start duration timer
    const timer = setInterval(() => {
      const s = this.activeSessions.get(id);
      if (s) {
        s.duration = Math.floor((Date.now() - s.startedAt) / 1000);
        this.activeSessions.set(id, s);
      }
    }, 1000);
    this.timers.set(id, timer);

    await this._persist();
    nexarEvents.emit(`${type}:started` as NexarEventName, { sessionId: id, ...meta });
    return id;
  }

  async stop(id: string): Promise<ActiveSession | null> {
    const session = this.activeSessions.get(id);
    if (!session) return null;

    clearInterval(this.timers.get(id));
    this.timers.delete(id);
    this.activeSessions.delete(id);

    const finalSession = {
      ...session,
      duration: Math.floor((Date.now() - session.startedAt) / 1000),
    };

    nexarEvents.emit(`${session.type}:stopped` as NexarEventName, {
      sessionId: id,
      duration: finalSession.duration,
      ...session.meta,
    });

    // Track in analytics
    nexarEvents.emit('analytics:sessionTrack', {
      type: session.type,
      duration: finalSession.duration,
      meta: session.meta,
    });

    await this._persist();
    return finalSession;
  }

  getActive(): ActiveSession[] {
    return Array.from(this.activeSessions.values());
  }

  getById(id: string): ActiveSession | null {
    return this.activeSessions.get(id) ?? null;
  }

  private async _persist() {
    try {
      const data = Array.from(this.activeSessions.values());
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(data));
    } catch {}
  }
}

export const sessionManager = new SessionManager();

// ═══════════════════════════════════════════════════════════
// FEATURE GUARD — حارس الميزات حسب خطة الاشتراك
// ═══════════════════════════════════════════════════════════

export type SubscriptionPlan = 'free' | 'pro' | 'premium';

export interface FeatureAccess {
  allowed: boolean;
  reason?: string;
  requiredPlan?: SubscriptionPlan;
  upgradeRoute: string;
}

const FEATURE_REQUIREMENTS: Record<string, SubscriptionPlan> = {
  // Recording
  'recording.4K': 'premium',
  'recording.8K': 'premium',
  'recording.background': 'pro',
  'recording.60fps': 'pro',
  'recording.120fps': 'premium',
  'recording.unlimited': 'pro',
  // Streaming
  'streaming.youtube': 'pro',
  'streaming.twitch': 'pro',
  'streaming.facebook': 'pro',
  'streaming.4K': 'premium',
  // AI
  'ai.subtitles': 'pro',
  'ai.highlights': 'premium',
  'ai.upscaling': 'premium',
  'ai.sentimentAnalysis': 'premium',
  // Editing
  'editing.colorGrading': 'pro',
  'editing.chromaKey': 'pro',
  'editing.removeWatermark': 'premium',
  // Retouch
  'retouch.full85': 'pro',
  'retouch.bodyShape': 'premium',
  'retouch.virtualMakeup': 'premium',
  // Cloud
  'cloud.5gb': 'pro',
  'cloud.unlimited': 'premium',
  'cloud.autoBackup': 'pro',
  // Advanced
  'multiCamera': 'premium',
  'analytics.advanced': 'pro',
  'branding.custom': 'premium',
};

const PLAN_ORDER: Record<SubscriptionPlan, number> = {
  free: 0,
  pro: 1,
  premium: 2,
};

class FeatureGuard {
  private currentPlan: SubscriptionPlan = 'free';

  setPlan(plan: SubscriptionPlan) {
    this.currentPlan = plan;
    nexarEvents.emit('subscription:upgraded', { plan });
  }

  getPlan(): SubscriptionPlan {
    return this.currentPlan;
  }

  check(featureId: string): FeatureAccess {
    const required = FEATURE_REQUIREMENTS[featureId] ?? 'free';
    const allowed = PLAN_ORDER[this.currentPlan] >= PLAN_ORDER[required];
    return {
      allowed,
      reason: allowed
        ? undefined
        : `This feature requires ${required} plan`,
      requiredPlan: allowed ? undefined : required,
      upgradeRoute: '/(tabs)/subscriptions',
    };
  }

  canUse(featureId: string): boolean {
    return this.check(featureId).allowed;
  }

  // Premium limits
  getRecordingLimit(): number {
    if (this.currentPlan === 'free') return 30 * 60; // 30 minutes in seconds
    return Infinity;
  }

  getMaxResolution(): string {
    if (this.currentPlan === 'free') return '720p';
    if (this.currentPlan === 'pro') return '1080p';
    return '8K';
  }

  getCloudStorage(): number {
    if (this.currentPlan === 'free') return 0;
    if (this.currentPlan === 'pro') return 5 * 1024 * 1024 * 1024; // 5GB
    return Infinity;
  }
}

export const featureGuard = new FeatureGuard();

// ═══════════════════════════════════════════════════════════
// NEXAR STATE — الحالة العامة المشتركة
// ═══════════════════════════════════════════════════════════

const STATE_KEY = '@nexar_global_state_v3';

export interface NexarGlobalState {
  // User
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
  subscription: SubscriptionPlan;
  // Recording
  isRecording: boolean;
  activeRecordingId: string | null;
  totalRecordingsToday: number;
  // Streaming
  isStreaming: boolean;
  activeStreamId: string | null;
  currentViewers: number;
  // Notifications
  unreadNotifications: number;
  // Storage
  storageUsed: number; // bytes
  storageLimit: number; // bytes
  // Usage stats (local, real-time)
  sessionsToday: number;
  totalRecordingTimeSec: number;
  // App state
  lastActivity: number;
  isFirstLaunch: boolean;
  appVersion: string;
}

const DEFAULT_STATE: NexarGlobalState = {
  userId: null,
  userName: null,
  userEmail: null,
  subscription: 'free',
  isRecording: false,
  activeRecordingId: null,
  totalRecordingsToday: 0,
  isStreaming: false,
  activeStreamId: null,
  currentViewers: 0,
  unreadNotifications: 0,
  storageUsed: 0,
  storageLimit: 5 * 1024 * 1024 * 1024,
  sessionsToday: 0,
  totalRecordingTimeSec: 0,
  lastActivity: Date.now(),
  isFirstLaunch: true,
  appVersion: '3.0.0',
};

type StateListener = (state: NexarGlobalState) => void;

class NexarStateManager {
  private state: NexarGlobalState = { ...DEFAULT_STATE };
  private listeners: StateListener[] = [];
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    try {
      const raw = await AsyncStorage.getItem(STATE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        // Merge saved state, keeping defaults for new fields
        this.state = { ...DEFAULT_STATE, ...saved, appVersion: '3.0.0' };
      }
    } catch {}

    // Wire up event listeners
    this._wireEvents();
  }

  private _wireEvents() {
    // Recording events
    nexarEvents.on('recording:started', ({ sessionId }) => {
      this._update({
        isRecording: true,
        activeRecordingId: sessionId,
        lastActivity: Date.now(),
      });
    });

    nexarEvents.on('recording:stopped', ({ duration }) => {
      this._update({
        isRecording: false,
        activeRecordingId: null,
        totalRecordingTimeSec: this.state.totalRecordingTimeSec + (duration ?? 0),
        totalRecordingsToday: this.state.totalRecordingsToday + 1,
        sessionsToday: this.state.sessionsToday + 1,
        lastActivity: Date.now(),
      });
    });

    // Streaming events
    nexarEvents.on('stream:started', ({ sessionId }) => {
      this._update({ isStreaming: true, activeStreamId: sessionId, lastActivity: Date.now() });
    });

    nexarEvents.on('stream:stopped', () => {
      this._update({ isStreaming: false, activeStreamId: null, currentViewers: 0 });
    });

    nexarEvents.on('stream:viewerUpdate', ({ count }) => {
      this._update({ currentViewers: count ?? 0 });
    });

    // Subscription events
    nexarEvents.on('subscription:upgraded', ({ plan }) => {
      this._update({ subscription: plan });
      featureGuard.setPlan(plan);
    });

    // Notification events
    nexarEvents.on('notification:new', () => {
      this._update({ unreadNotifications: this.state.unreadNotifications + 1 });
    });

    // Auth events
    nexarEvents.on('auth:loggedIn', ({ userId, name, email, plan }) => {
      this._update({
        userId, userName: name, userEmail: email,
        subscription: plan ?? 'free',
        isFirstLaunch: false,
      });
      featureGuard.setPlan(plan ?? 'free');
    });

    nexarEvents.on('auth:loggedOut', () => {
      this._update({
        userId: null, userName: null, userEmail: null,
        subscription: 'free', isRecording: false,
        isStreaming: false, unreadNotifications: 0,
      });
      featureGuard.setPlan('free');
    });

    // Cloud events
    nexarEvents.on('cloud:uploadComplete', ({ fileSize }) => {
      this._update({ storageUsed: this.state.storageUsed + (fileSize ?? 0) });
    });
  }

  private async _update(partial: Partial<NexarGlobalState>): Promise<void> {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach(l => { try { l(this.state); } catch {} });
    try {
      await AsyncStorage.setItem(STATE_KEY, JSON.stringify(this.state));
    } catch {}
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.push(listener);
    listener(this.state); // immediate call with current state
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  get(): NexarGlobalState {
    return this.state;
  }

  async setUser(user: { id: number; name?: string; email?: string; plan?: SubscriptionPlan }) {
    nexarEvents.emit('auth:loggedIn', {
      userId: user.id,
      name: user.name ?? null,
      email: user.email ?? null,
      plan: user.plan ?? 'free',
    });
  }

  async markNotificationsRead(count: number) {
    await this._update({
      unreadNotifications: Math.max(0, this.state.unreadNotifications - count),
    });
  }

  async resetDailyStats() {
    await this._update({ totalRecordingsToday: 0, sessionsToday: 0 });
  }
}

export const nexarState = new NexarStateManager();

// ═══════════════════════════════════════════════════════════
// NEXAR CORE — نقطة التهيئة المركزية
// ═══════════════════════════════════════════════════════════

class NexarCoreClass {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    console.log('[NexarCore] Initializing Nexar Pro v3.0...');

    // Initialize global state
    await nexarState.init();

    // Reset daily stats if needed
    const lastActivity = nexarState.get().lastActivity;
    const now = Date.now();
    const isNewDay = (now - lastActivity) > 86400000; // 24 hours
    if (isNewDay) await nexarState.resetDailyStats();

    console.log('[NexarCore] ✅ Initialization complete');
  }

  // Shortcut helpers used across screens
  startRecording(meta?: Record<string, any>): Promise<string> {
    return sessionManager.start('recording', meta);
  }

  stopRecording(id: string): Promise<any> {
    return sessionManager.stop(id);
  }

  startStream(meta?: Record<string, any>): Promise<string> {
    return sessionManager.start('stream', meta);
  }

  stopStream(id: string): Promise<any> {
    return sessionManager.stop(id);
  }

  checkFeature(featureId: string): FeatureAccess {
    return featureGuard.check(featureId);
  }

  getState(): NexarGlobalState {
    return nexarState.get();
  }

  emit(event: NexarEventName, payload?: EventPayload): void {
    nexarEvents.emit(event, payload);
  }
}

export const NexarCore = new NexarCoreClass();
export default NexarCore;
