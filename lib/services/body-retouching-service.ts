// Copyright © Knoux. All rights reserved.
/**
 * BodyRetouchingService - Advanced body retouching and enhancement
 */

export interface BodyRetouchingSettings {
  bodySlim: number; // 0-100
  waistSlim: number; // 0-100
  buttEnhance: number; // 0-100
  breastEnhance: number; // 0-100
  legSlim: number; // 0-100
  heightAdjust: number; // 0-100
  muscleEnhance: number; // 0-100
  skinSmoothing: number; // 0-100
  bodyBrightness: number; // 0-100
  bodyContrast: number; // 0-100
}

export interface BodyRetouchingPreset {
  id: string;
  name: string;
  description: string;
  settings: BodyRetouchingSettings;
  category: "slim" | "enhance" | "athletic" | "natural";
}

class BodyRetouchingServiceClass {
  private presets: Map<string, BodyRetouchingPreset> = new Map();
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializePresets();
  }

  private initializePresets(): void {
    const presets: BodyRetouchingPreset[] = [
      {
        id: "preset_slim_natural",
        name: "Natural Slim",
        description: "Subtle body slimming with natural appearance",
        category: "slim",
        settings: {
          bodySlim: 25,
          waistSlim: 30,
          buttEnhance: 10,
          breastEnhance: 0,
          legSlim: 20,
          heightAdjust: 0,
          muscleEnhance: 0,
          skinSmoothing: 15,
          bodyBrightness: 5,
          bodyContrast: 10,
        },
      },
      {
        id: "preset_slim_dramatic",
        name: "Dramatic Slim",
        description: "Significant body slimming effect",
        category: "slim",
        settings: {
          bodySlim: 50,
          waistSlim: 60,
          buttEnhance: 20,
          breastEnhance: 0,
          legSlim: 45,
          heightAdjust: 0,
          muscleEnhance: 0,
          skinSmoothing: 25,
          bodyBrightness: 10,
          bodyContrast: 15,
        },
      },
      {
        id: "preset_enhance_curves",
        name: "Enhance Curves",
        description: "Enhance body curves and contours",
        category: "enhance",
        settings: {
          bodySlim: 15,
          waistSlim: 20,
          buttEnhance: 50,
          breastEnhance: 40,
          legSlim: 10,
          heightAdjust: 0,
          muscleEnhance: 0,
          skinSmoothing: 20,
          bodyBrightness: 8,
          bodyContrast: 12,
        },
      },
      {
        id: "preset_athletic",
        name: "Athletic Build",
        description: "Enhance athletic and muscular appearance",
        category: "athletic",
        settings: {
          bodySlim: 20,
          waistSlim: 25,
          buttEnhance: 30,
          breastEnhance: 0,
          legSlim: 15,
          heightAdjust: 10,
          muscleEnhance: 60,
          skinSmoothing: 15,
          bodyBrightness: 10,
          bodyContrast: 20,
        },
      },
      {
        id: "preset_natural",
        name: "Natural Enhancement",
        description: "Minimal enhancement for natural look",
        category: "natural",
        settings: {
          bodySlim: 10,
          waistSlim: 10,
          buttEnhance: 5,
          breastEnhance: 0,
          legSlim: 5,
          heightAdjust: 0,
          muscleEnhance: 0,
          skinSmoothing: 10,
          bodyBrightness: 3,
          bodyContrast: 5,
        },
      },
    ];

    presets.forEach((preset) => {
      this.presets.set(preset.id, preset);
    });
  }

  getPresets(): BodyRetouchingPreset[] {
    return Array.from(this.presets.values());
  }

  getPreset(presetId: string): BodyRetouchingPreset | undefined {
    return this.presets.get(presetId);
  }

  getPresetsByCategory(category: string): BodyRetouchingPreset[] {
    return Array.from(this.presets.values()).filter(
      (p) => p.category === category
    );
  }

  applyRetouching(
    settings: BodyRetouchingSettings
  ): Promise<{ success: boolean; message: string }> {
    this.emit("retouchingApplied", { settings });
    return {success: true,
          message: "Body retouching applied successfully",};
  }

  createCustomPreset(
    name: string,
    description: string,
    settings: BodyRetouchingSettings
  ): BodyRetouchingPreset {
    const preset: BodyRetouchingPreset = {
      id: `custom_${Date.now()}`,
      name,
      description,
      settings,
      category: "natural",
    };

    this.presets.set(preset.id, preset);
    this.emit("presetCreated", { preset });
    return preset;
  }

  deleteCustomPreset(presetId: string): void {
    if (presetId.startsWith("custom_")) {
      this.presets.delete(presetId);
      this.emit("presetDeleted", { presetId });
    }
  }

  on(event: string, cb: Function): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(cb);
  }

  off(event: string, cb: Function): void {
    this.listeners.set(
      event,
      (this.listeners.get(event) || []).filter((c) => c !== cb)
    );
  }

  private emit(event: string, data: any): void {
    (this.listeners.get(event) || []).forEach((cb) => cb(data));
  }
}

export const BodyRetouchingService = new BodyRetouchingServiceClass();
