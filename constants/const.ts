// Copyright © Knoux. All rights reserved.
// ─── Knoux Nexar Pro v3.0 — Application Constants ────────────────────────────

export const COOKIE_NAME = "nexar_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = "يرجى تسجيل الدخول (10001)";
export const NOT_ADMIN_ERR_MSG = "لا تملك الصلاحيات المطلوبة (10002)";

// ─── App Identity ─────────────────────────────────────────────────────────────
export const APP_NAME = "Nexar Pro";
export const APP_BRAND = "Knoux";
export const APP_VERSION = "3.0.0";
export const APP_BUNDLE_ID = "com.knoux.nexarpro";
export const APP_DOMAIN = "nexarpro.app";
export const APP_SUPPORT_EMAIL = "support@nexarpro.app";
export const APP_WEBSITE = "https://nexarpro.app";

// ─── Subscription Plans ───────────────────────────────────────────────────────
export const PLAN_FREE_LIMIT_MINUTES = 30;
export const PLAN_FREE_STORAGE_GB = 1;
export const PLAN_PRO_STORAGE_GB = 5;
export const PLAN_PREMIUM_STORAGE_GB = -1; // unlimited

// ─── Recording Limits ─────────────────────────────────────────────────────────
export const MAX_RECORDING_RESOLUTIONS = ['720p', '1080p', '4K', '8K'];
export const MAX_RECORDING_FPS = [24, 30, 60, 120];
export const MAX_SLOW_MOTION_FPS = 240;

// ─── Streaming Platforms ──────────────────────────────────────────────────────
export const RTMP_YOUTUBE  = 'rtmp://a.rtmp.youtube.com/live2/';
export const RTMP_TWITCH   = 'rtmp://live.twitch.tv/live/';
export const RTMP_TIKTOK   = 'rtmp://push.tiktok.com/live/';
export const RTMPS_FACEBOOK = 'rtmps://live-api-s.facebook.com/rtmp/';

// ─── Security ─────────────────────────────────────────────────────────────────
export const ENCRYPTION_ALGORITHM = 'AES-256-GCM';
export const MAX_PIN_ATTEMPTS = 5;
export const AUTO_LOCK_DEFAULT_MS = 60_000; // 1 minute

// ─── UI / UX ──────────────────────────────────────────────────────────────────
export const NEXAR_PURPLE = '#A78BFA';
export const NEXAR_DARK   = '#7C3AED';
export const NEXAR_PINK   = '#EC4899';
export const NEXAR_BG     = '#07070f';
export const NEXAR_SURFACE = '#0f0e1a';
export const ANIMATION_DURATION_DEFAULT = 350;

// ─── License ──────────────────────────────────────────────────────────────────
export const LICENSE_KEY_FORMAT = 'XXXX-XXXX-XXXX-XXXX';
export const LICENSE_KEY_REGEX = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
