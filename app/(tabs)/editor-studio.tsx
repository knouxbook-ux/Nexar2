// Copyright © Knoux. All rights reserved.
import {
  ScrollView,
  Text,
  View,
  Pressable,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useState } from "react";
import { videoEditingService } from "@/lib/services/video-editing-service";
import { useLanguage } from "@/lib/language-context";
import { useColors } from "@/hooks/use-colors";
import { MaterialIcons } from "@expo/vector-icons";
import { cn } from "@/lib/utils";

type TabType = "templates" | "color" | "speed" | "export";
type FilterType = "all" | "intro" | "outro" | "transition" | "effect" | "music";

interface Template {
  id: string;
  name: string;
  nameAr: string;
  descAr: string;
  category: FilterType;
  emoji: string;
  color: string;
  isPro?: boolean;
}

const TEMPLATES: Template[] = [
  { id: "1", name: "Smooth Transition", nameAr: "Smooth Transition", descAr: "انتقال سلس احترافي", category: "transition", emoji: "✨", color: "#FFD700" },
  { id: "2", name: "Cinematic Intro", nameAr: "Cinematic Intro", descAr: "مقدمة سينمائية احترافية", category: "intro", emoji: "🎬", color: "#0a7ea4" },
  { id: "3", name: "Color Grade", nameAr: "Color Grade", descAr: "تصحيح الألوان احترافي", category: "effect", emoji: "🎨", color: "#FF6B6B" },
  { id: "4", name: "Dynamic Title", nameAr: "Dynamic Title", descAr: "عنوان ديناميكي متحرك", category: "intro", emoji: "📝", color: "#9370DB", isPro: true },
  { id: "5", name: "Slow Motion", nameAr: "Slow Motion", descAr: "حركة بطيئة احترافية", category: "effect", emoji: "🐢", color: "#22c55e" },
  { id: "6", name: "Music Beat Sync", nameAr: "Music Beat Sync", descAr: "مزامنة مع نبضات الموسيقى", category: "music", emoji: "🎵", color: "#FF1493", isPro: true },
  { id: "7", name: "Epic Outro", nameAr: "Epic Outro", descAr: "خاتمة احترافية مؤثرة", category: "outro", emoji: "🏁", color: "#FF4500" },
  { id: "8", name: "Glitch Effect", nameAr: "Glitch Effect", descAr: "تأثير خلل إبداعي", category: "effect", emoji: "⚡", color: "#00CED1", isPro: true },
  { id: "9", name: "Fade Transition", nameAr: "Fade Transition", descAr: "انتقال تلاشي ناعم", category: "transition", emoji: "🌅", color: "#DDA15E" },
  { id: "10", name: "Zoom Intro", nameAr: "Zoom Intro", descAr: "مقدمة بتكبير درامي", category: "intro", emoji: "🔭", color: "#32CD32" },
];

const FILTERS: { key: FilterType; labelAr: string; labelEn: string; icon: string }[] = [
  { key: "all", labelAr: "الكل", labelEn: "All", icon: "apps" },
  { key: "intro", labelAr: "مقدمة", labelEn: "Intro", icon: "play-arrow" },
  { key: "outro", labelAr: "خاتمة", labelEn: "Outro", icon: "stop" },
  { key: "transition", labelAr: "انتقال", labelEn: "Trans.", icon: "swap-horiz" },
];

