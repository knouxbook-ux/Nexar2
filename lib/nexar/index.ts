// Copyright © Knoux. All rights reserved.
/**
 * 🚀 KNOUX NEXAR — Services Index
 * مُدمج من: ServiceRegistry.ts + AdvancedServices.ts + RetouchEngine.ts
 * نقطة الدخول الواحدة لجميع خدمات NEXAR
 */

// ── من ServiceRegistry.ts الأصلي ────────────────────────────
export type { NexarService } from './ServiceRegistry';
export {
  RECORDING_SERVICES,
  EDITING_SERVICES,
  IMAGE_SERVICES,
  INTERACTION_SERVICES,
} from './ServiceRegistry';

// ── من RetouchEngine.ts الأصلي ──────────────────────────────
export type {
  RetouchOptions,
  RetouchResult,
  RetouchCategory,
  RetouchService,
} from './RetouchEngine';
export {
  SKIN_SERVICES,
  EYES_SERVICES,
  NOSE_SERVICES,
  LIPS_SERVICES,
  TEETH_SERVICES,
  ALL_RETOUCH_SERVICES,
  applyRetouch,
  applyBatchRetouch,
} from './RetouchEngine';

// ── من AdvancedServices.ts الأصلي ───────────────────────────
export {
  ACCESSIBILITY_SERVICES,
  SOCIAL_SERVICES,
  AI_BASIC_SERVICES,
  ADVANCED_CATEGORIES,
} from './AdvancedServices';

// ── إحصائيات مجمّعة ─────────────────────────────────────────
export const NEXAR_STATS = {
  totalServices: 337,
  categories: 13,
  retouchServices: 85,
  aiServices: 20,
  freeServices: 280,
  premiumServices: 57,
  version: '2.0.0',
  developer: 'Eng. Sadek Elgazar (Abu Ritaj)',
  company: 'KNOUX Technology',
  location: 'Abu Dhabi, UAE',
};
