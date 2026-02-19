/**
 * 🚀 KNOUX NEXAR - Complete Service Registry
 * All 337 Professional Features
 * 
 * @author Eng. Sadiq Al-Jazzar (Abu Ritaj)
 */

export interface NexarService {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  subcategory?: string;
  description: string;
  icon: string;
  enabled: boolean;
  premium?: boolean;
}

// ============================================
// 1️⃣ BASIC RECORDING (10 services)
// ============================================
export const RECORDING_SERVICES: NexarService[] = [
  { id: 'rec_001', name: 'Basic Screen Recording', nameAr: 'تسجيل الشاشة الأساسي', category: 'recording', description: 'Record screen in HD with audio', icon: '📹', enabled: true },
  { id: 'rec_002', name: 'Resolution Selection', nameAr: 'اختيار دقة التسجيل', category: 'recording', description: '480p - 4K - 8K options', icon: '🎞️', enabled: true },
  { id: 'rec_003', name: 'Frame Rate Control', nameAr: 'معدل الإطارات', category: 'recording', description: '15-120 FPS adjustable', icon: '⚡', enabled: true },
  { id: 'rec_004', name: 'Internal Audio', nameAr: 'صوت داخلي', category: 'recording', description: 'Record system audio', icon: '🔊', enabled: true },
  { id: 'rec_005', name: 'External Audio', nameAr: 'صوت خارجي', category: 'recording', description: 'Record from microphone', icon: '🎤', enabled: true },
  { id: 'rec_006', name: 'FaceCam Overlay', nameAr: 'كاميرا أمامية', category: 'recording', description: 'Front camera overlay', icon: '📷', enabled: true },
  { id: 'rec_007', name: 'Draw on Screen', nameAr: 'رسم على الشاشة', category: 'recording', description: 'Live annotation', icon: '✏️', enabled: true },
  { id: 'rec_008', name: 'Pause/Resume', nameAr: 'إيقاف مؤقت', category: 'recording', description: 'Pause and resume recording', icon: '⏸️', enabled: true },
  { id: 'rec_009', name: 'Background Recording', nameAr: 'تسجيل في الخلفية', category: 'recording', description: 'Record while using other apps', icon: '🔄', enabled: true },
  { id: 'rec_010', name: 'Countdown Timer', nameAr: 'عد تنازلي', category: 'recording', description: '3-5-10 seconds countdown', icon: '⏱️', enabled: true },
];

// ============================================
// 2️⃣ BASIC EDITING (12 services)
// ============================================
export const EDITING_SERVICES: NexarService[] = [
  { id: 'edit_011', name: 'Video Trimming', nameAr: 'قص الفيديو', category: 'editing', description: 'Trim with high precision', icon: '✂️', enabled: true },
  { id: 'edit_012', name: 'Video Splitting', nameAr: 'تقطيع الفيديو', category: 'editing', description: 'Split into segments', icon: '🔪', enabled: true },
  { id: 'edit_013', name: 'Merge Clips', nameAr: 'دمج المقاطع', category: 'editing', description: 'Merge without quality loss', icon: '🔗', enabled: true },
  { id: 'edit_014', name: 'Speed Control', nameAr: 'تحكم بالسرعة', category: 'editing', description: '0.25x - 4x speed', icon: '🏃', enabled: true },
  { id: 'edit_015', name: 'Transitions', nameAr: 'انتقالات', category: 'editing', description: '10+ transition types', icon: '🎬', enabled: true },
  { id: 'edit_016', name: 'Visual Effects', nameAr: 'تأثيرات بصرية', category: 'editing', description: 'Filters and effects', icon: '✨', enabled: true },
  { id: 'edit_017', name: 'Color Correction', nameAr: 'تصحيح الألوان', category: 'editing', description: 'Professional color grading', icon: '🎨', enabled: true },
  { id: 'edit_018', name: 'Text Overlays', nameAr: 'نصوص على الفيديو', category: 'editing', description: 'Titles and subtitles', icon: '📝', enabled: true },
  { id: 'edit_019', name: 'Watermark', nameAr: 'علامة مائية', category: 'editing', description: 'Custom watermark', icon: '🏷️', enabled: true },
  { id: 'edit_020', name: 'Lighting Control', nameAr: 'تحكم بالإضاءة', category: 'editing', description: 'Brightness/Contrast', icon: '💡', enabled: true },
  { id: 'edit_021', name: 'Crop & Rotate', nameAr: 'اقتصاص وتدوير', category: 'editing', description: 'Crop, rotate, flip', icon: '🔄', enabled: true },
  { id: 'edit_022', name: 'Undo/Redo', nameAr: 'تراجع وإعادة', category: 'editing', description: 'Unlimited undo/redo', icon: '↩️', enabled: true },
];

