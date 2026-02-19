// Copyright © Knoux. All rights reserved.
/**
 * PerformanceMonitorService — مراقبة أداء حقيقية
 * تستخدم React Native APIs المتاحة + expo-keep-awake
 */

import { Platform, NativeModules, InteractionManager } from 'react-native';
import * as ExpoKeepAwake from 'expo-keep-awake';

export interface PerformanceMetrics {
  fps: number;
  cpu: number;
  memory: number;
  memoryTotal: number;
  battery: number;
  temperature: number;
  networkSpeed: number;
  droppedFrames: number;
  gpuUsage: number;
  diskWriteSpeed: number;
  heapUsed: number;
  heapTotal: number;
}

export interface PerformanceThresholds {
  cpuWarning: number;
  memoryWarning: number;
  batteryWarning: number;
  temperatureWarning: number;
}

type EventType =
  | 'metricsUpdated' | 'cpuWarning' | 'memoryWarning'
  | 'batteryWarning' | 'temperatureWarning' | 'started' | 'stopped';

class PerformanceMonitorServiceClass {
  private interval: ReturnType<typeof setInterval> | null = null;
  private frameTimestamps: number[] = [];
  private droppedFrames = 0;
  private isMonitoring = false;
  private listeners = new Map<string, ((data: any) => void)[]>();
  private frameHandle: number | null = null;
  private batteryLevel = 1.0; // 0..1

  private current: PerformanceMetrics = {
    fps: 60, cpu: 0, memory: 0, memoryTotal: 4096,
    battery: 100, temperature: 36, networkSpeed: 0,
    droppedFrames: 0, gpuUsage: 0, diskWriteSpeed: 0,
    heapUsed: 0, heapTotal: 0,
  };

  private thresholds: PerformanceThresholds = {
    cpuWarning: 80, memoryWarning: 85,
    batteryWarning: 15, temperatureWarning: 45,
  };

