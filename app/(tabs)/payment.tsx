// Copyright © Knoux. All rights reserved.
/**
 * 💳 Billing & Payments
 * ✅ FIXED: متصل بـ tRPC backend الحقيقي — لا hardcoded IDs
 */

import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLanguage } from "@/lib/language-context";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

export default function PaymentScreen() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"history" | "new">("history");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "paypal" | "bank_transfer"
  >("card");
  const [transactionId, setTransactionId] = useState("");

  // ─── tRPC Queries (real backend data) ─────────────────────────────────────
  const {
    data: payments,
    isLoading: loadingPayments,
    refetch,
  } = trpc.payments.list.useQuery({ limit: 20 }, { enabled: !!user });

  const { data: stats } = trpc.payments.stats.useQuery(undefined, {
    enabled: !!user,
  });

  // ─── tRPC Mutations ───────────────────────────────────────────────────────
  const createPaymentMutation = trpc.payments.create.useMutation({
    onSuccess: () => {
      refetch();
      setAmount("");
      setTransactionId("");
      Alert.alert(
        ar ? "✅ نجاح" : "✅ Success",
        ar ? "تم تسجيل الدفعة بنجاح" : "Payment recorded successfully",
      );
      setActiveTab("history");
    },
    onError: (err) => Alert.alert(ar ? "خطأ" : "Error", err.message),
  });

  const handleCreatePayment = () => {
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(
        ar ? "خطأ" : "Error",
        ar ? "أدخل مبلغاً صحيحاً" : "Enter a valid amount",
      );
      return;
    }
    createPaymentMutation.mutate({
      amount: Math.round(parsedAmount * 100), // store in cents
      currency: "USD",
      paymentMethod,
      transactionId: transactionId.trim() || undefined,
    });
  };

  const statusStyles: Record<string, { color: string; bg: string }> = {
    completed: { color: "#10B981", bg: "rgba(16,185,129,0.15)" },
    failed: { color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
    refunded: { color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
    pending: { color: "#60A5FA", bg: "rgba(96,165,250,0.15)" },
  };

  if (!user) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center p-6">
        <Text className="text-5xl mb-4">🔒</Text>
        <Text className="text-foreground text-lg font-semibold mb-2">
          {ar ? "يرجى تسجيل الدخول" : "Sign in required"}
        </Text>
        <Text className="text-muted text-sm text-center">
          {ar ? "سجّل دخولك لعرض مدفوعاتك" : "Sign in to view your payments"}
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">
              {ar ? "الفواتير والمدفوعات" : "Billing & Payments"}
            </Text>
            <Text className="text-sm text-muted mt-1">
              {ar ? "تتبع مدفوعاتك المالية" : "Track your financial payments"}
            </Text>
          </View>

          {/* Stats */}
          {stats && (
            <View className="flex-row gap-3">
              <View className="flex-1 bg-primary/10 rounded-2xl p-4 border border-primary/30">
                <Text className="text-xs text-primary font-semibold mb-1">
                  {ar ? "الإجمالي" : "Total"}
                </Text>
                <Text className="text-2xl font-bold text-primary">
                  {stats.total ?? 0}
                </Text>
              </View>
              <View
                className="flex-1 rounded-2xl p-4 border"
                style={{
                  backgroundColor: "rgba(16,185,129,0.1)",
                  borderColor: "rgba(16,185,129,0.3)",
                }}
              >
                <Text
                  className="text-xs font-semibold mb-1"
                  style={{ color: "#10B981" }}
                >
                  {ar ? "مكتملة" : "Completed"}
                </Text>
                <Text
                  className="text-2xl font-bold"
                  style={{ color: "#10B981" }}
                >
                  {stats.completed ?? 0}
                </Text>
              </View>
              <View
                className="flex-1 rounded-2xl p-4 border"
                style={{
                  backgroundColor: "rgba(245,158,11,0.1)",
                  borderColor: "rgba(245,158,11,0.3)",
                }}
              >
                <Text
                  className="text-xs font-semibold mb-1"
                  style={{ color: "#F59E0B" }}
                >
                  {ar ? "معلقة" : "Pending"}
                </Text>
                <Text
                  className="text-2xl font-bold"
                  style={{ color: "#F59E0B" }}
                >
                  {stats.pending ?? 0}
                </Text>
              </View>
            </View>
          )}

          {/* Tabs */}
          <View className="flex-row gap-2 bg-surface rounded-xl p-1 border border-border">
            {(["history", "new"] as const).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg ${activeTab === tab ? "bg-primary" : ""}`}
              >
                <Text
                  className={`text-sm font-semibold text-center ${activeTab === tab ? "text-background" : "text-foreground"}`}
                >
                  {tab === "history"
                    ? ar
                      ? "السجل"
                      : "History"
                    : ar
                      ? "دفعة جديدة"
                      : "New Payment"}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* History Tab */}
          {activeTab === "history" && (
            <View className="gap-3">
              {loadingPayments ? (
                <ActivityIndicator
                  size="large"
                  color="#A78BFA"
                  className="py-8"
                />
              ) : !payments?.length ? (
                <View className="bg-surface rounded-2xl p-10 border border-border items-center gap-2">
                  <Text className="text-4xl">💳</Text>
                  <Text className="text-muted text-sm text-center">
                    {ar ? "لا توجد مدفوعات بعد" : "No payments yet"}
                  </Text>
                </View>
              ) : (
                payments.map((payment) => {
                  const s =
                    statusStyles[payment.status] ?? statusStyles.pending;
                  return (
                    <View
                      key={payment.id}
                      className="bg-surface rounded-2xl p-4 border border-border"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-foreground capitalize">
                            {payment.paymentMethod.replace(/_/g, " ")}
                          </Text>
                          <Text className="text-xs text-muted mt-0.5">
                            {new Date(payment.createdAt).toLocaleDateString(
                              ar ? "ar-SA" : "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </Text>
                          {payment.transactionId && (
                            <Text
                              className="text-xs text-muted font-mono mt-0.5"
                              numberOfLines={1}
                            >
                              {payment.transactionId}
                            </Text>
                          )}
                        </View>
                        <View className="items-end gap-1">
                          <Text className="text-lg font-bold text-primary">
                            ${(payment.amount / 100).toFixed(2)}
                          </Text>
                          <View
                            style={{
                              backgroundColor: s.bg,
                              borderRadius: 6,
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                            }}
                          >
                            <Text
                              style={{
                                color: s.color,
                                fontSize: 11,
                                fontWeight: "700",
                              }}
                            >
                              {payment.status.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* New Payment Tab */}
          {activeTab === "new" && (
            <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
              <Text className="text-lg font-semibold text-foreground">
                {ar ? "تسجيل دفعة جديدة" : "Record New Payment"}
              </Text>

              <View className="gap-1.5">
                <Text className="text-sm font-medium text-muted">
                  {ar ? "المبلغ (USD)" : "Amount (USD)"}
                </Text>
                <TextInput
                  placeholder="0.00"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  className="bg-background rounded-xl p-3.5 text-foreground border border-border"
                  placeholderTextColor="#555"
                />
              </View>

              <View className="gap-1.5">
                <Text className="text-sm font-medium text-muted">
                  {ar ? "طريقة الدفع" : "Payment Method"}
                </Text>
                <View className="flex-row gap-2">
                  {(["card", "paypal", "bank_transfer"] as const).map((m) => (
                    <Pressable
                      key={m}
                      onPress={() => setPaymentMethod(m)}
                      className={`flex-1 py-2.5 rounded-xl border items-center ${paymentMethod === m ? "bg-primary border-primary" : "bg-background border-border"}`}
                    >
                      <Text
                        className={`text-xs font-bold ${paymentMethod === m ? "text-background" : "text-foreground"}`}
                      >
                        {m === "bank_transfer"
                          ? "Bank"
                          : m === "paypal"
                            ? "PayPal"
                            : "Card"}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="gap-1.5">
                <Text className="text-sm font-medium text-muted">
                  {ar ? "رقم المعاملة (اختياري)" : "Transaction ID (optional)"}
                </Text>
                <TextInput
                  placeholder="txn_..."
                  value={transactionId}
                  onChangeText={setTransactionId}
                  className="bg-background rounded-xl p-3.5 text-foreground border border-border font-mono text-sm"
                  placeholderTextColor="#555"
                  autoCapitalize="none"
                />
              </View>

              <Pressable
                onPress={handleCreatePayment}
                disabled={createPaymentMutation.isPending}
                className={`py-4 rounded-xl items-center ${createPaymentMutation.isPending ? "bg-gray-600" : "bg-primary"}`}
              >
                {createPaymentMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-base font-bold text-background">
                    {ar ? "تسجيل الدفعة" : "Record Payment"}
                  </Text>
                )}
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
