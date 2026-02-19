// Copyright © Knoux. All rights reserved.
import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";

const SOCIAL_LINKS = [
  { icon: "💬", label: "WhatsApp", sublabel: "+971 503 281 920", url: "https://wa.me/971503281920", color: "#25D366" },
  { icon: "📧", label: "Email", sublabel: "contact@knoux.io", url: "mailto:contact@knoux.io", color: "#00C2FF" },
  { icon: "🐦", label: "Twitter / X", sublabel: "@knoux7", url: "https://twitter.com/knoux7", color: "#1DA1F2" },
  { icon: "🎵", label: "TikTok", sublabel: "@knoux_7", url: "https://www.tiktok.com/@knoux_7", color: "#FF0050" },
  { icon: "📘", label: "Facebook", sublabel: "Knoux Official", url: "https://www.facebook.com/share/1bXebP7S7D/", color: "#1877F2" },
  { icon: "👻", label: "Snapchat", sublabel: "@knooux7", url: "https://www.snapchat.com/add/knooux7", color: "#FFFC00" },
];

const APP_FEATURES = [
  { icon: "🎬", text: "4K Ultra HD Video Playback" },
  { icon: "🎵", text: "FLAC & Hi-Res Audio" },
  { icon: "📁", text: "Smart Media Library" },
  { icon: "⬇️", text: "Offline Downloads" },
  { icon: "🌙", text: "Dark, Light & AMOLED Themes" },
  { icon: "🌍", text: "5 Languages: EN, AR, FR, ES, DE" },
  { icon: "🎛️", text: "10-Band Equalizer (Premium)" },
  { icon: "☁️", text: "Cloud Sync (Premium)" },
  { icon: "🔒", text: "Folder Lock & Security" },
  { icon: "⭐", text: "Premium: No Watermark + HDR" },
];

export default function AboutScreen() {
  const colors = useColors();
  const router = useRouter();

  const openLink = (url: string, label: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", `Could not open ${label}`)
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
            <Text style={[styles.backText, { color: colors.primary }]}>←</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>About</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* App Hero */}
        <View style={[styles.hero, { backgroundColor: colors.primary + "12" }]}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary + "25" }]}>
            <Text style={styles.logoEmoji}>🎬</Text>
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>Knoux X</Text>
          <Text style={[styles.tagline, { color: colors.primary }]}>Play Beyond Limits</Text>
          <Text style={[styles.version, { color: colors.muted }]}>Version 1.0.0</Text>

          <View style={styles.badgeRow}>
            {["Android", "iOS", "Web"].map((p) => (
              <View key={p} style={[styles.platformBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.platformText, { color: colors.muted }]}>{p}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About the App</Text>
          <View style={[styles.descCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.descText, { color: colors.foreground }]}>
              Knoux X is a professional multimedia player designed for the modern era. Built with cutting-edge technology, it delivers cinema-quality playback for videos, crystal-clear audio, and a beautifully organized media library.
            </Text>
            <Text style={[styles.descText, { color: colors.foreground, marginTop: 10 }]}>
              Developed by a passionate indie developer with a focus on performance, simplicity, and beautiful design.
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Key Features</Text>
          <View style={[styles.featuresCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {APP_FEATURES.map((f, i) => (
              <View
                key={i}
                style={[
                  styles.featureRow,
                  i < APP_FEATURES.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 0.5 },
                ]}
              >
                <Text style={{ fontSize: 18 }}>{f.icon}</Text>
                <Text style={[styles.featureText, { color: colors.foreground }]}>{f.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Developer */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Developer</Text>
          <View style={[styles.devCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.devAvatar, { backgroundColor: colors.primary + "25" }]}>
              <Text style={{ fontSize: 32 }}>👨‍💻</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.devName, { color: colors.foreground }]}>Knoux</Text>
              <Text style={[styles.devRole, { color: colors.primary }]}>Founder & Lead Developer</Text>
              <Text style={[styles.devBio, { color: colors.muted }]}>
                Building powerful tools for creators and media enthusiasts worldwide.
              </Text>
            </View>
          </View>
        </View>

        {/* Social Links */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Contact & Social</Text>
          <View style={styles.socialGrid}>
            {SOCIAL_LINKS.map((link, i) => (
              <Pressable
                key={i}
                onPress={() => openLink(link.url, link.label)}
                style={({ pressed }) => [
                  styles.socialCard,
                  { backgroundColor: link.color + "15", borderColor: link.color, opacity: pressed ? 0.75 : 1 },
                ]}
              >
                <Text style={styles.socialIcon}>{link.icon}</Text>
                <Text style={[styles.socialLabel, { color: link.color }]}>{link.label}</Text>
                <Text style={[styles.socialSublabel, { color: colors.muted }]} numberOfLines={1}>
                  {link.sublabel}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <View style={styles.legalRow}>
            {["Privacy Policy", "Terms of Service"].map((item) => (
              <Pressable key={item} style={[styles.legalBtn, { borderColor: colors.border }]}>
                <Text style={[styles.legalText, { color: colors.muted }]}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.muted }]}>
            Made with ❤️ by Knoux
          </Text>
          <Text style={[styles.footerCopy, { color: colors.muted }]}>
            © 2026 Knoux X. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  backText: { fontSize: 22, fontWeight: "bold" },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  hero: {
    margin: 20,
    padding: 28,
    borderRadius: 20,
    alignItems: "center",
  },
  logoBox: {
    width: 90,
    height: 90,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  logoEmoji: { fontSize: 48 },
  appName: { fontSize: 28, fontWeight: "bold", marginBottom: 4 },
  tagline: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  version: { fontSize: 12, marginBottom: 14 },
  badgeRow: { flexDirection: "row", gap: 8 },
  platformBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  platformText: { fontSize: 11, fontWeight: "600" },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: "bold", marginBottom: 12 },
  descCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
  descText: { fontSize: 14, lineHeight: 22 },
  featuresCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  featureText: { flex: 1, fontSize: 13 },
  devCard: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    alignItems: "flex-start",
  },
  devAvatar: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  devName: { fontSize: 16, fontWeight: "bold", marginBottom: 2 },
  devRole: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  devBio: { fontSize: 12, lineHeight: 17 },
  socialGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  socialCard: {
    width: "47%",
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  socialIcon: { fontSize: 26 },
  socialLabel: { fontSize: 13, fontWeight: "bold" },
  socialSublabel: { fontSize: 10 },
  legalRow: { flexDirection: "row", gap: 10 },
  legalBtn: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 12, alignItems: "center" },
  legalText: { fontSize: 12 },
  footer: { alignItems: "center", paddingVertical: 16 },
  footerText: { fontSize: 13, marginBottom: 4 },
  footerCopy: { fontSize: 11 },
});
