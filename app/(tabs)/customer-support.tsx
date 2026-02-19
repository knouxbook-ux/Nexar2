// Copyright © Knoux. All rights reserved.
/**
 * 🎧 Customer Support
 * ✅ FIXED: tRPC حقيقي — لا FirebaseService.generateLicenseKey("user_123") — لا setTimeout وهمي
 */

import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLanguage } from "@/lib/language-context";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import * as Clipboard from "expo-clipboard";

export default function CustomerSupportScreen() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const { user } = useAuth();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState<
    "contact" | "key" | "ticket"
  >("contact");
  const [copiedKey, setCopiedKey] = useState(false);

  // ─── tRPC: توليد مفتاح ترخيص ──────────────────────────────────────────────
  const generateKeyMutation = trpc.licenses.generate.useMutation({
    onSuccess: () => {
      Alert.alert(
        ar ? "✅ تم التوليد" : "✅ Key Generated",
        ar
          ? "تم توليد مفتاحك — يمكنك نسخه الآن"
          : "Your license key was generated — copy it now",
      );
    },
    onError: (e) => Alert.alert(ar ? "خطأ" : "Error", e.message),
  });

  // ─── tRPC: إنشاء تذكرة دعم ────────────────────────────────────────────────
  const createTicketMutation = trpc.chat.startConversation.useMutation({
    onSuccess: () => {
      setSubject("");
      setMessage("");
      Alert.alert(
        ar ? "✅ تم الإرسال" : "✅ Ticket Created",
        ar
          ? "تم إنشاء تذكرة الدعم! سنرد عليك خلال 24 ساعة."
          : "Support ticket created! We'll reply within 24 hours.",
      );
    },
    onError: (e) => Alert.alert(ar ? "خطأ" : "Error", e.message),
  });

  const handleGenerateKey = () => {
    if (!user) {
      Alert.alert(ar ? "يرجى تسجيل الدخول" : "Sign in required", "");
      return;
    }
    generateKeyMutation.mutate({ plan: "pro", maxDevices: 1 });
  };

  const handleCopyKey = async (key: string) => {
    await Clipboard.setStringAsync(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSendTicket = () => {
    if (!user) {
      Alert.alert(ar ? "يرجى تسجيل الدخول" : "Sign in required", "");
      return;
    }
    if (!subject.trim() || !message.trim()) {
      Alert.alert(
        ar ? "خطأ" : "Error",
        ar ? "يرجى ملء الموضوع والرسالة" : "Please fill subject and message",
      );
      return;
    }
    createTicketMutation.mutate({
      subject: subject.trim(),
      initialMessage: message.trim(),
      category: "general",
    });
  };

  const SECTIONS = [
    {
      id: "contact" as const,
      label: ar ? "تواصل معنا" : "Quick Contact",
      icon: "📞",
    },
    {
      id: "key" as const,
      label: ar ? "مفتاح الترخيص" : "License Key",
      icon: "🔑",
    },
    {
      id: "ticket" as const,
      label: ar ? "تذكرة دعم" : "Support Ticket",
      icon: "🎫",
    },
  ];

  return (
    <ScreenContainer className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: "900", color: "#F3F4F6" }}>
            {ar ? "🎧 دعم العملاء" : "🎧 Customer Support"}
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 13, marginTop: 4 }}>
            {ar
              ? "نحن هنا لمساعدتك في أي وقت"
              : "We're here to help you anytime"}
          </Text>
        </View>

        {/* Section Tabs */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
          {SECTIONS.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => setActiveSection(s.id)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: "center",
                backgroundColor:
                  activeSection === s.id ? "#7C3AED" : "rgba(255,255,255,0.06)",
                borderWidth: 1,
                borderColor:
                  activeSection === s.id ? "#7C3AED" : "rgba(255,255,255,0.08)",
              }}
            >
              <Text style={{ fontSize: 18 }}>{s.icon}</Text>
              <Text
                style={{
                  color: activeSection === s.id ? "#fff" : "#9CA3AF",
                  fontSize: 10,
                  fontWeight: "700",
                  marginTop: 2,
                }}
              >
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Quick Contact */}
        {activeSection === "contact" && (
          <View style={{ gap: 12 }}>
            {[
              {
                icon: "💬",
                label: ar ? "واتساب — رد فوري" : "WhatsApp — Instant reply",
                color: "#25D366",
                onPress: () =>
                  Linking.openURL(
                    "https://wa.me/971503281920?text=" +
                      encodeURIComponent(
                        ar
                          ? "أحتاج مساعدة في Knoux Nexar Pro"
                          : "I need help with Knoux Nexar Pro",
                      ),
                  ),
              },
              {
                icon: "📧",
                label: ar ? "البريد الإلكتروني" : "Email Support",
                color: "#60A5FA",
                onPress: () =>
                  Linking.openURL(
                    "mailto:contact@knoux.io?subject=Nexar%20Pro%20Support",
                  ),
              },
              {
                icon: "🌐",
                label: ar ? "الموقع الرسمي" : "Official Website",
                color: "#A78BFA",
                onPress: () => Linking.openURL("https://knoux.io"),
              },
            ].map((item) => (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                style={{
                  backgroundColor: `${item.color}15`,
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: ar ? "row-reverse" : "row",
                  alignItems: "center",
                  gap: 14,
                  borderWidth: 1,
                  borderColor: `${item.color}30`,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: `${item.color}25`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                </View>
                <Text
                  style={{
                    flex: 1,
                    color: "#F3F4F6",
                    fontWeight: "700",
                    fontSize: 15,
                  }}
                >
                  {item.label}
                </Text>
                <Text style={{ color: item.color, fontSize: 18 }}>→</Text>
              </Pressable>
            ))}

            {/* Support Info */}
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                marginTop: 4,
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
                ℹ️ {ar ? "معلومات الدعم" : "Support Info"}
              </Text>
              {[
                {
                  icon: "⏰",
                  text: ar
                    ? "وقت الرد: خلال 24 ساعة"
                    : "Response time: Within 24 hours",
                },
                { icon: "📧", text: "contact@knoux.io" },
                { icon: "📱", text: "+971 50 328 1920" },
                {
                  icon: "📍",
                  text: ar ? "أبوظبي، الإمارات" : "Abu Dhabi, UAE",
                },
              ].map((info) => (
                <View
                  key={info.text}
                  style={{
                    flexDirection: ar ? "row-reverse" : "row",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{info.icon}</Text>
                  <Text style={{ color: "#D1D5DB", fontSize: 13 }}>
                    {info.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* License Key Section */}
        {activeSection === "key" && (
          <View style={{ gap: 14 }}>
            <View
              style={{
                backgroundColor: "rgba(124,58,237,0.08)",
                borderRadius: 18,
                padding: 18,
                borderWidth: 1,
                borderColor: "rgba(124,58,237,0.25)",
              }}
            >
              <Text
                style={{
                  color: "#A78BFA",
                  fontWeight: "800",
                  fontSize: 16,
                  marginBottom: 8,
                }}
              >
                🔑 {ar ? "طلب مفتاح ترخيص" : "Request License Key"}
              </Text>
              <Text
                style={{
                  color: "#9CA3AF",
                  fontSize: 13,
                  marginBottom: 16,
                  lineHeight: 20,
                }}
              >
                {ar
                  ? "اضغط على الزر أدناه لتوليد مفتاح ترخيص Pro خاص بك. يحتاج حساب مسجّل."
                  : "Press the button below to generate your Pro license key. Requires a registered account."}
              </Text>

              {!user ? (
                <View
                  style={{
                    backgroundColor: "rgba(239,68,68,0.1)",
                    borderRadius: 12,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: "rgba(239,68,68,0.2)",
                  }}
                >
                  <Text
                    style={{
                      color: "#FCA5A5",
                      fontSize: 13,
                      textAlign: "center",
                    }}
                  >
                    {ar
                      ? "⚠️ يرجى تسجيل الدخول أولاً لتوليد مفتاح"
                      : "⚠️ Please sign in first to generate a key"}
                  </Text>
                </View>
              ) : (
                <>
                  <Pressable
                    onPress={handleGenerateKey}
                    disabled={generateKeyMutation.isPending}
                    style={{
                      backgroundColor: "#7C3AED",
                      borderRadius: 14,
                      padding: 14,
                      alignItems: "center",
                      opacity: generateKeyMutation.isPending ? 0.7 : 1,
                    }}
                  >
                    {generateKeyMutation.isPending ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "800",
                          fontSize: 15,
                        }}
                      >
                        {ar ? "⚡ توليد مفتاح Pro" : "⚡ Generate Pro Key"}
                      </Text>
                    )}
                  </Pressable>

                  {generateKeyMutation.data && (
                    <View
                      style={{
                        backgroundColor: "rgba(16,185,129,0.1)",
                        borderRadius: 14,
                        padding: 16,
                        marginTop: 14,
                        borderWidth: 1,
                        borderColor: "rgba(16,185,129,0.3)",
                      }}
                    >
                      <Text
                        style={{
                          color: "#6B7280",
                          fontSize: 11,
                          marginBottom: 6,
                        }}
                      >
                        {ar ? "مفتاحك الجديد:" : "Your new key:"}
                      </Text>
                      <Text
                        style={{
                          color: "#10B981",
                          fontFamily: "monospace",
                          fontSize: 15,
                          fontWeight: "700",
                          letterSpacing: 1,
                          marginBottom: 12,
                        }}
                      >
                        {generateKeyMutation.data.key}
                      </Text>
                      <Pressable
                        onPress={() =>
                          handleCopyKey(generateKeyMutation.data!.key)
                        }
                        style={{
                          backgroundColor: "#10B981",
                          borderRadius: 10,
                          padding: 10,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#000", fontWeight: "800" }}>
                          {copiedKey
                            ? ar
                              ? "✅ تم النسخ!"
                              : "✅ Copied!"
                            : ar
                              ? "📋 نسخ المفتاح"
                              : "📋 Copy Key"}
                        </Text>
                      </Pressable>
                      <Text
                        style={{
                          color: "#6B7280",
                          fontSize: 11,
                          textAlign: "center",
                          marginTop: 8,
                        }}
                      >
                        {ar
                          ? "احتفظ بهذا المفتاح في مكان آمن."
                          : "Keep this key in a safe place."}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>

            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text
                style={{ color: "#9CA3AF", fontSize: 13, textAlign: "center" }}
              >
                {ar
                  ? "هل تحتاج مفتاح Premium أو مساعدة؟ تواصل عبر واتساب أو البريد الإلكتروني."
                  : "Need a Premium key or help? Contact us via WhatsApp or email."}
              </Text>
            </View>
          </View>
        )}

        {/* Support Ticket */}
        {activeSection === "ticket" && (
          <View style={{ gap: 14 }}>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderRadius: 18,
                padding: 18,
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
                🎫 {ar ? "إنشاء تذكرة دعم" : "Create Support Ticket"}
              </Text>

              {!user ? (
                <View
                  style={{
                    backgroundColor: "rgba(239,68,68,0.1)",
                    borderRadius: 12,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: "rgba(239,68,68,0.2)",
                  }}
                >
                  <Text
                    style={{
                      color: "#FCA5A5",
                      fontSize: 13,
                      textAlign: "center",
                    }}
                  >
                    {ar
                      ? "⚠️ يرجى تسجيل الدخول لإرسال تذكرة دعم"
                      : "⚠️ Please sign in to submit a support ticket"}
                  </Text>
                </View>
              ) : (
                <>
                  <TextInput
                    value={subject}
                    onChangeText={setSubject}
                    placeholder={ar ? "موضوع المشكلة..." : "Issue subject..."}
                    placeholderTextColor="#4B5563"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.3)",
                      borderRadius: 12,
                      padding: 14,
                      color: "#E5E7EB",
                      fontSize: 14,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.08)",
                      marginBottom: 10,
                    }}
                  />
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder={
                      ar
                        ? "اشرح مشكلتك بالتفصيل..."
                        : "Describe your issue in detail..."
                    }
                    placeholderTextColor="#4B5563"
                    multiline
                    numberOfLines={5}
                    style={{
                      backgroundColor: "rgba(0,0,0,0.3)",
                      borderRadius: 12,
                      padding: 14,
                      color: "#E5E7EB",
                      fontSize: 14,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.08)",
                      minHeight: 120,
                      textAlignVertical: "top",
                      marginBottom: 14,
                    }}
                  />
                  <Pressable
                    onPress={handleSendTicket}
                    disabled={createTicketMutation.isPending}
                    style={{
                      backgroundColor: "#7C3AED",
                      borderRadius: 14,
                      padding: 14,
                      alignItems: "center",
                      opacity: createTicketMutation.isPending ? 0.7 : 1,
                    }}
                  >
                    {createTicketMutation.isPending ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "800",
                          fontSize: 15,
                        }}
                      >
                        {ar ? "🚀 إرسال التذكرة" : "🚀 Submit Ticket"}
                      </Text>
                    )}
                  </Pressable>
                  <Text
                    style={{
                      color: "#6B7280",
                      fontSize: 11,
                      textAlign: "center",
                      marginTop: 10,
                    }}
                  >
                    {ar ? "سنرد على بريدك الإلكتروني: " : "We'll reply to: "}
                    <Text style={{ color: "#A78BFA" }}>{user.email}</Text>
                  </Text>
                </>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
