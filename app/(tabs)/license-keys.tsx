// Copyright © Knoux. All rights reserved.
/**
 * 🔑 KNOUX NEXAR PRO — License Keys Manager
 * ✅ FIXED: متصل بـ tRPC backend الحقيقي — لا INITIAL_KEYS وهمية
 */

import React, { useState, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Platform, Alert, Animated, Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { useLanguage } from "@/lib/language-context";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

// ─── أنواع ──────────────────────────────────────────────────────────────────
type Plan = "free" | "pro" | "premium";

// ─── ألوان الخطط ────────────────────────────────────────────────────────────
const PLAN_COLORS: Record<Plan, { color: string; bg: string; label: string; icon: string }> = {
  free:    { color: "#10B981", bg: "rgba(16,185,129,0.15)",  label: "FREE",    icon: "🎁" },
  pro:     { color: "#A78BFA", bg: "rgba(167,139,250,0.15)", label: "PRO",     icon: "⚡" },
  premium: { color: "#FCD34D", bg: "rgba(252,211,77,0.15)",  label: "PREMIUM", icon: "👑" },
};

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  active:    { color: "#10B981", bg: "rgba(16,185,129,0.15)"  },
  used:      { color: "#F59E0B", bg: "rgba(245,158,11,0.15)"  },
  expired:   { color: "#EF4444", bg: "rgba(239,68,68,0.15)"   },
  revoked:   { color: "#6B7280", bg: "rgba(107,114,128,0.15)" },
  available: { color: "#10B981", bg: "rgba(16,185,129,0.15)"  },
};

