// Copyright © Knoux. All rights reserved.
/**
 * 🎨 NEXAR Retouch Panel UI Component
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
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import {
  RetouchCategory,
  RetouchService,
  ALL_RETOUCH_SERVICES,
  SKIN_SERVICES,
  EYES_SERVICES,
  NOSE_SERVICES,
  LIPS_SERVICES,
  TEETH_SERVICES,
  applyRetouch,
  applyBatchRetouch,
} from '@/lib/nexar/RetouchEngine';

const { width } = Dimensions.get('window');

interface RetouchPanelProps {
  imageUri?: string;
  onImageChange?: (uri: string) => void;
}

const CATEGORY_ICONS: Record<RetouchCategory, string> = {
  skin: '🧴',
  eyes: '👁️',
  nose: '👃',
  lips: '💋',
  teeth: '🦷',
  jaw: '👤',
  body: '🏋️',
  lighting: '🌟',
  background: '🎭',
  ai: '🤖',
  quick: '⚡',
};

const CATEGORY_LABELS: Record<RetouchCategory, { en: string; ar: string }> = {
  skin: { en: 'Skin', ar: 'البشرة' },
  eyes: { en: 'Eyes', ar: 'العيون' },
  nose: { en: 'Nose', ar: 'الأنف' },
  lips: { en: 'Lips', ar: 'الشفاه' },
  teeth: { en: 'Teeth', ar: 'الأسنان' },
  jaw: { en: 'Jaw', ar: 'الفك' },
  body: { en: 'Body', ar: 'الجسم' },
  lighting: { en: 'Lighting', ar: 'الإضاءة' },
  background: { en: 'Background', ar: 'الخلفية' },
  ai: { en: 'AI', ar: 'الذكاء الاصطناعي' },
  quick: { en: 'Quick', ar: 'سريع' },
};

export default function RetouchPanel({ imageUri, onImageChange }: RetouchPanelProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(imageUri || null);
  const [selectedCategory, setSelectedCategory] = useState<RetouchCategory>('skin');
  const [activeServices, setActiveServices] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      onImageChange?.(result.assets[0].uri);
    }
  };

  const toggleService = (serviceId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setActiveServices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  const applyAllActive = async () => {
    if (!selectedImage || activeServices.size === 0) return;

    setProcessing(true);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      const result = await applyBatchRetouch(
        selectedImage,
        Array.from(activeServices),
        { intensity: 0.7, naturalLook: true, preserveTexture: true }
      );

      if (result.success) {
        setSelectedImage(result.processedImage);
        onImageChange?.(result.processedImage);
      }
    } finally {
      setProcessing(false);
    }
  };

  const resetAll = () => {
    setActiveServices(new Set());
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const getCategoryServices = (category: RetouchCategory): RetouchService[] => {
    switch (category) {
      case 'skin':
        return SKIN_SERVICES;
      case 'eyes':
        return EYES_SERVICES;
      case 'nose':
        return NOSE_SERVICES;
      case 'lips':
        return LIPS_SERVICES;
      case 'teeth':
        return TEETH_SERVICES;
      default:
        return ALL_RETOUCH_SERVICES.filter(s => s.category === category);
    }
  };

  const services = getCategoryServices(selectedCategory);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Image Preview */}
      <View style={styles.imageContainer}>
        {selectedImage ? (
          <TouchableOpacity
            onPress={() => setShowOriginal(!showOriginal)}
            onLongPress={pickImage}
            activeOpacity={0.9}
          >
            <Image source={{ uri: selectedImage }} style={styles.image} />
            <BlurView intensity={10} tint="dark" style={styles.imageOverlay}>
              <Text style={styles.imageHint}>
                {showOriginal ? '👁️ Original' : '✨ Enhanced'}
              </Text>
            </BlurView>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImage}>
            <Text style={styles.placeholderIcon}>📸</Text>
            <Text style={styles.placeholderText}>Tap to select image</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {Object.keys(CATEGORY_ICONS).map((cat) => {
          const category = cat as RetouchCategory;
          const isActive = selectedCategory === category;

          return (
            <TouchableOpacity
              key={category}
              style={[styles.categoryTab, isActive && styles.categoryTabActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={styles.categoryIcon}>{CATEGORY_ICONS[category]}</Text>
              <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                {CATEGORY_LABELS[category].en}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Services List */}
      <ScrollView style={styles.servicesList}>
        <View style={styles.servicesGrid}>
          {services.map((service) => {
            const isActive = activeServices.has(service.id);

            return (
              <TouchableOpacity
                key={service.id}
                style={[styles.serviceCard, isActive && styles.serviceCardActive]}
                onPress={() => toggleService(service.id)}
                disabled={!service.enabled}
              >
                <BlurView intensity={isActive ? 20 : 10} tint="dark" style={styles.serviceBlur}>
                  <View style={styles.serviceContent}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceNameAr}>{service.nameAr}</Text>
                    <Text style={styles.serviceTechnique}>{service.technique}</Text>
                    {isActive && (
                      <View style={styles.serviceActiveBadge}>
                        <Text style={styles.serviceActiveBadgeText}>✓</Text>
                      </View>
                    )}
                  </View>
                </BlurView>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {selectedImage && (
        <BlurView intensity={30} tint="dark" style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionButton, styles.resetButton]}
            onPress={resetAll}
          >
            <Text style={styles.actionButtonText}>🔄 Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.applyButton,
              (processing || activeServices.size === 0) && styles.actionButtonDisabled,
            ]}
            onPress={applyAllActive}
            disabled={processing || activeServices.size === 0}
          >
            <Text style={styles.actionButtonText}>
              {processing ? '⏳ Processing...' : `✨ Apply (${activeServices.size})`}
            </Text>
          </TouchableOpacity>
        </BlurView>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    width,
    height: width * 1.2,
    backgroundColor: '#111',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    alignItems: 'center',
  },
  imageHint: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
  },
  categoryScroll: {
    maxHeight: 80,
    backgroundColor: '#0a0a0a',
  },
  categoryScrollContent: {
    padding: 10,
    gap: 10,
  },
  categoryTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    minWidth: 80,
  },
  categoryTabActive: {
    backgroundColor: '#8B5CF6',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  servicesList: {
    flex: 1,
  },
  servicesGrid: {
    padding: 10,
    gap: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceCard: {
    width: (width - 30) / 2,
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  serviceCardActive: {
    borderColor: '#8B5CF6',
  },
  serviceBlur: {
    padding: 16,
  },
  serviceContent: {
    position: 'relative',
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  serviceNameAr: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
  },
  serviceTechnique: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },
  serviceActiveBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceActiveBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  applyButton: {
    backgroundColor: '#8B5CF6',
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
