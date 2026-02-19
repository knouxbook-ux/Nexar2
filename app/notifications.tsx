// Copyright © Knoux. All rights reserved.
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";

interface Notification {
  id: string;
  type: "download" | "update" | "premium" | "system" | "info";
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: string;
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "download",
    title: "Download Complete",
    body: "Movie_4K_2024.mp4 has been downloaded successfully.",
    time: "2 min ago",
    read: false,
    icon: "⬇️",
  },
  {
    id: "2",
    type: "premium",
    title: "Premium Feature Unlocked",
    body: "4K playback is now available. Enjoy Ultra HD content!",
    time: "1 hour ago",
    read: false,
    icon: "⭐",
  },
  {
    id: "3",
    type: "update",
    title: "New Update Available",
    body: "Knoux X v1.1.0 is available with new gesture controls and bug fixes.",
    time: "3 hours ago",
    read: true,
    icon: "🔄",
  },
  {
    id: "4",
    type: "download",
    title: "Download Paused",
    body: "Documentary_HDR.mkv was paused due to network issues.",
    time: "Yesterday",
    read: true,
    icon: "⏸️",
  },
  {
    id: "5",
    type: "system",
    title: "Storage Warning",
    body: "Your device storage is at 90%. Consider cleaning up old files.",
    time: "2 days ago",
    read: true,
    icon: "⚠️",
  },
  {
    id: "6",
    type: "info",
    title: "Welcome to Knoux X!",
    body: "Thank you for installing Knoux X. Discover your media collection now.",
    time: "3 days ago",
    read: true,
    icon: "🎉",
  },
];

const TYPE_COLORS: Record<Notification["type"], string> = {
  download: "#00C2FF",
  update: "#8A2BE2",
  premium: "#F59E0B",
  system: "#EF4444",
  info: "#22C55E",
};

export default function NotificationsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const markAllRead = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const deleteNotification = (id: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Clear All", "Remove all notifications?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => setNotifications([]),
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
            <Text style={[styles.backText, { color: colors.primary }]}>←</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <Pressable onPress={clearAll} style={{ padding: 4 }}>
          <Text style={[styles.clearText, { color: colors.error }]}>Clear All</Text>
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        {(["all", "unread"] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setFilter(tab);
            }}
            style={[
              styles.tab,
              filter === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: filter === tab ? colors.primary : colors.muted },
              ]}
            >
              {tab === "all" ? "All" : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
            </Text>
          </Pressable>
        ))}

        {unreadCount > 0 && (
          <Pressable onPress={markAllRead} style={styles.markAllBtn}>
            <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>All Caught Up!</Text>
            <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((notif) => {
              const accentColor = TYPE_COLORS[notif.type];
              return (
                <Pressable
                  key={notif.id}
                  onPress={() => markRead(notif.id)}
                  onLongPress={() => deleteNotification(notif.id)}
                  style={[
                    styles.notifCard,
                    {
                      backgroundColor: !notif.read ? accentColor + "10" : colors.surface,
                      borderColor: !notif.read ? accentColor + "40" : colors.border,
                    },
                  ]}
                >
                  {/* Unread Dot */}
                  {!notif.read && (
                    <View style={[styles.unreadDot, { backgroundColor: accentColor }]} />
                  )}

                  {/* Icon */}
                  <View style={[styles.notifIcon, { backgroundColor: accentColor + "20" }]}>
                    <Text style={{ fontSize: 20 }}>{notif.icon}</Text>
                  </View>

                  {/* Content */}
                  <View style={styles.notifContent}>
                    <Text style={[styles.notifTitle, { color: colors.foreground, fontWeight: notif.read ? "500" : "700" }]}>
                      {notif.title}
                    </Text>
                    <Text style={[styles.notifBody, { color: colors.muted }]} numberOfLines={2}>
                      {notif.body}
                    </Text>
                    <Text style={[styles.notifTime, { color: accentColor }]}>{notif.time}</Text>
                  </View>
                </Pressable>
              );
            })}

            <Text style={[styles.longPressHint, { color: colors.muted }]}>
              Long press a notification to delete it
            </Text>
          </View>
        )}
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
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerTitle: { fontSize: 22, fontWeight: "bold" },
  backText: { fontSize: 22, fontWeight: "bold" },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  clearText: { fontSize: 13, fontWeight: "600" },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginRight: 20,
  },
  tabText: { fontSize: 14, fontWeight: "600" },
  markAllBtn: { marginLeft: "auto", padding: 8 },
  markAllText: { fontSize: 12, fontWeight: "600" },
  list: { padding: 16, gap: 10 },
  notifCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    position: "relative",
  },
  unreadDot: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, marginBottom: 3 },
  notifBody: { fontSize: 12, lineHeight: 17, marginBottom: 5 },
  notifTime: { fontSize: 11, fontWeight: "600" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 100 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  emptySubtitle: { fontSize: 14 },
  longPressHint: { textAlign: "center", fontSize: 11, marginTop: 8, paddingBottom: 8 },
});
