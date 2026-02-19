// Copyright © Knoux. All rights reserved.
import { View, Text, Animated, Pressable, Dimensions, StyleSheet, Image } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");

// Helper: returns correct text based on current language
// Slides have both titleAr and title fields for bilingual support

const ONBOARDING_SLIDES = [
  {
    titleAr: "مرحباً في عالم الإبداع",
    title: "Welcome to the World of Creativity",
    subtitleAr: "تجربة تسجيل وبث لم تشهدها من قبل",
    subtitle: "A recording & streaming experience unlike anything before",
    descriptionAr: "استمتع بميزات احترافية وذكاء اصطناعي متقدم في تطبيق واحد",
    description: "Enjoy professional features and advanced AI in one app",
    icon: "rocket-launch",
    gradient: ["#667eea", "#764ba2"],
    features: [
      { icon: "4k", text: "تسجيل 4K" },
      { icon: "auto-awesome", text: "ذكاء اصطناعي" },
      { icon: "speed", text: "أداء فائق" },
    ],
  },
  {
    titleAr: "قوة الذكاء الاصطناعي",
    title: "The Power of AI",
    subtitleAr: "تحرير وتحسين تلقائي",
    subtitle: "Auto-edit and auto-enhance",
    descriptionAr: "دع الذكاء الاصطناعي يقوم بالعمل الشاق بينما تركز على إبداعك",
    description: "Let AI handle the heavy lifting while you focus on your creativity",
    icon: "psychology",
    gradient: ["#f093fb", "#f5576c"],
    features: [
      { icon: "face-retouching-natural", text: "تجميل تلقائي" },
      { icon: "subtitles", text: "ترجمات ذكية" },
      { icon: "auto-fix-high", text: "تحسين تلقائي" },
    ],
  },
  {
    titleAr: "بث احترافي",
    title: "Professional Live Streaming",
    subtitleAr: "شارك محتواك مع العالم",
    subtitle: "Share your content with the world",
    descriptionAr: "بث مباشر على منصات متعددة بجودة استثنائية",
    description: "Live broadcast on multiple platforms with exceptional quality",
    icon: "broadcast-on-personal",
    gradient: ["#4facfe", "#00f2fe"],
    features: [
      { icon: "hd", text: "بث HD" },
      { icon: "people", text: "دردشة مباشرة" },
      { icon: "analytics", textAr: "تحليلات فورية", text: "Real-time Analytics" },
    ],
  },
  {
    titleAr: "جاهز للانطلاق؟",
    title: "Ready to Create?",
    subtitleAr: "ابدأ رحلتك الإبداعية الآن",
    subtitle: "Start your creative journey now",
    descriptionAr: "انضم لآلاف المبدعين الذين اختاروا Knoux X Pro",
    description: "Join thousands of creators who chose Knoux Nexar Pro",
    icon: "celebration",
    gradient: ["#fa709a", "#fee140"],
    features: [
      { icon: "workspace-premium", textAr: "مميزات حصرية", text: "Exclusive Features" },
      { icon: "support-agent",     textAr: "دعم 24/7",      text: "24/7 Support" },
      { icon: "cloud-sync",        textAr: "مزامنة سحابية", text: "Cloud Sync" },
    ],
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const slide = ONBOARDING_SLIDES[currentSlide];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentSlide(currentSlide + 1);
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  return (
    <LinearGradient
      colors={slide.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* زر التخطي */}
      <Pressable style={styles.skipButton} onPress={handleSkip}>
        <BlurView intensity={40} style={styles.skipBlur}>
          <Text style={styles.skipText}>تخطي</Text>
        </BlurView>
      </Pressable>

      {/* المحتوى الرئيسي */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* أيقونة ضخمة */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <LinearGradient
              colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]}
              style={styles.iconGradient}
            >
              <MaterialIcons name={slide.icon as any} size={120} color="#fff" />
            </LinearGradient>
          </View>
          
          {/* جزيئات متلألئة */}
          <View style={[styles.sparkle, { top: -20, right: -20 }]}>
            <MaterialIcons name="auto-awesome" size={32} color="#FFD700" />
          </View>
          <View style={[styles.sparkle, { bottom: -10, left: -20 }]}>
            <MaterialIcons name="auto-awesome" size={28} color="#FF69B4" />
          </View>
          <View style={[styles.sparkle, { top: 30, left: -30 }]}>
            <MaterialIcons name="auto-awesome" size={24} color="#00CED1" />
          </View>
        </Animated.View>

        {/* النصوص */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>

        {/* الميزات */}
        <View style={styles.featuresContainer}>
          {slide.features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <BlurView intensity={30} style={styles.featureBlur}>
                <MaterialIcons name={feature.icon as any} size={28} color="#fff" />
                <Text style={styles.featureText}>{feature.text}</Text>
              </BlurView>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* مؤشرات الشرائح */}
      <View style={styles.indicatorsContainer}>
        {ONBOARDING_SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentSlide === index && styles.indicatorActive,
            ]}
          />
        ))}
      </View>

      {/* أزرار التنقل */}
      <View style={styles.navigationContainer}>
        {currentSlide > 0 && (
          <Pressable
            style={styles.backButton}
            onPress={() => setCurrentSlide(currentSlide - 1)}
          >
            <BlurView intensity={40} style={styles.navButtonBlur}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </BlurView>
          </Pressable>
        )}

        <Pressable style={styles.nextButton} onPress={handleNext}>
          <LinearGradient
            colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {currentSlide === ONBOARDING_SLIDES.length - 1 ? "ابدأ الآن" : "التالي"}
            </Text>
            <MaterialIcons
              name={currentSlide === ONBOARDING_SLIDES.length - 1 ? "rocket-launch" : "arrow-forward"}
              size={24}
              color="#667eea"
            />
          </LinearGradient>
        </Pressable>
      </View>

      {/* تأثيرات الخلفية */}
      <View style={styles.backgroundCircle1} />
      <View style={styles.backgroundCircle2} />
      <View style={styles.backgroundCircle3} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 10,
    borderRadius: 20,
    overflow: "hidden",
  },
  skipBlur: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 60,
  },
  iconCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
  },
  iconGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sparkle: {
    position: "absolute",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 320,
  },
  featuresContainer: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  featureCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  featureBlur: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  indicatorsContainer: {
    position: "absolute",
    bottom: 140,
    flexDirection: "row",
    gap: 8,
    alignSelf: "center",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  indicatorActive: {
    width: 24,
    backgroundColor: "#fff",
  },
  navigationContainer: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    width: "100%",
  },
  backButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  navButtonBlur: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  nextButton: {
    flex: 1,
    marginLeft: 16,
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  nextButtonText: {
    color: "#667eea",
    fontSize: 18,
    fontWeight: "700",
  },
  backgroundCircle1: {
    position: "absolute",
    top: -150,
    right: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  backgroundCircle2: {
    position: "absolute",
    bottom: -200,
    left: -150,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  backgroundCircle3: {
    position: "absolute",
    top: height / 3,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
});
