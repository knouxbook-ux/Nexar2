// Copyright © Knoux. All rights reserved.
/**
 * 💬 KNOUX NEXAR PRO — Live Chat & Community
 * دردشة مباشرة مع فريق Knoux + مجتمع المستخدمين
 */
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

interface Message {
  id: string;
  text: string;
  sender: "user" | "support" | "knoux";
  senderName: string;
  time: string;
  status?: "sending" | "sent" | "delivered";
  isTyping?: boolean;
}

const WELCOME_MESSAGES: Message[] = [
  {
    id: "0",
    text: "👋 مرحباً بك في Knoux Nexar Pro!\nنحن هنا لمساعدتك. كيف يمكننا خدمتك؟",
    sender: "knoux",
    senderName: "⚡ Knoux Support",
    time: new Date().toLocaleTimeString("ar", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    status: "delivered",
  },
  {
    id: "1",
    text: "🚀 يمكنك:\n• الاستفسار عن المميزات\n• الإبلاغ عن مشكلة\n• طلب الدعم التقني\n• اقتراح ميزة جديدة",
    sender: "knoux",
    senderName: "⚡ Knoux Support",
    time: new Date().toLocaleTimeString("ar", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    status: "delivered",
  },
];

const QUICK_REPLIES = [
  "🎬 استفسار عن التسجيل",
  "💳 سؤال عن الاشتراك",
  "🐛 الإبلاغ عن مشكلة",
  "💡 اقتراح ميزة",
  "🔑 مشكلة في الترخيص",
];

const SUPPORT_RESPONSES: Record<string, string> = {
  تسجيل:
    "📹 يدعم Nexar Pro التسجيل بدقة تصل إلى 8K بمعدل 120fps. تحتاج إلى اشتراك Pro أو Premium للوصول لأعلى الدقات.",
  اشتراك:
    "💳 تتوفر ثلاثة خطط:\n• مجاني: 720p، 30 دقيقة\n• Pro (9.99$/شهر): 1080p، غير محدود\n• Premium (19.99$/شهر): 4K/8K + كل المميزات",
  مشكلة:
    "🔧 شكراً لإبلاغك! يرجى وصف المشكلة بالتفصيل وسيتواصل معك فريقنا خلال 24 ساعة على support@nexarpro.app",
  ترخيص:
    "🔑 يمكنك إدارة مفاتيح الترخيص من: الرئيسية ← License Keys. إذا واجهت مشكلة، يرجى مشاركة مفتاحك معنا.",
  ميزة: "💡 شكراً لاقتراحك! نحن دائماً نطور التطبيق. يمكنك متابعة التحديثات على nexarpro.app",
};

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(WELCOME_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAutoReply = (text: string): string => {
    const lower = text.toLowerCase();
    for (const [key, reply] of Object.entries(SUPPORT_RESPONSES)) {
      if (lower.includes(key)) return reply;
    }
    return "🤖 استلمنا رسالتك! سيرد عليك أحد أفراد فريق Knoux قريباً.\n\nللتواصل المباشر: support@nexarpro.app";
  };

  const sendMessage = useCallback(
    async (text?: string) => {
      const msg = (text ?? inputText).trim();
      if (!msg) return;
      if (Platform.OS !== "web")
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const now = new Date().toLocaleTimeString("ar", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const userMsg: Message = {
        id: Date.now().toString(),
        text: msg,
        sender: "user",
        senderName: "أنت",
        time: now,
        status: "sending",
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputText("");
      setIsSending(true);

      // Simulate message sent
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMsg.id ? { ...m, status: "delivered" } : m,
          ),
        );
      }, 500);

      // Show typing indicator
      setTimeout(() => setIsTyping(true), 800);

      // Auto reply after delay
      setTimeout(() => {
        setIsTyping(false);
        setIsSending(false);
        const replyMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: getAutoReply(msg),
          sender: "knoux",
          senderName: "⚡ Knoux Support",
          time: new Date().toLocaleTimeString("ar", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "delivered",
        };
        setMessages((prev) => [...prev, replyMsg]);
      }, 2200);
    },
    [inputText],
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user";
    return (
      <View
        style={[
          styles.messageWrapper,
          isUser ? styles.userWrapper : styles.otherWrapper,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarCircle}>
            <Text style={{ fontSize: 14 }}>⚡</Text>
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.otherBubble,
          ]}
        >
          {!isUser && <Text style={styles.senderName}>{item.senderName}</Text>}
          <Text style={styles.msgText}>{item.text}</Text>
          <View style={styles.msgMeta}>
            <Text style={styles.msgTime}>{item.time}</Text>
            {isUser && (
              <Text
                style={{
                  color: item.status === "delivered" ? "#A78BFA" : "#6b7280",
                  fontSize: 11,
                  marginLeft: 4,
                }}
              >
                {item.status === "delivered" ? "✓✓" : "✓"}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {/* Background gradient */}
      <LinearGradient
        colors={["#07070f", "#0f0a1a", "#07070f"]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Text style={{ color: "#A78BFA", fontSize: 22 }}>←</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={styles.headerTitle}>💬 Nexar Support</Text>
              <View style={styles.onlineIndicator}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>
                  متصل الآن · عادةً يرد خلال دقائق
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() =>
                Alert.alert("📧 تواصل بالبريد", "support@nexarpro.app")
              }
              style={styles.emailBtn}
            >
              <Text style={{ fontSize: 20 }}>📧</Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
          >
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={
                isTyping ? (
                  <View style={[styles.otherWrapper, { marginBottom: 8 }]}>
                    <View style={styles.avatarCircle}>
                      <Text style={{ fontSize: 14 }}>⚡</Text>
                    </View>
                    <View
                      style={[
                        styles.bubble,
                        styles.otherBubble,
                        { paddingVertical: 12, paddingHorizontal: 16 },
                      ]}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 5,
                          alignItems: "center",
                        }}
                      >
                        {[0, 1, 2].map((i) => (
                          <Animated.View key={i} style={styles.typingDot} />
                        ))}
                        <Text
                          style={{
                            color: "#9CA3AF",
                            fontSize: 12,
                            marginLeft: 4,
                          }}
                        >
                          يكتب...
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : null
              }
            />

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <View>
                <FlatList
                  data={QUICK_REPLIES}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 16,
                    gap: 8,
                    paddingVertical: 8,
                  }}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => sendMessage(item)}
                      style={styles.quickReply}
                    >
                      <Text style={styles.quickReplyText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Input Bar */}
            <BlurView intensity={60} tint="dark" style={styles.inputBar}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="اكتب رسالتك..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                textAlign="right"
                onSubmitEditing={() => sendMessage()}
              />
              <TouchableOpacity
                onPress={() => sendMessage()}
                disabled={!inputText.trim() || isSending}
                style={styles.sendBtn}
              >
                <LinearGradient
                  colors={
                    inputText.trim()
                      ? ["#7C3AED", "#EC4899"]
                      : ["#27272a", "#27272a"]
                  }
                  style={styles.sendBtnGrad}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={{ fontSize: 18, color: "#fff" }}>➤</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </KeyboardAvoidingView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(10,10,20,0.9)",
  },
  backBtn: { width: 40, alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
  onlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 3,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4ade80",
  },
  onlineText: { color: "#6B7280", fontSize: 10 },
  emailBtn: { width: 40, alignItems: "center" },
  messagesList: { padding: 16, gap: 12, paddingBottom: 8 },
  messageWrapper: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  userWrapper: { justifyContent: "flex-end" },
  otherWrapper: { justifyContent: "flex-start" },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(124,58,237,0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.4)",
  },
  bubble: { maxWidth: "75%", borderRadius: 18, padding: 12, gap: 4 },
  userBubble: {
    backgroundColor: "rgba(124,58,237,0.35)",
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.3)",
  },
  otherBubble: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  senderName: {
    color: "#A78BFA",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  msgText: { color: "#fff", fontSize: 14, lineHeight: 20 },
  msgMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 2,
  },
  msgTime: { color: "rgba(255,255,255,0.35)", fontSize: 10 },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#A78BFA",
    opacity: 0.7,
  },
  quickReply: {
    backgroundColor: "rgba(124,58,237,0.2)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.3)",
  },
  quickReplyText: { color: "#A78BFA", fontSize: 12, fontWeight: "600" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  sendBtn: { width: 42, height: 42, borderRadius: 21, overflow: "hidden" },
  sendBtnGrad: { flex: 1, alignItems: "center", justifyContent: "center" },
});
