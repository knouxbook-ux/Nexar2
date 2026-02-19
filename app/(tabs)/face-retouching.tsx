// Copyright © Knoux. All rights reserved.
import { ScrollView, Text, View, Pressable, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLanguage } from "@/lib/language-context";
import { useState } from "react";
import { FaceRetouchingService } from "@/lib/services/face-retouching-service";

export default function FaceRetouchingScreen() {
  const { t, language } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [appliedEffects, setAppliedEffects] = useState<string[]>([]);
  const [skinSmoothing, setSkinSmoothing] = useState(50);
  const [teethWhitening, setTeethWhitening] = useState(30);
  const [eyeEnlargement, setEyeEnlargement] = useState(20);

  const handleApplyRetouching = async () => {
    setIsProcessing(true);
    try {
      const result = await FaceRetouchingService.applyRetouching("sample_image.jpg", {
        skinSmoothing,
        teethWhitening,
        eyeEnlargement,
        blemishRemoval: 40,
        lightingCorrection: 50,
      });
      setAppliedEffects(result.appliedEffects);
    } catch (error) {
      console.error("Retouching error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDetectFaces = async () => {
    setIsProcessing(true);
    try {
      const result = await FaceRetouchingService.detectFaces("sample_image.jpg");
      console.log("Detected faces:", result.faces.length);
    } catch (error) {
      console.error("Face detection error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScreenContainer className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              {t("faceRetouching.title")}
            </Text>
            <Text className="text-sm text-muted">
              {t("faceRetouching.subtitle")}
            </Text>
          </View>

          {/* Sliders */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-4">
            {/* Skin Smoothing */}
            <View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm font-semibold text-foreground">
                  {t("faceRetouching.skinSmoothing")}
                </Text>
                <Text className="text-sm text-primary font-bold">
                  {skinSmoothing}%
                </Text>
              </View>
              <View className="h-2 bg-border rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary"
                  style={{ width: `${skinSmoothing}%` }}
                />
              </View>
            </View>

            {/* Teeth Whitening */}
            <View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm font-semibold text-foreground">
                  {t("faceRetouching.teethWhitening")}
                </Text>
                <Text className="text-sm text-primary font-bold">
                  {teethWhitening}%
                </Text>
              </View>
              <View className="h-2 bg-border rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary"
                  style={{ width: `${teethWhitening}%` }}
                />
              </View>
            </View>

            {/* Eye Enlargement */}
            <View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm font-semibold text-foreground">
                  {t("faceRetouching.eyeEnlargement")}
                </Text>
                <Text className="text-sm text-primary font-bold">
                  {eyeEnlargement}%
                </Text>
              </View>
              <View className="h-2 bg-border rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary"
                  style={{ width: `${eyeEnlargement}%` }}
                />
              </View>
            </View>
          </View>

          {/* Applied Effects */}
          {appliedEffects.length > 0 && (
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-3">
                {t("faceRetouching.appliedEffects")}
              </Text>
              <View className="gap-2">
                {appliedEffects.map((effect, i) => (
                  <View key={i} className="flex-row items-center gap-2 bg-background rounded-lg p-2">
                    <View className="w-2 h-2 rounded-full bg-success" />
                    <Text className="text-sm text-foreground flex-1">{effect}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Features List */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-3">
              {t("faceRetouching.availableEffects")}
            </Text>
            <View className="gap-2">
              {[
                t("faceRetouching.skinSmoothing"),
                t("faceRetouching.blemishRemoval"),
                t("faceRetouching.teethWhitening"),
                t("faceRetouching.eyeEnlargement"),
                t("faceRetouching.eyebrowShaping"),
                t("faceRetouching.lipPlumping"),
                t("faceRetouching.noseReshaping"),
                t("faceRetouching.faceSlimming"),
              ].map((effect, i) => (
                <View key={i} className="flex-row items-center gap-2">
                  <View className="w-2 h-2 rounded-full bg-primary" />
                  <Text className="text-sm text-foreground">{effect}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-2">
            <Pressable
              onPress={handleDetectFaces}
              disabled={isProcessing}
              className={`py-3 rounded-lg items-center ${
                isProcessing ? "bg-muted" : "bg-primary"
              }`}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-semibold text-background">
                  {t("faceRetouching.detectFaces")}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={handleApplyRetouching}
              disabled={isProcessing}
              className={`py-3 rounded-lg items-center ${
                isProcessing ? "bg-muted" : "bg-success"
              }`}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-semibold text-background">
                  {t("faceRetouching.applyRetouching")}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
