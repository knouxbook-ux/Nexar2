// Copyright © Knoux. All rights reserved.
/**
 * 💎 Subscription Plans
 * ✅ FIXED: متصل بـ tRPC backend — لا hardcoded user_123
 */

import { ScrollView, Text, View, Pressable, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLanguage } from "@/lib/language-context";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { nexarEvents } from "@/lib/nexar/NexarCore";

// ─── خطط الاشتراك ──────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "free",
    plan: "free" as const,
    name: "Free",
    nameAr: "مجاني",
    price: 0,
    priceYearly: 0,
    billingCycle: "monthly" as const,
    color: "#10B981",
    icon: "🎁",
    features: [
      "30-min recording limit",
      "720p resolution",
      "Basic effects",
      "1 concurrent recording",
      "Community support",
    ],
    featuresAr: [
      "حد التسجيل 30 دقيقة",
      "دقة 720p",
      "تأثيرات أساسية",
      "تسجيل واحد في آن واحد",
      "دعم المجتمع",
    ],
  },
  {
    id: "pro",
    plan: "pro" as const,
    name: "Pro",
    nameAr: "احترافي",
    price: 9.99,
    priceYearly: 99,
    billingCycle: "monthly" as const,
    color: "#A78BFA",
    icon: "⚡",
    features: [
      "Unlimited recording",
      "1080p resolution",
      "Advanced AI effects",
      "2 concurrent recordings",
      "5GB cloud storage",
      "Priority support",
    ],
    featuresAr: [
      "تسجيل غير محدود",
      "دقة 1080p",
      "تأثيرات AI متقدمة",
      "تسجيلان في آن واحد",
      "5GB تخزين سحابي",
      "دعم متميز",
    ],
  },
  {
    id: "premium",
    plan: "premium" as const,
    name: "Premium",
    nameAr: "بريميوم",
    price: 19.99,
    priceYearly: 199,
    billingCycle: "monthly" as const,
    color: "#FCD34D",
    icon: "👑",
    features: [
      "Everything in Pro",
      "4K resolution",
      "Unlimited cloud storage",
      "Unlimited concurrent recordings",
      "Custom branding",
      "24/7 dedicated support",
      "Advanced analytics",
    ],
    featuresAr: [
      "كل مميزات احترافي",
      "دقة 4K",
      "تخزين سحابي غير محدود",
      "تسجيلات متعددة بلا حد",
      "علامة تجارية مخصصة",
      "دعم على مدار الساعة",
      "تحليلات متقدمة",
    ],
  },
];