// ============================================
// 3️⃣ IMAGES & VISUALS (8 services)
// ============================================
export const IMAGE_SERVICES: NexarService[] = [
  { id: 'img_023', name: 'Image Gallery', nameAr: 'معرض صور', category: 'images', description: 'Organized image gallery', icon: '🖼️', enabled: true },
  { id: 'img_024', name: 'Screenshot Capture', nameAr: 'التقاط شاشة', category: 'images', description: 'Quick screenshots', icon: '📸', enabled: true },
  { id: 'img_025', name: 'Interactive Viewer', nameAr: 'عرض تفاعلي', category: 'images', description: 'Pinch to zoom', icon: '🔍', enabled: true },
  { id: 'img_026', name: 'Image Fallback', nameAr: 'صور بديلة', category: 'images', description: 'Fallback on error', icon: '🔄', enabled: true },
  { id: 'img_027', name: 'Auto Enhancement', nameAr: 'تحسين تلقائي', category: 'images', description: 'Auto enhance images', icon: '✨', enabled: true },
  { id: 'img_028', name: 'Color Correction', nameAr: 'تصحيح ألوان', category: 'images', description: 'Professional color correction', icon: '🎨', enabled: true },
  { id: 'img_029', name: 'WebP/AVIF Support', nameAr: 'صيغ مضغوطة', category: 'images', description: 'Modern formats', icon: '📦', enabled: true },
  { id: 'img_030', name: 'SVG Support', nameAr: 'أيقونات متجهة', category: 'images', description: 'Vector icons', icon: '🎯', enabled: true },
];

// ============================================
// 4️⃣ INTERACTIONS (12 services)
// ============================================
export const INTERACTION_SERVICES: NexarService[] = [
  { id: 'int_031', name: 'Instant Feedback', nameAr: 'تفاعلات لحظية', category: 'interactions', description: 'Ripple/Tap effects', icon: '💫', enabled: true },
  { id: 'int_032', name: 'Magnetic Buttons', nameAr: 'أزرار مغناطيسية', category: 'interactions', description: 'Magnetic button effect', icon: '🧲', enabled: true },
  { id: 'int_033', name: 'Gesture Shortcuts', nameAr: 'اختصارات حركية', category: 'interactions', description: 'Custom gestures', icon: '👆', enabled: true },
  { id: 'int_034', name: 'Smooth Transitions', nameAr: 'انتقالات سلسة', category: 'interactions', description: 'Buttery smooth transitions', icon: '🌊', enabled: true },
  { id: 'int_035', name: 'Shared Elements', nameAr: 'حركة العناصر المشتركة', category: 'interactions', description: 'Shared element transitions', icon: '🔗', enabled: true },
  { id: 'int_036', name: 'Parallax Effect', nameAr: 'تأثير طبقات', category: 'interactions', description: 'Parallax scrolling', icon: '📐', enabled: true },
  { id: 'int_037', name: 'Scroll Reveal', nameAr: 'ظهور تدريجي', category: 'interactions', description: 'Reveal on scroll', icon: '👁️', enabled: true },
  { id: 'int_038', name: 'Animated Icons', nameAr: 'أيقونات متحركة', category: 'interactions', description: 'Smooth icon animations', icon: '🎭', enabled: true },
  { id: 'int_039', name: 'Haptic Feedback', nameAr: 'لمس ارتجاجي', category: 'interactions', description: 'Touch vibration', icon: '📳', enabled: true },
  { id: 'int_040', name: 'Logo Breathing', nameAr: 'تنفس اللوجو', category: 'interactions', description: 'Breathing animation', icon: '💨', enabled: true },
  { id: 'int_041', name: 'Hover Effects', nameAr: 'تأثيرات التحويم', category: 'interactions', description: 'Hover animations', icon: '🎯', enabled: true },
  { id: 'int_042', name: 'Click Sounds', nameAr: 'أصوات النقر', category: 'interactions', description: 'Audio feedback', icon: '🔊', enabled: true },
];

