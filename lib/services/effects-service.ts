// Copyright © Knoux. All rights reserved.
/**
 * EffectsService — Visual Effects Engine
 * Real implementation using ffmpeg-kit-react-native + expo-file-system
 * Particle, ChromaKey, HDR, Color Grading, Blur, Glitch, Vignette
 */

import { FFmpegKit, FFmpegKitConfig, ReturnCode } from 'ffmpeg-kit-react-native';
import * as FileSystem from 'expo-file-system';
import { EventEmitter } from 'events';

export interface Effect {
  id: string;
  name: string;
  type: 'particle' | 'chromakey' | 'hdr' | 'colorgrade' | 'blur' | 'glitch' | 'vignette';
  intensity: number;
  duration: number;
}
export interface EffectResult {
  originalUri: string;
  effectUri: string;
  appliedEffect: Effect;
  processingTime: number;
}

const COLOR_GRADE_FILTERS: Record<string, string> = {
  warm:      "curves=r='0/0 0.5/0.6 1/1':g='0/0 0.5/0.5 1/0.9':b='0/0 0.5/0.4 1/0.8',eq=saturation=1.2",
  cool:      "curves=r='0/0 0.5/0.4 1/0.8':g='0/0 0.5/0.5 1/0.9':b='0/0 0.5/0.6 1/1',eq=saturation=1.1",
  vintage:   "curves=r='0/0.1 0.5/0.6 1/0.9':g='0/0.05 0.5/0.5 1/0.85':b='0/0.1 0.5/0.4 1/0.7',vignette=PI/4",
  cinematic: "curves=r='0/0 0.3/0.25 0.7/0.75 1/1':b='0/0 0.3/0.35 0.7/0.65 1/0.9',eq=contrast=1.15:saturation=0.9",
  noir:      "hue=s=0,curves='0/0 0.3/0.2 0.7/0.8 1/1',eq=contrast=1.3",
};

class EffectsServiceClass extends EventEmitter {
  private activeEffects: Map<string, Effect> = new Map();
  private outputDir = `${FileSystem.cacheDirectory}nexar_effects/`;

  constructor() {
    super();
    this.ensureOutputDir();
  }

  private async ensureOutputDir(): Promise<void> {
    const info = await FileSystem.getInfoAsync(this.outputDir);
    if (!info.exists) await FileSystem.makeDirectoryAsync(this.outputDir, { intermediates: true });
  }

  private outputPath(inputUri: string, suffix: string): string {
    const ext = inputUri.split('.').pop() || 'mp4';
    return `${this.outputDir}fx_${suffix}_${Date.now()}.${ext}`;
  }

  private async runFFmpeg(cmd: string, onProgress?: (p: number) => void): Promise<boolean> {
    if (onProgress) {
      FFmpegKitConfig.enableStatisticsCallback((s) => {
        const t = s.getTime();
        if (t > 0) onProgress(Math.min(t / 100, 0.99));
      });
    }
    const session = await FFmpegKit.execute(cmd);
    const rc = await session.getReturnCode();
    return ReturnCode.isSuccess(rc);
  }

  async applyParticleEffect(videoUri: string, particleType: 'snow'|'rain'|'confetti'|'sparkles'|'smoke', options: any = {}): Promise<EffectResult> {
    this.emit('effectStarted', { effectType: 'particle', particleType });
    const t0 = Date.now();
    const out = this.outputPath(videoUri, `particle_${particleType}`);
    const filters: Record<string,string> = {
      snow:     "geq=lum='lum(X,Y)':a='if(gt(random(1)*100,97),255,lum(X,Y)*0.1)'",
      rain:     "geq=lum='lum(X,Y)':a='if(gt(mod(X+Y*0.5,30),28),200,0)'",
      confetti: 'noise=alls=20:allf=t,hue=s=2',
      sparkles: "geq=lum='if(gt(random(0),0.995),255,lum(X,Y))'",
      smoke:    'gblur=sigma=3,eq=brightness=0.05:contrast=0.9',
    };
    const ok = await this.runFFmpeg(`-i "${videoUri}" -vf "${filters[particleType]??filters.snow}" -c:a copy -y "${out}"`, (p) => this.emit('effectProgress', { pct: p }));
    const effect: Effect = { id:`particle_${Date.now()}`, name:`${particleType} Effect`, type:'particle', intensity: options.intensity??50, duration: options.duration??5000 };
    this.activeEffects.set(effect.id, effect);
    const result = { originalUri: videoUri, effectUri: ok?out:videoUri, appliedEffect: effect, processingTime: Date.now()-t0 };
    this.emit('effectCompleted', result);
    return result;
  }

