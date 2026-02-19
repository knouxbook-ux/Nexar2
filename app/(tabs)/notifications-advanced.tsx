// Copyright © Knoux. All rights reserved.
/**
 * 🔔 Advanced Notification Settings
 * ✅ FIXED: tRPC حقيقي — لا AdvancedNotificationsService — لا user_123 — لا tier وهمي
 */

import { ScrollView, Text, View, Pressable, Switch, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLanguage } from "@/lib/language-context";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFS_KEY = "@nexar_notif_prefs_v1";

interface NotifPrefs {
  enableNotifications: boolean;
  enableSound: boolean;
  enableVibration: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
  types: {
    recording: boolean;
    subscription: boolean;
    payment: boolean;
    chat: boolean;
    system: boolean;
    referral: boolean;
  };
}

const DEFAULT_PREFS: NotifPrefs = {
  enableNotifications: true,
  enableSound: true,
  enableVibration: true,
  quietHoursStart: 22,
  quietHoursEnd: 8,
  types: {
    recording: true,
    subscription: true,
    payment: true,
    chat: true,
    system: true,
    referral: true,
  },
};

export default function AdvancedNotificationsScreen() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const { user } = useAuth();

  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [isLoading, setIsLoading] = useState(true);

  // ─── tRPC Queries ─────────────────────────────────────────────────────────
  const { data: notifications = [], isLoading: loadingNotifs, refetch } =
    trpc.notifications.list.useQuery({ unreadOnly: false }, { enabled: !!user });

  const { data: unreadCount = 0 } = trpc.notifications.unreadCount.useQuery(
    undefined, { enabled: !!user, refetchInterval: 30000 }
  );

  // ─── tRPC Mutations ───────────────────────────────────────────────────────
  const markReadMutation = trpc.notifications.markRead.useMutation({ onSuccess: () => refetch() });
  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({ onSuccess: () => refetch() });

  // ─── Load/Save Preferences from AsyncStorage ──────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY)
      .then((raw) => {
        if (raw) setPrefs(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const savePrefs = async (updated: NotifPrefs) => {
    setPrefs(updated);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  };

  const togglePref = (key: keyof Omit<NotifPrefs, "quietHoursStart" | "quietHoursEnd" | "types">) => {
    savePrefs({ ...prefs, [key]: !prefs[key] });
  };

  const toggleType = (type: keyof NotifPrefs["types"]) => {
    savePrefs({ ...prefs, types: { ...prefs.types, [type]: !prefs.types[type] } });
  };

  // إحصاءات من الـ backend الحقيقي
  const totalNotifs = notifications.length;
  const readNotifs = notifications.filter((n: any) => n.isRead === 1).length;
  const openRate = totalNotifs > 0 ? Math.round((readNotifs / totalNotifs) * 100) : 0;

  const typeLabels: Record<keyof NotifPrefs["types"], { ar: string; en: string; icon: string }> = {
    recording: { ar: "التسجيل", en: "Recording", icon: "📹" },
    subscription: { ar: "الاشتراك", en: "Subscription", icon: "💎" },
    payment: { ar: "الدفع", en: "Payment", icon: "💳" },
    chat: { ar: "الدعم", en: "Support Chat", icon: "💬" },
    system: { ar: "النظام", en: "System", icon: "⚙️" },
    referral: { ar: "الإحالات", en: "Referrals", icon: "🤝" },
  };

  if (isLoading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#A78BFA" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: "900", color: "#F3F4F6" }}>
            {ar ? "🔔 إعدادات الإشعارات" : "🔔 Notification Settings"}
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 13, marginTop: 4 }}>
            {ar ? "تحكم في كيفية استلام الإشعارات" : "Customize how you receive notifications"}
          </Text>
        </View>

        {/* Real Stats from Backend */}
        {user && (
          <View style={{
            backgroundColor: "rgba(167,139,250,0.08)", borderRadius: 20, padding: 16,
            borderWidth: 1, borderColor: "rgba(167,139,250,0.2)", marginBottom: 20,
          }}>
            <View style={{ flexDirection: ar ? "row-reverse" : "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ color: "#F3F4F6", fontWeight: "800", fontSize: 14 }}>
                {ar ? "إحصاءات الإشعارات" : "Notification Stats"}
              </Text>
              {unreadCount > 0 && (
                <Pressable
                  onPress={() => markAllReadMutation.mutate()}
                  style={{ backgroundColor: "rgba(167,139,250,0.2)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}
                >
                  <Text style={{ color: "#A78BFA", fontSize: 11, fontWeight: "700" }}>
                    {ar ? "قراءة الكل" : "Mark all read"}
                  </Text>
                </Pressable>
              )}
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {[
                { label: ar ? "الإجمالي" : "Total", value: totalNotifs, color: "#A78BFA" },
                { label: ar ? "مقروءة" : "Read", value: readNotifs, color: "#10B981" },
                { label: ar ? "غير مقروءة" : "Unread", value: unreadCount, color: "#F59E0B" },
                { label: ar ? "معدل القراءة" : "Read Rate", value: `${openRate}%`, color: "#60A5FA" },
              ].map((s) => (
                <View key={s.label} style={{ flex: 1, backgroundColor: `${s.color}15`, borderRadius: 12, padding: 10, alignItems: "center" }}>
                  <Text style={{ color: s.color, fontSize: 18, fontWeight: "900" }}>{s.value}</Text>
                  <Text style={{ color: "#6B7280", fontSize: 9, marginTop: 2, textAlign: "center" }}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Main Settings */}
        <View style={{
          backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 20,
          borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 16,
        }}>
          <Text style={{ color: "#F3F4F6", fontWeight: "800", fontSize: 16, marginBottom: 16 }}>
            {ar ? "الإعدادات الرئيسية" : "Main Settings"}
          </Text>

          {[
            { key: "enableNotifications" as const, labelAr: "تفعيل الإشعارات", labelEn: "Enable Notifications", descAr: "استقبال جميع الإشعارات", descEn: "Receive all notifications" },
            { key: "enableSound" as const, labelAr: "الصوت", labelEn: "Sound", descAr: "تشغيل صوت للإشعارات", descEn: "Play sound for notifications" },
            { key: "enableVibration" as const, labelAr: "الاهتزاز", labelEn: "Vibration", descAr: "اهتزاز عند الإشعارات", descEn: "Vibrate on notifications" },
          ].map((item, idx, arr) => (
            <View
              key={item.key}
              style={{
                flexDirection: ar ? "row-reverse" : "row", justifyContent: "space-between",
                alignItems: "center", paddingVertical: 14,
                borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#F3F4F6", fontWeight: "600", fontSize: 14 }}>
                  {ar ? item.labelAr : item.labelEn}
                </Text>
                <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 2 }}>
                  {ar ? item.descAr : item.descEn}
                </Text>
              </View>
              <Switch
                value={prefs[item.key]}
                onValueChange={() => togglePref(item.key)}
                trackColor={{ false: "#374151", true: "#A78BFA" }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>

        {/* Quiet Hours */}
        <View style={{
          backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 20,
          borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 16,
        }}>
          <Text style={{ color: "#F3F4F6", fontWeight: "800", fontSize: 16, marginBottom: 8 }}>
            {ar ? "🌙 ساعات الهدوء" : "🌙 Quiet Hours"}
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 13, marginBottom: 14 }}>
            {ar
              ? `لا إشعارات من ${prefs.quietHoursStart}:00 حتى ${prefs.quietHoursEnd}:00`
              : `No notifications from ${prefs.quietHoursStart}:00 to ${prefs.quietHoursEnd}:00`}
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {[
              { label: ar ? "من" : "From", value: prefs.quietHoursStart, key: "start" as const },
              { label: ar ? "حتى" : "Until", value: prefs.quietHoursEnd, key: "end" as const },
            ].map((item) => (
              <View key={item.key} style={{ flex: 1 }}>
                <Text style={{ color: "#9CA3AF", fontSize: 11, marginBottom: 6 }}>{item.label}</Text>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {[0, 6, 8, 10, 22, 23].map((h) => (
                    <Pressable
                      key={h}
                      onPress={() => savePrefs({
                        ...prefs,
                        [item.key === "start" ? "quietHoursStart" : "quietHoursEnd"]: h,
                      })}
                      style={{
                        flex: 1, paddingVertical: 6, borderRadius: 8, alignItems: "center",
                        backgroundColor: item.value === h ? "#A78BFA" : "rgba(255,255,255,0.06)",
                      }}
                    >
                      <Text style={{ color: item.value === h ? "#000" : "#9CA3AF", fontSize: 11, fontWeight: "700" }}>
                        {h}h
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Notification Types */}
        <View style={{
          backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 20,
          borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 16,
        }}>
          <Text style={{ color: "#F3F4F6", fontWeight: "800", fontSize: 16, marginBottom: 16 }}>
            {ar ? "أنواع الإشعارات" : "Notification Types"}
          </Text>

          {(Object.keys(prefs.types) as (keyof NotifPrefs["types"])[]).map((type, idx, arr) => {
            const info = typeLabels[type];
            return (
              <View
                key={type}
                style={{
                  flexDirection: ar ? "row-reverse" : "row", justifyContent: "space-between",
                  alignItems: "center", paddingVertical: 12,
                  borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
                  borderColor: "rgba(255,255,255,0.06)",
                }}
              >
                <View style={{ flexDirection: ar ? "row-reverse" : "row", alignItems: "center", gap: 10 }}>
                  <Text style={{ fontSize: 20 }}>{info.icon}</Text>
                  <Text style={{ color: "#F3F4F6", fontWeight: "600", fontSize: 14 }}>
                    {ar ? info.ar : info.en}
                  </Text>
                </View>
                <Switch
                  value={prefs.types[type]}
                  onValueChange={() => toggleType(type)}
                  trackColor={{ false: "#374151", true: "#A78BFA" }}
                  thumbColor="#fff"
                />
              </View>
            );
          })}
        </View>

        {/* Recent Notifications from Backend */}
        {user && (
          <View style={{
            backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 20,
            borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
          }}>
            <Text style={{ color: "#F3F4F6", fontWeight: "800", fontSize: 16, marginBottom: 14 }}>
              {ar ? "آخر الإشعارات" : "Recent Notifications"}
            </Text>

            {loadingNotifs ? (
              <ActivityIndicator color="#A78BFA" />
            ) : notifications.length === 0 ? (
              <View style={{ alignItems: "center", padding: 20 }}>
                <Text style={{ fontSize: 36, marginBottom: 8 }}>🔔</Text>
                <Text style={{ color: "#9CA3AF", textAlign: "center" }}>
                  {ar ? "لا إشعارات بعد" : "No notifications yet"}
                </Text>
              </View>
            ) : (
              notifications.slice(0, 10).map((notif: any) => {
                const typeColors: Record<string, string> = {
                  success: "#10B981", warning: "#F59E0B", error: "#EF4444", info: "#60A5FA",
                };
                const color = typeColors[notif.type] ?? "#60A5FA";
                const isUnread = notif.isRead === 0;
                return (
                  <Pressable
                    key={notif.id}
                    onPress={() => isUnread && markReadMutation.mutate({ id: notif.id })}
                    style={{
                      flexDirection: ar ? "row-reverse" : "row", gap: 12, paddingVertical: 12,
                      borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)",
                      opacity: isUnread ? 1 : 0.6,
                    }}
                  >
                    <View style={{
                      width: 8, height: 8, borderRadius: 4, backgroundColor: isUnread ? color : "transparent",
                      marginTop: 5, flexShrink: 0,
                    }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#F3F4F6", fontWeight: isUnread ? "700" : "500", fontSize: 13 }}>
                        {notif.title}
                      </Text>
                      {notif.message && (
                        <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 2 }} numberOfLines={2}>
                          {notif.message}
                        </Text>
                      )}
                      <Text style={{ color: "#6B7280", fontSize: 10, marginTop: 4 }}>
                        {new Date(notif.createdAt).toLocaleString(ar ? "ar-SA" : "en-US")}
                      </Text>
                    </View>
                    <View style={{ backgroundColor: `${color}20`, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, alignSelf: "flex-start" }}>
                      <Text style={{ color, fontSize: 9, fontWeight: "700" }}>{notif.type?.toUpperCase()}</Text>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        )}

      </ScrollView>
    </ScreenContainer>
  );
}
