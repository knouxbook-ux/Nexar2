// Copyright © Knoux. All rights reserved.
/**
 * 📁 Retouch Engine — Video Importer
 * استيراد الفيديو والصور من المكتبة أو الكاميرا
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';

interface ImportedMedia {
  uri: string;
  type: 'image' | 'video';
  name: string;
  size?: number;
  duration?: number;
  width?: number;
  height?: number;
}

interface VideoImporterProps {
  onImport: (media: ImportedMedia) => void;
  allowedTypes?: ('image' | 'video')[];
  maxFileSizeMB?: number;
}

export function VideoImporter({ onImport, allowedTypes = ['image', 'video'], maxFileSizeMB = 500 }: VideoImporterProps) {
  const [importing, setImporting] = useState(false);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  const importFromGallery = async () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      Alert.alert('❌ صلاحية مرفوضة', 'يرجى السماح للتطبيق بالوصول إلى مكتبة الصور من الإعدادات');
      return;
    }
    setImporting(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: allowedTypes.includes('video')
          ? ImagePicker.MediaTypeOptions.All
          : ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: false,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onImport({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          name: asset.fileName ?? `media_${Date.now()}`,
          size: asset.fileSize,
          duration: asset.duration ?? undefined,
          width: asset.width,
          height: asset.height,
        });
      }
    } catch (err) {
      Alert.alert('❌ خطأ في الاستيراد', err instanceof Error ? err.message : 'فشل استيراد الملف');
    } finally {
      setImporting(false);
    }
  };

  const importFromCamera = async () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('❌ صلاحية مرفوضة', 'يرجى السماح للتطبيق بالوصول إلى الكاميرا');
      return;
    }
    setImporting(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onImport({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          name: `capture_${Date.now()}`,
          width: asset.width,
          height: asset.height,
        });
      }
    } finally {
      setImporting(false);
    }
  };

  const IMPORT_BTNS = [
    { icon: '🖼️', labelAr: 'من المعرض',   gradient: ['#7C3AED', '#A855F7'] as const, onPress: importFromGallery },
    { icon: '📷', labelAr: 'من الكاميرا', gradient: ['#EC4899', '#F97316'] as const, onPress: importFromCamera },
  ];

  return (
    <View style={s.container}>
      <LinearGradient colors={['rgba(99,102,241,0.08)', 'transparent']} style={StyleSheet.absoluteFill} />

      {importing ? (
        <View style={s.loadingBox}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={s.loadingText}>جاري الاستيراد...</Text>
        </View>
      ) : (
        <>
          <View style={s.dropZone}>
            <LinearGradient
              colors={['rgba(124,58,237,0.12)', 'rgba(124,58,237,0.04)']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={s.dropIcon}>📥</Text>
            <Text style={s.dropTitle}>استيراد وسائط</Text>
            <Text style={s.dropSub}>صور وفيديوهات · حتى {maxFileSizeMB}MB</Text>
          </View>
          <View style={s.btnRow}>
            {IMPORT_BTNS.map((btn, i) => (
              <TouchableOpacity key={i} onPress={btn.onPress} style={s.importBtn} activeOpacity={0.85}>
                <LinearGradient colors={btn.gradient} style={StyleSheet.absoluteFill} />
                <Text style={s.importIcon}>{btn.icon}</Text>
                <Text style={s.importLabel}>{btn.labelAr}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { borderRadius: 16, padding: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(99,102,241,0.25)', gap: 12 },
  loadingBox: { alignItems: 'center', padding: 30, gap: 12 },
  loadingText: { color: '#A78BFA', fontSize: 14, fontWeight: '600' },
  dropZone: { alignItems: 'center', padding: 24, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(167,139,250,0.4)', gap: 8 },
  dropIcon: { fontSize: 40 },
  dropTitle: { color: '#f1f0ff', fontSize: 16, fontWeight: '800' },
  dropSub: { color: '#6B7280', fontSize: 12 },
  btnRow: { flexDirection: 'row', gap: 10 },
  importBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, overflow: 'hidden' },
  importIcon: { fontSize: 18 },
  importLabel: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
