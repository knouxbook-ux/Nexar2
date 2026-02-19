// Copyright © Knoux. All rights reserved.
/**
 * AnalyticsService — تحليلات حقيقية
 * vexo-analytics + AsyncStorage + إحصاءات محلية دقيقة
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Vexo from 'vexo-analytics';

const SESSIONS_KEY = 'nexar_analytics_sessions';
const DAILY_KEY = 'nexar_analytics_daily';
const METRICS_KEY = 'nexar_analytics_metrics';

export interface SessionStats {
  sessionId: string;
  startTime: number;
  endTime?: number;
  duration: number;
  recordingType: 'screen' | 'audio' | 'video' | 'stream' | 'retouch' | 'ai';
  fileSize: number;
  resolution?: string;
  frameRate?: number;
  viewers?: number;
  completedSuccessfully: boolean;
  feature?: string;
}

export interface DailyStats {
  date: string;
  totalSessions: number;
  totalDuration: number;
  totalFileSize: number;
  avgSessionDuration: number;
  successRate: number;
  byType: Record<string, number>;
  peakHour: number;
  sessionsByHour: number[];
}

export interface AnalyticsSummary {
  totalSessions: number;
  totalRecordingTimeSec: number;
  totalStorageUsedBytes: number;
  avgSessionDuration: number;
  successRate: number;
  mostUsedFeature: string;
  longestSession: number;
  totalViews: number;
}

class AnalyticsServiceClass {
  private currentSession: (SessionStats & { _startedAt: number }) | null = null;
  private hourlyBuckets: number[] = Array(24).fill(0);

  // ─── بدء جلسة تتبع ──────────────────────────────────────────────────────────
  startSession(type: SessionStats['recordingType'], feature?: string): string {
    const id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    this.currentSession = {
      sessionId: id,
      startTime: Date.now(),
      _startedAt: Date.now(),
      duration: 0,
      recordingType: type,
      fileSize: 0,
      completedSuccessfully: false,
      feature,
    };

    // تتبع vexo
    try {
      (Vexo as any).trackEvent?.('session_started', { type, feature });
    } catch {}

    // تسجيل الساعة
    const hour = new Date().getHours();
    this.hourlyBuckets[hour]++;

    return id;
  }

  // ─── إنهاء الجلسة وحفظها ─────────────────────────────────────────────────────
  async endSession(params: {
    fileSize?: number;
    success?: boolean;
    metadata?: Partial<SessionStats>;
  } = {}): Promise<SessionStats | null> {
    if (!this.currentSession) return null;

    const now = Date.now();
    const duration = Math.floor((now - this.currentSession._startedAt) / 1000);

    const session: SessionStats = {
      sessionId: this.currentSession.sessionId,
      startTime: this.currentSession.startTime,
      endTime: now,
      duration,
      recordingType: this.currentSession.recordingType,
      fileSize: params.fileSize ?? 0,
      resolution: params.metadata?.resolution,
      frameRate: params.metadata?.frameRate,
      viewers: params.metadata?.viewers,
      completedSuccessfully: params.success ?? true,
      feature: this.currentSession.feature,
    };

    // حفظ الجلسة
    await this._saveSession(session);
    await this._updateDailyStats(session);
    await this._updateSummary(session);

    // تتبع vexo
    try {
      (Vexo as any).trackEvent?.('session_ended', {
        type: session.recordingType,
        duration,
        success: session.completedSuccessfully,
      });
    } catch {}

    this.currentSession = null;
    return session;
  }

  // ─── تتبع حدث ────────────────────────────────────────────────────────────────
  trackEvent(name: string, properties?: Record<string, any>): void {
    try {
      (Vexo as any).trackEvent?.(name, properties);
    } catch {}
    // حفظ محلي للأحداث المهمة
    this._logEvent(name, properties);
  }

  trackScreenView(screen: string): void {
    try {
      (Vexo as any).trackEvent?.('screen_view', { screen });
    } catch {}
  }

  trackFeatureUsage(feature: string, tier: string): void {
    try {
      (Vexo as any).trackEvent?.('feature_used', { feature, tier });
    } catch {}
  }

  trackError(error: string, context?: string): void {
    try {
      (Vexo as any).trackEvent?.('error', { error, context });
    } catch {}
  }

  // ─── الملخص الإجمالي ─────────────────────────────────────────────────────────
  async getSummary(): Promise<AnalyticsSummary> {
    try {
      const raw = await AsyncStorage.getItem(METRICS_KEY);
      return raw ? JSON.parse(raw) : this._emptyMetrics();
    } catch {
      return this._emptyMetrics();
    }
  }

  // ─── الجلسات الأخيرة ─────────────────────────────────────────────────────────
  async getRecentSessions(limit = 50): Promise<SessionStats[]> {
    try {
      const raw = await AsyncStorage.getItem(SESSIONS_KEY);
      const all: SessionStats[] = raw ? JSON.parse(raw) : [];
      return all.slice(0, limit);
    } catch {
      return [];
    }
  }

  // ─── إحصاءات يومية (30 يوماً) ────────────────────────────────────────────────
  async getDailyStats(days = 30): Promise<DailyStats[]> {
    try {
      const raw = await AsyncStorage.getItem(DAILY_KEY);
      const all: DailyStats[] = raw ? JSON.parse(raw) : [];
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return all.filter((d) => new Date(d.date) >= cutoff);
    } catch {
      return [];
    }
  }

  // ─── إحصاءات الساعة ──────────────────────────────────────────────────────────
  getHourlyDistribution(): number[] {
    return [...this.hourlyBuckets];
  }

  // ─── حذف البيانات ────────────────────────────────────────────────────────────
  async clearAll(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(SESSIONS_KEY),
      AsyncStorage.removeItem(DAILY_KEY),
      AsyncStorage.removeItem(METRICS_KEY),
    ]);
    this.hourlyBuckets = Array(24).fill(0);
  }

  // ─── مساعدات خاصة ────────────────────────────────────────────────────────────
  private async _saveSession(s: SessionStats): Promise<void> {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    const all: SessionStats[] = raw ? JSON.parse(raw) : [];
    all.unshift(s);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(all.slice(0, 500)));
  }

  private async _updateDailyStats(s: SessionStats): Promise<void> {
    const dateKey = new Date(s.startTime).toISOString().slice(0, 10);
    const raw = await AsyncStorage.getItem(DAILY_KEY);
    const all: DailyStats[] = raw ? JSON.parse(raw) : [];

    let today = all.find((d) => d.date === dateKey);
    if (!today) {
      today = {
        date: dateKey,
        totalSessions: 0,
        totalDuration: 0,
        totalFileSize: 0,
        avgSessionDuration: 0,
        successRate: 100,
        byType: {},
        peakHour: 0,
        sessionsByHour: Array(24).fill(0),
      };
      all.unshift(today);
    }

    today.totalSessions++;
    today.totalDuration += s.duration;
    today.totalFileSize += s.fileSize;
    today.avgSessionDuration = Math.round(today.totalDuration / today.totalSessions);
    today.byType[s.recordingType] = (today.byType[s.recordingType] ?? 0) + 1;

    const hour = new Date(s.startTime).getHours();
    today.sessionsByHour[hour]++;
    today.peakHour = today.sessionsByHour.indexOf(Math.max(...today.sessionsByHour));

    const sessions = await this.getRecentSessions(500);
    const todaySessions = sessions.filter((ss) =>
      new Date(ss.startTime).toISOString().slice(0, 10) === dateKey
    );
    const succeeded = todaySessions.filter((ss) => ss.completedSuccessfully).length;
    today.successRate = Math.round((succeeded / todaySessions.length) * 100);

    await AsyncStorage.setItem(DAILY_KEY, JSON.stringify(all.slice(0, 90)));
  }

  private async _updateSummary(s: SessionStats): Promise<void> {
    const summary = await this.getSummary();
    summary.totalSessions++;
    summary.totalRecordingTimeSec += s.duration;
    summary.totalStorageUsedBytes += s.fileSize;
    summary.avgSessionDuration = Math.round(summary.totalRecordingTimeSec / summary.totalSessions);
    if (s.duration > summary.longestSession) summary.longestSession = s.duration;
    if (s.viewers) summary.totalViews += s.viewers;

    // حساب successRate بشكل تراكمي
    const successRatio = s.completedSuccessfully ? 1 : 0;
    summary.successRate = Math.round(
      ((summary.successRate * (summary.totalSessions - 1)) + successRatio * 100) / summary.totalSessions
    );

    // الميزة الأكثر استخداماً
    const sessions = await this.getRecentSessions(200);
    const counts: Record<string, number> = {};
    sessions.forEach((ss) => { counts[ss.recordingType] = (counts[ss.recordingType] ?? 0) + 1; });
    summary.mostUsedFeature = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'screen';

    await AsyncStorage.setItem(METRICS_KEY, JSON.stringify(summary));
  }

  private async _logEvent(name: string, properties?: Record<string, any>): Promise<void> {
    const key = 'nexar_event_log';
    const raw = await AsyncStorage.getItem(key);
    const log: any[] = raw ? JSON.parse(raw) : [];
    log.unshift({ name, properties, timestamp: Date.now() });
    await AsyncStorage.setItem(key, JSON.stringify(log.slice(0, 200)));
  }

  private _emptyMetrics(): AnalyticsSummary {
    return {
      totalSessions: 0, totalRecordingTimeSec: 0, totalStorageUsedBytes: 0,
      avgSessionDuration: 0, successRate: 100, mostUsedFeature: 'screen',
      longestSession: 0, totalViews: 0,
    };
  }
}

export const analyticsService = new AnalyticsServiceClass();

// ── Compatibility shim for screens expecting sync getTotalStats ───────────────
// Returns cached/empty values synchronously; call getSummary() for async real data.
const _syncCache = {
  totalSessions: 0,
  totalTime: '0s',
  totalSize: '0 B',
  averageSessionTime: '0s',
  successRate: 100,
};

// Overload with sync shim + async weekly helper
const extendedService = Object.assign(analyticsService, {
  getTotalStats(): typeof _syncCache {
    // Kick off async update for next call
    analyticsService.getSummary().then(s => {
      const sec = s.totalRecordingTimeSec;
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      _syncCache.totalSessions = s.totalSessions;
      _syncCache.totalTime = h > 0 ? `${h}h ${m}m` : `${m}m`;
      _syncCache.totalSize = (() => {
        const b = s.totalStorageUsedBytes;
        if (!b) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(b) / Math.log(k));
        return (b / Math.pow(k, i)).toFixed(1) + ' ' + ['B','KB','MB','GB'][i];
      })();
      _syncCache.averageSessionTime = `${s.avgSessionDuration}s`;
      _syncCache.successRate = s.successRate;
    }).catch(() => {});
    return { ..._syncCache };
  },

  async getWeeklyStats(): Promise<{ totalSessions: number; date: string }[]> {
    const days = await analyticsService.getDailyStats(7);
    return days.map(d => ({ totalSessions: d.totalSessions, date: d.date }));
  },
});

export const AnalyticsService = extendedService;