  async applyChromaKey(videoUri: string, keyColor='0x00FF00', backgroundUri?: string, tolerance=0.3, spill=0.1): Promise<EffectResult> {
    this.emit('effectStarted', { effectType: 'chromakey' });
    const t0 = Date.now();
    const out = this.outputPath(videoUri, 'chromakey');
    const cmd = backgroundUri
      ? `-i "${videoUri}" -i "${backgroundUri}" -filter_complex "[0:v]chromakey=${keyColor}:${tolerance}:${spill}[ck];[1:v][ck]overlay[out]" -map "[out]" -c:a copy -y "${out}"`
      : `-i "${videoUri}" -vf "chromakey=${keyColor}:${tolerance}:${spill}" -c:a copy -y "${out}"`;
    const ok = await this.runFFmpeg(cmd, (p) => this.emit('effectProgress', { pct: p }));
    const effect: Effect = { id:`chromakey_${Date.now()}`, name:'Chroma Key', type:'chromakey', intensity:100, duration:0 };
    this.activeEffects.set(effect.id, effect);
    const result = { originalUri: videoUri, effectUri: ok?out:videoUri, appliedEffect: effect, processingTime: Date.now()-t0 };
    this.emit('effectCompleted', result);
    return result;
  }

  async applyHDR(videoUri: string, options: { tone?:number; saturation?:number; contrast?:number } = {}): Promise<EffectResult> {
    this.emit('effectStarted', { effectType: 'hdr' });
    const t0 = Date.now();
    const out = this.outputPath(videoUri, 'hdr');
    const sat = (1 + (options.saturation??30)/100).toFixed(2);
    const con = (1 + (options.contrast??20)/100).toFixed(2);
    const bri = ((options.tone??50)/1000).toFixed(3);
    const ok = await this.runFFmpeg(`-i "${videoUri}" -vf "eq=contrast=${con}:saturation=${sat}:brightness=${bri}" -c:a copy -y "${out}"`, (p) => this.emit('effectProgress', { pct: p }));
    const effect: Effect = { id:`hdr_${Date.now()}`, name:'HDR', type:'hdr', intensity:100, duration:0 };
    this.activeEffects.set(effect.id, effect);
    const result = { originalUri: videoUri, effectUri: ok?out:videoUri, appliedEffect: effect, processingTime: Date.now()-t0 };
    this.emit('effectCompleted', result);
    return result;
  }

  async applyColorGrade(videoUri: string, preset: 'warm'|'cool'|'vintage'|'cinematic'|'noir'): Promise<EffectResult> {
    this.emit('effectStarted', { effectType: 'colorgrade', preset });
    const t0 = Date.now();
    const out = this.outputPath(videoUri, `grade_${preset}`);
    const filter = COLOR_GRADE_FILTERS[preset] ?? COLOR_GRADE_FILTERS.cinematic;
    const ok = await this.runFFmpeg(`-i "${videoUri}" -vf "${filter}" -c:a copy -y "${out}"`, (p) => this.emit('effectProgress', { pct: p }));
    const effect: Effect = { id:`grade_${Date.now()}`, name:`${preset} Grade`, type:'colorgrade', intensity:100, duration:0 };
    this.activeEffects.set(effect.id, effect);
    const result = { originalUri: videoUri, effectUri: ok?out:videoUri, appliedEffect: effect, processingTime: Date.now()-t0 };
    this.emit('effectCompleted', result);
    return result;
  }

