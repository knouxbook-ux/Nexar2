// Copyright © Knoux. All rights reserved.
/**
 * KNOUX NEXAR PRO — Main Dashboard
 * Full glass UI · Search · Animated feature grid · Quick access
 */
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  TextInput,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useNexarState } from "@/hooks/use-nexar-state";

const { width } = Dimensions.get("window");
const CARD_W = (width - 52) / 2;

// ── Feature Sections ─────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: "retouch",
    name: "Retouch Suite",
    nameAr: "الريتوش",
    icon: "🎨",
    color: "#EC4899",
    gradient: ["#EC4899", "#F472B6"] as const,
    count: 85,
    route: "/(tabs)/nexar-retouch",
    desc: "Skin · Eyes · Lips · AI",
  },
  {
    id: "recording",
    name: "Screen Recording",
    nameAr: "تسجيل الشاشة",
    icon: "📹",
    color: "#8B5CF6",
    gradient: ["#8B5CF6", "#A78BFA"] as const,
    count: 10,
    route: "/(tabs)/screen-recording",
    desc: "HD · 4K · FaceCam",
  },
  {
    id: "editing",
    name: "Video Editing",
    nameAr: "تحرير الفيديو",
    icon: "✂️",
    color: "#6366F1",
    gradient: ["#6366F1", "#818CF8"] as const,
    count: 12,
    route: "/(tabs)/video-editing",
    desc: "Trim · Merge · Color",
  },
  {
    id: "vfx",
    name: "VFX & Effects",
    nameAr: "المؤثرات",
    icon: "✨",
    color: "#F59E0B",
    gradient: ["#F59E0B", "#FCD34D"] as const,
    count: 30,
    route: "/(tabs)/effects",
    desc: "Filters · Particles · HDR",
  },
  {
    id: "audio",
    name: "Audio Studio",
    nameAr: "الصوت",
    icon: "🎵",
    color: "#EF4444",
    gradient: ["#EF4444", "#F87171"] as const,
    count: 27,
    route: "/(tabs)/audio-recording",
    desc: "Record · Mix · EQ",
  },
  {
    id: "ai",
    name: "AI Tools",
    nameAr: "ذكاء AI",
    icon: "🤖",
    color: "#06B6D4",
    gradient: ["#06B6D4", "#67E8F9"] as const,
    count: 20,
    route: "/(tabs)/ai-features",
    desc: "Subtitles · Highlights",
  },
  {
    id: "stream",
    name: "Live Streaming",
    nameAr: "بث مباشر",
    icon: "📡",
    color: "#FF4500",
    gradient: ["#FF4500", "#FF6B35"] as const,
    count: 8,
    route: "/(tabs)/streaming",
    desc: "YouTube · Twitch · TikTok",
  },
  {
    id: "cloud",
    name: "Cloud Sync",
    nameAr: "السحابة",
    icon: "☁️",
    color: "#10B981",
    gradient: ["#10B981", "#6EE7B7"] as const,
    count: 14,
    route: "/(tabs)/cloud-sync",
    desc: "Drive · AES-256 Encrypted",
  },
  {
    id: "beauty",
    name: "Beauty & Makeup",
    nameAr: "الجمال",
    icon: "💄",
    color: "#F472B6",
    gradient: ["#F472B6", "#FBCFE8"] as const,
    count: 15,
    route: "/(tabs)/beauty-makeup",
    desc: "Lips · Lashes · Contour",
  },
  {
    id: "multi",
    name: "Multi-Camera",
    nameAr: "كاميرات",
    icon: "🎥",
    color: "#9370DB",
    gradient: ["#9370DB", "#C4B5FD"] as const,
    count: 6,
    route: "/(tabs)/multi-camera",
    desc: "Dual Cam · PIP · Tracking",
  },
  {
    id: "analytics",
    name: "Analytics",
    nameAr: "التحليلات",
    icon: "📊",
    color: "#20B2AA",
    gradient: ["#20B2AA", "#5EEAD4"] as const,
    count: 11,
    route: "/(tabs)/analytics",
    desc: "Stats · Charts · Reports",
  },
  {
    id: "pro",
    name: "PRO Services",
    nameAr: "خدمات PRO",
    icon: "👑",
    color: "#FFD700",
    gradient: ["#FFD700", "#FEF08A"] as const,
    count: 60,
    route: "/(tabs)/pro-services",
    desc: "All 60+ Premium Features",
  },
  {
    id: "subs",
    name: "Subscriptions",
    nameAr: "الاشتراكات",
    icon: "💳",
    color: "#A78BFA",
    gradient: ["#A78BFA", "#C4B5FD"] as const,
    count: 4,
    route: "/(tabs)/subscriptions",
    desc: "Free · Pro · Premium · Ent",
  },
  {
    id: "support",
    name: "Live Support",
    nameAr: "الدعم",
    icon: "💬",
    color: "#00CED1",
    gradient: ["#00CED1", "#67E8F9"] as const,
    count: 4,
    route: "/(tabs)/live-chat",
    desc: "Chat · Tickets · Reviews",
  },
];

