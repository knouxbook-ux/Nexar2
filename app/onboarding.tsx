// Copyright © Knoux. All rights reserved.
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Dimensions,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "@/hooks/use-colors";

const { width, height } = Dimensions.get("window");
const ONBOARDING_KEY = "@knoux_x_onboarding_done";

const slides = [
  {
    id: "1",
    emoji: "🎬",
    title: "Play Beyond Limits",
    subtitle: "Knoux X",
    description:
      "The ultimate media player for 4K videos, FLAC audio, and stunning images — all in one place.",
    gradient: ["#00C2FF", "#0056D2"],
    bg: "#00C2FF18",
  },
  {
    id: "2",
    emoji: "📁",
    title: "Your Library, Organized",
    subtitle: "Smart Media Library",
    description:
      "Automatically scans and organizes your videos, music, and photos. Search, filter, and sort effortlessly.",
    gradient: ["#8A2BE2", "#5500AA"],
    bg: "#8A2BE218",
  },
  {
    id: "3",
    emoji: "⬇️",
    title: "Download & Go",
    subtitle: "Offline Access",
    description:
      "Download your favorite content and watch offline anytime, anywhere — even without internet.",
    gradient: ["#22C55E", "#15803D"],
    bg: "#22C55E18",
  },
  {
    id: "4",
    emoji: "⭐",
    title: "Go Premium",
    subtitle: "Unlock Everything",
    description:
      "4K HDR, No watermark, Full equalizer, Cloud sync, and priority support — all with Knoux X Premium.",
    gradient: ["#F59E0B", "#D97706"],
    bg: "#F59E0B18",
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleFinish();
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/(tabs)");
  };

  const renderDot = (index: number) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const dotWidth = scrollX.interpolate({
      inputRange,
      outputRange: [8, 24, 8],
      extrapolate: "clamp",
    });
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.dot,
          {
            width: dotWidth,
            opacity,
            backgroundColor: colors.primary,
          },
        ]}
      />
    );
  };

  const renderSlide = ({ item }: { item: (typeof slides)[0] }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.emojiContainer, { backgroundColor: item.bg }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>

      <Text style={[styles.subtitle, { color: colors.primary }]}>{item.subtitle}</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
      <Text style={[styles.description, { color: colors.muted }]}>{item.description}</Text>
    </View>
  );

  const isLast = currentIndex === slides.length - 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip Button */}
      {!isLast && (
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.muted }]}>Skip</Text>
        </Pressable>
      )}

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      />

      {/* Bottom Controls */}
      <View style={styles.bottomContainer}>
        {/* Dots */}
        <View style={styles.dotsContainer}>{slides.map((_, i) => renderDot(i))}</View>

        {/* Next / Get Started Button */}
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          <Text style={styles.buttonText}>{isLast ? "Get Started 🚀" : "Next →"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipButton: {
    position: "absolute",
    top: 56,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: { fontSize: 14, fontWeight: "600" },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  emojiContainer: {
    width: 140,
    height: 140,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  emoji: { fontSize: 72 },
  subtitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 38,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 24,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: { height: 8, borderRadius: 4 },
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