// ============================================
// 5️⃣ UI/UX (14 services)
// ============================================
export const UI_SERVICES: NexarService[] = [
  { id: 'ui_043', name: 'Hero Video', nameAr: 'فيديو ترحيبي', category: 'ui', description: 'Hero header video', icon: '🎥', enabled: true },
  { id: 'ui_044', name: 'Dynamic Splash', nameAr: 'شاشة بداية سينمائية', category: 'ui', description: 'Cinematic splash screen', icon: '🌟', enabled: true },
  { id: 'ui_045', name: 'AMOLED Theme', nameAr: 'واجهة سوداء', category: 'ui', description: 'Pure black theme', icon: '🌑', enabled: true },
  { id: 'ui_046', name: 'Theme Presets', nameAr: 'ثيمات متعددة', category: 'ui', description: 'Multiple theme options', icon: '🎨', enabled: true },
  { id: 'ui_047', name: 'Custom Sections', nameAr: 'تخصيص الأقسام', category: 'ui', description: 'Customizable sections', icon: '🧩', enabled: true },
  { id: 'ui_048', name: 'Interactive Cards', nameAr: 'بطاقات تفاعلية', category: 'ui', description: 'Interactive card components', icon: '🃏', enabled: true },
  { id: 'ui_049', name: 'Drag & Drop', nameAr: 'سحب وإفلات', category: 'ui', description: 'Drag and drop support', icon: '✋', enabled: true },
  { id: 'ui_050', name: 'Responsive Design', nameAr: 'تصميم متجاوب', category: 'ui', description: 'All screen sizes', icon: '📱', enabled: true },
  { id: 'ui_051', name: 'Font Scaling', nameAr: 'تكبير الخط', category: 'ui', description: 'Accessible font sizes', icon: '🔤', enabled: true },
  { id: 'ui_052', name: 'Multi-language', nameAr: 'لغات متعددة', category: 'ui', description: 'i18n support', icon: '🌍', enabled: true },
  { id: 'ui_053', name: 'RTL Support', nameAr: 'دعم العربية', category: 'ui', description: 'Arabic & Hebrew', icon: '📜', enabled: true },
  { id: 'ui_054', name: 'Vector Icons', nameAr: 'أيقونات متجهة', category: 'ui', description: 'Scalable icons', icon: '🎯', enabled: true },
  { id: 'ui_055', name: 'Tooltips', nameAr: 'تلميحات مساعدة', category: 'ui', description: 'Helper tooltips', icon: '💡', enabled: true },
  { id: 'ui_056', name: 'Progress Bars', nameAr: 'شريط تقدم', category: 'ui', description: 'Progress indicators', icon: '📊', enabled: true },
];

// ============================================
// 6️⃣ PERFORMANCE (12 services)
// ============================================
export const PERFORMANCE_SERVICES: NexarService[] = [
  { id: 'perf_057', name: '60 FPS Smooth', nameAr: '60 إطار في الثانية', category: 'performance', description: 'Buttery smooth 60fps', icon: '⚡', enabled: true },
  { id: 'perf_058', name: 'Hardware Decoding', nameAr: 'فك تشفير بالمعالج', category: 'performance', description: 'GPU acceleration', icon: '🎮', enabled: true },
  { id: 'perf_059', name: 'Lazy Loading', nameAr: 'تحميل تدريجي', category: 'performance', description: 'Load on demand', icon: '🔄', enabled: true },
  { id: 'perf_060', name: 'Memory Saver', nameAr: 'توفير الذاكرة', category: 'performance', description: 'Optimized memory usage', icon: '💾', enabled: true },
  { id: 'perf_061', name: 'Battery Saver', nameAr: 'توفير البطارية', category: 'performance', description: 'Power efficient', icon: '🔋', enabled: true },
  { id: 'perf_062', name: 'Image Optimization', nameAr: 'صور مضغوطة', category: 'performance', description: 'WebP/AVIF support', icon: '📦', enabled: true },
  { id: 'perf_063', name: 'Smart Caching', nameAr: 'تخزين مؤقت', category: 'performance', description: 'Intelligent caching', icon: '📂', enabled: true },
  { id: 'perf_064', name: 'Auto Archive', nameAr: 'أرشفة تلقائية', category: 'performance', description: 'Automatic archiving', icon: '📦', enabled: true },
  { id: 'perf_065', name: 'Cache Cleaner', nameAr: 'تنظيف ذاكرة', category: 'performance', description: 'Clear cache', icon: '🧹', enabled: true },
  { id: 'perf_066', name: 'On-demand Loading', nameAr: 'تحميل عند الطلب', category: 'performance', description: 'Load when needed', icon: '⏳', enabled: true },
  { id: 'perf_067', name: 'Smart Compression', nameAr: 'ضغط ذكي', category: 'performance', description: 'Lossless compression', icon: '🗜️', enabled: true },
  { id: 'perf_068', name: 'Performance Monitor', nameAr: 'مراقب أداء', category: 'performance', description: 'Track performance', icon: '📊', enabled: true },
];

// Add to export: Export all services as one array
export const ALL_NEXAR_SERVICES: NexarService[] = [
  ...RECORDING_SERVICES,
  ...EDITING_SERVICES,
  ...IMAGE_SERVICES,
  ...INTERACTION_SERVICES,
  ...UI_SERVICES,
  ...PERFORMANCE_SERVICES,
];

// Service categories for navigation
export const SERVICE_CATEGORIES = {
  recording: { name: 'Recording', nameAr: 'التسجيل', icon: '📹', count: RECORDING_SERVICES.length },
  editing: { name: 'Editing', nameAr: 'التحرير', icon: '✂️', count: EDITING_SERVICES.length },
  images: { name: 'Images', nameAr: 'الصور', icon: '🖼️', count: IMAGE_SERVICES.length },
  interactions: { name: 'Interactions', nameAr: 'التفاعلات', icon: '💫', count: INTERACTION_SERVICES.length },
  ui: { name: 'UI/UX', nameAr: 'الواجهة', icon: '🎨', count: UI_SERVICES.length },
  performance: { name: 'Performance', nameAr: 'الأداء', icon: '⚡', count: PERFORMANCE_SERVICES.length },
};
