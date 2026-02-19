// Copyright © Knoux. All rights reserved.
/**
 * 🗄️ Retouch Engine — Preset Manager
 * مدير الإعدادات المسبقة الكامل
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RetouchPreset {
  id: string;
  name: string;
  nameAr: string;
  category: 'skin' | 'portrait' | 'beauty' | 'cinematic' | 'custom';
  icon: string;
  filters: Record<string, number>;
  colorAdjustments: {
    brightness: number;
    contrast: number;
    saturation: number;
    temperature: number;
    tint: number;
    sharpness: number;
  };
  isBuiltIn: boolean;
  isFavorite: boolean;
  usageCount: number;
  createdAt: number;
  thumbnail?: string;
}

const BUILT_INS: RetouchPreset[] = [
  {
    id: 'natural',    name: 'Natural',     nameAr: 'طبيعي',         category: 'skin',     icon: '🌿', isBuiltIn: true, isFavorite: true, usageCount: 0, createdAt: 0,
    filters: { smooth: 0.25, glow: 0.1 },
    colorAdjustments: { brightness: 0.05, contrast: 0, saturation: 0.1, temperature: 0, tint: 0, sharpness: 0.3 },
  },
  {
    id: 'glamour',    name: 'Glamour',     nameAr: 'جلامور',        category: 'beauty',   icon: '💄', isBuiltIn: true, isFavorite: false, usageCount: 0, createdAt: 0,
    filters: { smooth: 0.8, glow: 0.6, eyes: 0.5 },
    colorAdjustments: { brightness: 0.1, contrast: 0.2, saturation: 0.15, temperature: 0.05, tint: 0, sharpness: 0.2 },
  },
  {
    id: 'cinema',     name: 'Cinematic',   nameAr: 'سينمائي',       category: 'cinematic',icon: '🎬', isBuiltIn: true, isFavorite: false, usageCount: 0, createdAt: 0,
    filters: { grain: 0.2 },
    colorAdjustments: { brightness: -0.05, contrast: 0.4, saturation: -0.15, temperature: -0.1, tint: 0, sharpness: 0.1 },
  },
  {
    id: 'portrait',   name: 'Portrait',    nameAr: 'بورتريه',       category: 'portrait', icon: '📸', isBuiltIn: true, isFavorite: true, usageCount: 0, createdAt: 0,
    filters: { smooth: 0.45, sharpen: 0.3 },
    colorAdjustments: { brightness: 0.08, contrast: 0.15, saturation: 0.05, temperature: 0.03, tint: 0, sharpness: 0.35 },
  },
];

const STORAGE_KEY = 'knoux_nexar_custom_presets';

export class PresetManager {
  private customPresets: RetouchPreset[] = [];
  private loaded = false;

  async loadFromStorage(): Promise<void> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) this.customPresets = JSON.parse(json);
      this.loaded = true;
    } catch { this.loaded = true; }
  }

  private async save(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.customPresets));
  }

  getBuiltIns(): RetouchPreset[] { return BUILT_INS; }
  getCustom(): RetouchPreset[] { return this.customPresets; }
  getAll(): RetouchPreset[] { return [...BUILT_INS, ...this.customPresets]; }
  getFavorites(): RetouchPreset[] { return this.getAll().filter((p) => p.isFavorite); }

  async createCustom(preset: Omit<RetouchPreset, 'id' | 'isBuiltIn' | 'usageCount' | 'createdAt'>): Promise<RetouchPreset> {
    const newPreset: RetouchPreset = {
      ...preset,
      id: `custom_${Date.now()}`,
      isBuiltIn: false,
      usageCount: 0,
      createdAt: Date.now(),
    };
    this.customPresets.push(newPreset);
    await this.save();
    return newPreset;
  }

  async deleteCustom(id: string): Promise<void> {
    this.customPresets = this.customPresets.filter((p) => p.id !== id);
    await this.save();
  }

  async toggleFavorite(id: string): Promise<void> {
    const preset = this.customPresets.find((p) => p.id === id);
    if (preset) {
      preset.isFavorite = !preset.isFavorite;
      await this.save();
    }
  }

  async incrementUsage(id: string): Promise<void> {
    const preset = this.customPresets.find((p) => p.id === id);
    if (preset) { preset.usageCount++; await this.save(); }
  }

  getMostUsed(limit = 5): RetouchPreset[] {
    return this.getAll().sort((a, b) => b.usageCount - a.usageCount).slice(0, limit);
  }
}

export const presetManager = new PresetManager();