  // ─── بدء المراقبة ──────────────────────────────────────────────────────────
  async startMonitoring(intervalMs = 1000): Promise<void> {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    // إبقاء الشاشة مضاءة أثناء المراقبة
    ExpoKeepAwake.activateKeepAwakeAsync('perf-monitor');

    // تتبع FPS باستخدام requestAnimationFrame
    this._startFPSTracking();

    // تحديث المقاييس كل interval
    this.interval = setInterval(async () => {
      await this._updateMetrics();
      this._checkThresholds();
      this.emit('metricsUpdated', { ...this.current });
    }, intervalMs);

    this.emit('started', {});
  }

  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) return;
    this.isMonitoring = false;

    ExpoKeepAwake.deactivateKeepAwake('perf-monitor');

    if (this.interval) { clearInterval(this.interval); this.interval = null; }
    if (this.frameHandle) {
      cancelAnimationFrame(this.frameHandle);
      this.frameHandle = null;
    }
    this.emit('stopped', {});
  }

  async getCurrentMetrics(): Promise<PerformanceMetrics> {
    await this._updateMetrics();
    return { ...this.current };
  }

  setThresholds(t: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...t };
  }

  // ─── تتبع FPS حقيقي ──────────────────────────────────────────────────────
  private _startFPSTracking(): void {
    const tick = (now: number) => {
      if (!this.isMonitoring) return;
      // الاحتفاظ بآخر ثانية من الإطارات
      this.frameTimestamps = this.frameTimestamps.filter((t) => now - t < 1000);
      this.frameTimestamps.push(now);
      this.current.fps = this.frameTimestamps.length;

      // الكشف عن الإطارات المسقوطة (< 50 FPS = مشكلة)
      if (this.current.fps < 50 && this.frameTimestamps.length > 5) {
        this.droppedFrames++;
        this.current.droppedFrames = this.droppedFrames;
      }

      if (Platform.OS === 'web') {
        this.frameHandle = requestAnimationFrame(tick);
      } else {
        // React Native: استخدم InteractionManager لتتبع الإطارات
        this.frameHandle = requestAnimationFrame(tick);
      }
    };
    this.frameHandle = requestAnimationFrame(tick);
  }

  // ─── تحديث المقاييس الحقيقية ──────────────────────────────────────────────
  private async _updateMetrics(): Promise<void> {
    // ─── JS Heap (حقيقي في بيئة V8/Hermes) ──────────────────────────────────
    if (typeof (performance as any).memory !== 'undefined') {
      const mem = (performance as any).memory;
      this.current.heapUsed = Math.round(mem.usedJSHeapSize / 1024 / 1024);
      this.current.heapTotal = Math.round(mem.totalJSHeapSize / 1024 / 1024);
      // نسبة الذاكرة
      this.current.memory = Math.round(
        (mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100
      );
    } else if (NativeModules.MemoryModule) {
      // Native module إذا متاح
      const info = NativeModules.MemoryModule.getMemoryInfo?.() ?? {};
      this.current.heapUsed = info.usedMB ?? this.current.heapUsed;
      this.current.memory = info.percent ?? this.current.memory;
    }

    // ─── CPU تقدير من عبء JS loop ────────────────────────────────────────────
    const cpuStart = Date.now();
    let counter = 0;
    for (let i = 0; i < 50000; i++) counter++;
    const cpuTime = Date.now() - cpuStart;
    // كلما زاد الوقت كلما ارتفع الحمل
    const estimatedCPU = Math.min(100, Math.round((cpuTime / 10) * 15));
    this.current.cpu = Math.max(estimatedCPU, this.current.cpu * 0.7 + estimatedCPU * 0.3);

    // ─── البطارية عبر React Native API ───────────────────────────────────────
    if (NativeModules.RNDeviceInfo?.getBatteryLevel) {
      try {
        const level = await NativeModules.RNDeviceInfo.getBatteryLevel();
        this.batteryLevel = level;
        this.current.battery = Math.round(level * 100);
      } catch {}
    } else if (typeof navigator !== 'undefined' && (navigator as any).getBattery) {
      // Web API
      try {
        const bat = await (navigator as any).getBattery();
        this.current.battery = Math.round(bat.level * 100);
      } catch {}
    }

    // ─── GPU تقدير من FPS drop ───────────────────────────────────────────────
    const fpsDrop = Math.max(0, 60 - this.current.fps);
    this.current.gpuUsage = Math.min(100, Math.round(fpsDrop * 2 + this.current.cpu * 0.3));

    // ─── درجة الحرارة (تقدير من CPU) ─────────────────────────────────────────
    this.current.temperature = parseFloat(
      (35 + (this.current.cpu / 100) * 20).toFixed(1)
    );

    // ─── سرعة الشبكة (تقدير من navigator.connection) ─────────────────────────
    if (typeof navigator !== 'undefined' && (navigator as any).connection) {
      const conn = (navigator as any).connection;
      const downMbps = conn.downlink ?? 0;
      this.current.networkSpeed = Math.round(downMbps * 1000); // kbps
    }
  }

  // ─── فحص العتبات ────────────────────────────────────────────────────────────
  private _checkThresholds(): void {
    const m = this.current;
    if (m.cpu > this.thresholds.cpuWarning) this.emit('cpuWarning', m.cpu);
    if (m.memory > this.thresholds.memoryWarning) this.emit('memoryWarning', m.memory);
    if (m.battery < this.thresholds.batteryWarning) this.emit('batteryWarning', m.battery);
    if (m.temperature > this.thresholds.temperatureWarning) this.emit('temperatureWarning', m.temperature);
  }

  // ─── Event Emitter ──────────────────────────────────────────────────────────
  on(event: EventType, cb: (data: any) => void): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(cb);
    return () => this.off(event, cb);
  }

  off(event: EventType, cb: (data: any) => void): void {
    this.listeners.set(event, (this.listeners.get(event) ?? []).filter((c) => c !== cb));
  }

  private emit(event: string, data: any): void {
    (this.listeners.get(event) ?? []).forEach((cb) => cb(data));
  }
}

export const PerformanceMonitorService = new PerformanceMonitorServiceClass();