// ─── بطاقة مفتاح ────────────────────────────────────────────────────────────
function KeyCard({ licKey, ar, onCopy, onShare, onRevoke }: {
  licKey: any; ar: boolean;
  onCopy: () => void; onShare: () => void; onRevoke: () => void;
}) {
  const plan   = PLAN_COLORS[licKey.plan as Plan] ?? PLAN_COLORS.free;
  const status = STATUS_COLORS[licKey.status] ?? STATUS_COLORS.available;
  const scale  = useRef(new Animated.Value(1)).current;

  const pressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 14 }}>
      <TouchableOpacity onPressIn={pressIn} onPressOut={pressOut} activeOpacity={1}>
        <View style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          borderRadius: 20, padding: 18,
          borderWidth: 1, borderColor: `${plan.color}35`,
        }}>
          {/* الصف الأول */}
          <View style={{ flexDirection: ar ? "row-reverse" : "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <View style={{ flexDirection: ar ? "row-reverse" : "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontSize: 22 }}>{plan.icon}</Text>
              <View style={{ backgroundColor: plan.bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ color: plan.color, fontSize: 11, fontWeight: "900" }}>{plan.label}</Text>
              </View>
            </View>
            <View style={{ backgroundColor: status.bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: status.color, fontSize: 10, fontWeight: "800" }}>
                {licKey.status?.toUpperCase() ?? "ACTIVE"}
              </Text>
            </View>
          </View>

          {/* المفتاح */}
          <View style={{ backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 12, marginBottom: 12 }}>
            <Text style={{ fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", fontSize: 16, color: plan.color, letterSpacing: 2, textAlign: "center", fontWeight: "800" }}>
              {licKey.key}
            </Text>
          </View>

          {/* معلومات */}
          <View style={{ flexDirection: ar ? "row-reverse" : "row", justifyContent: "space-between", marginBottom: 14 }}>
            <View>
              <Text style={{ color: "#6B7280", fontSize: 10, marginBottom: 2 }}>
                {ar ? "الأجهزة" : "Devices"}
              </Text>
              <Text style={{ color: "#E5E7EB", fontSize: 13, fontWeight: "700" }}>
                {licKey.devicesUsed ?? 0}/{licKey.maxDevices ?? 1}
              </Text>
            </View>
            <View>
              <Text style={{ color: "#6B7280", fontSize: 10, marginBottom: 2 }}>
                {ar ? "تاريخ الإنشاء" : "Created"}
              </Text>
              <Text style={{ color: "#E5E7EB", fontSize: 13, fontWeight: "700" }}>
                {licKey.createdAt ? new Date(licKey.createdAt).toLocaleDateString() : "—"}
              </Text>
            </View>
            {licKey.expiresAt && (
              <View>
                <Text style={{ color: "#6B7280", fontSize: 10, marginBottom: 2 }}>
                  {ar ? "ينتهي" : "Expires"}
                </Text>
                <Text style={{ color: "#E5E7EB", fontSize: 13, fontWeight: "700" }}>
                  {new Date(licKey.expiresAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

          {licKey.notes && (
            <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 12, fontStyle: "italic" }}>
              {licKey.notes}
            </Text>
          )}

          {/* أزرار */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity onPress={onCopy} style={{ flex: 1, backgroundColor: "rgba(167,139,250,0.15)", borderRadius: 12, paddingVertical: 10, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}>
              <MaterialIcons name="content-copy" size={15} color="#A78BFA" />
              <Text style={{ color: "#A78BFA", fontSize: 12, fontWeight: "700" }}>{ar ? "نسخ" : "Copy"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onShare} style={{ flex: 1, backgroundColor: "rgba(16,185,129,0.15)", borderRadius: 12, paddingVertical: 10, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}>
              <MaterialIcons name="share" size={15} color="#10B981" />
              <Text style={{ color: "#10B981", fontSize: 12, fontWeight: "700" }}>{ar ? "مشاركة" : "Share"}</Text>
            </TouchableOpacity>
            {(licKey.status === "active" || licKey.status === "available") && (
              <TouchableOpacity onPress={onRevoke} style={{ flex: 1, backgroundColor: "rgba(239,68,68,0.15)", borderRadius: 12, paddingVertical: 10, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}>
                <MaterialIcons name="cancel" size={15} color="#EF4444" />
                <Text style={{ color: "#EF4444", fontSize: 12, fontWeight: "700" }}>{ar ? "إلغاء" : "Revoke"}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── الشاشة الرئيسية ────────────────────────────────────────────────────────
export default function LicenseKeysScreen() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"myKeys" | "activate" | "generate">("myKeys");
  const [activateInput, setActivateInput] = useState("");
  const [activateResult, setActivateResult] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan>("pro");
  const [selectedDevices, setSelectedDevices] = useState(1);
  const [notes, setNotes] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ─── tRPC Queries ─────────────────────────────────────────────────────────
  const { data: keys = [], isLoading, refetch } = trpc.licenses.myKeys.useQuery(
    undefined,
    { enabled: !!user }
  );

  // ─── tRPC Mutations ───────────────────────────────────────────────────────
  const generateMutation = trpc.licenses.generate.useMutation({
    onSuccess: (newKey) => {
      setGeneratedKey(newKey.key);
      refetch();
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (err) => Alert.alert(ar ? "خطأ" : "Error", err.message),
  });

  const activateMutation = trpc.licenses.activate.useMutation({
    onSuccess: () => {
      refetch();
      setActivateResult({ success: true, message: ar ? "✅ تم تفعيل المفتاح بنجاح!" : "✅ Key activated successfully!" });
      setActivateInput("");
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (err) => {
      setActivateResult({ success: false, message: err.message });
    },
  });

  const revokeMutation = trpc.licenses.revoke.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => Alert.alert(ar ? "خطأ" : "Error", err.message),
  });

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleCopy = async (key: string) => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (key: string) => {
    try {
      await Share.share({
        message: ar
          ? `🔑 مفتاح ترخيص Knoux Nexar Pro:\n${key}\n\nفعّل الآن على التطبيق!`
          : `🔑 Your Knoux Nexar Pro License Key:\n${key}\n\nActivate now in the app!`,
      });
    } catch (_) {}
  };

  const handleRevoke = (id: number) => {
    Alert.alert(
      ar ? "تأكيد الإلغاء" : "Confirm Revoke",
      ar ? "هل أنت متأكد من إلغاء هذا المفتاح؟ لا يمكن التراجع." : "Are you sure? This cannot be undone.",
      [
        { text: ar ? "لا" : "Cancel", style: "cancel" },
        {
          text: ar ? "إلغاء المفتاح" : "Revoke",
          style: "destructive",
          onPress: () => {
            if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            revokeMutation.mutate({ id });
          },
        },
      ]
    );
  };

  const handleActivate = () => {
    const input = activateInput.trim().toUpperCase();
    if (!input) {
      setActivateResult({ success: false, message: ar ? "أدخل المفتاح أولاً" : "Please enter a key" });
      return;
    }
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    activateMutation.mutate({ key: input });
  };

  const handleGenerate = () => {
    if (!user) {
      Alert.alert(ar ? "يرجى تسجيل الدخول" : "Please sign in");
      return;
    }
    generateMutation.mutate({
      plan: selectedPlan,
      maxDevices: selectedDevices,
      notes: notes.trim() || undefined,
    });
    setNotes("");
  };

  const stats = {
    total:   keys.length,
    active:  keys.filter((k: any) => k.status === "active" || k.status === "available").length,
    premium: keys.filter((k: any) => k.plan === "premium").length,
  };

  const TABS = [
    { key: "myKeys" as const,   icon: "🔑", labelAr: "مفاتيحي",     labelEn: "My Keys"  },
    { key: "activate" as const, icon: "✅", labelAr: "تفعيل",       labelEn: "Activate" },
    { key: "generate" as const, icon: "⚙️", labelAr: "توليد مفتاح", labelEn: "Generate" },
  ];

  return (
    <ScreenContainer className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={["rgba(167,139,250,0.2)", "transparent"]} style={{ borderRadius: 24, padding: 24, marginBottom: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: "900", color: "#F3F4F6", marginBottom: 4 }}>
            {ar ? "🔑 مفاتيح الترخيص" : "🔑 License Keys"}
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
            {ar ? "إدارة مفاتيح الترخيص" : "Manage your license keys"}
          </Text>

          {/* Stats */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
            {[
              { label: ar ? "الإجمالي" : "Total", value: stats.total, color: "#A78BFA" },
              { label: ar ? "نشطة" : "Active", value: stats.active, color: "#10B981" },
              { label: ar ? "بريميوم" : "Premium", value: stats.premium, color: "#FCD34D" },
            ].map((s) => (
              <View key={s.label} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 14, padding: 12, alignItems: "center" }}>
                <Text style={{ color: s.color, fontSize: 24, fontWeight: "900" }}>{s.value}</Text>
                <Text style={{ color: "#9CA3AF", fontSize: 10, marginTop: 2 }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => { setActiveTab(tab.key); setActivateResult(null); setGeneratedKey(null); }}
              style={{
                flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: "center",
                backgroundColor: activeTab === tab.key ? "#A78BFA" : "rgba(255,255,255,0.06)",
                borderWidth: 1, borderColor: activeTab === tab.key ? "#A78BFA" : "rgba(255,255,255,0.1)",
              }}
            >
              <Text style={{ fontSize: 16, marginBottom: 2 }}>{tab.icon}</Text>
              <Text style={{ color: activeTab === tab.key ? "#000" : "#9CA3AF", fontSize: 10, fontWeight: "700" }}>
                {ar ? tab.labelAr : tab.labelEn}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── تبويب مفاتيحي ────────────────────────────────────────────── */}
        {activeTab === "myKeys" && (
          <View>
            {isLoading ? (
              <View style={{ alignItems: "center", padding: 40 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>⏳</Text>
                <Text style={{ color: "#9CA3AF" }}>{ar ? "جاري التحميل..." : "Loading..."}</Text>
              </View>
            ) : keys.length === 0 ? (
              <View style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 40, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🔑</Text>
                <Text style={{ color: "#9CA3AF", textAlign: "center", fontSize: 14 }}>
                  {ar ? "لا توجد مفاتيح بعد\nاضغط على تبويب \"توليد مفتاح\" لإنشاء أول مفتاح" : "No keys yet\nGo to \"Generate\" tab to create your first key"}
                </Text>
              </View>
            ) : (
              keys.map((k: any) => (
                <KeyCard
                  key={k.id}
                  licKey={k}
                  ar={ar}
                  onCopy={() => handleCopy(k.key)}
                  onShare={() => handleShare(k.key)}
                  onRevoke={() => handleRevoke(k.id)}
                />
              ))
            )}
          </View>
        )}

        {/* ── تبويب تفعيل ──────────────────────────────────────────────── */}
        {activeTab === "activate" && (
          <View style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <Text style={{ color: "#F3F4F6", fontSize: 18, fontWeight: "800", marginBottom: 16 }}>
              {ar ? "✅ تفعيل مفتاح" : "✅ Activate Key"}
            </Text>
            <TextInput
              value={activateInput}
              onChangeText={setActivateInput}
              placeholder={ar ? "XXXX-XXXX-XXXX-XXXX" : "XXXX-XXXX-XXXX-XXXX"}
              placeholderTextColor="#4B5563"
              autoCapitalize="characters"
              style={{
                backgroundColor: "rgba(0,0,0,0.4)",
                borderRadius: 14, padding: 16,
                color: "#A78BFA",
                fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                fontSize: 18, letterSpacing: 2, textAlign: "center",
                borderWidth: 1, borderColor: "rgba(167,139,250,0.3)",
                marginBottom: 16,
              }}
            />
            {activateResult && (
              <View style={{
                backgroundColor: activateResult.success ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                borderRadius: 12, padding: 12, marginBottom: 16,
                borderWidth: 1, borderColor: activateResult.success ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)",
              }}>
                <Text style={{ color: activateResult.success ? "#10B981" : "#EF4444", fontWeight: "700", textAlign: "center" }}>
                  {activateResult.message}
                </Text>
              </View>
            )}
            <TouchableOpacity
              onPress={handleActivate}
              disabled={activateMutation.isPending}
              style={{
                backgroundColor: "#A78BFA", borderRadius: 14, padding: 16,
                alignItems: "center", opacity: activateMutation.isPending ? 0.7 : 1,
              }}
            >
              <Text style={{ color: "#000", fontSize: 15, fontWeight: "900" }}>
                {activateMutation.isPending ? (ar ? "جاري التفعيل..." : "Activating...") : (ar ? "تفعيل المفتاح" : "Activate Key")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── تبويب توليد ──────────────────────────────────────────────── */}
        {activeTab === "generate" && (
          <View style={{ gap: 16 }}>
            <View style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
              <Text style={{ color: "#F3F4F6", fontSize: 18, fontWeight: "800", marginBottom: 16 }}>
                {ar ? "⚙️ توليد مفتاح جديد" : "⚙️ Generate New Key"}
              </Text>

              {/* اختيار الخطة */}
              <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 8 }}>{ar ? "الخطة" : "Plan"}</Text>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                {(["free", "pro", "premium"] as Plan[]).map((p) => {
                  const pc = PLAN_COLORS[p];
                  return (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setSelectedPlan(p)}
                      style={{
                        flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center",
                        backgroundColor: selectedPlan === p ? pc.bg : "rgba(0,0,0,0.3)",
                        borderWidth: 1.5, borderColor: selectedPlan === p ? pc.color : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>{pc.icon}</Text>
                      <Text style={{ color: selectedPlan === p ? pc.color : "#6B7280", fontSize: 10, fontWeight: "800", marginTop: 2 }}>{pc.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* عدد الأجهزة */}
              <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 8 }}>
                {ar ? `عدد الأجهزة: ${selectedDevices}` : `Devices: ${selectedDevices}`}
              </Text>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                {[1, 2, 3, 5, 10].map((n) => (
                  <TouchableOpacity
                    key={n}
                    onPress={() => setSelectedDevices(n)}
                    style={{
                      flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center",
                      backgroundColor: selectedDevices === n ? "#A78BFA" : "rgba(0,0,0,0.3)",
                      borderWidth: 1, borderColor: selectedDevices === n ? "#A78BFA" : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Text style={{ color: selectedDevices === n ? "#000" : "#9CA3AF", fontWeight: "800", fontSize: 13 }}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ملاحظات */}
              <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 8 }}>{ar ? "ملاحظات (اختياري)" : "Notes (optional)"}</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder={ar ? "مثال: للعميل الشركة X..." : "e.g. For enterprise client X..."}
                placeholderTextColor="#4B5563"
                multiline
                style={{
                  backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 14,
                  color: "#E5E7EB", fontSize: 13, minHeight: 70, textAlignVertical: "top",
                  borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", marginBottom: 16,
                }}
              />

              <TouchableOpacity
                onPress={handleGenerate}
                disabled={generateMutation.isPending}
                style={{
                  backgroundColor: PLAN_COLORS[selectedPlan].color, borderRadius: 14,
                  padding: 16, alignItems: "center", opacity: generateMutation.isPending ? 0.7 : 1,
                }}
              >
                <Text style={{ color: "#000", fontSize: 15, fontWeight: "900" }}>
                  {generateMutation.isPending ? (ar ? "جاري التوليد..." : "Generating...") : (ar ? "⚡ توليد مفتاح" : "⚡ Generate Key")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* المفتاح المولّد */}
            {generatedKey && (
              <View style={{ backgroundColor: "rgba(16,185,129,0.1)", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "rgba(16,185,129,0.3)" }}>
                <Text style={{ color: "#10B981", fontWeight: "800", marginBottom: 10, textAlign: "center" }}>
                  {ar ? "✅ تم توليد المفتاح!" : "✅ Key Generated!"}
                </Text>
                <View style={{ backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 12, padding: 14, marginBottom: 14 }}>
                  <Text style={{ fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", fontSize: 16, color: "#10B981", letterSpacing: 2, textAlign: "center", fontWeight: "800" }}>
                    {generatedKey}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity onPress={() => handleCopy(generatedKey)} style={{ flex: 1, backgroundColor: "rgba(167,139,250,0.2)", borderRadius: 12, padding: 12, alignItems: "center" }}>
                    <Text style={{ color: "#A78BFA", fontWeight: "700" }}>{copied ? (ar ? "✅ تم النسخ" : "✅ Copied!") : (ar ? "نسخ" : "Copy")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleShare(generatedKey)} style={{ flex: 1, backgroundColor: "rgba(16,185,129,0.2)", borderRadius: 12, padding: 12, alignItems: "center" }}>
                    <Text style={{ color: "#10B981", fontWeight: "700" }}>{ar ? "مشاركة" : "Share"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