  async applyBlur(videoUri: string, sigma=5, type: 'gaussian'|'motion'|'radial'='gaussian'): Promise<EffectResult> {
    this.emit('effectStarted', { effectType: 'blur', type });
    const t0 = Date.now();
    const out = this.outputPath(videoUri, `blur_${type}`);
    const filterMap = { gaussian:`gblur=sigma=${sigma}`, motion:`tmix=frames=${Math.max(2,Math.ceil(sigma/5))}`, radial:`gblur=sigma=${sigma/2},vignette=PI/4` };
    const ok = await this.runFFmpeg(`-i "${videoUri}" -vf "${filterMap[type]}" -c:a copy -y "${out}"`, (p) => this.emit('effectProgress', { pct: p }));
    const effect: Effect = { id:`blur_${Date.now()}`, name:`${type} Blur`, type:'blur', intensity:sigma, duration:0 };
    this.activeEffects.set(effect.id, effect);
    const result = { originalUri: videoUri, effectUri: ok?out:videoUri, appliedEffect: effect, processingTime: Date.now()-t0 };
    this.emit('effectCompleted', result);
    return result;
  }

  async applyGlitch(videoUri: string, intensity=50): Promise<EffectResult> {
    this.emit('effectStarted', { effectType: 'glitch' });
    const t0 = Date.now();
    const out = this.outputPath(videoUri, 'glitch');
    const shift = Math.floor(intensity/10);
    const ok = await this.runFFmpeg(`-i "${videoUri}" -vf "rgbashift=rh=${shift}:bh=-${shift},noise=alls=${Math.floor(intensity/5)}:allf=t" -c:a copy -y "${out}"`, (p) => this.emit('effectProgress', { pct: p }));
    const effect: Effect = { id:`glitch_${Date.now()}`, name:'Glitch', type:'glitch', intensity, duration:0 };
    this.activeEffects.set(effect.id, effect);
    const result = { originalUri: videoUri, effectUri: ok?out:videoUri, appliedEffect: effect, processingTime: Date.now()-t0 };
    this.emit('effectCompleted', result);
    return result;
  }

  async applyVignette(videoUri: string, strength=50): Promise<EffectResult> {
    this.emit('effectStarted', { effectType: 'vignette' });
    const t0 = Date.now();
    const out = this.outputPath(videoUri, 'vignette');
    const angle = ((strength/100) * Math.PI/2).toFixed(4);
    const ok = await this.runFFmpeg(`-i "${videoUri}" -vf "vignette=angle=${angle}:mode=backward" -c:a copy -y "${out}"`, (p) => this.emit('effectProgress', { pct: p }));
    const effect: Effect = { id:`vignette_${Date.now()}`, name:'Vignette', type:'vignette', intensity:strength, duration:0 };
    this.activeEffects.set(effect.id, effect);
    const result = { originalUri: videoUri, effectUri: ok?out:videoUri, appliedEffect: effect, processingTime: Date.now()-t0 };
    this.emit('effectCompleted', result);
    return result;
  }

  getActiveEffects(): Effect[] { return Array.from(this.activeEffects.values()); }
  removeEffect(id: string): void { this.activeEffects.delete(id); this.emit('effectRemoved', { id }); }
  getPresets(): string[] { return Object.keys(COLOR_GRADE_FILTERS); }

  async clearCache(): Promise<void> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.outputDir);
      await Promise.all(files.map(f => FileSystem.deleteAsync(`${this.outputDir}${f}`, { idempotent: true })));
    } catch {}
  }
}

export const effectsService = new EffectsServiceClass();
export default effectsService;

// Alias for backward compatibility
export const EffectsService = effectsService;
