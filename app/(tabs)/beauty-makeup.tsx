// Copyright © Knoux. All rights reserved.
/**
 * 💄 Beauty & Makeup Screen
 * ✅ FIXED: ImagePicker حقيقي — applyPreset/removeMakeup حقيقيان — لا Simulated image selection
 */

import { ScrollView, Text, View, Pressable, Image, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLanguage } from "@/lib/language-context";
import { useState } from "react";
import { MakeupService } from "@/lib/services/makeup-service";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";
import * as ImagePicker from "expo-image-picker";

type PresetId = "natural" | "party" | "vintage" | "bold" | "korean" | "artistic";

export default function BeautyMakeupScreen() {
  const { language } = useLanguage();
  const colors = useColors();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPreset, setCurrentPreset] = useState<PresetId>("natural");
  const [intensity, setIntensity] = useState(50);
  const [appliedPreset, setAppliedPreset] = useState<string | null>(null);

  const ar = language === "ar";

  const makeupPresets: Array<{ id: PresetId; nameAr: string; nameEn: string; icon: string; color: string }> = [
    { id: "natural", nameAr: "طبيعي", nameEn: "Natural", icon: "face", color: "#FFB6C1" },
    { id: "party", nameAr: "حفلة", nameEn: "Party", icon: "celebration", color: "#FF69B4" },
    { id: "vintage", nameAr: "كلاسيكي", nameEn: "Vintage", icon: "access-time", color: "#DDA15E" },
    { id: "bold", nameAr: "جريء", nameEn: "Bold", icon: "bolt", color: "#FF1493" },
    { id: "korean", nameAr: "كوري", nameEn: "Korean", icon: "favorite", color: "#FFC0CB" },
    { id: "artistic", nameAr: "فني", nameEn: "Artistic", icon: "palette", color: "#9370DB" },
  ];

  const makeupFeatures = [
    { id: "foundation", nameAr: "أساس المكياج", nameEn: "Foundation", intensity: 70 },
    { id: "eyeshadow", nameAr: "ظلال العيون", nameEn: "Eye Shadow", intensity: 60 },
    { id: "eyeliner", nameAr: "كحل العيون", nameEn: "Eyeliner", intensity: 80 },
    { id: "mascara", nameAr: "ماسكارا", nameEn: "Mascara", intensity: 75 },
    { id: "blush", nameAr: "أحمر الخدود", nameEn: "Blush", intensity: 50 },
    { id: "lipstick", nameAr: "أحمر الشفاه", nameEn: "Lipstick", intensity: 85 },
    { id: "eyebrow", nameAr: "الحواجب", nameEn: "Eyebrows", intensity: 65 },
    { id: "highlighter", nameAr: "الإضاءة", nameEn: "Highlighter", intensity: 55 },
    { id: "contour", nameAr: "التحديد", nameEn: "Contour", intensity: 45 },
  ];

  // ─── اختيار صورة حقيقية من المعرض ─────────────────────────────────────────
  const handleSelectImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        ar ? "إذن مطلوب" : "Permission Required",
        ar ? "يرجى السماح للتطبيق بالوصول إلى الصور" : "Please allow access to your photo library"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setAppliedPreset(null);
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        ar ? "إذن مطلوب" : "Permission Required",
        ar ? "يرجى السماح للتطبيق بالوصول إلى الكاميرا" : "Please allow access to your camera"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
      cameraType: ImagePicker.CameraType.front,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setAppliedPreset(null);
    }
  };

  // ─── تطبيق المكياج ───────────────────────────────────────────────────────
  const handleApplyMakeup = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);
    try {
      const result = await MakeupService.applyPreset(selectedImage, currentPreset, intensity);
      setSelectedImage(result.processedImageUri);
      setAppliedPreset(result.presetApplied);
    } catch (error) {
      Alert.alert(ar ? "خطأ" : "Error", ar ? "فشل تطبيق المكياج" : "Failed to apply makeup");
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── إزالة المكياج ───────────────────────────────────────────────────────
  const handleRemoveMakeup = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);
    try {
      const result = await MakeupService.removeMakeup(selectedImage);
      setSelectedImage(result.processedImageUri);
      setAppliedPreset(null);
    } catch (error) {
      Alert.alert(ar ? "خطأ" : "Error", ar ? "فشل إزالة المكياج" : "Failed to remove makeup");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6 pb-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              {ar ? "💄 الجمال والمكياج" : "💄 Beauty & Makeup"}
            </Text>
            <Text className="text-base text-muted">
              {ar ? "اكتشفي إطلالات مكياج مختلفة بتقنية الذكاء الاصطناعي" : "Try different makeup looks with AI"}
            </Text>
          </View>

          {/* Image Preview / Picker */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            {selectedImage ? (
              <View>
                <View style={{ position: "relative" }}>
                  <Image
                    source={{ uri: selectedImage }}
                    style={{ width: "100%", height: 360, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                  {isProcessing && (
                    <View style={{
                      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 12,
                      alignItems: "center", justifyContent: "center",
                    }}>
                      <ActivityIndicator size="large" color={colors.primary} />
                      <Text style={{ color: "#fff", marginTop: 10, fontWeight: "700" }}>
                        {ar ? "جاري المعالجة..." : "Processing..."}
                      </Text>
                    </View>
                  )}
                  {appliedPreset && (
                    <View style={{
                      position: "absolute", bottom: 10, right: 10,
                      backgroundColor: "rgba(0,0,0,0.7)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
                    }}>
                      <Text style={{ color: "#fff", fontSize: 11 }}>✨ {appliedPreset}</Text>
                    </View>
                  )}
                </View>
                {/* Change / Reset buttons */}
                <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                  <Pressable
                    onPress={handleSelectImage}
                    style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 10, padding: 10, alignItems: "center" }}
                  >
                    <Text style={{ color: colors.muted, fontWeight: "600" }}>
                      {ar ? "📁 تغيير" : "📁 Change"}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleTakePhoto}
                    style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 10, padding: 10, alignItems: "center" }}
                  >
                    <Text style={{ color: colors.muted, fontWeight: "600" }}>
                      {ar ? "📷 كاميرا" : "📷 Camera"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                <Pressable
                  onPress={handleSelectImage}
                  style={{
                    height: 220, borderWidth: 2, borderStyle: "dashed", borderColor: colors.border,
                    borderRadius: 12, alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  <MaterialIcons name="add-a-photo" size={48} color={colors.muted} />
                  <Text style={{ color: colors.muted, fontWeight: "600" }}>
                    {ar ? "اضغط لاختيار صورة" : "Tap to select a photo"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleTakePhoto}
                  style={{
                    flexDirection: "row", alignItems: "center", justifyContent: "center",
                    gap: 8, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 12,
                  }}
                >
                  <MaterialIcons name="camera-alt" size={20} color={colors.muted} />
                  <Text style={{ color: colors.muted, fontWeight: "600" }}>
                    {ar ? "أو التقط صورة سيلفي" : "Or take a selfie"}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Makeup Presets */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              {ar ? "قوالب المكياج" : "Makeup Presets"}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {makeupPresets.map((preset) => (
                  <Pressable
                    key={preset.id}
                    onPress={() => setCurrentPreset(preset.id)}
                    style={{
                      paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16,
                      borderWidth: 2,
                      borderColor: currentPreset === preset.id ? preset.color : "rgba(255,255,255,0.1)",
                      backgroundColor: currentPreset === preset.id ? `${preset.color}20` : "rgba(255,255,255,0.04)",
                    }}
                  >
                    <View style={{ alignItems: "center", gap: 8 }}>
                      <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: `${preset.color}30` }}>
                        <MaterialIcons name={preset.icon as any} size={24} color={preset.color} />
                      </View>
                      <Text style={{ color: currentPreset === preset.id ? preset.color : "#94A3B8", fontSize: 12, fontWeight: "700" }}>
                        {ar ? preset.nameAr : preset.nameEn}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Intensity */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-semibold text-foreground">
                {ar ? "شدة المكياج" : "Makeup Intensity"}
              </Text>
              <Text style={{ color: colors.primary, fontWeight: "800", fontSize: 16 }}>{intensity}%</Text>
            </View>
            <View className="flex-row gap-2">
              {[0, 25, 50, 75, 100].map((value) => (
                <Pressable
                  key={value}
                  onPress={() => setIntensity(value)}
                  style={{
                    flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center",
                    backgroundColor: intensity === value ? colors.primary : "rgba(255,255,255,0.06)",
                  }}
                >
                  <Text style={{ color: intensity === value ? "#fff" : "#94A3B8", fontSize: 12, fontWeight: "700" }}>
                    {value}%
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Makeup Features */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <Text className="text-base font-semibold text-foreground">
              {ar ? "ميزات المكياج" : "Makeup Features"}
            </Text>
            <View className="gap-1">
              {makeupFeatures.map((feature, i) => (
                <View
                  key={feature.id}
                  style={{
                    flexDirection: ar ? "row-reverse" : "row", alignItems: "center",
                    justifyContent: "space-between", paddingVertical: 8,
                    borderBottomWidth: i < makeupFeatures.length - 1 ? 1 : 0,
                    borderColor: "rgba(255,255,255,0.06)",
                  }}
                >
                  <View style={{ flexDirection: ar ? "row-reverse" : "row", alignItems: "center", gap: 10 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
                    <Text style={{ color: "#D1D5DB", fontSize: 13 }}>
                      {ar ? feature.nameAr : feature.nameEn}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <View style={{ width: 60, height: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
                      <View style={{ width: `${(intensity / 100) * feature.intensity}%`, height: "100%", backgroundColor: colors.primary, borderRadius: 2 }} />
                    </View>
                    <Text style={{ color: "#6B7280", fontSize: 11, width: 28, textAlign: "right" }}>
                      {Math.round((intensity / 100) * feature.intensity)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <Pressable
              onPress={handleApplyMakeup}
              disabled={!selectedImage || isProcessing}
              style={{
                paddingVertical: 16, borderRadius: 16, alignItems: "center",
                backgroundColor: !selectedImage || isProcessing ? "#374151" : colors.primary,
              }}
            >
              {isProcessing
                ? <ActivityIndicator color="#fff" />
                : <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>
                    {ar ? "✨ تطبيق المكياج" : "✨ Apply Makeup"}
                  </Text>
              }
            </Pressable>

            {selectedImage && (
              <Pressable
                onPress={handleRemoveMakeup}
                disabled={isProcessing}
                style={{ paddingVertical: 14, borderRadius: 16, alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}
              >
                <Text style={{ color: "#94A3B8", fontWeight: "700" }}>
                  {ar ? "🗑️ إزالة المكياج" : "🗑️ Remove Makeup"}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Tips */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <Text className="text-base font-semibold text-foreground">
              💡 {ar ? "نصائح" : "Tips"}
            </Text>
            {[
              ar ? "استخدمي صورة بإضاءة جيدة للحصول على أفضل النتائج" : "Use a well-lit photo for best results",
              ar ? "جربي القوالب المختلفة لاكتشاف إطلالات جديدة" : "Try different presets to explore new looks",
              ar ? "اضبطي شدة المكياج حسب تفضيلاتك" : "Adjust makeup intensity to your preference",
            ].map((tip, i) => (
              <View key={i} style={{ flexDirection: ar ? "row-reverse" : "row", gap: 8 }}>
                <Text style={{ color: colors.primary }}>•</Text>
                <Text style={{ flex: 1, color: "#9CA3AF", fontSize: 13 }}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
