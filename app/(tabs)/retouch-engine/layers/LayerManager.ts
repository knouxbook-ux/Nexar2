// Copyright © Knoux. All rights reserved.
/**
 * 🗂️ Retouch Engine — Layer Manager
 * إدارة الطبقات الاحترافية
 */

export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'soft-light' | 'hard-light' | 'difference' | 'exclusion';

export interface Layer {
  id: string;
  name: string;
  type: 'image' | 'adjustment' | 'text' | 'shape' | 'mask' | 'group';
  isVisible: boolean;
  isLocked: boolean;
  opacity: number;
  blendMode: BlendMode;
  uri?: string;
  children?: Layer[];
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export class LayerManager {
  private layers: Layer[] = [];
  private selectedLayerId: string | null = null;
  private listeners: Map<string, ((layers: Layer[]) => void)[]> = new Map();

  constructor(initialLayers: Layer[] = []) {
    this.layers = initialLayers;
  }

  getLayers(): Layer[] {
    return [...this.layers];
  }

  getSelectedLayer(): Layer | undefined {
    if (!this.selectedLayerId) return undefined;
    return this.findLayer(this.selectedLayerId);
  }

  selectLayer(id: string | null): void {
    this.selectedLayerId = id;
    this.emit('select', this.layers);
  }

  addLayer(layer: Omit<Layer, 'id' | 'createdAt' | 'updatedAt'>): Layer {
    const newLayer: Layer = {
      ...layer,
      id: `layer_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.layers.push(newLayer);
    this.emit('add', this.layers);
    return newLayer;
  }

  removeLayer(id: string): void {
    this.layers = this.layers.filter((l) => l.id !== id);
    if (this.selectedLayerId === id) this.selectedLayerId = null;
    this.emit('remove', this.layers);
  }

  updateLayer(id: string, updates: Partial<Layer>): void {
    this.layers = this.layers.map((l) =>
      l.id === id ? { ...l, ...updates, updatedAt: Date.now() } : l
    );
    this.emit('update', this.layers);
  }

  moveLayer(id: string, direction: 'up' | 'down'): void {
    const idx = this.layers.findIndex((l) => l.id === id);
    if (idx < 0) return;
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= this.layers.length) return;
    const newLayers = [...this.layers];
    [newLayers[idx], newLayers[target]] = [newLayers[target], newLayers[idx]];
    this.layers = newLayers;
    this.emit('reorder', this.layers);
  }

  duplicateLayer(id: string): Layer | undefined {
    const layer = this.findLayer(id);
    if (!layer) return undefined;
    const duplicate = this.addLayer({ ...layer, name: `${layer.name} (نسخة)` });
    return duplicate;
  }

  mergeVisibleLayers(): Layer {
    const visible = this.layers.filter((l) => l.isVisible);
    const merged = this.addLayer({
      name: 'طبقة مدمجة',
      type: 'image',
      isVisible: true,
      isLocked: false,
      opacity: 1,
      blendMode: 'normal',
      metadata: { mergedFrom: visible.map((l) => l.id) },
    });
    return merged;
  }

  private findLayer(id: string): Layer | undefined {
    const search = (layers: Layer[]): Layer | undefined => {
      for (const layer of layers) {
        if (layer.id === id) return layer;
        if (layer.children) {
          const found = search(layer.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return search(this.layers);
  }

  on(event: string, callback: (layers: Layer[]) => void): () => void {
    const callbacks = this.listeners.get(event) ?? [];
    callbacks.push(callback);
    this.listeners.set(event, callbacks);
    return () => {
      this.listeners.set(event, (this.listeners.get(event) ?? []).filter((cb) => cb !== callback));
    };
  }

  private emit(event: string, layers: Layer[]): void {
    (this.listeners.get(event) ?? []).forEach((cb) => cb(layers));
    (this.listeners.get('change') ?? []).forEach((cb) => cb(layers));
  }

  toJSON(): string {
    return JSON.stringify({ layers: this.layers, selectedLayerId: this.selectedLayerId });
  }

  static fromJSON(json: string): LayerManager {
    const { layers, selectedLayerId } = JSON.parse(json);
    const manager = new LayerManager(layers);
    manager.selectedLayerId = selectedLayerId;
    return manager;
  }
}

export const layerManager = new LayerManager();
