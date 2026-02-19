// Copyright © Knoux. All rights reserved.
/**
 * 🛡️ KNOUX NEXAR PRO — لوحة تحكم المدير
 * ✅ FIXED: متصل بـ tRPC backend الحقيقي — لا خدمات محلية وهمية
 */

import React, { useState, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { useLanguage } from "@/lib/language-context";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

type Tab = "overview" | "users" | "subscriptions" | "chat" | "reports";

const L: Record<string, Record<"ar" | "en", string>> = {
  overview: { ar: "نظرة عامة", en: "Overview" },
  users: { ar: "المستخدمون", en: "Users" },
  subscriptions: { ar: "الاشتراكات", en: "Subscriptions" },
  chat: { ar: "الدعم", en: "Support" },
  reports: { ar: "التقارير", en: "Reports" },
};

function tl(key: string, lang: "ar" | "en"): string {
  return L[key]?.[lang] ?? L[key]?.en ?? key;
}

function StatCard({
  icon,
  label,
  value,
  color,
  sub,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  sub?: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: `${color}15`,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: `${color}40`,
        minWidth: 140,
      }}
    >
      <Text style={{ fontSize: 22, marginBottom: 6 }}>{icon}</Text>
      <Text style={{ color, fontSize: 22, fontWeight: "900" }}>{value}</Text>
      <Text style={{ color: "#94A3B8", fontSize: 11, marginTop: 2 }}>
        {label}
      </Text>
      {sub && (
        <Text style={{ color: `${color}99`, fontSize: 10, marginTop: 3 }}>
          {sub}
        </Text>
      )}
    </View>
  );
}

