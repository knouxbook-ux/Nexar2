// Copyright © Knoux. All rights reserved.
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Video, ResizeMode } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { Text } from 'react-native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// الفيديو الأساسي للـ Hero
const HERO_VIDEO_URL = 'https://res.cloudinary.com/ddglpkk4j/video/upload/v1771322655/1d2ab2f3-178c-4555-b80f-aeed38adcff3_btddeo.mp4';

interface GlassButtonProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  icon?: string;
  delay?: number;
}

const GlassButton: React.FC<GlassButtonProps> = ({ title, subtitle, onPress, icon, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.buttonContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={styles.buttonTouchable}
      >
        <BlurView intensity={20} tint="dark" style={styles.blurButton}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            {icon && <Text style={styles.icon}>{icon}</Text>}
            <Text style={styles.buttonTitle}>{title}</Text>
            {subtitle && <Text style={styles.buttonSubtitle}>{subtitle}</Text>}
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HeroLaunchScreen() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const videoRef = useRef<any>(null);

  useEffect(() => {
    // تحريك الشعار
    Animated.sequence([
      Animated.delay(500),
      Animated.spring(logoAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // تلاشي الشاشة
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  const navigateTo = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Hero Video Background */}
      <Video
        ref={videoRef}
        source={{ uri: HERO_VIDEO_URL }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        isLooping
        isMuted
        shouldPlay
        onLoad={handleVideoLoad}
      />

      {/* Dark Overlay للتباين */}
      <LinearGradient
        colors={[
          'rgba(0,0,0,0.4)',
          'rgba(0,0,0,0.6)',
          'rgba(0,0,0,0.8)',
        ]}
        style={styles.overlay}
      />

      {/* المحتوى الرئيسي */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              transform: [
                {
                  scale: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
                {
                  translateY: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <BlurView intensity={15} tint="dark" style={styles.logoBlur}>
            <Text style={styles.brandName}>KNOUX</Text>
            <Text style={styles.appName}>NEXAR</Text>
            <Text style={styles.tagline}>Your Professional Studio</Text>
          </BlurView>
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <GlassButton
            title="Get Started"
            subtitle="337 Professional Features"
            icon="🚀"
            onPress={() => navigateTo('/onboarding')}
            delay={600}
          />
          
          <GlassButton
            title="Explore Features"
            subtitle="Retouch • Edit • Export"
            icon="✨"
            onPress={() => navigateTo('/(tabs)')}
            delay={800}
          />
          
          <GlassButton
            title="Contact Developer"
            subtitle="Eng. Sadiq Al-Jazzar"
            icon="👨‍💻"
            onPress={() => navigateTo('/about')}
            delay={1000}
          />
        </View>

        {/* Bottom Credits */}
        <Animated.View style={styles.credits}>
          <BlurView intensity={10} tint="dark" style={styles.creditsBlur}>
            <Text style={styles.creditsText}>Built with ❤️ by knoux</Text>
            <Text style={styles.creditsSubtext}>Abu Ritaj • 2026</Text>
          </BlurView>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoBlur: {
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  brandName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  appName: {
    fontSize: 64,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 8,
    marginTop: -10,
    textShadowColor: 'rgba(139,92,246,0.8)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    letterSpacing: 2,
  },
  actionsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
  },
  buttonTouchable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  blurButton: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  gradientButton: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  icon: {
    fontSize: 28,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  buttonSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  credits: {
    alignItems: 'center',
  },
  creditsBlur: {
    borderRadius: 15,
    padding: 15,
    paddingHorizontal: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  creditsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  creditsSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    textAlign: 'center',
  },
});
