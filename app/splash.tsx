// Copyright © Knoux. All rights reserved.
/**
 * 🎬 KNOUX NEXAR PRO — Hero Launch Screen
 * شاشة البداية بفيديو احترافي + واجهة زجاجية
 * مُدمج من: hero-launch_tsx.txt
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// ── رابط الفيديو الرئيسي (Cloudinary) ──────────────────────────
const HERO_VIDEO_URL =
  'https://res.cloudinary.com/ddglpkk4j/video/upload/v1771322655/1d2ab2f3-178c-4555-b80f-aeed38adcff3_btddeo.mp4';

// ── زر زجاجي Glass Button ────────────────────────────────────
interface GlassButtonProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  icon?: string;
  delay?: number;
  primary?: boolean;
}

function GlassButton({ title, subtitle, onPress, icon, delay = 0, primary = false }: GlassButtonProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, delay, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, delay, friction: 5, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], marginBottom: 14 }}>
      <TouchableOpacity activeOpacity={0.82} onPress={handlePress}>
        <LinearGradient
          colors={
            primary
              ? ['rgba(139,92,246,0.85)', 'rgba(99,102,241,0.7)']
              : ['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.04)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.glassBtn, primary && styles.glassBtnPrimary]}
        >
          {icon ? <Text style={styles.btnIcon}>{icon}</Text> : null}
          <View style={{ flex: 1 }}>
            <Text style={styles.btnTitle}>{title}</Text>
            {subtitle ? <Text style={styles.btnSubtitle}>{subtitle}</Text> : null}
          </View>
          <Text style={styles.btnArrow}>›</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── خلفية الفيديو ───────────────────────────────────────────
function VideoBackground() {
  const [VideoComp, setVideoComp] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    import('expo-av')
      .then((m) => setVideoComp(() => m.Video))
      .catch(() => {});
  }, []);

  if (!VideoComp) {
    return (
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={StyleSheet.absoluteFillObject}
      />
    );
  }

  return (
    <>
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={StyleSheet.absoluteFillObject}
      />
      <VideoComp
        source={{ uri: HERO_VIDEO_URL }}
        style={[StyleSheet.absoluteFillObject, { opacity: loaded ? 1 : 0 }]}
        resizeMode={'cover' as any}
        isLooping
        isMuted
        shouldPlay
        onLoad={() => setLoaded(true)}
        onError={() => {}}
      />
    </>
  );
}

// ── الشاشة الرئيسية ─────────────────────────────────────────
export default function SplashScreen() {
  const fadeAnim      = useRef(new Animated.Value(0)).current;
  const logoScale     = useRef(new Animated.Value(0.4)).current;
  const logoOpacity   = useRef(new Animated.Value(0)).current;
  const glowPulse     = useRef(new Animated.Value(0)).current;
  const subtitleAnim  = useRef(new Animated.Value(0)).current;
  const buttonsAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // fade in page
    Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }).start();

    // logo entrance
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    ]).start();

    // glow pulse loop
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowPulse, { toValue: 1, duration: 2200, useNativeDriver: true }),
          Animated.timing(glowPulse, { toValue: 0, duration: 2200, useNativeDriver: true }),
        ])
      ).start();
    }, 800);

    // subtitle
    Animated.sequence([
      Animated.delay(900),
      Animated.timing(subtitleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();

    // buttons
    Animated.sequence([
      Animated.delay(1200),
      Animated.timing(buttonsAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const glowOp  = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.65] });
  const glowSc  = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const logoTY  = logoScale.interpolate({ inputRange: [0.4, 1], outputRange: [60, 0] });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* فيديو أو تدرج خلفي */}
      <VideoBackground />

      {/* طبقة تعتيم */}
      <LinearGradient
        colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.9)']}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* دائرة وهج خلفية */}
      <Animated.View
        style={[styles.glowRing, { opacity: glowOp, transform: [{ scale: glowSc }] }]}
      />

      {/* المحتوى الرئيسي */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

        {/* ── قسم الشعار ── */}
        <Animated.View
          style={[
            styles.logoSection,
            { opacity: logoOpacity, transform: [{ scale: logoScale }, { translateY: logoTY }] },
          ]}
        >
          <View style={styles.logoCard}>
            <Image
              source={require('@/assets/images/app-icon.png')}
              style={styles.appIcon}
              onError={() => {}}
            />
            <Text style={styles.brandTxt}>KNOUX</Text>
            <Text style={styles.appNameTxt}>NEXAR</Text>
            <Text style={styles.proTxt}>P R O</Text>

            <Animated.View style={{ opacity: subtitleAnim, alignItems: 'center' }}>
              <View style={styles.taglineBox}>
                <Text style={styles.taglineTxt}>✨  Your Professional Studio  ✨</Text>
              </View>
              <Text style={styles.featuresTxt}>337+ Professional Features</Text>
            </Animated.View>
          </View>
        </Animated.View>

        {/* ── أزرار الإجراءات ── */}
        <Animated.View style={{ opacity: buttonsAnim }}>
          <GlassButton
            title="ابدأ الآن  •  Get Started"
            subtitle="أنشئ حسابك واستمتع بكل الميزات"
            icon="🚀"
            primary
            onPress={() => router.replace('/hero-launch')}
            delay={0}
          />
          <GlassButton
            title="استكشف التطبيق"
            subtitle="الريتوش • التسجيل • البث • AI والمزيد"
            icon="✨"
            onPress={() => router.replace('/(tabs)')}
            delay={120}
          />
          <GlassButton
            title="دخول سريع ⚡"
            subtitle="تخطي المقدمة"
            icon="⚡"
            onPress={() => router.replace('/(tabs)')}
            delay={240}
          />
        </Animated.View>

        {/* Credits */}
        <Animated.View style={[styles.credits, { opacity: subtitleAnim }]}>
          <Text style={styles.creditsTxt}>Built with ❤️ by Eng. Sadek Elgazar</Text>
          <Text style={styles.creditsSubTxt}>Abu Dhabi, UAE  •  2026</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0c29' },

  glowRing: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#8B5CF6',
    top: height * 0.1,
    alignSelf: 'center',
  },

  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop:   Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 22,
  },

  logoSection: { alignItems: 'center' },
  logoCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 32,
    padding: 30,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.4)',
    width: '100%',
  },
  appIcon: {
    width: 82,
    height: 82,
    borderRadius: 22,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(139,92,246,0.5)',
  },
  brandTxt: {
    fontSize: 16,
    fontWeight: '900',
    color: '#A78BFA',
    letterSpacing: 8,
  },
  appNameTxt: {
    fontSize: 58,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 10,
    marginTop: -8,
    textShadowColor: 'rgba(139,92,246,0.9)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 24,
  },
  proTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8B5CF6',
    letterSpacing: 10,
    marginTop: -6,
  },
  taglineBox: {
    marginTop: 18,
    backgroundColor: 'rgba(139,92,246,0.13)',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.28)',
  },
  taglineTxt: { color: '#C4B5FD', fontSize: 13, letterSpacing: 1, textAlign: 'center' },
  featuresTxt: {
    color: 'rgba(255,255,255,0.32)',
    fontSize: 11,
    marginTop: 10,
    letterSpacing: 2,
    textAlign: 'center',
  },

  glassBtn: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  glassBtnPrimary: {
    borderColor: 'rgba(139,92,246,0.55)',
  },
  btnIcon:     { fontSize: 26 },
  btnTitle:    { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 2 },
  btnSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  btnArrow:    { color: 'rgba(255,255,255,0.35)', fontSize: 22, fontWeight: '200' },

  credits:       { alignItems: 'center' },
  creditsTxt:    { color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center' },
  creditsSubTxt: { color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 4, textAlign: 'center' },
});
