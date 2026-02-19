// Copyright © Knoux. All rights reserved.
/**
 * ⚡ KNOUX NEXAR PRO — Services Hub الكامل
 * قسم متكامل يضم 60+ خدمة احترافية في 12 قسم
 * مع بطاقات تفاعلية، تصاريح، ونظام اشتراك مدمج
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
  StatusBar,
  Platform,
  FlatList,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { useLanguage } from "@/lib/language-context";
import { useNexarState } from "@/hooks/use-nexar-state";

const { width } = Dimensions.get("window");

// ─── أنواع البيانات ────────────────────────────────────────────────────────
type ServiceTier = "free" | "pro" | "premium";

interface Service {
  id: string;
  icon: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  tier: ServiceTier;
  isNew?: boolean;
  isHot?: boolean;
  route?: string;
  color: string;
}

interface ServiceCategory {
  id: string;
  icon: string;
  titleAr: string;
  titleEn: string;
  gradient: readonly [string, string];
  services: Service[];
}

// ─── بيانات الخدمات الكاملة ───────────────────────────────────────────────

const ALL_CATEGORIES: ServiceCategory[] = [
  // ═══════════════════════════════════════════════
  // 🎬 تسجيل الوسائط
  // ═══════════════════════════════════════════════
  {
    id: "media",
    icon: "🎬",
    titleAr: "تسجيل الوسائط",
    titleEn: "Media Recording",
    gradient: ["#7C3AED", "#A78BFA"] as const,
    services: [
      {
        id: "m1",
        icon: "📱",
        nameAr: "تسجيل الشاشة HD",
        nameEn: "Screen Recording HD",
        descAr: "جودة 1080p مع صوت",
        descEn: "1080p with audio",
        tier: "free",
        color: "#8B5CF6",
        route: "/(tabs)/screen-recording",
      },
      {
        id: "m2",
        icon: "📹",
        nameAr: "تسجيل 4K/8K",
        nameEn: "4K/8K Recording",
        descAr: "دقة خارقة ب60 FPS",
        descEn: "Ultra-res 60 FPS",
        tier: "premium",
        isHot: true,
        color: "#7C3AED",
        route: "/(tabs)/screen-recording",
      },
      {
        id: "m3",
        icon: "🎙️",
        nameAr: "استوديو صوتي",
        nameEn: "Audio Studio",
        descAr: "تسجيل احترافي متعدد القنوات",
        descEn: "Multi-track pro recording",
        tier: "pro",
        color: "#6D28D9",
        route: "/(tabs)/audio-recording",
      },
      {
        id: "m4",
        icon: "📡",
        nameAr: "بث مباشر",
        nameEn: "Live Streaming",
        descAr: "YouTube · Twitch · Facebook",
        descEn: "YouTube · Twitch · Facebook",
        tier: "pro",
        isHot: true,
        color: "#FF4500",
        route: "/(tabs)/streaming",
      },
      {
        id: "m5",
        icon: "📷",
        nameAr: "كاميرات متعددة",
        nameEn: "Multi-Camera",
        descAr: "PIP وتتبع الحركة",
        descEn: "PIP & motion tracking",
        tier: "premium",
        color: "#9370DB",
        route: "/(tabs)/multi-camera",
      },
      {
        id: "m6",
        icon: "⏺️",
        nameAr: "تسجيل في الخلفية",
        nameEn: "Background Recording",
        descAr: "تسجيل مستمر بدون توقف",
        descEn: "Continuous background mode",
        tier: "pro",
        isNew: true,
        color: "#5B21B6",
        route: "/(tabs)/screen-recording",
      },
      {
        id: "m7",
        icon: "🎞️",
        nameAr: "تقطير الفيديو",
        nameEn: "Time-lapse Mode",
        descAr: "Time-lapse وSlow-mo",
        descEn: "Time-lapse & Slow-motion",
        tier: "free",
        color: "#4C1D95",
        route: "/(tabs)/screen-recording",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // ✂️ تحرير الفيديو
  // ═══════════════════════════════════════════════
  {
    id: "editing",
    icon: "✂️",
    titleAr: "تحرير الفيديو",
    titleEn: "Video Editing",
    gradient: ["#1D4ED8", "#60A5FA"] as const,
    services: [
      {
        id: "e1",
        icon: "✂️",
        nameAr: "قص ودمج",
        nameEn: "Trim & Merge",
        descAr: "قص دقيق وربط المقاطع",
        descEn: "Precision trim & splice",
        tier: "free",
        color: "#3B82F6",
        route: "/(tabs)/video-editing",
      },
      {
        id: "e2",
        icon: "🎨",
        nameAr: "تدريج الألوان",
        nameEn: "Color Grading",
        descAr: "LUT + تصحيح احترافي",
        descEn: "LUT + pro correction",
        tier: "pro",
        color: "#2563EB",
        route: "/(tabs)/video-editing",
      },
      {
        id: "e3",
        icon: "🌊",
        nameAr: "انتقالات سلسة",
        nameEn: "Smooth Transitions",
        descAr: "50+ تأثير انتقال",
        descEn: "50+ transition effects",
        tier: "pro",
        color: "#1E40AF",
        route: "/(tabs)/video-editing",
      },
      {
        id: "e4",
        icon: "📝",
        nameAr: "ترجمات تلقائية",
        nameEn: "Auto Subtitles",
        descAr: "ترجمة AI بـ40+ لغة",
        descEn: "AI subtitles in 40+ langs",
        tier: "premium",
        isHot: true,
        color: "#1D4ED8",
        route: "/(tabs)/ai-features",
      },
      {
        id: "e5",
        icon: "🔊",
        nameAr: "مزج الصوت",
        nameEn: "Audio Mixing",
        descAr: "EQ + مستويات متعددة",
        descEn: "EQ + multi-track levels",
        tier: "pro",
        color: "#1E3A8A",
        route: "/(tabs)/audio-recording",
      },
      {
        id: "e6",
        icon: "💧",
        nameAr: "إزالة العلامة المائية",
        nameEn: "Remove Watermark",
        descAr: "AI لإزالة أي علامة",
        descEn: "AI watermark remover",
        tier: "premium",
        isNew: true,
        color: "#1D4ED8",
        route: "/(tabs)/video-editing",
      },
      {
        id: "e7",
        icon: "📤",
        nameAr: "تصدير متعدد",
        nameEn: "Multi-Export",
        descAr: "MP4, MOV, AVI, WebM",
        descEn: "MP4, MOV, AVI, WebM",
        tier: "free",
        color: "#2563EB",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // 🎨 استوديو الريتوش والجمال
  // ═══════════════════════════════════════════════
  {
    id: "beauty",
    icon: "🎨",
    titleAr: "استوديو الجمال",
    titleEn: "Beauty Studio",
    gradient: ["#BE185D", "#F9A8D4"] as const,
    services: [
      {
        id: "b1",
        icon: "✨",
        nameAr: "85+ خدمة ريتوش",
        nameEn: "85+ Retouch Services",
        descAr: "بشرة • عيون • شفاه • AI",
        descEn: "Skin, eyes, lips, AI",
        tier: "pro",
        isHot: true,
        color: "#EC4899",
        route: "/(tabs)/nexar-retouch",
      },
      {
        id: "b2",
        icon: "🧴",
        nameAr: "تنعيم البشرة AI",
        nameEn: "AI Skin Smoothing",
        descAr: "تنعيم بالذكاء الاصطناعي",
        descEn: "AI-powered skin smoothing",
        tier: "pro",
        color: "#DB2777",
        route: "/(tabs)/face-retouching",
      },
      {
        id: "b3",
        icon: "👄",
        nameAr: "مكياج افتراضي",
        nameEn: "Virtual Makeup",
        descAr: "تجربة المكياج مباشرة",
        descEn: "Live virtual makeup try-on",
        tier: "premium",
        isNew: true,
        color: "#BE185D",
        route: "/(tabs)/beauty-makeup",
      },
      {
        id: "b4",
        icon: "🦷",
        nameAr: "تبييض الأسنان",
        nameEn: "Teeth Whitening",
        descAr: "تبييض دقيق وطبيعي",
        descEn: "Precise natural whitening",
        tier: "free",
        color: "#9D174D",
        route: "/(tabs)/face-retouching",
      },
      {
        id: "b5",
        icon: "💆",
        nameAr: "جسم وتقليم",
        nameEn: "Body Retouching",
        descAr: "تنسيق الجسم",
        descEn: "Full body reshaping",
        tier: "premium",
        color: "#831843",
        route: "/(tabs)/face-retouching",
      },
      {
        id: "b6",
        icon: "💅",
        nameAr: "لون البشرة",
        nameEn: "Skin Tone Adjust",
        descAr: "توحيد وضبط اللون",
        descEn: "Unify & adjust skin tone",
        tier: "free",
        color: "#EC4899",
        route: "/(tabs)/face-retouching",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // ✨ المؤثرات البصرية
  // ═══════════════════════════════════════════════
  {
    id: "effects",
    icon: "✨",
    titleAr: "المؤثرات البصرية",
    titleEn: "Visual Effects",
    gradient: ["#D97706", "#FCD34D"] as const,
    services: [
      {
        id: "vfx1",
        icon: "🌈",
        nameAr: "100+ فلتر",
        nameEn: "100+ Filters",
        descAr: "فلاتر فنية ومتقدمة",
        descEn: "Artistic & advanced filters",
        tier: "free",
        color: "#F59E0B",
        route: "/(tabs)/effects",
      },
      {
        id: "vfx2",
        icon: "🎆",
        nameAr: "جسيمات متحركة",
        nameEn: "Particle Effects",
        descAr: "نيران • ثلج • نجوم",
        descEn: "Fire, snow, stars",
        tier: "pro",
        color: "#D97706",
        route: "/(tabs)/effects",
      },
      {
        id: "vfx3",
        icon: "🟩",
        nameAr: "Chroma Key",
        nameEn: "Chroma Key / Green Screen",
        descAr: "خلفية خضراء احترافية",
        descEn: "Pro green screen removal",
        tier: "pro",
        color: "#B45309",
        route: "/(tabs)/effects",
      },
      {
        id: "vfx4",
        icon: "☀️",
        nameAr: "HDR محسّن",
        nameEn: "HDR Enhancement",
        descAr: "تعزيز النطاق الديناميكي",
        descEn: "Dynamic range boost",
        tier: "premium",
        isNew: true,
        color: "#92400E",
        route: "/(tabs)/effects",
      },
      {
        id: "vfx5",
        icon: "🌃",
        nameAr: "تدريج الألوان اللقطة",
        nameEn: "Cinematic Look",
        descAr: "إضاءة سينمائية",
        descEn: "Hollywood-style color look",
        tier: "premium",
        isHot: true,
        color: "#F59E0B",
        route: "/(tabs)/effects",
      },
      {
        id: "vfx6",
        icon: "💨",
        nameAr: "ضبابية الخلفية",
        nameEn: "Background Blur",
        descAr: "بوكيه ذكي للخلفية",
        descEn: "Smart bokeh background",
        tier: "pro",
        color: "#D97706",
        route: "/(tabs)/effects",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // 🤖 الذكاء الاصطناعي
  // ═══════════════════════════════════════════════
  {
    id: "ai",
    icon: "🤖",
    titleAr: "الذكاء الاصطناعي",
    titleEn: "AI Intelligence",
    gradient: ["#0369A1", "#38BDF8"] as const,
    services: [
      {
        id: "ai1",
        icon: "🗣️",
        nameAr: "تحويل صوت إلى نص",
        nameEn: "Voice to Text",
        descAr: "دقة 99% بـ 40+ لغة",
        descEn: "99% accuracy, 40+ languages",
        tier: "pro",
        isHot: true,
        color: "#0EA5E9",
        route: "/(tabs)/ai-features",
      },
      {
        id: "ai2",
        icon: "🎯",
        nameAr: "كشف اللحظات البارزة",
        nameEn: "Highlight Detection",
        descAr: "AI يجد أفضل اللحظات",
        descEn: "AI finds best moments",
        tier: "premium",
        color: "#0284C7",
        route: "/(tabs)/ai-features",
      },
      {
        id: "ai3",
        icon: "🎬",
        nameAr: "تحليل المشاهد",
        nameEn: "Scene Analysis",
        descAr: "تحليل المحتوى تلقائياً",
        descEn: "Automatic content analysis",
        tier: "premium",
        isNew: true,
        color: "#0369A1",
        route: "/(tabs)/ai-features",
      },
      {
        id: "ai4",
        icon: "📊",
        nameAr: "تحليل المشاعر",
        nameEn: "Sentiment Analysis",
        descAr: "قياس مشاعر المتحدث",
        descEn: "Speaker emotion detection",
        tier: "premium",
        color: "#075985",
        route: "/(tabs)/ai-features",
      },
      {
        id: "ai5",
        icon: "✍️",
        nameAr: "توليد عناوين",
        nameEn: "Auto Title Generator",
        descAr: "عناوين SEO بالذكاء الاصطناعي",
        descEn: "AI-powered SEO titles",
        tier: "pro",
        color: "#0C4A6E",
        route: "/(tabs)/ai-features",
      },
      {
        id: "ai6",
        icon: "🔍",
        nameAr: "التعرف على المحتوى",
        nameEn: "Content Recognition",
        descAr: "تعرف على الأشياء والأماكن",
        descEn: "Objects & places recognition",
        tier: "premium",
        color: "#38BDF8",
        route: "/(tabs)/ai-features",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // 📊 الإحصاءات والتحليلات
  // ═══════════════════════════════════════════════
  {
    id: "analytics",
    icon: "📊",
    titleAr: "إحصاءات متقدمة",
    titleEn: "Advanced Analytics",
    gradient: ["#065F46", "#34D399"] as const,
    services: [
      {
        id: "an1",
        icon: "📈",
        nameAr: "إحصاءات الجلسة",
        nameEn: "Session Statistics",
        descAr: "وقت التسجيل والمشاهدات",
        descEn: "Recording time & views",
        tier: "free",
        color: "#10B981",
        route: "/(tabs)/analytics",
      },
      {
        id: "an2",
        icon: "📅",
        nameAr: "تقارير يومية",
        nameEn: "Daily Reports",
        descAr: "ملخص يومي تفصيلي",
        descEn: "Detailed daily summary",
        tier: "pro",
        color: "#059669",
        route: "/(tabs)/analytics",
      },
      {
        id: "an3",
        icon: "🌍",
        nameAr: "تحليل الجمهور",
        nameEn: "Audience Analytics",
        descAr: "من أين يأتي جمهورك",
        descEn: "Where your audience comes from",
        tier: "premium",
        isNew: true,
        color: "#047857",
      },
      {
        id: "an4",
        icon: "💰",
        nameAr: "تقرير الإيرادات",
        nameEn: "Revenue Report",
        descAr: "أرباح وعمولات تفصيلية",
        descEn: "Detailed earnings & commissions",
        tier: "premium",
        color: "#065F46",
      },
      {
        id: "an5",
        icon: "⚡",
        nameAr: "أداء الجهاز",
        nameEn: "Device Performance",
        descAr: "CPU • ذاكرة • بطارية",
        descEn: "CPU, memory, battery",
        tier: "free",
        color: "#34D399",
      },
      {
        id: "an6",
        icon: "🎯",
        nameAr: "مقاييس التفاعل",
        nameEn: "Engagement Metrics",
        descAr: "نسبة المشاهدة والإعجاب",
        descEn: "View & like ratios",
        tier: "pro",
        color: "#10B981",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // ☁️ التخزين السحابي
  // ═══════════════════════════════════════════════
  {
    id: "cloud",
    icon: "☁️",
    titleAr: "التخزين السحابي",
    titleEn: "Cloud Storage",
    gradient: ["#1E40AF", "#93C5FD"] as const,
    services: [
      {
        id: "cl1",
        icon: "☁️",
        nameAr: "مزامنة Firebase",
        nameEn: "Firebase Sync",
        descAr: "نسخ احتياطي AES-256",
        descEn: "AES-256 encrypted backup",
        tier: "free",
        color: "#3B82F6",
        route: "/(tabs)/cloud-sync",
      },
      {
        id: "cl2",
        icon: "🔒",
        nameAr: "مخزن مشفر",
        nameEn: "Encrypted Vault",
        descAr: "تشفير عسكري للملفات",
        descEn: "Military-grade encryption",
        tier: "premium",
        color: "#2563EB",
      },
      {
        id: "cl3",
        icon: "🔄",
        nameAr: "مزامنة تلقائية",
        nameEn: "Auto-Sync",
        descAr: "مزامنة في الخلفية",
        descEn: "Background auto-sync",
        tier: "pro",
        color: "#1D4ED8",
      },
      {
        id: "cl4",
        icon: "📦",
        nameAr: "تخزين 1TB",
        nameEn: "1TB Cloud Storage",
        descAr: "مساحة ضخمة للمحتوى",
        descEn: "Massive content storage",
        tier: "premium",
        isHot: true,
        color: "#1E40AF",
      },
      {
        id: "cl5",
        icon: "🌐",
        nameAr: "مشاركة رابط",
        nameEn: "Link Sharing",
        descAr: "شارك بسرعة عبر رابط",
        descEn: "Quick shareable links",
        tier: "free",
        color: "#93C5FD",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // 🎵 استوديو الصوت المتقدم
  // ═══════════════════════════════════════════════
  {
    id: "audio",
    icon: "🎵",
    titleAr: "استوديو الصوت",
    titleEn: "Audio Pro Studio",
    gradient: ["#991B1B", "#FCA5A5"] as const,
    services: [
      {
        id: "au1",
        icon: "🎚️",
        nameAr: "Equalizer متقدم",
        nameEn: "Advanced Equalizer",
        descAr: "32 حزمة تردد احترافية",
        descEn: "32-band professional EQ",
        tier: "pro",
        color: "#EF4444",
      },
      {
        id: "au2",
        icon: "🔇",
        nameAr: "إلغاء الضوضاء AI",
        nameEn: "AI Noise Cancellation",
        descAr: "إزالة الضوضاء بذكاء",
        descEn: "Intelligent noise removal",
        tier: "pro",
        isHot: true,
        color: "#DC2626",
        route: "/(tabs)/audio-recording",
      },
      {
        id: "au3",
        icon: "🎤",
        nameAr: "تأثيرات الصوت",
        nameEn: "Voice Effects",
        descAr: "تغيير الصوت والنبرة",
        descEn: "Voice changer & pitch",
        tier: "pro",
        isNew: true,
        color: "#B91C1C",
      },
      {
        id: "au4",
        icon: "🎶",
        nameAr: "موسيقى خلفية",
        nameEn: "Background Music",
        descAr: "500+ مقطع موسيقي مجاني",
        descEn: "500+ royalty-free tracks",
        tier: "premium",
        color: "#991B1B",
      },
      {
        id: "au5",
        icon: "📻",
        nameAr: "ضغط الصوت",
        nameEn: "Audio Compression",
        descAr: "تقليل الحجم مع الجودة",
        descEn: "Compress with quality",
        tier: "free",
        color: "#EF4444",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // 🏆 الاشتراكات والمكافآت
  // ═══════════════════════════════════════════════
  {
    id: "premium",
    icon: "🏆",
    titleAr: "الاشتراكات والمكافآت",
    titleEn: "Plans & Rewards",
    gradient: ["#B45309", "#FDE68A"] as const,
    services: [
      {
        id: "pr1",
        icon: "💎",
        nameAr: "اشتراك Premium",
        nameEn: "Premium Subscription",
        descAr: "جميع الميزات بدون قيود",
        descEn: "All features, no limits",
        tier: "premium",
        isHot: true,
        color: "#F59E0B",
        route: "/(tabs)/subscriptions",
      },
      {
        id: "pr2",
        icon: "🎁",
        nameAr: "نظام الإحالات",
        nameEn: "Referral System",
        descAr: "اكسب 20% عن كل إحالة",
        descEn: "Earn 20% per referral",
        tier: "free",
        color: "#D97706",
        route: "/(tabs)/referrals",
      },
      {
        id: "pr3",
        icon: "⭐",
        nameAr: "برنامج النقاط",
        nameEn: "Points Program",
        descAr: "اجمع نقاطاً وافتح ميزات",
        descEn: "Collect points, unlock features",
        tier: "free",
        isNew: true,
        color: "#B45309",
      },
      {
        id: "pr4",
        icon: "🏅",
        nameAr: "شارات الإنجاز",
        nameEn: "Achievement Badges",
        descAr: "أنجز مهاماً واحصل على شارات",
        descEn: "Complete tasks, earn badges",
        tier: "free",
        color: "#92400E",
      },
      {
        id: "pr5",
        icon: "💳",
        nameAr: "مفاتيح الترخيص",
        nameEn: "License Keys",
        descAr: "مفاتيح للاستخدام المؤسسي",
        descEn: "Enterprise license keys",
        tier: "premium",
        color: "#FDE68A",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // 🛡️ الخصوصية والأمان
  // ═══════════════════════════════════════════════
  {
    id: "security",
    icon: "🛡️",
    titleAr: "الخصوصية والأمان",
    titleEn: "Privacy & Security",
    gradient: ["#1F2937", "#6B7280"] as const,
    services: [
      {
        id: "sec1",
        icon: "🔐",
        nameAr: "تشفير AES-256",
        nameEn: "AES-256 Encryption",
        descAr: "تشفير عسكري كامل",
        descEn: "Full military encryption",
        tier: "free",
        color: "#6B7280",
      },
      {
        id: "sec2",
        icon: "🧹",
        nameAr: "مسح آمن",
        nameEn: "Secure Wipe",
        descAr: "حذف لا يمكن استعادته",
        descEn: "Unrecoverable file deletion",
        tier: "pro",
        color: "#4B5563",
      },
      {
        id: "sec3",
        icon: "🔑",
        nameAr: "قفل التطبيق",
        nameEn: "App Lock",
        descAr: "قفل ببصمة أو وجه",
        descEn: "Biometric app lock",
        tier: "free",
        color: "#374151",
      },
      {
        id: "sec4",
        icon: "📋",
        nameAr: "سجل الوصول",
        nameEn: "Access Log",
        descAr: "راقب من وصل للملفات",
        descEn: "Monitor file access",
        tier: "premium",
        isNew: true,
        color: "#1F2937",
      },
      {
        id: "sec5",
        icon: "🕵️",
        nameAr: "وضع التخفي",
        nameEn: "Stealth Mode",
        descAr: "تسجيل بدون إشعار",
        descEn: "Silent recording mode",
        tier: "premium",
        color: "#111827",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // 💼 أدوات الأعمال
  // ═══════════════════════════════════════════════
  {
    id: "business",
    icon: "💼",
    titleAr: "أدوات الأعمال",
    titleEn: "Business Tools",
    gradient: ["#0F766E", "#5EEAD4"] as const,
    services: [
      {
        id: "biz1",
        icon: "👥",
        nameAr: "تعاون الفريق",
        nameEn: "Team Collaboration",
        descAr: "مشاركة وتحرير جماعي",
        descEn: "Shared editing workspace",
        tier: "premium",
        isNew: true,
        color: "#14B8A6",
      },
      {
        id: "biz2",
        icon: "🏷️",
        nameAr: "علامة تجارية مخصصة",
        nameEn: "Custom Branding",
        descAr: "شعار + ألوان مخصصة",
        descEn: "Custom logo & colors",
        tier: "premium",
        color: "#0D9488",
      },
      {
        id: "biz3",
        icon: "🔌",
        nameAr: "API مفتوح",
        nameEn: "Open API Access",
        descAr: "دمج مع تطبيقاتك",
        descEn: "Integrate with your apps",
        tier: "premium",
        isHot: true,
        color: "#0F766E",
      },
      {
        id: "biz4",
        icon: "📜",
        nameAr: "فواتير PDF",
        nameEn: "PDF Invoices",
        descAr: "فواتير تلقائية احترافية",
        descEn: "Auto professional invoices",
        tier: "pro",
        color: "#115E59",
      },
      {
        id: "biz5",
        icon: "📧",
        nameAr: "تقارير بالبريد",
        nameEn: "Email Reports",
        descAr: "تقارير دورية بالبريد",
        descEn: "Scheduled email reports",
        tier: "pro",
        color: "#5EEAD4",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // 🎭 الإبداع والقوالب
  // ═══════════════════════════════════════════════
  {
    id: "creative",
    icon: "🎭",
    titleAr: "الإبداع والقوالب",
    titleEn: "Creative Templates",
    gradient: ["#7C2D12", "#FB923C"] as const,
    services: [
      {
        id: "cr1",
        icon: "📋",
        nameAr: "200+ قالب جاهز",
        nameEn: "200+ Ready Templates",
        descAr: "قوالب لكل مناسبة",
        descEn: "Templates for every occasion",
        tier: "pro",
        isHot: true,
        color: "#F97316",
      },
      {
        id: "cr2",
        icon: "🎨",
        nameAr: "ثيمات مخصصة",
        nameEn: "Custom Themes",
        descAr: "صمم ثيم يخصك",
        descEn: "Build your own theme",
        tier: "premium",
        color: "#EA580C",
      },
      {
        id: "cr3",
        icon: "📍",
        nameAr: "طبقات وتراكبات",
        nameEn: "Overlays & Layers",
        descAr: "تراكبات نصوص وصور",
        descEn: "Text & image overlays",
        tier: "pro",
        color: "#C2410C",
      },
      {
        id: "cr4",
        icon: "🖼️",
        nameAr: "صور مصغرة AI",
        nameEn: "AI Thumbnails",
        descAr: "توليد صور مصغرة ذكية",
        descEn: "Smart AI thumbnail gen",
        tier: "premium",
        isNew: true,
        color: "#9A3412",
      },
      {
        id: "cr5",
        icon: "✒️",
        nameAr: "تصميم الخطوط",
        nameEn: "Font Designer",
        descAr: "500+ خط احترافي",
        descEn: "500+ professional fonts",
        tier: "pro",
        color: "#FB923C",
      },
    ],
  },
];

// ─── مكون البطاقة الفردية ───────────────────────────────────────────────────

const TIER_BADGE: Record<
  ServiceTier,
  { label: string; color: string; bg: string }
> = {
  free: { label: "FREE", color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  pro: { label: "PRO", color: "#A78BFA", bg: "rgba(167,139,250,0.15)" },
  premium: { label: "PREMIUM", color: "#FCD34D", bg: "rgba(252,211,77,0.15)" },
};

function ServiceCard({
  service,
  ar,
  onPress,
}: {
  service: Service;
  ar: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const tier = TIER_BADGE[service.tier];

  const handlePressIn = () => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        width: (width - 48) / 2,
        marginBottom: 12,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: `${service.color}40`,
          }}
        >
          {/* أيقونة وشارات */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 28 }}>{service.icon}</Text>
            <View style={{ flexDirection: "row", gap: 4 }}>
              {service.isNew && (
                <View
                  style={{
                    backgroundColor: "rgba(16,185,129,0.2)",
                    borderRadius: 6,
                    paddingHorizontal: 5,
                    paddingVertical: 2,
                  }}
                >
                  <Text
                    style={{ color: "#10B981", fontSize: 9, fontWeight: "800" }}
                  >
                    NEW
                  </Text>
                </View>
              )}
              {service.isHot && (
                <View
                  style={{
                    backgroundColor: "rgba(239,68,68,0.2)",
                    borderRadius: 6,
                    paddingHorizontal: 5,
                    paddingVertical: 2,
                  }}
                >
                  <Text
                    style={{ color: "#EF4444", fontSize: 9, fontWeight: "800" }}
                  >
                    🔥
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* الاسم */}
          <Text
            style={{
              color: "#F1F5F9",
              fontWeight: "700",
              fontSize: 12,
              marginBottom: 4,
              textAlign: ar ? "right" : "left",
            }}
            numberOfLines={2}
          >
            {ar ? service.nameAr : service.nameEn}
          </Text>

          {/* الوصف */}
          <Text
            style={{
              color: "#94A3B8",
              fontSize: 10,
              marginBottom: 10,
              textAlign: ar ? "right" : "left",
            }}
            numberOfLines={2}
          >
            {ar ? service.descAr : service.descEn}
          </Text>

          {/* التيير */}
          <View
            style={{
              backgroundColor: tier.bg,
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 3,
              alignSelf: ar ? "flex-end" : "flex-start",
            }}
          >
            <Text
              style={{ color: tier.color, fontSize: 10, fontWeight: "800" }}
            >
              {tier.label}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── الشاشة الرئيسية ────────────────────────────────────────────────────────

export default function ProServicesScreen() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const isAr = ar;
  const { subscription: nexarPlan } = useNexarState();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | ServiceTier>("all");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  // إحصاءات سريعة
  const totalServices = ALL_CATEGORIES.reduce(
    (a, c) => a + c.services.length,
    0,
  );
  const totalFree = ALL_CATEGORIES.reduce(
    (a, c) => a + c.services.filter((s) => s.tier === "free").length,
    0,
  );

  // فلترة
  const filteredCategories = ALL_CATEGORIES.map((cat) => ({
    ...cat,
    services: cat.services.filter((s) => {
      const matchTier = activeFilter === "all" || s.tier === activeFilter;
      const matchSearch =
        search.trim() === "" ||
        s.nameAr.includes(search) ||
        s.nameEn.toLowerCase().includes(search.toLowerCase()) ||
        s.descAr.includes(search);
      return matchTier && matchSearch;
    }),
  })).filter((cat) => cat.services.length > 0);

  const handleServicePress = (service: Service) => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Check subscription access
    const userPlan = nexarPlan;
    const planOrder = { free: 0, pro: 1, premium: 2 };
    const hasAccess = planOrder[userPlan] >= planOrder[service.tier];

    if (!hasAccess) {
      const planLabel = service.tier === "premium" ? "Premium 👑" : "Pro ⚡";
      Alert.alert(
        isAr
          ? `🔒 ميزة ${service.tier === "premium" ? "بريميم" : "برو"}`
          : `🔒 ${service.tier === "premium" ? "Premium" : "Pro"} Feature`,
        isAr
          ? `${service.nameAr} متاحة في خطة ${service.tier}. قم بالترقية للوصول.`
          : `${service.nameEn} is available in the ${service.tier} plan. Upgrade to access.`,
        [
          { text: isAr ? "إلغاء" : "Cancel", style: "cancel" },
          {
            text: isAr ? `ترقية إلى ${planLabel}` : `Upgrade to ${planLabel}`,
            onPress: () => router.push("/(tabs)/subscriptions"),
          },
        ],
      );
      return;
    }

    if (service.route) {
      router.push(service.route as any);
    } else {
      // No route defined — navigate to most relevant section
      router.push("/(tabs)/pro-services" as any);
    }
  };

  const FILTERS: {
    key: "all" | ServiceTier;
    label: string;
    labelAr: string;
    color: string;
  }[] = [
    { key: "all", label: "All", labelAr: "الكل", color: "#A78BFA" },
    { key: "free", label: "Free", labelAr: "مجاني", color: "#10B981" },
    { key: "pro", label: "Pro", labelAr: "برو", color: "#A78BFA" },
    { key: "premium", label: "Premium", labelAr: "بريميم", color: "#FCD34D" },
  ];

  return (
    <ScreenContainer className="flex-1">
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── الهيدر ───────────────────────────────────── */}
        <Animated.View
          style={{
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-30, 0],
                }),
              },
            ],
          }}
        >
          <LinearGradient
            colors={["#1a0533", "#0a0a1a"]}
            style={{ paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20 }}
          >
            {/* شعار */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 32, marginRight: 10 }}>⚡</Text>
              <View>
                <Text
                  style={{
                    color: "#A78BFA",
                    fontSize: 22,
                    fontWeight: "900",
                    letterSpacing: 1,
                  }}
                >
                  NEXAR PRO
                </Text>
                <Text style={{ color: "#64748B", fontSize: 11 }}>
                  {ar ? "مركز الخدمات الاحترافية" : "Professional Services Hub"}
                </Text>
              </View>
            </View>

            {/* إحصاءات سريعة */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
              {[
                {
                  label: ar ? "خدمة" : "Services",
                  value: totalServices,
                  color: "#A78BFA",
                },
                {
                  label: ar ? "قسم" : "Categories",
                  value: ALL_CATEGORIES.length,
                  color: "#38BDF8",
                },
                {
                  label: ar ? "مجاني" : "Free",
                  value: totalFree,
                  color: "#10B981",
                },
              ].map((stat) => (
                <View
                  key={stat.label}
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderRadius: 12,
                    padding: 10,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: `${stat.color}30`,
                  }}
                >
                  <Text
                    style={{
                      color: stat.color,
                      fontSize: 20,
                      fontWeight: "900",
                    }}
                  >
                    {stat.value}
                  </Text>
                  <Text style={{ color: "#64748B", fontSize: 10 }}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* بحث */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.08)",
                borderRadius: 14,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderColor: "rgba(167,139,250,0.3)",
                marginBottom: 16,
              }}
            >
              <MaterialIcons name="search" size={20} color="#64748B" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={ar ? "ابحث عن خدمة..." : "Search services..."}
                placeholderTextColor="#475569"
                style={{
                  flex: 1,
                  color: "#F1F5F9",
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  fontSize: 14,
                  textAlign: ar ? "right" : "left",
                }}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <MaterialIcons name="close" size={18} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>

            {/* فلاتر التيير */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {FILTERS.map((f) => (
                  <TouchableOpacity
                    key={f.key}
                    onPress={() => {
                      if (Platform.OS !== "web") Haptics.selectionAsync();
                      setActiveFilter(f.key);
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor:
                        activeFilter === f.key
                          ? f.color
                          : "rgba(255,255,255,0.05)",
                      borderWidth: 1,
                      borderColor:
                        activeFilter === f.key
                          ? f.color
                          : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Text
                      style={{
                        color: activeFilter === f.key ? "#0a0a0f" : "#94A3B8",
                        fontWeight: "700",
                        fontSize: 12,
                      }}
                    >
                      {ar ? f.labelAr : f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </LinearGradient>
        </Animated.View>

        {/* ── الأقسام ──────────────────────────────────── */}
        <View style={{ padding: 16 }}>
          {filteredCategories.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
              <Text style={{ color: "#64748B", fontSize: 16 }}>
                {ar ? "لا توجد نتائج" : "No results found"}
              </Text>
            </View>
          ) : (
            filteredCategories.map((category) => {
              const isExpanded =
                expandedCategory === category.id || search.trim() !== "";
              return (
                <View key={category.id} style={{ marginBottom: 20 }}>
                  {/* رأس القسم */}
                  <TouchableOpacity
                    onPress={() => {
                      if (Platform.OS !== "web")
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setExpandedCategory(
                        isExpanded && search === "" ? null : category.id,
                      );
                    }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={category.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 14,
                        borderRadius: 14,
                        marginBottom: isExpanded ? 12 : 0,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: ar ? "row-reverse" : "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <Text style={{ fontSize: 24 }}>{category.icon}</Text>
                        <View>
                          <Text
                            style={{
                              color: "#fff",
                              fontWeight: "800",
                              fontSize: 15,
                            }}
                          >
                            {ar ? category.titleAr : category.titleEn}
                          </Text>
                          <Text
                            style={{
                              color: "rgba(255,255,255,0.7)",
                              fontSize: 11,
                            }}
                          >
                            {category.services.length}{" "}
                            {ar ? "خدمة" : "services"}
                          </Text>
                        </View>
                      </View>
                      <MaterialIcons
                        name={
                          isExpanded
                            ? "keyboard-arrow-up"
                            : "keyboard-arrow-down"
                        }
                        size={22}
                        color="rgba(255,255,255,0.8)"
                      />
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* بطاقات الخدمات */}
                  {isExpanded && (
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                      }}
                    >
                      {category.services.map((service) => (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          ar={ar}
                          onPress={() => handleServicePress(service)}
                        />
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* ── بانر الاشتراك ─────────────────────────────── */}
        <View style={{ marginHorizontal: 16, marginTop: 8 }}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/subscriptions" as any)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#7C3AED", "#EC4899"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 24, alignItems: "center" }}
            >
              <Text style={{ fontSize: 40, marginBottom: 10 }}>👑</Text>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: "900",
                  marginBottom: 6,
                }}
              >
                {ar ? "افتح جميع الخدمات" : "Unlock All Services"}
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 13,
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                {ar
                  ? `${totalServices} خدمة احترافية · بدون قيود · دعم 24/7`
                  : `${totalServices} Pro Services · No limits · 24/7 Support`}
              </Text>
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 30,
                  paddingHorizontal: 32,
                  paddingVertical: 12,
                }}
              >
                <Text
                  style={{ color: "#7C3AED", fontWeight: "900", fontSize: 15 }}
                >
                  {ar ? "🚀 ابدأ الآن" : "🚀 Get Started"}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
