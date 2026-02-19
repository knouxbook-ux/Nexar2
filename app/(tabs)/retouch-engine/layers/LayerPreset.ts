// Copyright © Knoux. All rights reserved.
/**
 * 🎨 Retouch Engine — Layer Presets
 * إعدادات مسبقة للطبقات
 */
import type { Layer, BlendMode } from './LayerManager';

export interface LayerPreset {
  id: string;
  name: string;
  nameAr: string;
  category: 'adjustment' | 'effect' | 'retouch' | 'color';
  layers: Partial<Layer>[];
  thumbnail?: string;
}

export const LAYER_PRESETS: LayerPreset[] = [
  {
    id: 'skin-retouch',
    name: 'Skin Retouch',
    nameAr: 'ريتوش البشرة',
    category: 'retouch',
    layers: [
      { name: 'تنعيم البشرة', type: 'adjustment', opacity: 0.7, blendMode: 'screen', metadata: { filter: 'smooth', intensity: 0.6 } },
      { name: 'توحيد اللون',  type: 'adjustment', opacity: 0.5, blendMode: 'overlay', metadata: { filter: 'tone', intensity: 0.4 } },
      { name: 'إضاءة الوجه', type: 'adjustment', opacity: 0.4, blendMode: 'soft-light', metadata: { filter: 'highlight', intensity: 0.3 } },
    ],
  },
  {
    id: 'beauty-enhance',
    name: 'Beauty Enhance',
    nameAr: 'تحسين الجمال',
    category: 'retouch',
    layers: [
      { name: 'تنعيم', type: 'adjustment', opacity: 0.8, blendMode: 'normal', metadata: { filter: 'smooth' } },
      { name: 'إضاءة', type: 'adjustment', opacity: 0.4, blendMode: 'screen', metadata: { filter: 'brighten' } },
      { name: 'عيون', type: 'adjustment', opacity: 0.6, blendMode: 'overlay', metadata: { filter: 'eyes', intensity: 0.5 } },
    ],
  },
  {
    id: 'cinema-look',
    name: 'Cinema Look',
    nameAr: 'المظهر السينمائي',
    category: 'color',
    layers: [
      { name: 'تباين', type: 'adjustment', opacity: 0.6, blendMode: 'multiply', metadata: { filter: 'contrast', intensity: 0.5 } },
      { name: 'ألوان سينمائية', type: 'adjustment', opacity: 0.7, blendMode: 'color', metadata: { filter: 'cinema' } },
      { name: 'حبوب', type: 'adjustment', opacity: 0.2, blendMode: 'overlay', metadata: { filter: 'grain', intensity: 0.3 } },
    ],
  },
  {
    id: 'hdr-effect',
    name: 'HDR Effect',
    nameAr: 'تأثير HDR',
    category: 'effect',
    layers: [
      { name: 'إضاءة HDR', type: 'adjustment', opacity: 0.8, blendMode: 'hard-light', metadata: { filter: 'hdr' } },
      { name: 'تباين تفصيلي', type: 'adjustment', opacity: 0.5, blendMode: 'overlay', metadata: { filter: 'clarity' } },
    ],
  },
];

export class LayerPresetManager {
  private customPresets: LayerPreset[] = [];

  getBuiltInPresets(): LayerPreset[] { return LAYER_PRESETS; }
  getCustomPresets(): LayerPreset[] { return this.customPresets; }
  getAllPresets(): LayerPreset[] { return [...LAYER_PRESETS, ...this.customPresets]; }

  saveCustomPreset(preset: Omit<LayerPreset, 'id'>): LayerPreset {
    const newPreset: LayerPreset = { ...preset, id: `custom_${Date.now()}` };
    this.customPresets.push(newPreset);
    return newPreset;
  }

  deleteCustomPreset(id: string): void {
    this.customPresets = this.customPresets.filter((p) => p.id !== id);
  }

  applyPreset(preset: LayerPreset): Partial<Layer>[] {
    return preset.layers.map((layer) => ({
      ...layer,
      id: `layer_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      isVisible: true,
      isLocked: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));
  }
}

export const layerPresetManager = new LayerPresetManager();
