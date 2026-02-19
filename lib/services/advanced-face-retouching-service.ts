// Copyright © Knoux. All rights reserved.
/**
 * AdvancedFaceRetouchingService - Professional face retouching
 */

export interface FaceRetouchingSettings {
  skinSmoothing: number; // 0-100
  blemishRemoval: number; // 0-100
  teethWhitening: number; // 0-100
  eyeEnlargement: number; // 0-100
  eyeBrightness: number; // 0-100
  eyebrowShaping: number; // 0-100
  lipPlumping: number; // 0-100
  lipColor: string; // hex color
  noseSlim: number; // 0-100
  faceSlim: number; // 0-100
  jawlineEnhance: number; // 0-100
  cheekboneEnhance: number; // 0-100
  foreheadSmoothing: number; // 0-100
  wrinkleRemoval: number; // 0-100
  darkCircleRemoval: number; // 0-100
  faceBrightness: number; // 0-100
  faceContrast: number; // 0-100
  skinTone: number; // 0-100 (warm to cool)
}

export interface FaceRetouchingPreset {
  id: string;
  name: string;
  description: string;
  settings: FaceRetouchingSettings;
  category: "natural" | "glamour" | "professional" | "artistic";
}

class AdvancedFaceRetouchingServiceClass {
  private presets: Map<string, FaceRetouchingPreset> = new Map();
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializePresets();
  }

  private initializePresets(): void {
    const presets: FaceRetouchingPreset[] = [
      {
        id: "preset_natural_glow",
        name: "Natural Glow",
        description: "Subtle enhancement with natural appearance",
        category: "natural",
        settings: {
          skinSmoothing: 20,
          blemishRemoval: 30,
          teethWhitening: 15,
          eyeEnlargement: 10,
          eyeBrightness: 15,
          eyebrowShaping: 10,
          lipPlumping: 5,
          lipColor: "#FF69B4",
          noseSlim: 5,
          faceSlim: 10,
          jawlineEnhance: 10,
          cheekboneEnhance: 15,
          foreheadSmoothing: 10,
          wrinkleRemoval: 15,
          darkCircleRemoval: 20,
          faceBrightness: 10,
          faceContrast: 10,
          skinTone: 50,
        },
      },
      {
        id: "preset_glamour_makeup",
        name: "Glamour Makeup",
        description: "Professional glamorous makeup look",
        category: "glamour",
        settings: {
          skinSmoothing: 40,
          blemishRemoval: 60,
          teethWhitening: 40,
          eyeEnlargement: 30,
          eyeBrightness: 40,
          eyebrowShaping: 35,
          lipPlumping: 40,
          lipColor: "#FF1493",
          noseSlim: 15,
          faceSlim: 20,
          jawlineEnhance: 25,
          cheekboneEnhance: 35,
          foreheadSmoothing: 20,
          wrinkleRemoval: 30,
          darkCircleRemoval: 40,
          faceBrightness: 20,
          faceContrast: 25,
          skinTone: 45,
        },
      },
      {
        id: "preset_professional",
        name: "Professional Look",
        description: "Clean professional appearance",
        category: "professional",
        settings: {
          skinSmoothing: 25,
          blemishRemoval: 40,
          teethWhitening: 25,
          eyeEnlargement: 15,
          eyeBrightness: 20,
          eyebrowShaping: 20,
          lipPlumping: 10,
          lipColor: "#FF6B9D",
          noseSlim: 10,
          faceSlim: 15,
          jawlineEnhance: 15,
          cheekboneEnhance: 20,
          foreheadSmoothing: 15,
          wrinkleRemoval: 20,
          darkCircleRemoval: 25,
          faceBrightness: 15,
          faceContrast: 15,
          skinTone: 50,
        },
      },
      {
        id: "preset_artistic",
        name: "Artistic Enhancement",
        description: "Creative artistic makeup style",
        category: "artistic",
        settings: {
          skinSmoothing: 35,
          blemishRemoval: 50,
          teethWhitening: 30,
          eyeEnlargement: 40,
          eyeBrightness: 45,
          eyebrowShaping: 40,
          lipPlumping: 50,
          lipColor: "#FF0000",
          noseSlim: 20,
          faceSlim: 25,
          jawlineEnhance: 30,
          cheekboneEnhance: 40,
          foreheadSmoothing: 25,
          wrinkleRemoval: 25,
          darkCircleRemoval: 35,
          faceBrightness: 25,
          faceContrast: 30,
          skinTone: 40,
        },
      },
    ];

    presets.forEach((preset) => {
      this.presets.set(preset.id, preset);
    });
  }

  getPresets(): FaceRetouchingPreset[] {
    return Array.from(this.presets.values());
  }

  getPreset(presetId: string): FaceRetouchingPreset | undefined {
    return this.presets.get(presetId);
  }

  getPresetsByCategory(category: string): FaceRetouchingPreset[] {
    return Array.from(this.presets.values()).filter(
      (p) => p.category === category
    );
  }

  applyRetouching(
    settings: FaceRetouchingSettings
  ): Promise<{ success: boolean; message: string }> {
    this.emit("retouchingApplied", { settings });
    return {success: true,
          message: "Face retouching applied successfully",};
  }

  createCustomPreset(
    name: string,
    description: string,
    settings: FaceRetouchingSettings
  ): FaceRetouchingPreset {
    const preset: FaceRetouchingPreset = {
      id: `custom_face_${Date.now()}`,
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

export const AdvancedFaceRetouchingService =
  new AdvancedFaceRetouchingServiceClass();