export default function AdminDashboardScreen() {
  const { language } = useLanguage();
  const ar = (language as string) === "ar";
  const lang = ar ? "ar" : "en";
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [notifUserId, setNotifUserId] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [keyPlan, setKeyPlan] = useState<"pro" | "premium">("pro");

  // ─── tRPC Queries ─────────────────────────────────────────────────────────
  const {
    data: analyticsData,
    isLoading: loadingAnalytics,
    refetch: refetchAnalytics,
  } = trpc.analytics.summary.useQuery(undefined, { enabled: !!user });

  const { data: analyticsHistory = [] } = trpc.analytics.history.useQuery(
    { days: 7 },
    { enabled: !!user && activeTab === "overview" },
  );

  const {
    data: usersData,
    isLoading: loadingUsers,
    refetch: refetchUsers,
  } = trpc.admin.users.useQuery(
    { limit: 50 },
    { enabled: !!user && activeTab === "users" },
  );

  const { data: userStats } = trpc.admin.userStats.useQuery(undefined, {
    enabled: !!user && activeTab === "users",
  });

  const {
    data: conversations = [],
    isLoading: loadingChat,
    refetch: refetchChat,
  } = trpc.admin.allConversations.useQuery(
    { limit: 30 },
    { enabled: !!user && activeTab === "chat" },
  );

  const { data: subStats } = trpc.admin.subscriptionStats.useQuery(undefined, {
    enabled: !!user && activeTab === "subscriptions",
  });

  const { data: payStats } = trpc.admin.paymentStats.useQuery(undefined, {
    enabled:
      !!user && (activeTab === "subscriptions" || activeTab === "overview"),
  });

  // ─── tRPC Mutations ───────────────────────────────────────────────────────
  const replyMutation = trpc.admin.replyToChat.useMutation({
    onSuccess: () => {
      setReplyText("");
      setReplyingTo(null);
      refetchChat();
      Alert.alert(
        ar ? "✅ تم الإرسال" : "✅ Sent",
        ar ? "تم إرسال ردك للمستخدم" : "Reply sent",
      );
    },
    onError: (e) => Alert.alert(ar ? "خطأ" : "Error", e.message),
  });

  const updateConvMutation = trpc.admin.updateConversation.useMutation({
    onSuccess: () => refetchChat(),
  });

  const generateKeyMutation = trpc.licenses.generate.useMutation({
    onSuccess: (data) => setGeneratedKey(data.key),
    onError: (e) => Alert.alert(ar ? "خطأ" : "Error", e.message),
  });

  const sendNotifMutation = trpc.notifications.send.useMutation({
    onSuccess: () => {
      setNotifTitle("");
      setNotifBody("");
      setNotifUserId("");
      Alert.alert(
        ar ? "✅ أُرسل" : "✅ Sent",
        ar ? "تم إرسال الإشعار" : "Notification sent",
      );
    },
    onError: (e) => Alert.alert(ar ? "خطأ" : "Error", e.message),
  });

  // ─── إجراءات ──────────────────────────────────────────────────────────────
  const handleReply = () => {
    if (!replyingTo || !replyText.trim()) return;
    replyMutation.mutate({
      conversationId: replyingTo,
      content: replyText.trim(),
      agentName: ar ? "المدير" : "Admin",
    });
  };

  const handleGenerateKey = () => {
    generateKeyMutation.mutate({ plan: keyPlan, maxDevices: 1 });
  };

  const handleSendNotif = () => {
    const uid = parseInt(notifUserId, 10);
    if (!notifTitle.trim() || !notifBody.trim() || isNaN(uid)) {
      Alert.alert(
        ar ? "خطأ" : "Error",
        ar ? "الرجاء ملء جميع الحقول" : "Fill all fields",
      );
      return;
    }
    sendNotifMutation.mutate({
      userId: uid,
      title: notifTitle.trim(),
      message: notifBody.trim(),
      type: "info",
    });
  };

  const handleRefresh = useCallback(() => {
    refetchAnalytics();
    if (activeTab === "users") refetchUsers();
    if (activeTab === "chat") refetchChat();
  }, [activeTab, refetchAnalytics, refetchChat, refetchUsers]);

  // ─── Guard: Admin only ────────────────────────────────────────────────────
  if (!user || user.role !== "admin") {
    return (
      <ScreenContainer className="flex-1 items-center justify-center p-6">
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🔒</Text>
        <Text
          style={{
            color: "#F3F4F6",
            fontSize: 18,
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          {ar ? "صلاحية المدير مطلوبة" : "Admin access required"}
        </Text>
      </ScreenContainer>
    );
  }

  const TABS: { key: Tab; icon: string }[] = [
    { key: "overview", icon: "📊" },
    { key: "subscriptions", icon: "💎" },
    { key: "chat", icon: "💬" },
    { key: "reports", icon: "📋" },
    { key: "users", icon: "👥" },
  ];

  return (
    <ScreenContainer className="flex-1" style={{ backgroundColor: "#0A0A1A" }}>
      {/* Header */}
      <LinearGradient
        colors={["rgba(124,58,237,0.3)", "transparent"]}
        style={{ padding: 20, paddingTop: 12, paddingBottom: 0 }}
      >
        <Text style={{ color: "#F3F4F6", fontSize: 22, fontWeight: "900" }}>
          🛡️ {ar ? "لوحة المدير" : "Admin Dashboard"}
        </Text>
        <Text style={{ color: "#7C3AED", fontSize: 12 }}>
          {user.email} — {ar ? "مدير النظام" : "System Administrator"}
        </Text>
      </LinearGradient>

      {/* Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingHorizontal: 16, paddingVertical: 12 }}
      >
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setActiveTab(t.key)}
            style={{
              marginRight: 10,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor:
                activeTab === t.key ? "#7C3AED" : "rgba(255,255,255,0.07)",
              borderWidth: 1,
              borderColor:
                activeTab === t.key ? "#7C3AED" : "rgba(255,255,255,0.1)",
            }}
          >
            <Text
              style={{
                color: activeTab === t.key ? "#fff" : "#94A3B8",
                fontWeight: "700",
                fontSize: 13,
              }}
            >
              {t.icon} {tl(t.key, lang)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={handleRefresh} />
        }
      >
        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === "overview" && (
          <View style={{ gap: 16 }}>
            {loadingAnalytics ? (
              <ActivityIndicator
                size="large"
                color="#7C3AED"
                style={{ marginTop: 40 }}
              />
            ) : (
              <>
                <View
                  style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}
                >
                  <StatCard
                    icon="📹"
                    label={ar ? "إجمالي التسجيلات" : "Total Recordings"}
                    value={analyticsData?.recordingCount ?? 0}
                    color="#7C3AED"
                  />
                  <StatCard
                    icon="⏱️"
                    label={ar ? "وقت التسجيل (ث)" : "Recording Time (s)"}
                    value={analyticsData?.totalDuration ?? 0}
                    color="#06B6D4"
                  />
                </View>
                <View
                  style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}
                >
                  <StatCard
                    icon="☁️"
                    label={ar ? "التخزين المستخدم" : "Storage Used"}
                    value={`${((analyticsData?.storageUsed ?? 0) / 1024).toFixed(1)} GB`}
                    color="#10B981"
                  />
                  <StatCard
                    icon="👁️"
                    label={ar ? "المشاهدات" : "Views"}
                    value={analyticsData?.viewsReceived ?? 0}
                    color="#F59E0B"
                  />
                </View>

                {/* Payment Stats */}
                {payStats && (
                  <View
                    style={{
                      backgroundColor: "rgba(16,185,129,0.08)",
                      borderRadius: 18,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: "rgba(16,185,129,0.2)",
                    }}
                  >
                    <Text
                      style={{
                        color: "#10B981",
                        fontWeight: "800",
                        fontSize: 15,
                        marginBottom: 12,
                      }}
                    >
                      💳 {ar ? "إحصاءات الدفع" : "Payment Stats"}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      {[
                        {
                          label: ar ? "إجمالي" : "Total",
                          value: payStats.total ?? 0,
                          color: "#A78BFA",
                        },
                        {
                          label: ar ? "مكتملة" : "Completed",
                          value: payStats.completed ?? 0,
                          color: "#10B981",
                        },
                        {
                          label: ar ? "الإيرادات" : "Revenue",
                          value: `$${((payStats.totalAmount ?? 0) / 100).toFixed(0)}`,
                          color: "#FCD34D",
                        },
                      ].map((s) => (
                        <View
                          key={s.label}
                          style={{
                            flex: 1,
                            backgroundColor: `${s.color}15`,
                            borderRadius: 12,
                            padding: 10,
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: s.color,
                              fontSize: 20,
                              fontWeight: "900",
                            }}
                          >
                            {s.value}
                          </Text>
                          <Text
                            style={{
                              color: "#6B7280",
                              fontSize: 10,
                              marginTop: 2,
                            }}
                          >
                            {s.label}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Analytics History */}
                {analyticsHistory.length > 0 && (
                  <View
                    style={{
                      backgroundColor: "rgba(124,58,237,0.08)",
                      borderRadius: 18,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: "rgba(124,58,237,0.2)",
                    }}
                  >
                    <Text
                      style={{
                        color: "#A78BFA",
                        fontWeight: "800",
                        fontSize: 15,
                        marginBottom: 12,
                      }}
                    >
                      📈{" "}
                      {ar
                        ? "سجل التحليلات (7 أيام)"
                        : "7-Day Analytics History"}
                    </Text>
                    {analyticsHistory.slice(-7).map((entry: any, i: number) => (
                      <View
                        key={i}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          paddingVertical: 6,
                          borderBottomWidth: 1,
                          borderColor: "rgba(255,255,255,0.05)",
                        }}
                      >
                        <Text style={{ color: "#94A3B8", fontSize: 12 }}>
                          {new Date(entry.createdAt).toLocaleDateString(
                            ar ? "ar-SA" : "en-US",
                            { month: "short", day: "numeric" },
                          )}
                        </Text>
                        <Text
                          style={{
                            color: "#A78BFA",
                            fontSize: 12,
                            fontWeight: "700",
                          }}
                        >
                          {entry.recordingCount ?? 0}{" "}
                          {ar ? "تسجيل" : "recordings"}
                        </Text>
                        <Text style={{ color: "#10B981", fontSize: 12 }}>
                          {entry.viewsReceived ?? 0} {ar ? "مشاهدة" : "views"}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Send Notification Panel */}
                <View
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    borderRadius: 18,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <Text
                    style={{
                      color: "#F3F4F6",
                      fontWeight: "800",
                      fontSize: 15,
                      marginBottom: 12,
                    }}
                  >
                    🔔 {ar ? "إرسال إشعار لمستخدم" : "Send User Notification"}
                  </Text>
                  <TextInput
                    value={notifUserId}
                    onChangeText={setNotifUserId}
                    placeholder={
                      ar ? "User ID (رقم)..." : "User ID (number)..."
                    }
                    placeholderTextColor="#4B5563"
                    keyboardType="number-pad"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.3)",
                      borderRadius: 10,
                      padding: 12,
                      color: "#E5E7EB",
                      fontSize: 14,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.08)",
                      marginBottom: 8,
                    }}
                  />
                  <TextInput
                    value={notifTitle}
                    onChangeText={setNotifTitle}
                    placeholder={
                      ar ? "عنوان الإشعار..." : "Notification title..."
                    }
                    placeholderTextColor="#4B5563"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.3)",
                      borderRadius: 10,
                      padding: 12,
                      color: "#E5E7EB",
                      fontSize: 14,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.08)",
                      marginBottom: 8,
                    }}
                  />
                  <TextInput
                    value={notifBody}
                    onChangeText={setNotifBody}
                    placeholder={ar ? "نص الإشعار..." : "Notification body..."}
                    placeholderTextColor="#4B5563"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.3)",
                      borderRadius: 10,
                      padding: 12,
                      color: "#E5E7EB",
                      fontSize: 14,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.08)",
                      marginBottom: 12,
                    }}
                  />
                  <Pressable
                    onPress={handleSendNotif}
                    disabled={sendNotifMutation.isPending}
                    style={{
                      backgroundColor: "#7C3AED",
                      borderRadius: 12,
                      padding: 12,
                      alignItems: "center",
                      opacity: sendNotifMutation.isPending ? 0.7 : 1,
                    }}
                  >
                    {sendNotifMutation.isPending ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={{ color: "#fff", fontWeight: "800" }}>
                        {ar ? "إرسال الإشعار" : "Send Notification"}
                      </Text>
                    )}
                  </Pressable>
                </View>
              </>
            )}
          </View>
        )}

        {/* ═══ USERS TAB ═══ */}
        {activeTab === "users" && (
          <View style={{ gap: 14 }}>
            {/* User Stats */}
            {userStats && (
              <View style={{ flexDirection: "row", gap: 12 }}>
                {[
                  {
                    label: ar ? "الإجمالي" : "Total",
                    value: userStats.total ?? 0,
                    color: "#A78BFA",
                  },
                  {
                    label: ar ? "نشط" : "Active",
                    value: userStats.active ?? 0,
                    color: "#10B981",
                  },
                  {
                    label: ar ? "مميز" : "Premium",
                    value: userStats.premium ?? 0,
                    color: "#FCD34D",
                  },
                ].map((s) => (
                  <View
                    key={s.label}
                    style={{
                      flex: 1,
                      backgroundColor: `${s.color}15`,
                      borderRadius: 14,
                      padding: 14,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: `${s.color}30`,
                    }}
                  >
                    <Text
                      style={{
                        color: s.color,
                        fontSize: 24,
                        fontWeight: "900",
                      }}
                    >
                      {s.value}
                    </Text>
                    <Text
                      style={{ color: "#6B7280", fontSize: 10, marginTop: 2 }}
                    >
                      {s.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {loadingUsers ? (
              <ActivityIndicator
                size="large"
                color="#7C3AED"
                style={{ marginTop: 30 }}
              />
            ) : (
              (usersData ?? []).map((u: any) => (
                <View
                  key={u.id}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.06)",
                  }}
                >
                  <View
                    style={{
                      flexDirection: ar ? "row-reverse" : "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: "#F3F4F6",
                          fontWeight: "700",
                          fontSize: 14,
                        }}
                      >
                        {u.name ?? u.username ?? `User #${u.id}`}
                      </Text>
                      <Text
                        style={{ color: "#6B7280", fontSize: 12, marginTop: 2 }}
                      >
                        {u.email}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 4 }}>
                      <View
                        style={{
                          backgroundColor:
                            u.subscriptionPlan === "premium"
                              ? "rgba(252,211,77,0.2)"
                              : u.subscriptionPlan === "pro"
                                ? "rgba(124,58,237,0.2)"
                                : "rgba(100,116,139,0.2)",
                          borderRadius: 8,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                        }}
                      >
                        <Text
                          style={{
                            color:
                              u.subscriptionPlan === "premium"
                                ? "#FCD34D"
                                : u.subscriptionPlan === "pro"
                                  ? "#A78BFA"
                                  : "#94A3B8",
                            fontSize: 10,
                            fontWeight: "700",
                            textTransform: "uppercase",
                          }}
                        >
                          {u.subscriptionPlan ?? "FREE"}
                        </Text>
                      </View>
                      <Text style={{ color: "#4B5563", fontSize: 10 }}>
                        #{u.id}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{ color: "#475569", fontSize: 10, marginTop: 8 }}
                  >
                    {ar ? "مسجل:" : "Joined:"}{" "}
                    {new Date(u.createdAt).toLocaleDateString(
                      ar ? "ar-SA" : "en-US",
                    )}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* ═══ SUBSCRIPTIONS TAB ═══ */}
        {activeTab === "subscriptions" && (
          <View style={{ gap: 16 }}>
            {/* Subscription Stats */}
            {subStats ? (
              <View
                style={{
                  backgroundColor: "rgba(124,58,237,0.08)",
                  borderRadius: 18,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "rgba(124,58,237,0.2)",
                }}
              >
                <Text
                  style={{
                    color: "#A78BFA",
                    fontWeight: "800",
                    fontSize: 15,
                    marginBottom: 12,
                  }}
                >
                  💎 {ar ? "إحصاءات الاشتراكات" : "Subscription Stats"}
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}
                >
                  {[
                    {
                      label: "Total",
                      value: subStats.total ?? 0,
                      color: "#A78BFA",
                    },
                    {
                      label: "Active",
                      value: subStats.active ?? 0,
                      color: "#10B981",
                    },
                    {
                      label: "Pro",
                      value: subStats.pro ?? 0,
                      color: "#60A5FA",
                    },
                    {
                      label: "Premium",
                      value: subStats.premium ?? 0,
                      color: "#FCD34D",
                    },
                  ].map((s) => (
                    <View
                      key={s.label}
                      style={{
                        flex: 1,
                        minWidth: "45%",
                        backgroundColor: `${s.color}15`,
                        borderRadius: 12,
                        padding: 12,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: s.color,
                          fontSize: 22,
                          fontWeight: "900",
                        }}
                      >
                        {s.value}
                      </Text>
                      <Text style={{ color: "#6B7280", fontSize: 10 }}>
                        {s.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <ActivityIndicator color="#7C3AED" />
            )}

            {/* Generate License Key */}
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderRadius: 18,
                padding: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text
                style={{
                  color: "#F3F4F6",
                  fontWeight: "800",
                  fontSize: 15,
                  marginBottom: 12,
                }}
              >
                🔑 {ar ? "توليد مفتاح ترخيص" : "Generate License Key"}
              </Text>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
                {(["pro", "premium"] as const).map((plan) => (
                  <Pressable
                    key={plan}
                    onPress={() => setKeyPlan(plan)}
                    style={{
                      flex: 1,
                      padding: 10,
                      borderRadius: 10,
                      alignItems: "center",
                      backgroundColor:
                        keyPlan === plan ? "#7C3AED" : "rgba(255,255,255,0.06)",
                      borderWidth: 1,
                      borderColor:
                        keyPlan === plan ? "#7C3AED" : "rgba(255,255,255,0.08)",
                    }}
                  >
                    <Text
                      style={{
                        color: keyPlan === plan ? "#fff" : "#94A3B8",
                        fontWeight: "700",
                        textTransform: "uppercase",
                      }}
                    >
                      {plan}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Pressable
                onPress={handleGenerateKey}
                disabled={generateKeyMutation.isPending}
                style={{
                  backgroundColor: "#7C3AED",
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "center",
                  opacity: generateKeyMutation.isPending ? 0.7 : 1,
                }}
              >
                {generateKeyMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "800" }}>
                    {ar ? "توليد مفتاح" : "Generate Key"}
                  </Text>
                )}
              </Pressable>
              {generatedKey && (
                <View
                  style={{
                    backgroundColor: "rgba(16,185,129,0.1)",
                    borderRadius: 12,
                    padding: 14,
                    marginTop: 12,
                    borderWidth: 1,
                    borderColor: "rgba(16,185,129,0.3)",
                  }}
                >
                  <Text
                    style={{ color: "#6B7280", fontSize: 10, marginBottom: 4 }}
                  >
                    {ar ? "المفتاح الجديد:" : "New key:"}
                  </Text>
                  <Text
                    style={{
                      color: "#10B981",
                      fontFamily: "monospace",
                      fontSize: 14,
                      fontWeight: "700",
                      letterSpacing: 1,
                    }}
                  >
                    {generatedKey}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ═══ CHAT/SUPPORT TAB ═══ */}
        {activeTab === "chat" && (
          <View style={{ gap: 12 }}>
            <Text style={{ color: "#F3F4F6", fontWeight: "800", fontSize: 16 }}>
              💬 {ar ? "محادثات الدعم" : "Support Conversations"} (
              {conversations.length})
            </Text>

            {loadingChat ? (
              <ActivityIndicator
                size="large"
                color="#7C3AED"
                style={{ marginTop: 30 }}
              />
            ) : conversations.length === 0 ? (
              <View style={{ alignItems: "center", padding: 40 }}>
                <Text style={{ fontSize: 40, marginBottom: 10 }}>💬</Text>
                <Text style={{ color: "#9CA3AF" }}>
                  {ar ? "لا محادثات مفتوحة" : "No open conversations"}
                </Text>
              </View>
            ) : (
              conversations.map((conv: any) => {
                const statusColors: Record<string, string> = {
                  open: "#EF4444",
                  in_progress: "#F59E0B",
                  resolved: "#10B981",
                  closed: "#6B7280",
                };
                const sc = statusColors[conv.status] ?? "#A78BFA";
                const isReplying = replyingTo === conv.id;
                return (
                  <View
                    key={conv.id}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.04)",
                      borderRadius: 16,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: `${sc}30`,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: ar ? "row-reverse" : "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 8,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: "#F3F4F6",
                            fontWeight: "700",
                            fontSize: 14,
                          }}
                        >
                          {conv.subject}
                        </Text>
                        <Text
                          style={{
                            color: "#6B7280",
                            fontSize: 11,
                            marginTop: 2,
                          }}
                        >
                          {ar ? "مستخدم" : "User"} #{conv.userId} ·{" "}
                          {new Date(conv.createdAt).toLocaleDateString(
                            ar ? "ar-SA" : "en-US",
                          )}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 6,
                          alignItems: "center",
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: `${sc}20`,
                            borderRadius: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                          }}
                        >
                          <Text
                            style={{
                              color: sc,
                              fontSize: 10,
                              fontWeight: "700",
                            }}
                          >
                            {conv.status?.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View
                      style={{ flexDirection: "row", gap: 8, marginTop: 8 }}
                    >
                      <Pressable
                        onPress={() =>
                          setReplyingTo(isReplying ? null : conv.id)
                        }
                        style={{
                          flex: 1,
                          backgroundColor: "rgba(124,58,237,0.2)",
                          borderRadius: 10,
                          padding: 8,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#A78BFA",
                            fontWeight: "700",
                            fontSize: 12,
                          }}
                        >
                          {isReplying
                            ? ar
                              ? "إلغاء"
                              : "Cancel"
                            : ar
                              ? "رد"
                              : "Reply"}
                        </Text>
                      </Pressable>
                      {conv.status === "open" && (
                        <Pressable
                          onPress={() =>
                            updateConvMutation.mutate({
                              id: conv.id,
                              status: "resolved",
                            })
                          }
                          style={{
                            flex: 1,
                            backgroundColor: "rgba(16,185,129,0.2)",
                            borderRadius: 10,
                            padding: 8,
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "#10B981",
                              fontWeight: "700",
                              fontSize: 12,
                            }}
                          >
                            {ar ? "إغلاق" : "Resolve"}
                          </Text>
                        </Pressable>
                      )}
                    </View>

                    {/* Reply Box */}
                    {isReplying && (
                      <View style={{ marginTop: 10, gap: 8 }}>
                        <TextInput
                          value={replyText}
                          onChangeText={setReplyText}
                          placeholder={
                            ar ? "اكتب ردك..." : "Type your reply..."
                          }
                          placeholderTextColor="#4B5563"
                          multiline
                          style={{
                            backgroundColor: "rgba(0,0,0,0.4)",
                            borderRadius: 10,
                            padding: 12,
                            color: "#E5E7EB",
                            fontSize: 13,
                            borderWidth: 1,
                            borderColor: "rgba(124,58,237,0.3)",
                            minHeight: 70,
                          }}
                        />
                        <Pressable
                          onPress={handleReply}
                          disabled={replyMutation.isPending}
                          style={{
                            backgroundColor: "#7C3AED",
                            borderRadius: 10,
                            padding: 10,
                            alignItems: "center",
                            opacity: replyMutation.isPending ? 0.7 : 1,
                          }}
                        >
                          {replyMutation.isPending ? (
                            <ActivityIndicator color="#fff" size="small" />
                          ) : (
                            <Text style={{ color: "#fff", fontWeight: "800" }}>
                              {ar ? "إرسال الرد" : "Send Reply"}
                            </Text>
                          )}
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ═══ REPORTS TAB ═══ */}
        {activeTab === "reports" && (
          <View style={{ gap: 16 }}>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderRadius: 18,
                padding: 20,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text
                style={{
                  color: "#F3F4F6",
                  fontWeight: "800",
                  fontSize: 16,
                  marginBottom: 16,
                }}
              >
                📋 {ar ? "ملخص النظام" : "System Summary"}
              </Text>
              {[
                {
                  label: ar ? "التسجيلات الإجمالية" : "Total Recordings",
                  value: analyticsData?.recordingCount ?? 0,
                  icon: "📹",
                  color: "#7C3AED",
                },
                {
                  label: ar ? "وقت التسجيل الكلي" : "Total Recording Time",
                  value: `${Math.round((analyticsData?.totalDuration ?? 0) / 60)} min`,
                  icon: "⏱️",
                  color: "#06B6D4",
                },
                {
                  label: ar ? "التخزين المستخدم" : "Storage Used",
                  value: `${((analyticsData?.storageUsed ?? 0) / 1024).toFixed(2)} GB`,
                  icon: "☁️",
                  color: "#10B981",
                },
                {
                  label: ar ? "المشاهدات الكلية" : "Total Views",
                  value: analyticsData?.viewsReceived ?? 0,
                  icon: "👁️",
                  color: "#F59E0B",
                },
                {
                  label: ar ? "إيرادات الدفع" : "Payment Revenue",
                  value: `$${((payStats?.totalAmount ?? 0) / 100).toFixed(2)}`,
                  icon: "💳",
                  color: "#EC4899",
                },
                {
                  label: ar ? "الاشتراكات النشطة" : "Active Subscriptions",
                  value: subStats?.active ?? 0,
                  icon: "💎",
                  color: "#A78BFA",
                },
              ].map((item) => (
                <View
                  key={item.label}
                  style={{
                    flexDirection: ar ? "row-reverse" : "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <View
                    style={{
                      flexDirection: ar ? "row-reverse" : "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                    <Text style={{ color: "#94A3B8", fontSize: 13 }}>
                      {item.label}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: item.color,
                      fontSize: 15,
                      fontWeight: "800",
                    }}
                  >
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
