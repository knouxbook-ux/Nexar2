// Copyright © Knoux. All rights reserved.
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { usePremium } from "@/lib/premium-provider";

const FEATURES = [
  { icon: "🚫", name: "No Watermark", free: false, premium: true, desc: "Remove the Knoux X watermark from all exports" },
  { icon: "🎥", name: "4K Ultra HD", free: false, premium: true, desc: "Stream and playback full 4K / UHD content" },
  { icon: "✨", name: "HDR Support", free: false, premium: true, desc: "Dolby Vision & HDR10 playback" },
  { icon: "🎛️", name: "Full Equalizer", free: false, premium: true, desc: "10-band EQ with 15 professional presets" },
  { icon: "☁️", name: "Cloud Sync", free: false, premium: true, desc: "Sync playlists and settings across devices" },
  { icon: "⭐", name: "Priority Support", free: false, premium: true, desc: "Direct line to the developer — 24/7" },
  { icon: "📁", name: "Media Library", free: true, premium: true, desc: "Browse your media collection" },
  { icon: "⬇️", name: "Downloads", free: true, premium: true, desc: "Download for offline viewing" },
  { icon: "🌙", name: "Dark & AMOLED", free: true, premium: true, desc: "Full theme customization" },
  { icon: "🌍", name: "5 Languages", free: true, premium: true, desc: "EN, AR, FR, ES, DE" },
];

