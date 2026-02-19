// Copyright © Knoux. All rights reserved.
import { ScrollView, Text, View, Pressable, ActivityIndicator, Switch } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLanguage } from "@/lib/language-context";
import { useState, useEffect } from "react";
import { MultiCameraService, CameraView } from "@/lib/services/multi-camera-service";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";

export default function MultiCameraScreen() {
  const { t, language } = useLanguage();
  const colors = useColors();
  const [isRecording, setIsRecording] = useState(false);
  const [activeCameras, setActiveCameras] = useState<string[]>([]);
  const [layout, setLayout] = useState<"grid" | "pip" | "splitScreen">("grid");
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);

  const availableCameras = [
    { id: "main", name: "الكاميرا الرئيسية", icon: "camera-alt", color: "#FF6B6B" },
    { id: "wide", name: "كاميرا واسعة", icon: "photo-size-select-large", color: "#4ECDC4" },
    { id: "telephoto", name: "كاميرا تقريب", icon: "zoom-in", color: "#45B7D1" },
    { id: "front", name: "الكاميرا الأمامية", icon: "camera-front", color: "#96CEB4" },
  ];

  const layoutOptions = [
    { id: "grid", name: "شبكة", icon: "grid-on" },
    { id: "pip", name: "صورة في صورة", icon: "picture-in-picture-alt" },
    { id: "splitScreen", name: "شاشة منقسمة", icon: "view-column" },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const toggleCamera = (cameraId: string) => {
    setActiveCameras((prev) =>
      prev.includes(cameraId)
        ? prev.filter((id) => id !== cameraId)
        : [...prev, cameraId]
    );
  };

  const handleStartRecording = async () => {
    if (activeCameras.length === 0) {
      alert("الرجاء اختيار كاميرا واحدة على الأقل");
      return;
    }

    try {
      const views: CameraView[] = activeCameras.map((id) => ({
        cameraId: id,
        position: { x: 0, y: 0, width: 100, height: 100 },
      }));

      await MultiCameraService.startRecording({
        cameras: views,
        layout,
        syncAudio: syncEnabled,
        resolution: "1080p",
        frameRate: 30,
      });

      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const handleStopRecording = async () => {
    try {
      await MultiCameraService.stopRecording();
      setIsRecording(false);
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  };

  const handleSwitchLayout = async (newLayout: "grid" | "pip" | "splitScreen") => {
    setLayout(newLayout);
    if (isRecording) {
      await MultiCameraService.switchLayout(newLayout);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6 pb-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">كاميرات متعددة</Text>
            <Text className="text-base text-muted">
              سجّل من عدة كاميرات في نفس الوقت مع تزامن مثالي
            </Text>
          </View>

          {/* Recording Status */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-sm text-muted mb-1">حالة التسجيل</Text>
                <Text
                  className={`text-lg font-bold ${
                    isRecording ? "text-error" : "text-muted"
                  }`}
                >
                  {isRecording ? "قيد التسجيل" : "متوقف"}
                </Text>
              </View>
              {isRecording && (
                <View className="w-4 h-4 rounded-full bg-error animate-pulse" />
              )}
            </View>
            
            <View className="bg-background rounded-xl p-4">
              <Text className="text-4xl font-bold text-primary text-center">
                {formatTime(recordingTime)}
              </Text>
            </View>

            <View className="flex-row gap-4 mt-4">
              <View className="flex-1 bg-background rounded-lg p-3">
                <Text className="text-xs text-muted mb-1">الكاميرات النشطة</Text>
                <Text className="text-lg font-semibold text-foreground">
                  {activeCameras.length}
                </Text>
              </View>
              <View className="flex-1 bg-background rounded-lg p-3">
                <Text className="text-xs text-muted mb-1">التخطيط</Text>
                <Text className="text-lg font-semibold text-foreground">
                  {layoutOptions.find((l) => l.id === layout)?.name}
                </Text>
              </View>
            </View>
          </View>

          {/* Camera Selection */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">اختر الكاميرات</Text>
            <View className="gap-3">
              {availableCameras.map((camera) => (
                <Pressable
                  key={camera.id}
                  onPress={() => toggleCamera(camera.id)}
                  disabled={isRecording}
                  className={`bg-surface rounded-2xl p-4 border-2 flex-row items-center gap-4 ${
                    activeCameras.includes(camera.id)
                      ? "border-primary"
                      : "border-border"
                  } ${isRecording ? "opacity-50" : ""}`}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: camera.color + "20" }}
                  >
                    <MaterialIcons
                      name={camera.icon as any}
                      size={24}
                      color={camera.color}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {camera.name}
                    </Text>
                    <Text className="text-xs text-muted mt-1">
                      {activeCameras.includes(camera.id) ? "نشط" : "غير نشط"}
                    </Text>
                  </View>
                  <View
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                      activeCameras.includes(camera.id)
                        ? "border-primary bg-primary"
                        : "border-border"
                    }`}
                  >
                    {activeCameras.includes(camera.id) && (
                      <MaterialIcons name="check" size={16} color="white" />
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Layout Options */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">تخطيط الشاشة</Text>
            <View className="flex-row gap-3">
              {layoutOptions.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => handleSwitchLayout(option.id as any)}
                  className={`flex-1 py-4 rounded-xl border-2 ${
                    layout === option.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface"
                  }`}
                >
                  <View className="items-center gap-2">
                    <MaterialIcons
                      name={option.icon as any}
                      size={28}
                      color={layout === option.id ? colors.primary : colors.muted}
                    />
                    <Text
                      className={`text-sm font-medium ${
                        layout === option.id ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {option.name}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Settings */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-4">
            <Text className="text-lg font-semibold text-foreground">الإعدادات</Text>

            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base text-foreground">مزامنة الصوت</Text>
                <Text className="text-xs text-muted mt-1">
                  دمج الصوت من جميع الكاميرات
                </Text>
              </View>
              <Switch
                value={syncEnabled}
                onValueChange={setSyncEnabled}
                disabled={isRecording}
              />
            </View>

            <View className="border-t border-border pt-4">
              <Text className="text-sm text-muted mb-2">الميزات المتقدمة</Text>
              <View className="gap-2">
                {[
                  "تثبيت الصورة التلقائي",
                  "معايرة الألوان الموحدة",
                  "موازنة الإضاءة التلقائية",
                  "كشف الحركة والتركيز",
                ].map((feature, i) => (
                  <View key={i} className="flex-row items-center gap-2">
                    <View className="w-2 h-2 rounded-full bg-primary" />
                    <Text className="text-sm text-foreground">{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            {!isRecording ? (
              <Pressable
                onPress={handleStartRecording}
                disabled={activeCameras.length === 0}
                className={`py-4 rounded-full ${
                  activeCameras.length === 0 ? "bg-gray-400" : "bg-primary"
                }`}
              >
                <Text className="text-center text-base font-semibold text-background">
                  بدء التسجيل ({activeCameras.length} كاميرا)
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleStopRecording}
                className="bg-error py-4 rounded-full"
              >
                <Text className="text-center text-base font-semibold text-background">
                  إيقاف التسجيل
                </Text>
              </Pressable>
            )}
          </View>

          {/* Tips */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="tips-and-updates" size={20} color={colors.primary} />
              <Text className="text-base font-semibold text-foreground">نصائح احترافية</Text>
            </View>
            <View className="gap-2">
              {[
                "استخدم الكاميرا الواسعة للقطات المجموعات",
                "الكاميرا المقربة مثالية للتفاصيل",
                "فعّل مزامنة الصوت لأفضل جودة",
                "جرب التخطيطات المختلفة حسب المحتوى",
              ].map((tip, i) => (
                <View key={i} className="flex-row gap-2">
                  <Text className="text-primary">•</Text>
                  <Text className="flex-1 text-sm text-muted">{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