const QUICK = [
  {
    icon: "📹",
    label: "Record",
    route: "/(tabs)/screen-recording",
    color: "#8B5CF6",
  },
  {
    icon: "🎨",
    label: "Retouch",
    route: "/(tabs)/nexar-retouch",
    color: "#EC4899",
  },
  { icon: "📡", label: "Stream", route: "/(tabs)/streaming", color: "#FF4500" },
  { icon: "✨", label: "Effects", route: "/(tabs)/effects", color: "#F59E0B" },
  { icon: "🤖", label: "AI", route: "/(tabs)/ai-features", color: "#06B6D4" },
  { icon: "☁️", label: "Cloud", route: "/(tabs)/cloud-sync", color: "#10B981" },
  {
    icon: "💄",
    label: "Beauty",
    route: "/(tabs)/beauty-makeup",
    color: "#F472B6",
  },
  {
    icon: "✂️",
    label: "Edit",
    route: "/(tabs)/video-editing",
    color: "#6366F1",
  },
  { icon: "📊", label: "Stats", route: "/(tabs)/analytics", color: "#20B2AA" },
  { icon: "👑", label: "PRO", route: "/(tabs)/pro-services", color: "#FFD700" },
];

// ── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({
  section,
  index,
}: {
  section: (typeof SECTIONS)[0];
  index: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 400,
      delay: index * 45,
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  const press = () => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(section.route as any);
  };

  return (
    <Animated.View
      style={{
        width: CARD_W,
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={press}
        style={s.cardTouch}
      >
        {/* Glass base */}
        <View style={s.card}>
          {/* Gradient fill */}
          <LinearGradient
            colors={[section.gradient[0] + "1e", section.gradient[1] + "0a"]}
            style={StyleSheet.absoluteFill}
          />
          {/* Count badge */}
          <View
            style={[s.cardBadge, { backgroundColor: section.color + "28" }]}
          >
            <Text style={[s.cardBadgeTxt, { color: section.color }]}>
              {section.count}+
            </Text>
          </View>
          {/* Content */}
          <Text style={s.cardIcon}>{section.icon}</Text>
          <Text style={s.cardName}>{section.name}</Text>
          <Text style={s.cardDesc} numberOfLines={1}>
            {section.desc}
          </Text>
          {/* Bottom accent bar */}
          <LinearGradient
            colors={[section.gradient[0], section.gradient[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.cardBar}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function NexarDashboardScreen() {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(SECTIONS);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const totalServices = SECTIONS.reduce((s, f) => s + f.count, 0);
  const nexar = useNexarState();

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    setFiltered(
      q
        ? SECTIONS.filter(
            (sec) =>
              sec.name.toLowerCase().includes(q) ||
              sec.nameAr.includes(q) ||
              sec.desc.toLowerCase().includes(q),
          )
        : SECTIONS,
    );
  }, [search]);

  const navigate = useCallback((route: string) => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  }, []);

  return (
    <View style={s.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ── Gradient Header ── */}
          <LinearGradient
            colors={["#0f0018", "#1a0035", "#0a1a40"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.header}
          >
            {/* Animated overlay circles */}
            <View
              style={[
                s.glowCircle,
                { top: -60, left: -40, backgroundColor: "#7C3AED" },
              ]}
            />
            <View
              style={[
                s.glowCircle,
                {
                  top: 30,
                  right: -50,
                  backgroundColor: "#3B82F6",
                  width: 180,
                  height: 180,
                },
              ]}
            />
            <Animated.View style={{ opacity: headerAnim, zIndex: 2 }}>
              <Text style={s.headerKnoux}>KNOUX</Text>
              <Text style={s.headerNexar}>NEXAR PRO</Text>
              <Text style={s.headerSub}>
                {totalServices}+ Professional Features
              </Text>
            </Animated.View>
            {/* Stats strip — Real live data */}
            <View style={s.statsStrip}>
              {[
                { icon: "🎬", val: `${SECTIONS.length}`, label: "Sections" },
                { icon: "⚡", val: `${totalServices}+`, label: "Features" },
                {
                  icon: nexar.isRecording
                    ? "🔴"
                    : nexar.isStreaming
                      ? "📡"
                      : "👑",
                  val: nexar.isRecording
                    ? "REC"
                    : nexar.isStreaming
                      ? "LIVE"
                      : nexar.subscription.toUpperCase(),
                  label: nexar.isRecording
                    ? "Recording"
                    : nexar.isStreaming
                      ? "Streaming"
                      : "Status",
                },
              ].map((st, i) => (
                <View key={i} style={s.statBox}>
                  <Text style={s.statIcon}>{st.icon}</Text>
                  <Text style={s.statVal}>{st.val}</Text>
                  <Text style={s.statLabel}>{st.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          {/* ── Search ── */}
          <View style={s.searchWrap}>
            <View style={s.searchBox}>
              <Text
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 16,
                  marginRight: 8,
                }}
              >
                🔍
              </Text>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search features & services…"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={s.searchInput}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Text
                    style={{ color: "rgba(255,255,255,0.35)", fontSize: 16 }}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* ── Quick Access ── */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>⚡ Quick Access</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}
            >
              {QUICK.map((q, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => navigate(q.route)}
                  style={[s.quickBtn, { borderColor: q.color + "50" }]}
                >
                  <LinearGradient
                    colors={[q.color + "20", q.color + "0a"]}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={s.quickIcon}>{q.icon}</Text>
                  <Text style={[s.quickLabel, { color: q.color }]}>
                    {q.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* ── Sections Grid ── */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>
              {search ? `🔍 Results (${filtered.length})` : "🌟 All Features"}
            </Text>
            <View style={s.grid}>
              {filtered.map((sec, i) => (
                <FeatureCard key={sec.id} section={sec} index={i} />
              ))}
            </View>
          </View>

          {/* ── Developer Card ── */}
          <TouchableOpacity
            onPress={() => navigate("/about")}
            activeOpacity={0.85}
            style={s.devCard}
          >
            <LinearGradient
              colors={["rgba(139,92,246,0.18)", "rgba(99,102,241,0.1)"]}
              style={StyleSheet.absoluteFill}
            />
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <Text style={{ fontSize: 44 }}>👨‍💻</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#A78BFA",
                    fontSize: 11,
                    fontWeight: "700",
                    letterSpacing: 1,
                    marginBottom: 2,
                  }}
                >
                  DEVELOPED BY
                </Text>
                <Text
                  style={{ color: "#f1f0ff", fontSize: 18, fontWeight: "800" }}
                >
                  Eng. Sadek Elgazar
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  Knoux · Abu Dhabi, UAE
                </Text>
              </View>
              <Text style={{ color: "#A78BFA", fontSize: 22 }}>→</Text>
            </View>
          </TouchableOpacity>

          <View style={{ height: 50 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#07070f" },

  header: {
    paddingTop: Platform.OS === "ios" ? 20 : 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  glowCircle: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.25,
  },
  headerKnoux: {
    fontSize: 12,
    fontWeight: "900",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 6,
    marginBottom: 4,
  },
  headerNexar: {
    fontSize: 42,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 2,
  },
  headerSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    marginTop: 4,
    letterSpacing: 1,
  },
  statsStrip: { flexDirection: "row", gap: 10, marginTop: 20 },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statIcon: { fontSize: 16, marginBottom: 2 },
  statVal: { fontSize: 15, fontWeight: "900", color: "#fff" },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 1 },

  searchWrap: { paddingHorizontal: 20, paddingTop: 16 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 14, paddingVertical: 14 },

  section: { paddingTop: 24, paddingHorizontal: 20 },
  sectionTitle: {
    color: "#f1f0ff",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 14,
  },

  quickBtn: {
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    minWidth: 68,
    overflow: "hidden",
  },
  quickIcon: { fontSize: 22, marginBottom: 4 },
  quickLabel: { fontSize: 10, fontWeight: "700" },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },

  cardTouch: { borderRadius: 20, overflow: "hidden" },
  card: {
    width: CARD_W,
    minHeight: 158,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    backgroundColor: "rgba(255,255,255,0.028)",
    overflow: "hidden",
    padding: 14,
  },
  cardBadge: {
    alignSelf: "flex-end",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  cardBadgeTxt: { fontSize: 11, fontWeight: "900" },
  cardIcon: { fontSize: 30, marginBottom: 8 },
  cardName: { color: "#f1f0ff", fontSize: 13, fontWeight: "800" },
  cardDesc: {
    color: "rgba(255,255,255,0.38)",
    fontSize: 10,
    marginTop: 5,
    marginBottom: 12,
  },
  cardBar: { height: 3, borderRadius: 2 },

  devCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.28)",
    overflow: "hidden",
  },
});
