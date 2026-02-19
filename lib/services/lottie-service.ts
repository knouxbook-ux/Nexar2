// Copyright © Knoux. All rights reserved.
/**
 * LottieService — Lottie Animation Manager
 * Integrates with lottie-react-native (already in package.json)
 * Manages preloading, caching, and playback of Lottie animations
 */

import * as FileSystem from 'expo-file-system';
import { EventEmitter } from 'events';

export interface LottieAnimation {
  id: string;
  name: string;
  type: 'loading' | 'success' | 'error' | 'warning' | 'info' | 'custom';
  source: string | object;   // URL string OR require() object for bundled assets
  duration: number;
  loop: boolean;
  autoPlay: boolean;
  speed: number;
}

export interface AnimationState {
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;  // 0–1
  speed: number;
  loop: boolean;
}

// Bundled animations — use JSON URLs from LottieFiles CDN (no auth needed)
const BUNDLED_ANIMATIONS: Record<string, Omit<LottieAnimation, 'id'>> = {
  loading: {
    name: 'Loading',
    type: 'loading',
    source: 'https://assets10.lottiefiles.com/packages/lf20_usmfx6bp.json',
    duration: 1500,
    loop: true,
    autoPlay: true,
    speed: 1,
  },
  success: {
    name: 'Success',
    type: 'success',
    source: 'https://assets3.lottiefiles.com/packages/lf20_s2lryxtd.json',
    duration: 1200,
    loop: false,
    autoPlay: true,
    speed: 1,
  },
  error: {
    name: 'Error',
    type: 'error',
    source: 'https://assets7.lottiefiles.com/packages/lf20_rnNQTn.json',
    duration: 1000,
    loop: false,
    autoPlay: true,
    speed: 1,
  },
  warning: {
    name: 'Warning',
    type: 'warning',
    source: 'https://assets5.lottiefiles.com/packages/lf20_kd5rzej5.json',
    duration: 1000,
    loop: false,
    autoPlay: true,
    speed: 1,
  },
  info: {
    name: 'Info',
    type: 'info',
    source: 'https://assets1.lottiefiles.com/packages/lf20_l5qvxwtf.json',
    duration: 1000,
    loop: false,
    autoPlay: true,
    speed: 1,
  },
  upload: {
    name: 'Uploading',
    type: 'loading',
    source: 'https://assets2.lottiefiles.com/packages/lf20_qp1q7mct.json',
    duration: 2000,
    loop: true,
    autoPlay: true,
    speed: 1,
  },
  processing: {
    name: 'Processing',
    type: 'loading',
    source: 'https://assets4.lottiefiles.com/packages/lf20_usbfx0em.json',
    duration: 2000,
    loop: true,
    autoPlay: true,
    speed: 1,
  },
  camera: {
    name: 'Camera',
    type: 'info',
    source: 'https://assets9.lottiefiles.com/packages/lf20_mniampqn.json',
    duration: 1500,
    loop: true,
    autoPlay: false,
    speed: 1,
  },
};

const CACHE_DIR = `${FileSystem.cacheDirectory}nexar_lottie/`;

class LottieServiceClass extends EventEmitter {
  private animations: Map<string, LottieAnimation> = new Map();
  private animationStates: Map<string, AnimationState> = new Map();
  private cachedFiles: Map<string, string> = new Map();   // url → localPath

  constructor() {
    super();
    this.initialize();
  }

  private initialize(): void {
    Object.entries(BUNDLED_ANIMATIONS).forEach(([key, def]) => {
      const anim: LottieAnimation = { id: `lottie_${key}`, ...def };
      this.animations.set(anim.id, anim);
      this.animationStates.set(anim.id, {
        isPlaying: anim.autoPlay,
        isPaused: false,
        progress: 0,
        speed: anim.speed,
        loop: anim.loop,
      });
    });
    this.ensureCacheDir();
  }

