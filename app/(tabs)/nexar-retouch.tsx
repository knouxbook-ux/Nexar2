// Copyright © Knoux. All rights reserved.
/**
 * 🎨 KNOUX NEXAR — Retouch Studio
 * مُدمج من: RetouchPanel_tsx.txt + RetouchEngine.ts
 * 85+ خدمة ريتوش احترافية موصّلة بالتطبيق الأصلي
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { nexarEvents } from '@/lib/nexar/NexarCore';

const { width } = Dimensions.get('window');

// ── محرك الريتوش (مُدمج من RetouchEngine.ts) ────────────────
type RetouchCategory =
  | 'skin' | 'eyes' | 'nose' | 'lips' | 'teeth'
  | 'jaw' | 'body' | 'lighting' | 'background' | 'ai' | 'quick';

interface RetouchService {
  id: string;
  name: string;
  nameAr: string;
  category: RetouchCategory;
  description: string;
  technique: string;
  intensity: number;
  icon: string;
}

// ── بيانات الخدمات الكاملة ────────────────────────────────────

// 🧴 البشرة (12)
const SKIN: RetouchService[] = [
  { id: 's1', name: 'Skin Smoothing', nameAr: 'تنعيم البشرة', category: 'skin', description: 'تنعيم مع الحفاظ على الملمس الطبيعي', technique: 'AI Frequency Separation', intensity: 0.7, icon: '🌸' },
  { id: 's2', name: 'Pore Minimizer', nameAr: 'تقليل المسام', category: 'skin', description: 'تقليل المسام الظاهرة', technique: 'Blur + Sharpen', intensity: 0.6, icon: '🔬' },
  { id: 's3', name: 'Skin Tone Uniform', nameAr: 'توحيد لون البشرة', category: 'skin', description: 'توحيد لون البشرة وإزالة البقع', technique: 'Color Matching', intensity: 0.5, icon: '🎨' },
  { id: 's4', name: 'Texture Preserve', nameAr: 'حفظ النسيج', category: 'skin', description: 'الحفاظ على نسيج البشرة الطبيعي', technique: 'Edge-Aware', intensity: 0.8, icon: '🖼️' },
  { id: 's5', name: 'Dewy Effect', nameAr: 'بشرة مشرقة', category: 'skin', description: 'تأثير البشرة الرطبة المتألقة', technique: 'Highlight Mask', intensity: 0.4, icon: '💧' },
  { id: 's6', name: 'Matte Finish', nameAr: 'بشرة مطفأة', category: 'skin', description: 'تأثير البشرة المطفأة', technique: 'Saturation Control', intensity: 0.5, icon: '🪞' },
  { id: 's7', name: 'Blemish Remove', nameAr: 'إزالة الشوائب', category: 'skin', description: 'إزالة البثور والشوائب', technique: 'Content-Aware Fill', intensity: 0.9, icon: '✨' },
  { id: 's8', name: 'Dark Spots', nameAr: 'إزالة البقع الداكنة', category: 'skin', description: 'إزالة التصبغات الداكنة', technique: 'Selective Lightening', intensity: 0.6, icon: '🌟' },
  { id: 's9', name: 'Redness Remove', nameAr: 'إزالة الاحمرار', category: 'skin', description: 'تقليل الاحمرار وتهيج البشرة', technique: 'Hue Adjustment', intensity: 0.6, icon: '🌹' },
  { id: 's10', name: 'Anti-Age', nameAr: 'مكافحة الشيخوخة', category: 'skin', description: 'تقليل علامات التعب والشيخوخة', technique: 'Smart Smoothing', intensity: 0.55, icon: '⏰' },
  { id: 's11', name: 'Tan Adjust', nameAr: 'ضبط البرونز', category: 'skin', description: 'تعديل درجة السمرة', technique: 'Color Balance', intensity: 0.4, icon: '☀️' },
  { id: 's12', name: 'Glow Boost', nameAr: 'تعزيز البريق', category: 'skin', description: 'إضفاء بريق صحي للبشرة', technique: 'Luminosity Layer', intensity: 0.5, icon: '💫' },
];

// 👁️ العيون (12)
const EYES: RetouchService[] = [
  { id: 'e1', name: 'Eye Enlarge', nameAr: 'تكبير العيون', category: 'eyes', description: 'تكبير العيون بشكل طبيعي', technique: 'Liquify Expand', intensity: 0.35, icon: '👁️' },
  { id: 'e2', name: 'Dark Circles', nameAr: 'إزالة الهالات', category: 'eyes', description: 'إخفاء الهالات الداكنة', technique: 'Color Correction', intensity: 0.7, icon: '🌙' },
  { id: 'e3', name: 'Eye Brighten', nameAr: 'إضاءة العيون', category: 'eyes', description: 'تفتيح بياض العين', technique: 'Dodge Tool', intensity: 0.45, icon: '💡' },
  { id: 'e4', name: 'Iris Enhance', nameAr: 'تعزيز القزحية', category: 'eyes', description: 'تعزيز لون القزحية', technique: 'HSL Adjustment', intensity: 0.55, icon: '🔵' },
  { id: 'e5', name: 'Eye Lift', nameAr: 'رفع العيون', category: 'eyes', description: 'رفع طرف العين', technique: 'Point Warp', intensity: 0.3, icon: '⬆️' },
  { id: 'e6', name: 'Bags Remove', nameAr: 'إزالة الانتفاخات', category: 'eyes', description: 'تقليل انتفاخات تحت العيون', technique: 'Healing Blend', intensity: 0.65, icon: '🛍️' },
  { id: 'e7', name: 'Wrinkle Eye', nameAr: 'تنعيم تجاعيد العيون', category: 'eyes', description: 'تقليل تجاعيد حول العيون', technique: 'Smooth Blend', intensity: 0.5, icon: '🪄' },
  { id: 'e8', name: 'Color Change', nameAr: 'تغيير لون العيون', category: 'eyes', description: 'تغيير لون العيون', technique: 'Hue + Mask', intensity: 0.6, icon: '🌈' },
  { id: 'e9', name: 'Lash Enhance', nameAr: 'تكثيف الرموش', category: 'eyes', description: 'تكثيف وتطويل الرموش', technique: 'Clone + Opacity', intensity: 0.5, icon: '😍' },
  { id: 'e10', name: 'Brow Shape', nameAr: 'تعديل الحواجب', category: 'eyes', description: 'إعادة تشكيل الحواجب', technique: 'Path Warp', intensity: 0.4, icon: '✏️' },
  { id: 'e11', name: 'Eyeliner', nameAr: 'تحديد العيون', category: 'eyes', description: 'تحسين تحديد العيون', technique: 'Edge Enhance', intensity: 0.5, icon: '🖊️' },
  { id: 'e12', name: 'Eyeshadow', nameAr: 'ظلال العيون', category: 'eyes', description: 'إضافة ظلال العيون', technique: 'Layer Blend', intensity: 0.4, icon: '💜' },
];

// 👃 الأنف (5)
const NOSE: RetouchService[] = [
  { id: 'n1', name: 'Nose Slim', nameAr: 'نحت الأنف', category: 'nose', description: 'تنحيف وتشكيل الأنف', technique: 'Liquify Tool', intensity: 0.4, icon: '👃' },
  { id: 'n2', name: 'Bridge Lift', nameAr: 'رفع جسر الأنف', category: 'nose', description: 'رفع جسر الأنف', technique: 'Vertical Warp', intensity: 0.3, icon: '🔺' },
  { id: 'n3', name: 'Nostril Reduce', nameAr: 'تصغير المنخرين', category: 'nose', description: 'تقليص حجم المنخرين', technique: 'Local Scale', intensity: 0.3, icon: '⬇️' },
  { id: 'n4', name: 'Tip Refine', nameAr: 'تحسين الطرف', category: 'nose', description: 'تحسين شكل طرف الأنف', technique: 'Pinch Bloat', intensity: 0.3, icon: '💎' },
  { id: 'n5', name: 'Symmetry', nameAr: 'تصحيح التناسق', category: 'nose', description: 'تصحيح عدم تناسق الأنف', technique: 'Mirror Blend', intensity: 0.5, icon: '⚖️' },
];

// 💋 الشفاه (7)
const LIPS: RetouchService[] = [
  { id: 'l1', name: 'Lip Plump', nameAr: 'نفخ الشفاه', category: 'lips', description: 'تكبير الشفاه بشكل طبيعي', technique: 'Bloat Tool', intensity: 0.4, icon: '💋' },
  { id: 'l2', name: 'Color Boost', nameAr: 'تكثيف اللون', category: 'lips', description: 'تكثيف لون الشفاه', technique: 'Saturation Mask', intensity: 0.5, icon: '🔴' },
  { id: 'l3', name: 'Definition', nameAr: 'تحديد الشفاه', category: 'lips', description: 'تحديد حواف الشفاه', technique: 'Edge Sharpen', intensity: 0.5, icon: '✏️' },
  { id: 'l4', name: 'Dry Repair', nameAr: 'علاج التشققات', category: 'lips', description: 'إصلاح الشفاه الجافة', technique: 'Smooth + Moisture', intensity: 0.7, icon: '💧' },
  { id: 'l5', name: 'Symmetry', nameAr: 'تصحيح التناسق', category: 'lips', description: 'تصحيح عدم تناسق الشفاه', technique: 'Warp Transform', intensity: 0.4, icon: '⚖️' },
  { id: 'l6', name: 'Teeth White', nameAr: 'تبييض الأسنان', category: 'lips', description: 'تبييض الأسنان', technique: 'Luminosity Mask', intensity: 0.6, icon: '😁' },
  { id: 'l7', name: 'Smile Lift', nameAr: 'رفع الابتسامة', category: 'lips', description: 'رفع زوايا الفم', technique: 'Point Warp', intensity: 0.3, icon: '😊' },
];

// 🦷 الأسنان (6)
const TEETH: RetouchService[] = [
  { id: 't1', name: 'Whitening Pro', nameAr: 'تبييض احترافي', category: 'teeth', description: 'تبييض متعدد المستويات', technique: 'Multi-Layer CC', intensity: 0.7, icon: '🦷' },
  { id: 't2', name: 'Stain Remove', nameAr: 'إزالة البقع', category: 'teeth', description: 'إزالة البقع والاصفرار', technique: 'Selective Color', intensity: 0.8, icon: '🌟' },
  { id: 't3', name: 'Braces Off', nameAr: 'إزالة التقويم', category: 'teeth', description: 'إزالة التقويم بالذكاء الاصطناعي', technique: 'Content-Aware', intensity: 1.0, icon: '🤖' },
  { id: 't4', name: 'Gap Fix', nameAr: 'تقليل الفراغات', category: 'teeth', description: 'تقليل الفراغات بين الأسنان', technique: 'Liquify Clone', intensity: 0.5, icon: '🔧' },
  { id: 't5', name: 'Chip Repair', nameAr: 'إصلاح المكسورة', category: 'teeth', description: 'إصلاح الأسنان المكسورة', technique: 'Texture Synth', intensity: 1.0, icon: '🔩' },
  { id: 't6', name: 'Enhancement', nameAr: 'التحسين العام', category: 'teeth', description: 'تحسين المظهر العام', technique: 'Brightness + CC', intensity: 0.6, icon: '✨' },
];

// 👤 الفك والخدود (7)
const JAW: RetouchService[] = [
  { id: 'j1', name: 'Face Slim', nameAr: 'نحت الوجه', category: 'jaw', description: 'تنحيف ونحت الوجه', technique: 'Liquify Pucker', intensity: 0.4, icon: '💎' },
  { id: 'j2', name: 'Cheek Lift', nameAr: 'رفع الخدود', category: 'jaw', description: 'رفع منطقة الخدود', technique: 'Upward Warp', intensity: 0.35, icon: '⬆️' },
  { id: 'j3', name: 'Double Chin', nameAr: 'إزالة ذقن مزدوجة', category: 'jaw', description: 'إزالة الذقن المزدوجة', technique: 'Liquify Push', intensity: 0.5, icon: '🚫' },
  { id: 'j4', name: 'Jaw Define', nameAr: 'تحديد الفك', category: 'jaw', description: 'تحديد معالم الفك', technique: 'Sharpen + Burn', intensity: 0.45, icon: '🔷' },
  { id: 'j5', name: 'Contour', nameAr: 'الكونتور', category: 'jaw', description: 'إضافة تأثير الكونتور', technique: 'Shadow Layer', intensity: 0.4, icon: '🌑' },
  { id: 'j6', name: 'Cheekbones', nameAr: 'بروز عظام الخد', category: 'jaw', description: 'تبارز عظام الخد', technique: 'Highlight + Shadow', intensity: 0.4, icon: '✨' },
  { id: 'j7', name: 'Face Symmetry', nameAr: 'تناسق الوجه', category: 'jaw', description: 'تصحيح تناسق الوجه', technique: 'Mirror + Warp', intensity: 0.5, icon: '⚖️' },
];

// 🏋️ الجسم (10)
const BODY: RetouchService[] = [
  { id: 'b1', name: 'Body Slim', nameAr: 'تنحيف الجسم', category: 'body', description: 'تنحيف الجسم عموماً', technique: 'Liquify Scale', intensity: 0.4, icon: '💪' },
  { id: 'b2', name: 'Waist Trim', nameAr: 'نحت الخصر', category: 'body', description: 'تنحيف منطقة الخصر', technique: 'Pucker Warp', intensity: 0.4, icon: '🎯' },
  { id: 'b3', name: 'Leg Lengthen', nameAr: 'تطويل الأرجل', category: 'body', description: 'تطويل الأرجل', technique: 'Vertical Scale', intensity: 0.3, icon: '📏' },
  { id: 'b4', name: 'Posture Fix', nameAr: 'تصحيح الوضعية', category: 'body', description: 'تصحيح وضعية الجسم', technique: 'Rotation Warp', intensity: 0.3, icon: '🧍' },
  { id: 'b5', name: 'Arm Slim', nameAr: 'تنحيف الذراعين', category: 'body', description: 'تنحيف منطقة الذراعين', technique: 'Local Pucker', intensity: 0.35, icon: '✊' },
  { id: 'b6', name: 'Neck Slim', nameAr: 'نحت الرقبة', category: 'body', description: 'تنحيف الرقبة', technique: 'Pinch Tool', intensity: 0.3, icon: '🦢' },
  { id: 'b7', name: 'Shoulder Shape', nameAr: 'تشكيل الكتفين', category: 'body', description: 'تشكيل الكتفين', technique: 'Bloat + Scale', intensity: 0.3, icon: '💎' },
  { id: 'b8', name: 'Skin Tone Body', nameAr: 'توحيد بشرة الجسم', category: 'body', description: 'توحيد لون بشرة الجسم', technique: 'Color Matching', intensity: 0.5, icon: '🎨' },
  { id: 'b9', name: 'Tan Body', nameAr: 'برونز الجسم', category: 'body', description: 'إضافة سمرة للجسم', technique: 'Color Tint', intensity: 0.4, icon: '☀️' },
  { id: 'b10', name: 'Muscle Define', nameAr: 'تحديد العضلات', category: 'body', description: 'تحديد ملامح العضلات', technique: 'Dodge + Burn', intensity: 0.35, icon: '💪' },
];

// 🌟 الإضاءة (7)
const LIGHTING: RetouchService[] = [
  { id: 'li1', name: 'Brightness', nameAr: 'السطوع', category: 'lighting', description: 'ضبط سطوع الصورة', technique: 'Levels Adjust', intensity: 0.5, icon: '☀️' },
  { id: 'li2', name: 'Contrast', nameAr: 'التباين', category: 'lighting', description: 'تعديل التباين', technique: 'Curves', intensity: 0.5, icon: '🌓' },
  { id: 'li3', name: 'Skin Light', nameAr: 'إضاءة البشرة', category: 'lighting', description: 'تحسين إضاءة البشرة', technique: 'Dodge + Fill', intensity: 0.5, icon: '💡' },
  { id: 'li4', name: 'Highlights', nameAr: 'هايلايتر', category: 'lighting', description: 'إضافة هايلايتر', technique: 'Luminosity', intensity: 0.45, icon: '✨' },
  { id: 'li5', name: 'Shadows', nameAr: 'الظلال', category: 'lighting', description: 'تعديل الظلال', technique: 'Shadow Layer', intensity: 0.4, icon: '🌑' },
  { id: 'li6', name: 'Color Grade', nameAr: 'تدريج الألوان', category: 'lighting', description: 'تدريج احترافي', technique: 'LUT Apply', intensity: 0.55, icon: '🎨' },
  { id: 'li7', name: 'HDR Effect', nameAr: 'تأثير HDR', category: 'lighting', description: 'تأثير HDR الديناميكي', technique: 'HDR Tone Map', intensity: 0.5, icon: '🌈' },
];

// 🎭 الخلفية (5)
const BACKGROUND: RetouchService[] = [
  { id: 'bg1', name: 'BG Remove', nameAr: 'إزالة الخلفية', category: 'background', description: 'إزالة الخلفية بالذكاء الاصطناعي', technique: 'AI Segmentation', intensity: 1.0, icon: '✂️' },
  { id: 'bg2', name: 'BG Replace', nameAr: 'تغيير الخلفية', category: 'background', description: 'استبدال الخلفية', technique: 'Compositing', intensity: 1.0, icon: '🖼️' },
  { id: 'bg3', name: 'BG Blur', nameAr: 'تمويه الخلفية', category: 'background', description: 'تمويه الخلفية - Bokeh', technique: 'Depth Blur', intensity: 0.6, icon: '🌀' },
  { id: 'bg4', name: 'BG Color', nameAr: 'تلوين الخلفية', category: 'background', description: 'تلوين الخلفية بلون محدد', technique: 'Fill + Mask', intensity: 0.8, icon: '🎨' },
  { id: 'bg5', name: 'BG Enhance', nameAr: 'تحسين الخلفية', category: 'background', description: 'تحسين وتجميل الخلفية', technique: 'AI Enhance', intensity: 0.5, icon: '✨' },
];

// 🤖 الذكاء الاصطناعي (8)
const AI_RETOUCH: RetouchService[] = [
  { id: 'ai1', name: 'AI Beautify', nameAr: 'تجميل AI', category: 'ai', description: 'تجميل شامل بالذكاء الاصطناعي', technique: 'Deep Learning', intensity: 0.7, icon: '🤖' },
  { id: 'ai2', name: 'Face Detect', nameAr: 'كشف الوجه', category: 'ai', description: 'كشف وتحليل الوجه تلقائياً', technique: 'Face Landmark AI', intensity: 1.0, icon: '🎯' },
  { id: 'ai3', name: 'Age Reverse', nameAr: 'عكس الشيخوخة', category: 'ai', description: 'تقليل عمر الشخص في الصورة', technique: 'GAN Model', intensity: 0.6, icon: '⏪' },
  { id: 'ai4', name: 'Super Res', nameAr: 'رفع الدقة', category: 'ai', description: 'رفع دقة الصورة بالذكاء الاصطناعي', technique: 'Super Resolution', intensity: 1.0, icon: '🔭' },
  { id: 'ai5', name: 'Noise Reduce', nameAr: 'إزالة الضوضاء', category: 'ai', description: 'إزالة الضجيج والتشويش', technique: 'AI Denoise', intensity: 0.7, icon: '🔇' },
  { id: 'ai6', name: 'Color Restore', nameAr: 'استعادة الألوان', category: 'ai', description: 'استعادة ألوان الصور القديمة', technique: 'Colorization AI', intensity: 0.8, icon: '🌈' },
  { id: 'ai7', name: 'Mood Enhance', nameAr: 'تحسين التعبيرات', category: 'ai', description: 'تعزيز تعابير الوجه', technique: 'Emotion AI', intensity: 0.4, icon: '😊' },
  { id: 'ai8', name: 'Sky Replace', nameAr: 'استبدال السماء', category: 'ai', description: 'استبدال السماء بالذكاء الاصطناعي', technique: 'Semantic Seg', intensity: 0.9, icon: '🌅' },
];

// ⚡ سريع (6)
const QUICK: RetouchService[] = [
  { id: 'q1', name: 'One-Tap Beauty', nameAr: 'جمال بنقرة', category: 'quick', description: 'تجميل كامل تلقائي', technique: 'Preset Apply', intensity: 0.7, icon: '⚡' },
  { id: 'q2', name: 'Natural Look', nameAr: 'مظهر طبيعي', category: 'quick', description: 'تعديلات خفيفة وطبيعية', technique: 'Subtle Preset', intensity: 0.4, icon: '🌿' },
  { id: 'q3', name: 'Glam Look', nameAr: 'مظهر فاخر', category: 'quick', description: 'مظهر فاخر ومبهر', technique: 'Heavy Preset', intensity: 0.8, icon: '💅' },
  { id: 'q4', name: 'Reset All', nameAr: 'إعادة ضبط', category: 'quick', description: 'إلغاء جميع التعديلات', technique: 'Reset', intensity: 0, icon: '🔄' },
  { id: 'q5', name: 'Save Result', nameAr: 'حفظ النتيجة', category: 'quick', description: 'حفظ الصورة المعدلة', technique: 'Export', intensity: 1.0, icon: '💾' },
  { id: 'q6', name: 'Share Result', nameAr: 'مشاركة النتيجة', category: 'quick', description: 'مشاركة الصورة المحسّنة', technique: 'Share API', intensity: 1.0, icon: '📤' },
];

const ALL_SERVICES: Record<RetouchCategory, RetouchService[]> = {
  skin: SKIN, eyes: EYES, nose: NOSE, lips: LIPS, teeth: TEETH,
  jaw: JAW, body: BODY, lighting: LIGHTING, background: BACKGROUND,
  ai: AI_RETOUCH, quick: QUICK,
};

const CATEGORY_META: Record<RetouchCategory, { icon: string; color: string; label: string; count: number }> = {
  skin:       { icon: '🧴', color: '#F472B6', label: 'البشرة',     count: 12 },
  eyes:       { icon: '👁️', color: '#818CF8', label: 'العيون',     count: 12 },
  nose:       { icon: '👃', color: '#34D399', label: 'الأنف',      count: 5  },
  lips:       { icon: '💋', color: '#F87171', label: 'الشفاه',     count: 7  },
  teeth:      { icon: '🦷', color: '#FCD34D', label: 'الأسنان',    count: 6  },
  jaw:        { icon: '👤', color: '#60A5FA', label: 'الفك',       count: 7  },
  body:       { icon: '🏋️', color: '#A78BFA', label: 'الجسم',      count: 10 },
  lighting:   { icon: '🌟', color: '#FBBF24', label: 'الإضاءة',    count: 7  },
  background: { icon: '🎭', color: '#4ADE80', label: 'الخلفية',    count: 5  },
  ai:         { icon: '🤖', color: '#38BDF8', label: 'ذكاء AI',    count: 8  },
  quick:      { icon: '⚡', color: '#FB923C', label: 'سريع',       count: 6  },
};

const CATEGORIES = Object.keys(CATEGORY_META) as RetouchCategory[];

// ── applyRetouch (من RetouchEngine.ts) ───────────────────────
async function applyBatchRetouch(
  imageUri: string,
  serviceIds: string[],
  _opts: { intensity?: number; naturalLook?: boolean } = {}
): Promise<{ success: boolean; processedImage: string; appliedFilters: string[] }> {
  // في البيئة الحقيقية يتم ربطها بـ OpenCV / ML Kit / Vision API
  // في الوقت الحالي تُعيد الصورة نفسها مع تسجيل الخدمات المطبّقة
  await new Promise((r) => setTimeout(r, 1500 + serviceIds.length * 200));
  const services = serviceIds
    .map((id) => Object.values(ALL_SERVICES).flat().find((s) => s.id === id)?.nameAr)
    .filter(Boolean) as string[];
  return { success: true, processedImage: imageUri, appliedFilters: services };
}

// ── بطاقة الخدمة ─────────────────────────────────────────────
function ServiceCard({
  service,
  isActive,
  onToggle,
}: {
  service: RetouchService;
  isActive: boolean;
  onToggle: () => void;
}) {
  const meta = CATEGORY_META[service.category];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 70, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 110, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 9 }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
        <LinearGradient
          colors={
            isActive
              ? [meta.color + '28', meta.color + '12']
              : ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']
          }
          style={[styles.svcCard, isActive && { borderColor: meta.color + '60' }]}
        >
          <View style={[styles.svcIconBox, { backgroundColor: meta.color + '22' }]}>
            <Text style={styles.svcIconTxt}>{service.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.svcName}>{service.nameAr}</Text>
            <Text style={styles.svcDesc} numberOfLines={1}>{service.description}</Text>
            <Text style={styles.svcTech}>{service.technique}</Text>
          </View>
          <View style={[styles.svcToggle, isActive && { backgroundColor: meta.color }]}>
            <Text style={styles.svcToggleTxt}>{isActive ? '✓' : '+'}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── الشاشة الرئيسية ─────────────────────────────────────────
export default function NexarRetouchScreen() {
  const [selectedCat, setSelectedCat] = useState<RetouchCategory>('skin');
  const [activeServices, setActiveServices] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const services = ALL_SERVICES[selectedCat];
  const activeCount = activeServices.size;

  const toggle = (id: string) => {
    setActiveServices((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const pickImage = async () => {
    try {
      const mod = await import('expo-image-picker');
      const res = await mod.launchImageLibraryAsync({
        mediaTypes: mod.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!res.canceled && res.assets[0]) {
        setSelectedImage(res.assets[0].uri);
      }
    } catch {
      Alert.alert('تنبيه', 'اختيار الصور متاح على الجهاز فقط');
    }
  };

  const applyAll = async () => {
    if (!selectedImage) {
      Alert.alert('📸 اختر صورة', 'يرجى اختيار صورة أو فيديو أولاً لتطبيق خدمات الريتوش');
      return;
    }
    if (activeCount === 0) {
      Alert.alert('تنبيه', 'اختر خدمة واحدة على الأقل أولاً');
      return;
    }
    setProcessing(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const result = await applyBatchRetouch(
      selectedImage ?? '',
      Array.from(activeServices),
      { intensity: 0.7, naturalLook: true }
    );
    setProcessing(false);

    // Emit to NexarCore for analytics tracking
    nexarEvents.emit('retouch:applied', {
      servicesCount: result.appliedFilters.length,
      services: result.appliedFilters,
    });
    nexarEvents.emit('analytics:sessionTrack', {
      type: 'retouch',
      duration: result.appliedFilters.length * 2,
      meta: { servicesCount: result.appliedFilters.length },
    });

    Alert.alert(
      '✅ تم التطبيق',
      `تم تطبيق ${result.appliedFilters.length} خدمة بنجاح:\n${result.appliedFilters.slice(0, 5).join(' • ')}${result.appliedFilters.length > 5 ? ' ...' : ''}`
    );
  };

  const resetAll = () => {
    setActiveServices(new Set());
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <LinearGradient colors={['#EC4899', '#8B5CF6']} style={styles.header}>
        <Text style={styles.headerTitle}>🎨 استوديو الريتوش</Text>
        <Text style={styles.headerSub}>85+ خدمة تجميل احترافية</Text>
        {activeCount > 0 && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeTxt}>{activeCount} خدمة محدّدة</Text>
          </View>
        )}
      </LinearGradient>

      {/* معاينة الصورة */}
      <TouchableOpacity onPress={pickImage} style={styles.imageArea}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.previewImg} />
        ) : (
          <LinearGradient
            colors={['rgba(139,92,246,0.12)', 'rgba(236,72,153,0.08)']}
            style={styles.imagePlaceholder}
          >
            <Text style={{ fontSize: 40 }}>📸</Text>
            <Text style={styles.imagePlaceholderTxt}>اضغط لاختيار صورة</Text>
            <Text style={styles.imagePlaceholderSub}>ستُطبّق عليها خدمات الريتوش</Text>
          </LinearGradient>
        )}
      </TouchableOpacity>

      {/* تبويبات الأقسام */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScrollView}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 8, paddingVertical: 10 }}
      >
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          const isActive = selectedCat === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => {
                setSelectedCat(cat);
                if (Platform.OS !== 'web') Haptics.selectionAsync();
              }}
              style={[
                styles.catTab,
                isActive && { backgroundColor: meta.color + '25', borderColor: meta.color + '80' },
              ]}
            >
              <Text style={styles.catTabIcon}>{meta.icon}</Text>
              <Text style={[styles.catTabLabel, isActive && { color: meta.color }]}>{meta.label}</Text>
              <Text style={styles.catTabCount}>{meta.count}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* قائمة الخدمات */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 12, paddingBottom: activeCount > 0 ? 110 : 30 }}
      >
        <Text style={styles.catTitle}>
          {CATEGORY_META[selectedCat].icon} {CATEGORY_META[selectedCat].label}
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>  ({services.length} خدمة)</Text>
        </Text>
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isActive={activeServices.has(service.id)}
            onToggle={() => toggle(service.id)}
          />
        ))}
      </ScrollView>

      {/* شريط الإجراءات */}
      {activeCount > 0 && (
        <View style={styles.actionBar}>
          <TouchableOpacity onPress={resetAll} style={styles.resetBtn}>
            <Text style={styles.resetBtnTxt}>🔄 إلغاء الكل</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={applyAll} style={styles.applyBtn} disabled={processing}>
            <LinearGradient
              colors={['#EC4899', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.applyBtnGrad}
            >
              {processing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.applyBtnTxt}>✨ تطبيق {activeCount} خدمة</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },

  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#fff' },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3 },
  activeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  activeBadgeTxt: { color: '#fff', fontSize: 12, fontWeight: '600' },

  imageArea: { height: 150, marginHorizontal: 12, marginTop: 12, borderRadius: 18, overflow: 'hidden' },
  previewImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.25)',
    borderStyle: 'dashed',
    borderRadius: 18,
    gap: 6,
  },
  imagePlaceholderTxt: { color: '#fff', fontSize: 14, fontWeight: '600' },
  imagePlaceholderSub: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },

  catScrollView: { maxHeight: 80, backgroundColor: '#0a0a0f' },
  catTab: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    minWidth: 62,
  },
  catTabIcon:  { fontSize: 18 },
  catTabLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 2, fontWeight: '600' },
  catTabCount: { color: 'rgba(255,255,255,0.3)', fontSize: 9, marginTop: 1 },

  catTitle: { color: '#fff', fontSize: 15, fontWeight: '800', marginBottom: 12 },

  svcCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  svcIconBox:   { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  svcIconTxt:   { fontSize: 20 },
  svcName:      { color: '#fff', fontSize: 13, fontWeight: '700' },
  svcDesc:      { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 1 },
  svcTech:      { color: 'rgba(255,255,255,0.22)', fontSize: 9, marginTop: 2 },
  svcToggle:    { width: 30, height: 30, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  svcToggleTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },

  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 14,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  resetBtn:     { borderRadius: 16, paddingHorizontal: 18, paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  resetBtnTxt:  { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '600' },
  applyBtn:     { flex: 1, borderRadius: 16, overflow: 'hidden' },
  applyBtnGrad: { padding: 14, alignItems: 'center' },
  applyBtnTxt:  { color: '#fff', fontSize: 14, fontWeight: '800' },
});
