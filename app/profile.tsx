// Copyright © Knoux. All rights reserved.
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { usePremium } from "@/lib/premium-provider";
import * as Linking from "expo-linking";

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { premium } = usePremium();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          await logout();
          setLoggingOut(false);
          router.replace("/(tabs)");
        },
      },
    ]);
  };

  const handleContact = (url: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url).catch(() => Alert.alert("Error", "Could not open link"));
  };

  const stats = [
    { label: "Total Media", value: "1,247", icon: "🎬" },
    { label: "Downloads", value: "89", icon: "⬇️" },
    { label: "Playtime", value: "324h", icon: "⏱️" },
    { label: "Favorites", value: "42", icon: "❤️" },
  ];

  const premiumFeatures = [
    { name: "No Watermark", enabled: premium.features.noWatermark, icon: "🚫" },
    { name: "4K Support", enabled: premium.features.support4K, icon: "🎥" },
    { name: "HDR", enabled: premium.features.supportHDR, icon: "✨" },
    { name: "Full Equalizer", enabled: premium.features.fullEqualizer, icon: "🎛️" },
    { name: "Cloud Sync", enabled: premium.features.cloudSync, icon: "☁️" },
    { name: "Priority Support", enabled: premium.features.prioritySupport, icon: "⭐" },
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
        </View>

        {/* Avatar & User Info */}
        <View style={styles.profileSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + "25" }]}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
            </Text>
          </View>

          {user ? (
            <>
              <Text style={[styles.userName, { color: colors.foreground }]}>
                {user.name || "Unknown User"}
              </Text>
              <Text style={[styles.userEmail, { color: colors.muted }]}>
                {user.email || "No email"}
              </Text>
              <View style={[styles.badge, { backgroundColor: premium.isPremium ? "#F59E0B22" : colors.surface }]}>
                <Text style={[styles.badgeText, { color: premium.isPremium ? "#F59E0B" : colors.muted }]}>
                  {premium.isPremium ? "⭐ Premium" : "Free Plan"}
                </Text>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.userName, { color: colors.foreground }]}>Guest User</Text>
              <Text style={[styles.userEmail, { color: colors.muted }]}>Not signed in</Text>
              <Pressable
                style={[styles.signInButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/oauth/callback")}
              >
                <Text style={styles.signInText}>Sign In</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Stats</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Premium Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Premium Features</Text>
            {!premium.isPremium && (
              <Pressable onPress={() => router.push("/premium")}>
                <Text style={[styles.upgradeLink, { color: colors.primary }]}>Upgrade →</Text>
              </Pressable>
            )}
          </View>
          <View style={[styles.premiumCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {premiumFeatures.map((f, i) => (
              <View key={i} style={[styles.featureRow, i < premiumFeatures.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 0.5 }]}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={[styles.featureName, { color: colors.foreground }]}>{f.name}</Text>
                <Text style={[styles.featureStatus, { color: f.enabled ? colors.success : colors.muted }]}>
                  {f.enabled ? "✓ Active" : "Locked"}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact Developer */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Contact Developer</Text>
          <View style={styles.contactGrid}>
            {[
              { icon: "💬", label: "WhatsApp", url: "https://wa.me/971503281920", color: "#25D366" },
              { icon: "📧", label: "Email", url: "mailto:contact@knoux.io", color: colors.primary },
              { icon: "🐦", label: "Twitter/X", url: "https://twitter.com/knoux7", color: "#1DA1F2" },
              { icon: "🎵", label: "TikTok", url: "https://www.tiktok.com/@knoux_7", color: "#FF0050" },
            ].map((c, i) => (
              <Pressable
                key={i}
                onPress={() => handleContact(c.url)}
                style={({ pressed }) => [
                  styles.contactButton,
                  { backgroundColor: c.color + "18", borderColor: c.color, opacity: pressed ? 0.75 : 1 },
                ]}
              >
                <Text style={styles.contactIcon}>{c.icon}</Text>
                <Text style={[styles.contactLabel, { color: c.color }]}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* App Info */}
        <View style={[styles.appInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.appName, { color: colors.foreground }]}>Knoux X</Text>
          <Text style={[styles.appVersion, { color: colors.muted }]}>Version 1.0.0 • Play Beyond Limits</Text>
        </View>

        {/* Logout */}
        {user && (
          <Pressable
            onPress={handleLogout}
            disabled={loggingOut}
            style={({ pressed }) => [
              styles.logoutButton,
              { backgroundColor: colors.error + "15", borderColor: colors.error, opacity: pressed ? 0.75 : 1 },
            ]}
          >
            {loggingOut ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text>
            )}
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  headerTitle: { fontSize: 28, fontWeight: "bold" },
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: { fontSize: 36, fontWeight: "bold", color: "#00C2FF" },
  userName: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  userEmail: { fontSize: 14, marginBottom: 12 },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: { fontSize: 13, fontWeight: "600" },
  signInButton: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  signInText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "bold", marginBottom: 12 },
  upgradeLink: { fontSize: 13, fontWeight: "600" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 20, fontWeight: "bold", marginBottom: 2 },
  statLabel: { fontSize: 11 },
  premiumCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  featureIcon: { fontSize: 18, marginRight: 12 },
  featureName: { flex: 1, fontSize: 14 },
  featureStatus: { fontSize: 13, fontWeight: "600" },
  contactGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  contactButton: {
    flex: 1,
    minWidth: "45%",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    gap: 6,
  },
  contactIcon: { fontSize: 24 },
  contactLabel: { fontSize: 12, fontWeight: "700" },
  appInfo: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 16,
  },
  appName: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  appVersion: { fontSize: 12 },
  logoutButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  logoutText: { fontSize: 15, fontWeight: "bold" },
});
