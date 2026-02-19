// Copyright © Knoux. All rights reserved.
/**
 * NexarBridge v3.0
 * يربط جميع الخدمات المستقلة بـ NexarCore EventBus
 * يُستدعى مرة واحدة من _layout.tsx عند تشغيل التطبيق
 */

import { nexarEvents, sessionManager, NexarCore } from '@/lib/nexar/NexarCore';
import { screenRecordingService } from '@/lib/services/screen-recording-service';
import { audioRecordingService } from '@/lib/services/audio-recording-service';
import { StreamingService } from '@/lib/services/streaming-service';
import { AnalyticsService } from '@/lib/services/analytics-service';
import AsyncStorage from '@react-native-async-storage/async-storage';

let bridgeInitialized = false;

export function initNexarBridge(): void {
  if (bridgeInitialized) return;
  bridgeInitialized = true;

  // ── 1. Screen Recording → NexarCore ─────────────────────────────────────
  screenRecordingService.on('recordingProgress', (status: any) => {
    if (status.isRecording && !status.isPaused) {
      // Update analytics every 30 seconds
      if (status.duration > 0 && status.duration % 30 === 0) {
        try {
          AnalyticsService.updateSessionProgress?.({
            duration: status.duration,
            fileSize: status.fileSize,
          });
        } catch {}
      }
    }
  });

  // Patch start/stop to emit NexarCore events
  const origStartRec = screenRecordingService.startRecording?.bind(screenRecordingService);
  const origStopRec = screenRecordingService.stopRecording?.bind(screenRecordingService);

  if (origStartRec) {
    (screenRecordingService as any).startRecording = async (opts: any) => {
      const result = await origStartRec(opts);
      nexarEvents.emit('recording:started', {
        resolution: opts?.resolution ?? '1080p',
        frameRate: opts?.frameRate ?? 60,
        includeAudio: opts?.includeAudio ?? true,
      });
      return result;
    };
  }

  if (origStopRec) {
    (screenRecordingService as any).stopRecording = async () => {
      const result = await origStopRec();
      nexarEvents.emit('recording:stopped', {
        duration: result?.duration ?? 0,
        fileSize: result?.fileSize ?? 0,
        filePath: result?.filePath ?? '',
      });
      return result;
    };
  }

  // ── 2. Audio Recording → NexarCore ──────────────────────────────────────
  audioRecordingService.on('recordingStarted', () => {
    nexarEvents.emit('audio:recorded', { type: 'started' });
  });

  audioRecordingService.on('recordingStopped', (result: any) => {
    nexarEvents.emit('audio:recorded', {
      type: 'stopped',
      duration: result?.duration ?? 0,
      fileSize: result?.fileSize ?? 0,
    });
    nexarEvents.emit('analytics:sessionTrack', {
      type: 'audio',
      duration: result?.duration ?? 0,
    });
  });

  // ── 3. Streaming Service → NexarCore ────────────────────────────────────
  StreamingService.on('statusChanged', (status: string) => {
    if (status === 'live') {
      nexarEvents.emit('stream:started', { platform: StreamingService.getPlatform?.() });
    } else if (status === 'ended' || status === 'idle') {
      nexarEvents.emit('stream:stopped', {});
    }
  });

  StreamingService.on('metricsUpdated', (metrics: any) => {
    if (metrics?.viewerCount !== undefined) {
      nexarEvents.emit('stream:viewerUpdate', { count: metrics.viewerCount });
    }
  });

  // ── 4. Analytics tracking from NexarCore events ──────────────────────────
  nexarEvents.on('analytics:sessionTrack', (data: any) => {
    try {
      AnalyticsService.trackEvent?.('session_completed', {
        type: data.type,
        duration: data.duration,
        ...data.meta,
      });
    } catch {}
  });

  // ── 5. Cloud upload events ───────────────────────────────────────────────
  nexarEvents.on('cloud:uploadComplete', (data: any) => {
    nexarEvents.emit('notification:new', {
      title: '☁️ Upload Complete',
      body: `${data.fileName ?? 'File'} uploaded successfully`,
    });
  });

  // ── 6. Subscription change → persist ────────────────────────────────────
  nexarEvents.on('subscription:upgraded', async ({ plan }) => {
    try {
      await AsyncStorage.setItem('@nexar_subscription_plan', plan);
    } catch {}
  });

  // ── 7. Load persisted subscription on init ───────────────────────────────
  AsyncStorage.getItem('@nexar_subscription_plan').then((plan) => {
    if (plan && ['free', 'pro', 'premium'].includes(plan)) {
      const { featureGuard } = require('@/lib/nexar/NexarCore');
      featureGuard.setPlan(plan as any);
    }
  }).catch(() => {});

  console.log('[NexarBridge] ✅ All services bridged to NexarCore');
}

export default initNexarBridge;
