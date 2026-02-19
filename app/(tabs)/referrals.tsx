// Copyright © Knoux. All rights reserved.
/**
 * 🤝 Referral Program
 * ✅ FIXED: tRPC حقيقي — لا ReferralService محلي — لا user_123
 */

import { ScrollView, Text, View, Pressable, Share, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLanguage } from "@/lib/language-context";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";

export default function ReferralsScreen() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // ─── tRPC Queries ─────────────────────────────────────────────────────────
  const { data: myReferrals = [], isLoading: loadingReferrals } = trpc.referrals.myReferrals.useQuery(
    undefined, { enabled: !!user }
  );

  const { data: stats } = trpc.referrals.stats.useQuery(
    undefined, { enabled: !!user }
  );

  // ─── حساب الإحصاءات من البيانات الحقيقية ─────────────────────────────────
  const totalReferrals = stats?.total ?? 0;
  const completedReferrals = stats?.completed ?? 0;
  const totalCommission = Number(stats?.totalCommission ?? 0);

  // رمز الإحالة الشخصي — مشتق من ID المستخدم
  const referralCode = user
    ? `NXR-${String(user.id).padStart(4, "0")}-${user.openId?.slice(0, 6).toUpperCase() ?? "XXXXXX"}`
    : null;

  const handleCopyCode = async () => {
    if (!referralCode) return;
    await Clipboard.setStringAsync(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareCode = async () => {
    if (!referralCode) return;
    try {
      await Share.share({
        message: ar
          ? `🚀 انضم إلى Knoux Nexar Pro! استخدم رمز إحالتي ${referralCode} للحصول على خصم. حمّل التطبيق الآن!`
          : `🚀 Join Knoux Nexar Pro! Use my referral code ${referralCode} for a discount. Download now!`,
        title: "Knoux Nexar Pro Referral",
      });
    } catch {}
  };

  if (!user) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center p-6">
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🔒</Text>
        <Text style={{ color: "#F3F4F6", fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
          {ar ? "يرجى تسجيل الدخول" : "Sign in required"}
        </Text>
        <Text style={{ color: "#9CA3AF", textAlign: "center" }}>
          {ar ? "سجّل دخولك للوصول لبرنامج الإحالة" : "Sign in to access the referral program"}
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Header */}
        <LinearGradient
          colors={["rgba(16,185,129,0.2)", "transparent"]}
          style={{ borderRadius: 24, padding: 24, marginBottom: 20 }}
        >
          <Text style={{ fontSize: 28, fontWeight: "900", color: "#F3F4F6", marginBottom: 4 }}>
            {ar ? "🤝 برنامج الإحالة" : "🤝 Referral Program"}
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
            {ar ? "ادعُ أصدقاءك واكسب عمولات حقيقية" : "Invite friends and earn real commissions"}
          </Text>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          {[
            { label: ar ? "إجمالي الإحالات" : "Total Referrals", value: totalReferrals, color: "#A78BFA", icon: "👥" },
            { label: ar ? "مكتملة" : "Completed", value: completedReferrals, color: "#10B981", icon: "✅" },
            { label: ar ? "العمولة الإجمالية" : "Total Commission", value: `${totalCommission}¢`, color: "#FCD34D", icon: "💰" },
            { label: ar ? "معدل التحويل" : "Conversion Rate", value: totalReferrals > 0 ? `${Math.round((completedReferrals / totalReferrals) * 100)}%` : "0%", color: "#60A5FA", icon: "📈" },
          ].map((stat) => (
            <View
              key={stat.label}
              style={{
                flex: 1, minWidth: "45%", backgroundColor: `${stat.color}15`,
                borderRadius: 16, padding: 14, borderWidth: 1, borderColor: `${stat.color}30`,
              }}
            >
              <Text style={{ fontSize: 22, marginBottom: 6 }}>{stat.icon}</Text>
              <Text style={{ color: stat.color, fontSize: 22, fontWeight: "900" }}>{stat.value}</Text>
              <Text style={{ color: "#9CA3AF", fontSize: 10, marginTop: 2 }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Referral Code Card */}
        <View style={{
          backgroundColor: "rgba(16,185,129,0.08)", borderRadius: 20, padding: 20,
          borderWidth: 1, borderColor: "rgba(16,185,129,0.25)", marginBottom: 20,
        }}>
          <Text style={{ color: "#10B981", fontWeight: "800", fontSize: 14, marginBottom: 14 }}>
            {ar ? "🔑 رمز إحالتك الشخصي" : "🔑 Your Personal Referral Code"}
          </Text>

          <View style={{
            backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 14, padding: 16, marginBottom: 14,
            borderWidth: 1, borderColor: "rgba(16,185,129,0.3)",
          }}>
            <Text style={{
              fontFamily: "monospace", fontSize: 20, color: "#10B981",
              letterSpacing: 2, textAlign: "center", fontWeight: "900",
            }}>
              {referralCode}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={handleCopyCode}
              style={{
                flex: 1, backgroundColor: "rgba(16,185,129,0.2)", borderRadius: 12,
                padding: 12, alignItems: "center",
              }}
            >
              <Text style={{ color: "#10B981", fontWeight: "700" }}>
                {copied ? (ar ? "✅ تم النسخ!" : "✅ Copied!") : (ar ? "نسخ" : "Copy")}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleShareCode}
              style={{ flex: 1, backgroundColor: "#10B981", borderRadius: 12, padding: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#000", fontWeight: "800" }}>
                {ar ? "مشاركة" : "Share"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* How It Works */}
        <View style={{
          backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 20,
          borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 20,
        }}>
          <Text style={{ color: "#F3F4F6", fontWeight: "800", fontSize: 16, marginBottom: 16 }}>
            {ar ? "كيف يعمل البرنامج؟" : "How Does It Work?"}
          </Text>
          {[
            { step: 1, icon: "📤", titleAr: "شارك رمزك", titleEn: "Share Your Code", descAr: "أرسل رمز إحالتك لأصدقائك", descEn: "Send your referral code to friends" },
            { step: 2, icon: "📱", titleAr: "ينضمون للتطبيق", titleEn: "They Join the App", descAr: "يستخدمون رمزك عند التسجيل", descEn: "They use your code at signup" },
            { step: 3, icon: "💳", titleAr: "يشتركون بخطة", titleEn: "They Subscribe", descAr: "يختارون خطة Pro أو Premium", descEn: "They choose Pro or Premium plan" },
            { step: 4, icon: "💰", titleAr: "تكسب عمولة", titleEn: "You Earn Commission", descAr: "عمولة تلقائية على كل اشتراك", descEn: "Automatic commission on each subscription" },
          ].map((item) => (
            <View key={item.step} style={{ flexDirection: ar ? "row-reverse" : "row", gap: 14, marginBottom: 14 }}>
              <View style={{
                width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(16,185,129,0.2)",
                alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#F3F4F6", fontWeight: "700", fontSize: 14 }}>
                  {ar ? item.titleAr : item.titleEn}
                </Text>
                <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 2 }}>
                  {ar ? item.descAr : item.descEn}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Referrals History */}
        <Text style={{ color: "#F3F4F6", fontWeight: "800", fontSize: 16, marginBottom: 12 }}>
          {ar ? "سجل الإحالات" : "Referrals History"}
        </Text>

        {loadingReferrals ? (
          <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 20 }} />
        ) : myReferrals.length === 0 ? (
          <View style={{
            backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 40,
            alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
          }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>👥</Text>
            <Text style={{ color: "#9CA3AF", textAlign: "center", fontSize: 14 }}>
              {ar ? "لا توجد إحالات بعد\nابدأ بمشاركة رمزك!" : "No referrals yet\nStart sharing your code!"}
            </Text>
          </View>
        ) : (
          myReferrals.map((ref: any) => {
            const statusColors: Record<string, string> = {
              completed: "#10B981", pending: "#F59E0B", failed: "#EF4444",
            };
            const statusColor = statusColors[ref.status] ?? "#9CA3AF";
            return (
              <View key={ref.id} style={{
                backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 16,
                borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", marginBottom: 10,
              }}>
                <View style={{ flexDirection: ar ? "row-reverse" : "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View>
                    <Text style={{ color: "#F3F4F6", fontWeight: "700", fontSize: 14 }}>
                      {ar ? "مستخدم" : "User"} #{ref.referredId}
                    </Text>
                    <Text style={{ color: "#6B7280", fontSize: 11, marginTop: 2 }}>
                      {new Date(ref.createdAt).toLocaleDateString(ar ? "ar-SA" : "en-US")}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <View style={{ backgroundColor: `${statusColor}20`, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ color: statusColor, fontSize: 11, fontWeight: "700" }}>
                        {ref.status?.toUpperCase()}
                      </Text>
                    </View>
                    {ref.commission > 0 && (
                      <Text style={{ color: "#10B981", fontWeight: "800", fontSize: 13 }}>
                        +{ref.commission}¢
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}

      </ScrollView>
    </ScreenContainer>
  );
}