export default function SubscriptionsScreen() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const { user } = useAuth();
  const [selectedBilling, setSelectedBilling] = useState<"monthly" | "yearly">("monthly");

  // ─── tRPC Queries ─────────────────────────────────────────────────────────
  const { data: currentSub, isLoading, refetch } = trpc.subscriptions.current.useQuery(
    undefined,
    { enabled: !!user }
  );

  // ─── tRPC Mutations ───────────────────────────────────────────────────────
  const subscribeMutation = trpc.subscriptions.subscribe.useMutation({
    onSuccess: (_data: any, variables: any) => {
      refetch();
      // Update NexarCore immediately so all screens reflect new plan
      nexarEvents.emit('subscription:upgraded', { plan: variables.plan });
      Alert.alert(
        ar ? "✅ تم الاشتراك!" : "✅ Subscribed!",
        ar ? "تم تفعيل اشتراكك بنجاح" : "Your subscription has been activated"
      );
    },
    onError: (err) => Alert.alert(ar ? "خطأ" : "Error", err.message),
  });

  const cancelMutation = trpc.subscriptions.cancel.useMutation({
    onSuccess: () => {
      refetch();
      nexarEvents.emit('subscription:upgraded', { plan: 'free' });
      Alert.alert(
        ar ? "تم الإلغاء" : "Cancelled",
        ar ? "تم إلغاء اشتراكك" : "Your subscription has been cancelled"
      );
    },
    onError: (err) => Alert.alert(ar ? "خطأ" : "Error", err.message),
  });

  const handleSubscribe = (planId: string, price: number) => {
    if (!user) {
      Alert.alert(ar ? "تسجيل الدخول مطلوب" : "Sign in required");
      return;
    }
    const plan = planId as "free" | "pro" | "premium";
    subscribeMutation.mutate({
      plan,
      price: selectedBilling === "yearly"
        ? PLANS.find((p) => p.id === planId)?.priceYearly ?? price
        : price,
      billingCycle: selectedBilling,
    });
  };

  const handleCancel = () => {
    Alert.alert(
      ar ? "إلغاء الاشتراك" : "Cancel Subscription",
      ar ? "هل تريد إلغاء اشتراكك الحالي؟" : "Are you sure you want to cancel?",
      [
        { text: ar ? "لا" : "No", style: "cancel" },
        {
          text: ar ? "نعم، إلغاء" : "Yes, Cancel",
          style: "destructive",
          onPress: () => cancelMutation.mutate(),
        },
      ]
    );
  };

  const activePlan = currentSub?.plan ?? "free";

  return (
    <ScreenContainer className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-6">

          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">
              {ar ? "خطط الاشتراك" : "Subscription Plans"}
            </Text>
            <Text className="text-sm text-muted mt-1">
              {ar ? "اختر الخطة المناسبة لك" : "Choose the plan that fits your needs"}
            </Text>
          </View>

          {/* Current Subscription Badge */}
          {user && !isLoading && currentSub && (
            <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4">
              <Text className="text-primary font-semibold text-sm mb-1">
                {ar ? "اشتراكك الحالي" : "Current Subscription"}
              </Text>
              <Text className="text-foreground font-bold text-lg capitalize">{currentSub.plan}</Text>
              <Text className="text-muted text-xs mt-1">
                {ar ? "الحالة:" : "Status:"} {currentSub.status}
              </Text>
              {currentSub.status === "active" && activePlan !== "free" && (
                <Pressable onPress={handleCancel} disabled={cancelMutation.isPending} className="mt-3 self-start">
                  <Text className="text-red-400 text-sm underline">
                    {cancelMutation.isPending
                      ? (ar ? "جاري الإلغاء..." : "Cancelling...")
                      : (ar ? "إلغاء الاشتراك" : "Cancel subscription")}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Billing Toggle */}
          <View className="flex-row gap-2 bg-surface rounded-xl p-1 border border-border">
            {(["monthly", "yearly"] as const).map((b) => (
              <Pressable
                key={b}
                onPress={() => setSelectedBilling(b)}
                className={`flex-1 py-2 rounded-lg ${selectedBilling === b ? "bg-primary" : ""}`}
              >
                <Text className={`text-sm font-semibold text-center ${selectedBilling === b ? "text-background" : "text-muted"}`}>
                  {b === "monthly"
                    ? (ar ? "شهري" : "Monthly")
                    : (ar ? "سنوي (-17%)" : "Yearly (-17%)")}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Plans */}
          <View className="gap-4">
            {PLANS.map((plan) => {
              const isActive = activePlan === plan.id;
              const price = selectedBilling === "yearly" ? plan.priceYearly : plan.price;
              return (
                <View
                  key={plan.id}
                  style={{
                    borderRadius: 20,
                    padding: 20,
                    borderWidth: isActive ? 2 : 1,
                    borderColor: isActive ? plan.color : "rgba(255,255,255,0.1)",
                    backgroundColor: isActive ? `${plan.color}12` : "rgba(255,255,255,0.03)",
                  }}
                >
                  {/* Plan Header */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-2">
                      <Text style={{ fontSize: 28 }}>{plan.icon}</Text>
                      <View>
                        <Text className="text-xl font-bold text-foreground">
                          {ar ? plan.nameAr : plan.name}
                        </Text>
                        {isActive && (
                          <View style={{ backgroundColor: plan.color, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start", marginTop: 2 }}>
                            <Text style={{ color: "#000", fontSize: 10, fontWeight: "900" }}>
                              {ar ? "✓ مفعّل" : "✓ ACTIVE"}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View className="items-end">
                      <Text style={{ fontSize: 28, fontWeight: "900", color: plan.color }}>
                        {price === 0 ? (ar ? "مجاني" : "Free") : `$${price}`}
                      </Text>
                      {price > 0 && (
                        <Text className="text-xs text-muted">
                          /{ar ? (selectedBilling === "monthly" ? "شهر" : "سنة") : selectedBilling.replace("ly", "")}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Features */}
                  <View className="gap-2 mb-4">
                    {(ar ? plan.featuresAr : plan.features).map((f, i) => (
                      <View key={i} className="flex-row items-center gap-2">
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: plan.color }} />
                        <Text className="text-sm text-foreground flex-1">{f}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Action */}
                  {!isActive && (
                    <Pressable
                      onPress={() => handleSubscribe(plan.id, plan.price)}
                      disabled={subscribeMutation.isPending}
                      style={{
                        backgroundColor: plan.color,
                        borderRadius: 12,
                        paddingVertical: 12,
                        alignItems: "center",
                        opacity: subscribeMutation.isPending ? 0.7 : 1,
                      }}
                    >
                      {subscribeMutation.isPending ? (
                        <ActivityIndicator color="#000" />
                      ) : (
                        <Text style={{ color: "#000", fontSize: 15, fontWeight: "800" }}>
                          {price === 0 ? (ar ? "ابدأ مجاناً" : "Start Free") : (ar ? "اشترك الآن" : "Subscribe Now")}
                        </Text>
                      )}
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>

          {/* Feature Comparison */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-lg font-bold text-foreground mb-4">
              {ar ? "مقارنة الميزات" : "Feature Comparison"}
            </Text>
            <View className="flex-row mb-2">
              <Text className="text-xs text-muted flex-1">{ar ? "الميزة" : "Feature"}</Text>
              <Text className="text-xs text-green-400 w-14 text-center">{ar ? "مجاني" : "Free"}</Text>
              <Text className="text-xs text-purple-400 w-14 text-center">Pro</Text>
              <Text className="text-xs text-yellow-400 w-16 text-center">Premium</Text>
            </View>
            {[
              { feature: ar ? "مدة التسجيل" : "Recording", free: "30m", pro: "∞", premium: "∞" },
              { feature: ar ? "الدقة" : "Resolution", free: "720p", pro: "1080p", premium: "4K" },
              { feature: ar ? "السحابة" : "Cloud", free: "✗", pro: "5GB", premium: "∞" },
              { feature: ar ? "الدعم" : "Support", free: "Community", pro: "Priority", premium: "24/7" },
              { feature: ar ? "العلامة التجارية" : "Branding", free: "✗", pro: "✗", premium: "✓" },
            ].map((row, i) => (
              <View key={i} className="flex-row items-center py-2.5 border-t border-border">
                <Text className="text-sm text-foreground flex-1">{row.feature}</Text>
                <Text className="text-xs text-muted w-14 text-center">{row.free}</Text>
                <Text className="text-xs text-muted w-14 text-center">{row.pro}</Text>
                <Text className="text-xs text-muted w-16 text-center">{row.premium}</Text>
              </View>
            ))}
          </View>

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