  private async ensureCacheDir(): Promise<void> {
    const info = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!info.exists) await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }

  // ─── Download & Cache ────────────────────────────────────────────────────────
  async downloadAndCache(animationId: string): Promise<string | null> {
    const anim = this.animations.get(animationId);
    if (!anim || typeof anim.source !== 'string') return null;

    if (this.cachedFiles.has(anim.source)) {
      return this.cachedFiles.get(anim.source)!;
    }

    try {
      const filename = `${animationId}_${Date.now()}.json`;
      const localPath = `${CACHE_DIR}${filename}`;
      await FileSystem.downloadAsync(anim.source, localPath);
      this.cachedFiles.set(anim.source, localPath);
      this.emit('animationCached', { animationId, localPath });
      return localPath;
    } catch (err) {
      this.emit('cacheError', { animationId, err });
      return null;
    }
  }

  /**
   * Returns the source to pass to LottieView:
   * - If cached locally: returns local file URI
   * - If bundled object: returns as-is
   * - Otherwise: returns remote URL string
   */
  async getSource(animationId: string): Promise<string | object | null> {
    const anim = this.animations.get(animationId);
    if (!anim) return null;
    if (typeof anim.source === 'object') return anim.source;

    const cached = this.cachedFiles.get(anim.source);
    if (cached) return cached;

    // Try to download
    const localPath = await this.downloadAndCache(animationId);
    return localPath ?? anim.source;
  }

  // ─── Playback Control ─────────────────────────────────────────────────────────
  // Note: These update state only. Actual LottieView control is done via ref in UI.
  play(animationId: string): void {
    const state = this.animationStates.get(animationId);
    if (state) {
      state.isPlaying = true;
      state.isPaused = false;
      this.emit('animationStarted', { animationId });
    }
  }

  pause(animationId: string): void {
    const state = this.animationStates.get(animationId);
    if (state) {
      state.isPlaying = false;
      state.isPaused = true;
      this.emit('animationPaused', { animationId });
    }
  }

  resume(animationId: string): void {
    const state = this.animationStates.get(animationId);
    if (state) {
      state.isPlaying = true;
      state.isPaused = false;
      this.emit('animationResumed', { animationId });
    }
  }

  stop(animationId: string): void {
    const state = this.animationStates.get(animationId);
    if (state) {
      state.isPlaying = false;
      state.isPaused = false;
      state.progress = 0;
      this.emit('animationStopped', { animationId });
    }
  }

  setSpeed(animationId: string, speed: number): void {
    const state = this.animationStates.get(animationId);
    if (state) {
      state.speed = Math.max(0.1, Math.min(5, speed));
      this.emit('speedChanged', { animationId, speed: state.speed });
    }
  }

  setProgress(animationId: string, progress: number): void {
    const state = this.animationStates.get(animationId);
    if (state) {
      state.progress = Math.max(0, Math.min(1, progress));
      this.emit('progressChanged', { animationId, progress: state.progress });
    }
  }

  setLoop(animationId: string, loop: boolean): void {
    const state = this.animationStates.get(animationId);
    const anim = this.animations.get(animationId);
    if (state && anim) {
      state.loop = loop;
      anim.loop = loop;
      this.emit('loopChanged', { animationId, loop });
    }
  }

  onComplete(animationId: string, callback: () => void): void {
    this.on(`complete_${animationId}`, callback);
  }

  triggerComplete(animationId: string): void {
    this.emit(`complete_${animationId}`);
    this.emit('animationCompleted', { animationId });
  }

  // ─── Registration ─────────────────────────────────────────────────────────────
  registerCustomAnimation(animation: LottieAnimation): void {
    this.animations.set(animation.id, animation);
    this.animationStates.set(animation.id, {
      isPlaying: animation.autoPlay,
      isPaused: false,
      progress: 0,
      speed: animation.speed,
      loop: animation.loop,
    });
    this.emit('animationRegistered', { animation });
  }

  unregisterAnimation(animationId: string): void {
    this.animations.delete(animationId);
    this.animationStates.delete(animationId);
    this.emit('animationUnregistered', { animationId });
  }

  // ─── Getters ──────────────────────────────────────────────────────────────────
  getAnimation(animationId: string): LottieAnimation | undefined {
    return this.animations.get(animationId);
  }

  getState(animationId: string): AnimationState | undefined {
    return this.animationStates.get(animationId);
  }

  getAllAnimations(): LottieAnimation[] {
    return Array.from(this.animations.values());
  }

  getByType(type: LottieAnimation['type']): LottieAnimation[] {
    return Array.from(this.animations.values()).filter(a => a.type === type);
  }

  // Quick access by type
  getLoading(): LottieAnimation | undefined { return this.getByType('loading')[0]; }
  getSuccess(): LottieAnimation | undefined { return this.getByType('success')[0]; }
  getError(): LottieAnimation | undefined { return this.getByType('error')[0]; }

  // ─── Cache Management ─────────────────────────────────────────────────────────
  async clearCache(): Promise<void> {
    try {
      const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
      await Promise.all(files.map(f => FileSystem.deleteAsync(`${CACHE_DIR}${f}`, { idempotent: true })));
      this.cachedFiles.clear();
      this.emit('cacheCleared', {});
    } catch {}
  }

  async getCacheSize(): Promise<number> {
    try {
      const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
      let total = 0;
      for (const file of files) {
        const info = await FileSystem.getInfoAsync(`${CACHE_DIR}${file}`, { size: true });
        if (info.exists && 'size' in info) total += info.size ?? 0;
      }
      return total;
    } catch {
      return 0;
    }
  }
}

export const LottieService = new LottieServiceClass();
export default LottieService;