export default function VideoEditingScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("templates");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [quality, setQuality] = useState<"low" | "medium" | "high" | "4k">("high");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const colors = useColors();

  const label = (ar: string, en: string) => (language === "ar" ? ar : en);

  const filteredTemplates =
    activeFilter === "all"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === activeFilter);

  const handleApplyTemplate = (template: Template) => {
    if (template.isPro) {
      Alert.alert(
        label("ميزة Pro", "Pro Feature"),
        label(
          `"${template.nameAr}" متاح فقط للمشتركين في خطة Pro أو Premium.`,
          `"${template.name}" is available for Pro & Premium subscribers only.`
        ),
        [
          { text: label("لاحقاً", "Later"), style: "cancel" },
          { text: label("ترقية الخطة", "Upgrade"), style: "default" },
        ]
      );
      return;
    }
    setSelectedTemplate(template.id);
    setIsProcessing(true);
    setProgress(0);
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(iv);
          setIsProcessing(false);
          return 100;
        }
        return p + 5;
      });
    }, 120);
  };

  const handleColorCorrection = async () => {
    setIsProcessing(true);
    setProgress(0);
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(iv);
          setIsProcessing(false);
          return 100;
        }
        return p + 4;
      });
    }, 100);
  };

  const handleExport = async () => {
    setIsProcessing(true);
    setProgress(0);
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(iv);
          setIsProcessing(false);
          Alert.alert(
            label("تم التصدير!", "Export Complete!"),
            label("تم حفظ الفيديو بنجاح.", "Video saved successfully.")
          );
          return 100;
        }
        return p + 3;
      });
    }, 150);
  };

  const SliderRow = ({
    labelText,
    value,
    onDecrease,
    onIncrease,
    displayValue,
  }: {
    labelText: string;
    value: number;
    onDecrease: () => void;
    onIncrease: () => void;
    displayValue: string;
  }) => (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-muted">{labelText}</Text>
        <Text className="text-sm font-bold text-primary">{displayValue}</Text>
      </View>
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={onDecrease}
          className="w-8 h-8 rounded-full bg-surface border border-border items-center justify-center active:opacity-60"
        >
          <MaterialIcons name="remove" size={16} color={colors.foreground} />
        </Pressable>
        <View className="flex-1 bg-background rounded-full h-2 overflow-hidden">
          <View
            className="bg-primary h-full"
            style={{ width: `${((value + 100) / 200) * 100}%` }}
          />
        </View>
        <Pressable
          onPress={onIncrease}
          className="w-8 h-8 rounded-full bg-surface border border-border items-center justify-center active:opacity-60"
        >
          <MaterialIcons name="add" size={16} color={colors.foreground} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="p-0">
      {/* TABS */}
      <View className="flex-row bg-surface border-b border-border px-2 pt-2">
        {(
          [
            { key: "templates", ar: "قوالب", en: "Templates", icon: "auto-awesome" },
            { key: "color", ar: "ألوان", en: "Color", icon: "palette" },
            { key: "speed", ar: "سرعة", en: "Speed", icon: "speed" },
            { key: "export", ar: "تصدير", en: "Export", icon: "file-upload" },
          ] as const
        ).map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 pb-2 items-center gap-1 border-b-2 ${
              activeTab === tab.key ? "border-primary" : "border-transparent"
            }`}
          >
            <MaterialIcons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? colors.primary : colors.muted}
            />
            <Text
              className={`text-xs font-semibold ${
                activeTab === tab.key ? "text-primary" : "text-muted"
              }`}
            >
              {label(tab.ar, tab.en)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* PROGRESS BAR */}
      {isProcessing && (
        <View className="bg-surface px-4 py-3 border-b border-border gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-muted">
              {label("جاري المعالجة...", "Processing...")}
            </Text>
            <Text className="text-xs font-bold text-primary">{Math.round(progress)}%</Text>
          </View>
          <View className="bg-background rounded-full h-1.5 overflow-hidden">
            <View
              className="bg-primary h-full rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>

        {/* ====== TEMPLATES TAB ====== */}
        {activeTab === "templates" && (
          <View className="gap-4">
            {/* Header */}
            <View className="gap-1">
              <Text className="text-2xl font-bold text-foreground">
                {label("تعديل الفيديو المتقدم", "Advanced Video Editor")}
              </Text>
              <Text className="text-sm text-muted">
                {label("اختر من تمبلتس احترافية جاهزة", "Choose from professional ready templates")}
              </Text>
            </View>

            {/* Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2 pr-4">
                {FILTERS.map((f) => (
                  <Pressable
                    key={f.key}
                    onPress={() => setActiveFilter(f.key)}
                    className={`flex-row items-center gap-2 px-4 py-2 rounded-xl border ${
                      activeFilter === f.key
                        ? "bg-primary border-primary"
                        : "bg-surface border-border"
                    }`}
                  >
                    <MaterialIcons
                      name={f.icon as any}
                      size={16}
                      color={activeFilter === f.key ? "#fff" : colors.muted}
                    />
                    <Text
                      className={`text-sm font-semibold ${
                        activeFilter === f.key ? "text-background" : "text-foreground"
                      }`}
                    >
                      {label(f.labelAr, f.labelEn)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Template Grid - 2 columns */}
            <View className="flex-row flex-wrap gap-3">
              {filteredTemplates.map((template) => (
                <Pressable
                  key={template.id}
                  onPress={() => handleApplyTemplate(template)}
                  style={{ width: "47%" }}
                  className={`bg-surface rounded-2xl p-4 border gap-3 active:opacity-80 ${
                    selectedTemplate === template.id
                      ? "border-primary"
                      : "border-border"
                  }`}
                >
                  {/* Icon */}
                  <View
                    className="w-14 h-14 rounded-2xl items-center justify-center self-start"
                    style={{ backgroundColor: template.color + "20" }}
                  >
                    <Text style={{ fontSize: 28 }}>{template.emoji}</Text>
                  </View>

                  {/* Name */}
                  <Text className="text-base font-bold text-foreground" numberOfLines={1}>
                    {template.name}
                  </Text>
                  <Text className="text-xs text-muted" numberOfLines={1}>
                    {template.descAr}
                  </Text>

                  {/* Category + Pro badge */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1">
                      <MaterialIcons
                        name={
                          template.category === "transition"
                            ? "swap-horiz"
                            : template.category === "intro"
                              ? "play-arrow"
                              : template.category === "outro"
                                ? "stop"
                                : template.category === "music"
                                  ? "music-note"
                                  : "auto-fix-high"
                        }
                        size={12}
                        color={colors.muted}
                      />
                      <Text className="text-xs text-muted">
                        {label(
                          template.category === "transition"
                            ? "انتقال"
                            : template.category === "intro"
                              ? "مقدمة"
                              : template.category === "outro"
                                ? "خاتمة"
                                : template.category === "music"
                                  ? "موسيقى"
                                  : "تأثير",
                          template.category
                        )}
                      </Text>
                    </View>
                    {template.isPro && (
                      <View className="bg-yellow-500/20 px-2 py-0.5 rounded-full">
                        <Text className="text-xs font-bold text-yellow-500">PRO</Text>
                      </View>
                    )}
                  </View>

                  {selectedTemplate === template.id && (
                    <View className="absolute top-3 right-3">
                      <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ====== COLOR TAB ====== */}
        {activeTab === "color" && (
          <View className="gap-4">
            <View className="gap-1">
              <Text className="text-2xl font-bold text-foreground">
                {label("تصحيح الألوان", "Color Correction")}
              </Text>
              <Text className="text-sm text-muted">
                {label("اضبط إضاءة وألوان الفيديو", "Adjust video lighting and colors")}
              </Text>
            </View>

            <View className="bg-surface rounded-2xl p-5 border border-border gap-5">
              <SliderRow
                labelText={t.videoEditing.brightness}
                value={brightness}
                onDecrease={() => setBrightness((v) => Math.max(-100, v - 10))}
                onIncrease={() => setBrightness((v) => Math.min(100, v + 10))}
                displayValue={brightness > 0 ? `+${brightness}` : `${brightness}`}
              />
              <SliderRow
                labelText={t.videoEditing.contrast}
                value={contrast}
                onDecrease={() => setContrast((v) => Math.max(-100, v - 10))}
                onIncrease={() => setContrast((v) => Math.min(100, v + 10))}
                displayValue={contrast > 0 ? `+${contrast}` : `${contrast}`}
              />
              <SliderRow
                labelText={t.videoEditing.saturation}
                value={saturation}
                onDecrease={() => setSaturation((v) => Math.max(-100, v - 10))}
                onIncrease={() => setSaturation((v) => Math.min(100, v + 10))}
                displayValue={saturation > 0 ? `+${saturation}` : `${saturation}`}
              />
            </View>

            {/* Presets */}
            <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
              <Text className="text-base font-semibold text-foreground">
                {label("إعدادات جاهزة", "Quick Presets")}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  { name: label("سينمائي", "Cinematic"), b: -10, c: 20, s: -20 },
                  { name: label("مشمس", "Sunny"), b: 20, c: 10, s: 30 },
                  { name: label("كلاسيكي", "Vintage"), b: -5, c: 15, s: -40 },
                  { name: label("حيوي", "Vivid"), b: 5, c: 25, s: 50 },
                  { name: label("فاتح", "Cool"), b: 10, c: 5, s: 10 },
                  { name: label("افتراضي", "Reset"), b: 0, c: 0, s: 0 },
                ].map((preset) => (
                  <Pressable
                    key={preset.name}
                    onPress={() => {
                      setBrightness(preset.b);
                      setContrast(preset.c);
                      setSaturation(preset.s);
                    }}
                    className="px-4 py-2 rounded-xl bg-background border border-border active:opacity-70"
                  >
                    <Text className="text-sm text-foreground font-medium">{preset.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              onPress={handleColorCorrection}
              disabled={isProcessing}
              className={`py-4 rounded-2xl items-center ${isProcessing ? "bg-muted" : "bg-primary"}`}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-bold text-background">
                  {t.videoEditing.applyColorCorrection}
                </Text>
              )}
            </Pressable>
          </View>
        )}

        {/* ====== SPEED TAB ====== */}
        {activeTab === "speed" && (
          <View className="gap-4">
            <View className="gap-1">
              <Text className="text-2xl font-bold text-foreground">
                {label("التحكم في السرعة", "Speed Control")}
              </Text>
              <Text className="text-sm text-muted">
                {label("تسريع أو إبطاء مقطع الفيديو", "Speed up or slow down your video")}
              </Text>
            </View>

            {/* Speed display */}
            <View className="bg-surface rounded-2xl p-6 border border-border items-center gap-4">
              <Text
                className="text-foreground font-black"
                style={{ fontSize: 64 }}
              >
                {speed.toFixed(2)}
                <Text className="text-primary text-2xl">x</Text>
              </Text>
              <Text className="text-muted text-sm">
                {speed < 1
                  ? label("حركة بطيئة", "Slow Motion")
                  : speed > 1
                    ? label("تسريع", "Fast Forward")
                    : label("سرعة عادية", "Normal Speed")}
              </Text>

              {/* Speed buttons */}
              <View className="flex-row flex-wrap justify-center gap-3">
                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4].map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setSpeed(s)}
                    className={`w-16 h-12 rounded-xl border items-center justify-center ${
                      speed === s
                        ? "bg-primary border-primary"
                        : "bg-background border-border"
                    }`}
                  >
                    <Text
                      className={`text-sm font-bold ${
                        speed === s ? "text-background" : "text-foreground"
                      }`}
                    >
                      {s}x
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ====== EXPORT TAB ====== */}
        {activeTab === "export" && (
          <View className="gap-4">
            <View className="gap-1">
              <Text className="text-2xl font-bold text-foreground">
                {label("تصدير الفيديو", "Export Video")}
              </Text>
              <Text className="text-sm text-muted">
                {label("اختر جودة التصدير المناسبة", "Choose export quality")}
              </Text>
            </View>

            {/* Quality selection */}
            <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
              <Text className="text-base font-semibold text-foreground">
                {t.videoEditing.exportQuality}
              </Text>
              <View className="gap-2">
                {(
                  [
                    { key: "low" as const, label: "720p", desc: label("جودة منخفضة • حجم صغير", "Low quality • Small size"), size: "~50MB" },
                    { key: "medium" as const, label: "1080p", desc: label("جودة متوسطة • موصى به", "Medium quality • Recommended"), size: "~120MB" },
                    { key: "high" as const, label: "1440p", desc: label("جودة عالية • احترافي", "High quality • Professional"), size: "~280MB" },
                    { key: "4k" as const, label: "4K", desc: label("أعلى جودة • خطة Pro", "Highest quality • Pro plan"), size: "~800MB", isPro: true },
                  ]
                ).map((q) => (
                  <Pressable
                    key={q.key}
                    onPress={() => {
                      if (q.isPro) {
                        Alert.alert(
                          label("ميزة Pro", "Pro Feature"),
                          label("التصدير بجودة 4K متاح لخطة Pro فقط.", "4K export requires a Pro subscription."),
                          [
                            { text: label("لاحقاً", "Later"), style: "cancel" },
                            { text: label("ترقية", "Upgrade") },
                          ]
                        );
                        return;
                      }
                      setQuality(q.key);
                    }}
                    className={`flex-row items-center gap-4 p-4 rounded-xl border ${
                      quality === q.key ? "border-primary bg-primary/10" : "border-border bg-background"
                    }`}
                  >
                    <View
                      className={`w-5 h-5 rounded-full border-2 ${
                        quality === q.key ? "border-primary bg-primary" : "border-muted"
                      }`}
                    />
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className={`text-base font-bold ${quality === q.key ? "text-primary" : "text-foreground"}`}>
                          {q.label}
                        </Text>
                        {q.isPro && (
                          <View className="bg-yellow-500/20 px-2 py-0.5 rounded-full">
                            <Text className="text-xs font-bold text-yellow-500">PRO</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs text-muted">{q.desc}</Text>
                    </View>
                    <Text className="text-xs text-muted">{q.size}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Format */}
            <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
              <Text className="text-base font-semibold text-foreground">
                {label("صيغة الملف", "File Format")}
              </Text>
              <View className="flex-row gap-2">
                {["MP4", "MOV", "WebM"].map((fmt) => (
                  <Pressable
                    key={fmt}
                    className={`flex-1 py-3 rounded-xl border items-center ${
                      fmt === "MP4" ? "border-primary bg-primary/10" : "border-border bg-background"
                    }`}
                  >
                    <Text
                      className={`text-sm font-bold ${fmt === "MP4" ? "text-primary" : "text-foreground"}`}
                    >
                      {fmt}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              onPress={handleExport}
              disabled={isProcessing}
              className={`py-4 rounded-2xl items-center flex-row justify-center gap-3 ${isProcessing ? "bg-muted" : "bg-primary"}`}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="file-upload" size={22} color="#fff" />
                  <Text className="text-base font-bold text-background">
                    {t.videoEditing.exportVideo}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