export default function PremiumScreen() {
  const colors = useColors();
  const router = useRouter();
  const { premium, activatePremium, deactivatePremium } = usePremium();
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      Alert.alert("Error", "Please enter a valid license key");
      return;
    }
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    const success = await activatePremium(licenseKey.trim());
    setLoading(false);
    if (success) {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("🎉 Premium Activated!", "Welcome to Knoux X Premium! Enjoy all features.", [
        { text: "Awesome!", onPress: () => router.back() },
      ]);
    } else {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Invalid Key", "The license key is not valid. Contact support to get your key.");
    }
  };

  const handleDeactivate = () => {
    Alert.alert("Deactivate Premium", "Are you sure? You will lose access to premium features.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Deactivate",
        style: "destructive",
        onPress: async () => {
          await deactivatePremium();
          Alert.alert("Deactivated", "Premium has been deactivated.");
        },
      },
    ]);
  };

  const handleGetKey = (method: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const urls: Record<string, string> = {
      whatsapp: "https://wa.me/971503281920?text=Hi!%20I'd%20like%20to%20get%20a%20Knoux%20X%20Premium%20license%20key",
      email: "mailto:contact@knoux.io?subject=Knoux X Premium Key&body=Hi, I want to purchase a premium license key.",
      twitter: "https://twitter.com/knoux7",
    };
    Linking.openURL(urls[method]).catch(() => Alert.alert("Error", "Could not open link"));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </Pressable>
        </View>

        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.primary + "12" }]}>
          <Text style={styles.heroEmoji}>{premium.isPremium ? "⭐" : "🚀"}</Text>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            {premium.isPremium ? "You're Premium!" : "Upgrade to Premium"}
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.muted }]}>
            {premium.isPremium
              ? "Enjoy all Knoux X features with no limits."
              : "Unlock 4K, HDR, Full Equalizer, Cloud Sync & more."}
          </Text>

          {premium.isPremium && (
            <View style={[styles.activeTag, { backgroundColor: "#22C55E22" }]}>
              <Text style={{ color: "#22C55E", fontWeight: "bold", fontSize: 13 }}>✓ Active Premium</Text>
            </View>
          )}
        </View>

        {/* Feature Comparison */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Feature Comparison</Text>

          {/* Table Header */}
          <View style={[styles.tableHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.colFeature, { color: colors.muted }]}>Feature</Text>
            <Text style={[styles.colPlan, { color: colors.muted }]}>Free</Text>
            <Text style={[styles.colPlan, { color: colors.primary, fontWeight: "bold" }]}>Premium</Text>
          </View>

          {FEATURES.map((f, i) => (
            <View
              key={i}
              style={[
                styles.tableRow,
                {
                  backgroundColor: i % 2 === 0 ? colors.background : colors.surface + "80",
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.featureCell}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <View>
                  <Text style={[styles.featureName, { color: colors.foreground }]}>{f.name}</Text>
                  <Text style={[styles.featureDesc, { color: colors.muted }]}>{f.desc}</Text>
                </View>
              </View>
              <Text style={[styles.colPlan, { color: f.free ? "#22C55E" : colors.muted }]}>
                {f.free ? "✓" : "✗"}
              </Text>
              <Text style={[styles.colPlan, { color: "#22C55E", fontWeight: "bold" }]}>✓</Text>
            </View>
          ))}
        </View>

        {/* How to Get Premium */}
        {!premium.isPremium && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>How to Get Premium</Text>
            <View style={[styles.stepsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {[
                { step: "1", text: "Contact the developer via WhatsApp, Email, or Twitter" },
                { step: "2", text: "Request a Knoux X Premium license key" },
                { step: "3", text: "Enter the key below to activate" },
              ].map((s) => (
                <View key={s.step} style={styles.stepRow}>
                  <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.stepNum}>{s.step}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.foreground }]}>{s.text}</Text>
                </View>
              ))}
            </View>

            {/* Contact Buttons */}
            <View style={styles.contactRow}>
              {[
                { icon: "💬", label: "WhatsApp", key: "whatsapp", color: "#25D366" },
                { icon: "📧", label: "Email", key: "email", color: colors.primary },
                { icon: "🐦", label: "Twitter", key: "twitter", color: "#1DA1F2" },
              ].map((c) => (
                <Pressable
                  key={c.key}
                  onPress={() => handleGetKey(c.key)}
                  style={({ pressed }) => [
                    styles.contactBtn,
                    { backgroundColor: c.color + "18", borderColor: c.color, opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <Text style={styles.contactIcon}>{c.icon}</Text>
                  <Text style={[styles.contactLabel, { color: c.color }]}>{c.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* License Key Input */}
        {!premium.isPremium && (
          <View style={styles.section}>
            <Pressable onPress={() => setShowKeyInput(!showKeyInput)} style={[styles.toggleKey, { borderColor: colors.border }]}>
              <Text style={[styles.toggleKeyText, { color: colors.primary }]}>
                {showKeyInput ? "▼ Hide Key Input" : "▶ Enter License Key"}
              </Text>
            </Pressable>

            {showKeyInput && (
              <View style={[styles.keyInputCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.keyLabel, { color: colors.muted }]}>License Key</Text>
                <TextInput
                  style={[styles.keyInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  placeholderTextColor={colors.muted}
                  value={licenseKey}
                  onChangeText={setLicenseKey}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={handleActivate}
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.activateBtn,
                    { backgroundColor: colors.primary, opacity: loading || pressed ? 0.75 : 1 },
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.activateBtnText}>Activate Premium ⭐</Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* Deactivate for active premium */}
        {premium.isPremium && (
          <Pressable
            onPress={handleDeactivate}
            style={({ pressed }) => [
              styles.deactivateBtn,
              { borderColor: colors.error, opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <Text style={[styles.deactivateText, { color: colors.error }]}>Deactivate Premium</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  backButton: { padding: 4 },
  backText: { fontSize: 15, fontWeight: "600" },
  hero: {
    margin: 20,
    padding: 28,
    borderRadius: 20,
    alignItems: "center",
  },
  heroEmoji: { fontSize: 56, marginBottom: 12 },
  heroTitle: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  heroSubtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  activeTag: { marginTop: 14, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: "bold", marginBottom: 12 },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    borderBottomWidth: 0.5,
  },
  colFeature: { flex: 1, fontSize: 13 },
  colPlan: { width: 56, textAlign: "center", fontSize: 14 },
  featureCell: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  featureIcon: { fontSize: 18 },
  featureName: { fontSize: 13, fontWeight: "600" },
  featureDesc: { fontSize: 11 },
  stepsCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 14, marginBottom: 14 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepBadge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  stepNum: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  stepText: { flex: 1, fontSize: 13 },
  contactRow: { flexDirection: "row", gap: 10 },
  contactBtn: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 12, alignItems: "center", gap: 4 },
  contactIcon: { fontSize: 22 },
  contactLabel: { fontSize: 11, fontWeight: "700" },
  toggleKey: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  toggleKeyText: { fontSize: 14, fontWeight: "600" },
  keyInputCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
  keyLabel: { fontSize: 12, fontWeight: "600" },
  keyInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15, fontFamily: "monospace" },
  activateBtn: { padding: 14, borderRadius: 12, alignItems: "center" },
  activateBtnText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  deactivateBtn: { marginHorizontal: 20, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  deactivateText: { fontSize: 14, fontWeight: "600" },
});
