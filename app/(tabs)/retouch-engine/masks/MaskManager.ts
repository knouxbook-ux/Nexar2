// Copyright © Knoux. All rights reserved.
/**
 * 🎭 Retouch Engine — Mask Manager
 * مدير الأقنعة الشامل
 */

export type MaskType = 'lasso' | 'polygon' | 'brush' | 'eraser' | 'ai' | 'gradient' | 'luminosity';

export interface MaskData {
  id: string;
  type: MaskType;
  uri?: string;
  points?: { x: number; y: number }[];
  opacity: number;
  isInverted: boolean;
  feather: number;
  name: string;
  createdAt: number;
}

export class MaskManager {
  private masks: MaskData[] = [];
  private activeMaskId: string | null = null;

  getMasks(): MaskData[] { return [...this.masks]; }

  getActiveMask(): MaskData | undefined {
    if (!this.activeMaskId) return undefined;
    return this.masks.find((m) => m.id === this.activeMaskId);
  }

  createMask(type: MaskType, name?: string): MaskData {
    const mask: MaskData = {
      id: `mask_${Date.now()}`,
      type,
      opacity: 1,
      isInverted: false,
      feather: 0,
      name: name ?? `قناع ${type}`,
      createdAt: Date.now(),
    };
    this.masks.push(mask);
    this.activeMaskId = mask.id;
    return mask;
  }

  updateMask(id: string, updates: Partial<MaskData>): void {
    this.masks = this.masks.map((m) => m.id === id ? { ...m, ...updates } : m);
  }

  deleteMask(id: string): void {
    this.masks = this.masks.filter((m) => m.id !== id);
    if (this.activeMaskId === id) {
      this.activeMaskId = this.masks[this.masks.length - 1]?.id ?? null;
    }
  }

  invertMask(id: string): void {
    this.updateMask(id, { isInverted: !this.masks.find((m) => m.id === id)?.isInverted });
  }

  setFeather(id: string, feather: number): void {
    this.updateMask(id, { feather: Math.max(0, Math.min(100, feather)) });
  }

  mergeAllMasks(): MaskData {
    return this.createMask('lasso', 'أقنعة مدمجة');
  }

  clearAll(): void {
    this.masks = [];
    this.activeMaskId = null;
  }

  selectMask(id: string): void {
    this.activeMaskId = id;
  }
}

export const maskManager = new MaskManager();
