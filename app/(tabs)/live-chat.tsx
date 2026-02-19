// Copyright © Knoux. All rights reserved.
/**
 * 💬 KNOUX NEXAR PRO — Live Chat Support
 * دعم فوري: محادثات، بوت ذكي، قاعدة معرفة
 * مع polling حقيقي وتجربة محادثة كاملة
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { useLanguage } from "@/lib/language-context";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

const { width } = Dimensions.get("window");

// ─── أنواع ──────────────────────────────────────────────────────────────────
type MessageSender = "user" | "agent" | "bot";
type ConversationStatus = "open" | "in_progress" | "resolved" | "closed";
type ConversationPriority = "low" | "medium" | "high" | "urgent";

interface Message {
  id: string;
  content: string;
  sender: MessageSender;
  senderName: string;
  timestamp: Date;
  isRead: boolean;
}

interface Conversation {
  id: string;
  subject: string;
  status: ConversationStatus;
  priority: ConversationPriority;
  category: string;
  messages: Message[];
  createdAt: Date;
  lastMessage?: string;
  unreadCount: number;
}

interface KnowledgeArticle {
  id: string;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  category: string;
  helpful: number;
  views: number;
}

// ─── قاعدة المعرفة ──────────────────────────────────────────────────────────
const KNOWLEDGE_BASE: KnowledgeArticle[] = [
  {
    id: "k1",
    title: "How to start screen recording",
    titleAr: "كيف تبدأ تسجيل الشاشة",
    content:
      "Go to Screen Recording tab, grant permissions, then press Start Recording button. You can set resolution and FPS in settings.",
    contentAr:
      "انتقل لتبويب تسجيل الشاشة، امنح الصلاحيات المطلوبة، ثم اضغط زر بدء التسجيل. يمكنك ضبط الدقة وعدد الإطارات في الإعدادات.",
    category: "recording",
    helpful: 142,
    views: 890,
  },
  {
    id: "k2",
    title: "How to upgrade to Pro plan",
    titleAr: "كيف ترقّي لخطة Pro",
    content:
      "Visit the Subscriptions screen from Settings or the home page. Choose Pro or Premium, then complete payment via Apple Pay or Google Pay.",
    contentAr:
      "زر شاشة الاشتراكات من الإعدادات أو الصفحة الرئيسية. اختر Pro أو Premium، ثم أكمل الدفع عبر Apple Pay أو Google Pay.",
    category: "billing",
    helpful: 98,
    views: 567,
  },
  {
    id: "k3",
    title: "AI subtitle generation not working",
    titleAr: "توليد الترجمة AI لا يعمل",
    content:
      "Ensure you have a stable internet connection. AI subtitles require Pro or Premium plan. Check your subscription status in Settings.",
    contentAr:
      "تأكد من اتصال مستقر بالإنترنت. ترجمة AI تتطلب خطة Pro أو Premium. تحقق من حالة اشتراكك في الإعدادات.",
    category: "ai",
    helpful: 76,
    views: 432,
  },
  {
    id: "k4",
    title: "Cloud sync not working",
    titleAr: "المزامنة السحابية لا تعمل",
    content:
      "Check internet connection. Go to Cloud Sync screen and tap 'Sync Now'. Make sure auto-sync is enabled and storage quota is not full.",
    contentAr:
      "تحقق من الإنترنت. انتقل لشاشة Cloud Sync واضغط 'مزامنة الآن'. تأكد من تفعيل المزامنة التلقائية وأن حصة التخزين لم تنته.",
    category: "cloud",
    helpful: 54,
    views: 321,
  },
  {
    id: "k5",
    title: "How to export in 4K",
    titleAr: "كيف تصدّر بجودة 4K",
    content:
      "4K export requires Premium plan. In Video Editing screen, tap Export, select 4K quality, then tap Export Video. Process may take a few minutes.",
    contentAr:
      "تصدير 4K يتطلب خطة Premium. في شاشة تحرير الفيديو، اضغط تصدير، اختر جودة 4K، ثم اضغط تصدير الفيديو. قد تستغرق العملية بضع دقائق.",
    category: "editing",
    helpful: 121,
    views: 678,
  },
  {
    id: "k6",
    title: "How to activate a license key",
    titleAr: "كيف تفعّل مفتاح ترخيص",
    content:
      "Go to License Keys screen from the Billing section. Tap 'Activate', enter your key in the format XXXX-XXXX-XXXX-XXXX, then tap Activate Key.",
    contentAr:
      "انتقل لشاشة مفاتيح الترخيص من قسم الدفع. اضغط 'تفعيل'، أدخل مفتاحك بالصيغة XXXX-XXXX-XXXX-XXXX، ثم اضغط تفعيل المفتاح.",
    category: "billing",
    helpful: 43,
    views: 212,
  },
];

// ─── ردود البوت الذكي ────────────────────────────────────────────────────────
const BOT_RESPONSES: { keywords: string[]; reply: string; replyAr: string }[] =
  [
    {
      keywords: ["hello", "hi", "مرحبا", "هلا", "السلام"],
      reply:
        "Hello! 👋 I'm Nexar Assistant. How can I help you today? You can ask about recording, editing, subscriptions, or any other feature.",
      replyAr:
        "مرحباً! 👋 أنا مساعد Nexar. كيف يمكنني مساعدتك اليوم؟ يمكنك السؤال عن التسجيل، التحرير، الاشتراكات، أو أي ميزة أخرى.",
    },
    {
      keywords: ["record", "recording", "screen", "تسجيل", "شاشة"],
      reply:
        "📹 To start screen recording:\n1. Go to Screen Recording tab\n2. Grant required permissions\n3. Set resolution & FPS\n4. Press Start Recording\n\nNeed more help?",
      replyAr:
        "📹 لبدء تسجيل الشاشة:\n1. انتقل لتبويب تسجيل الشاشة\n2. امنح الصلاحيات المطلوبة\n3. اضبط الدقة وعدد الإطارات\n4. اضغط بدء التسجيل\n\nهل تحتاج مزيداً من المساعدة؟",
    },
    {
      keywords: [
        "subscription",
        "plan",
        "pro",
        "premium",
        "upgrade",
        "اشتراك",
        "خطة",
        "ترقية",
      ],
      reply:
        "💎 Our plans:\n• Free: Basic recording, 720p\n• Pro: 1080p, AI features, cloud sync\n• Premium: 4K, all features, priority support\n\nGo to Subscriptions to upgrade!",
      replyAr:
        "💎 خططنا:\n• مجاني: تسجيل أساسي، 720p\n• Pro: 1080p، ميزات AI، مزامنة سحابية\n• Premium: 4K، جميع الميزات، دعم أولوية\n\nانتقل للاشتراكات للترقية!",
    },
    {
      keywords: ["price", "cost", "how much", "سعر", "كم", "تكلفة"],
      reply:
        "💰 Pricing:\n• Free: $0/month\n• Pro: $9.99/month or $79.99/year\n• Premium: $19.99/month or $149.99/year\n\nYearly plans save up to 40%!",
      replyAr:
        "💰 الأسعار:\n• مجاني: $0/شهر\n• Pro: $9.99/شهر أو $79.99/سنة\n• Premium: $19.99/شهر أو $149.99/سنة\n\nالخطط السنوية توفر حتى 40%!",
    },
    {
      keywords: [
        "error",
        "problem",
        "issue",
        "not working",
        "bug",
        "خطأ",
        "مشكلة",
        "لا يعمل",
      ],
      reply:
        "🔧 Sorry to hear that! Please try:\n1. Restart the app\n2. Check your internet connection\n3. Update to the latest version\n\nIf it persists, I'll connect you with a human agent.",
      replyAr:
        "🔧 آسف لسماع ذلك! يُرجى:\n1. إعادة تشغيل التطبيق\n2. التحقق من الإنترنت\n3. التحديث للإصدار الأحدث\n\nإذا استمرت المشكلة، سأوصلك بأحد خبرائنا.",
    },
    {
      keywords: [
        "agent",
        "human",
        "support",
        "help",
        "وكيل",
        "إنسان",
        "دعم",
        "مساعدة",
      ],
      reply:
        "🧑‍💼 I'll connect you with a support agent now! Average wait time: 2-5 minutes. Our team is available 24/7.\n\nIn the meantime, check our Knowledge Base for instant answers.",
      replyAr:
        "🧑‍💼 سأوصلك بأحد خبراء الدعم الآن! متوسط وقت الانتظار: 2-5 دقائق. فريقنا متاح 24/7.\n\nفي غضون ذلك، تفقد قاعدة المعرفة للحصول على إجابات فورية.",
    },
    {
      keywords: ["4k", "resolution", "quality", "دقة", "جودة"],
      reply:
        "🎥 4K recording & export is available on Premium plan. 1080p is available on Pro. Free plan supports 720p.\n\nGo to Settings > Recording to change resolution.",
      replyAr:
        "🎥 تسجيل وتصدير 4K متاح في خطة Premium. 1080p متاح في Pro. الخطة المجانية تدعم 720p.\n\nانتقل للإعدادات > التسجيل لتغيير الدقة.",
    },
    {
      keywords: ["license", "key", "activate", "ترخيص", "مفتاح", "تفعيل"],
      reply:
        "🔑 To activate a license key:\n1. Go to License Keys screen\n2. Tap 'Activate' tab\n3. Enter your key (XXXX-XXXX-XXXX-XXXX format)\n4. Tap Activate Key\n\nNeed a key? Contact sales@knoux.io",
      replyAr:
        "🔑 لتفعيل مفتاح ترخيص:\n1. انتقل لشاشة مفاتيح الترخيص\n2. اضغط تبويب 'تفعيل'\n3. أدخل مفتاحك (بصيغة XXXX-XXXX-XXXX-XXXX)\n4. اضغط تفعيل المفتاح\n\nتحتاج مفتاح؟ تواصل مع sales@knoux.io",
    },
  ];

function getBotReply(input: string, ar: boolean): string {
  const lower = input.toLowerCase();
  for (const resp of BOT_RESPONSES) {
    if (resp.keywords.some((kw) => lower.includes(kw))) {
      return ar ? resp.replyAr : resp.reply;
    }
  }
  return ar
    ? "شكراً على رسالتك! 🤝 سأحاول مساعدتك. هل يمكنك توضيح سؤالك أكثر؟ أو يمكنني توصيلك بأحد خبراء الدعم البشري."
    : "Thanks for reaching out! 🤝 I'll try to help. Could you elaborate on your question? Or I can connect you with a human support agent.";
}

// ─── مكوّن رسالة ────────────────────────────────────────────────────────────
function MessageBubble({ msg, ar }: { msg: Message; ar: boolean }) {
  const isUser = msg.sender === "user";
  const isBot = msg.sender === "bot";
  const bubbleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(bubbleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: bubbleAnim,
        transform: [{ scale: bubbleAnim }],
        alignSelf: isUser
          ? ar
            ? "flex-start"
            : "flex-end"
          : ar
            ? "flex-end"
            : "flex-start",
        maxWidth: "80%",
        marginBottom: 12,
      }}
    >
      {!isUser && (
        <View
          style={{
            flexDirection: ar ? "row-reverse" : "row",
            alignItems: "center",
            gap: 6,
            marginBottom: 4,
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: isBot ? "#A78BFA" : "#10B981",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 12 }}>{isBot ? "🤖" : "🧑"}</Text>
          </View>
          <Text style={{ color: "#64748B", fontSize: 10, fontWeight: "600" }}>
            {msg.senderName}
          </Text>
          <Text style={{ color: "#475569", fontSize: 9 }}>
            {msg.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      )}
      <View
        style={{
          backgroundColor: isUser
            ? "#7C3AED"
            : isBot
              ? "rgba(167,139,250,0.15)"
              : "rgba(16,185,129,0.15)",
          borderRadius: 18,
          borderBottomRightRadius: isUser && !ar ? 4 : 18,
          borderBottomLeftRadius: isUser && ar ? 4 : 18,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: isUser
            ? "transparent"
            : isBot
              ? "rgba(167,139,250,0.3)"
              : "rgba(16,185,129,0.3)",
        }}
      >
        <Text
          style={{
            color: isUser ? "#fff" : "#F1F5F9",
            fontSize: 14,
            lineHeight: 20,
            textAlign: ar ? "right" : "left",
          }}
        >
          {msg.content}
        </Text>
      </View>
      {isUser && (
        <Text
          style={{
            color: "#475569",
            fontSize: 9,
            textAlign: ar ? "left" : "right",
            marginTop: 3,
            marginRight: 4,
          }}
        >
          {msg.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          {msg.isRead ? "✓✓" : "✓"}
        </Text>
      )}
    </Animated.View>
  );
}

// ─── الشاشة الرئيسية ────────────────────────────────────────────────────────
export default function LiveChatScreen() {
  const { language } = useLanguage();
  const ar = language === "ar";

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"chat" | "knowledge" | "tickets">(
    "chat",
  );
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: ar
        ? "مرحباً! 👋 أنا مساعد Nexar الذكي. كيف يمكنني مساعدتك اليوم؟"
        : "Hello! 👋 I'm Nexar AI Assistant. How can I help you today?",
      sender: "bot",
      senderName: "Nexar Bot",
      timestamp: new Date(),
      isRead: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [searchKnowledge, setSearchKnowledge] = useState("");
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [agentOnline] = useState(true);

  // ─── tRPC: Tickets (real backend) ─────────────────────────────────────────
  const {
    data: tickets = [],
    isLoading: loadingTickets,
    refetch: refetchTickets,
  } = trpc.chat.myConversations.useQuery(undefined, {
    enabled: !!user && activeTab === "tickets",
  });

  const createTicketMutation = trpc.chat.startConversation.useMutation({
    onSuccess: () => {
      refetchTickets();
      setNewTicketSubject("");
      setShowNewTicket(false);
      if (Platform.OS !== "web")
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (err) => Alert.alert(ar ? "خطأ" : "Error", err.message),
  });

  const scrollRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString(),
      content: trimmed,
      sender: "user",
      senderName: ar ? "أنت" : "You",
      timestamp: new Date(),
      isRead: false,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsBotTyping(true);

    // محاكاة تأخر البوت
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const reply = getBotReply(trimmed, ar);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: reply,
        sender: "bot",
        senderName: "Nexar Bot",
        timestamp: new Date(),
        isRead: true,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsBotTyping(false);
      // تحديث قراءة رسالة المستخدم
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsg.id ? { ...m, isRead: true } : m)),
      );
    }, delay);
  }, [input, ar]);

  const createTicket = () => {
    if (!newTicketSubject.trim()) return;
    if (!user) {
      Alert.alert(ar ? "يرجى تسجيل الدخول أولاً" : "Please sign in first");
      return;
    }
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createTicketMutation.mutate({
      subject: newTicketSubject.trim(),
      category: "general",
      priority: "medium",
    });
  };

  // فلترة قاعدة المعرفة
  const filteredArticles = KNOWLEDGE_BASE.filter((a) => {
    const q = searchKnowledge.toLowerCase();
    return (
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.titleAr.includes(q) ||
      a.category.includes(q)
    );
  });

  const TABS = [
    { key: "chat" as const, icon: "💬", labelAr: "محادثة", labelEn: "Chat" },
    {
      key: "knowledge" as const,
      icon: "📚",
      labelAr: "معرفة",
      labelEn: "Knowledge",
    },
    {
      key: "tickets" as const,
      icon: "🎫",
      labelAr: "التذاكر",
      labelEn: "Tickets",
    },
  ];

  return (
    <ScreenContainer className="flex-1">
      {/* ── الهيدر ──────────────────────────────────────────────────────── */}
      <LinearGradient
        colors={["#1a0533", "#0a0a1a"]}
        style={{ paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 }}
      >
        <View
          style={{
            flexDirection: ar ? "row-reverse" : "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              style={{
                color: "#00CED1",
                fontSize: 22,
                fontWeight: "900",
                textAlign: ar ? "right" : "left",
              }}
            >
              💬 {ar ? "الدعم المباشر" : "Live Support"}
            </Text>
            <View
              style={{
                flexDirection: ar ? "row-reverse" : "row",
                alignItems: "center",
                gap: 6,
                marginTop: 4,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: agentOnline ? "#10B981" : "#EF4444",
                }}
              />
              <Text style={{ color: "#64748B", fontSize: 11 }}>
                {agentOnline
                  ? ar
                    ? "وكلاء متاحون الآن"
                    : "Agents online now"
                  : ar
                    ? "خارج الدوام"
                    : "Currently offline"}
              </Text>
            </View>
          </View>
          <View
            style={{
              backgroundColor: "rgba(0,206,209,0.15)",
              borderRadius: 14,
              padding: 10,
              borderWidth: 1,
              borderColor: "rgba(0,206,209,0.3)",
            }}
          >
            <Text style={{ color: "#00CED1", fontSize: 11, fontWeight: "700" }}>
              24/7
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── التبويبات ──────────────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: ar ? "row-reverse" : "row",
          backgroundColor: "#0f0f18",
          borderBottomWidth: 1,
          borderColor: "#1e1e2e",
        }}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.selectionAsync();
              setActiveTab(tab.key);
            }}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              borderBottomWidth: activeTab === tab.key ? 2 : 0,
              borderBottomColor: "#00CED1",
            }}
          >
            <Text style={{ fontSize: 18 }}>{tab.icon}</Text>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                marginTop: 2,
                color: activeTab === tab.key ? "#00CED1" : "#475569",
              }}
            >
              {ar ? tab.labelAr : tab.labelEn}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ══ المحادثة ════════════════════════════════════════════════════ */}
      {activeTab === "chat" && (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={90}
        >
          {/* الرسائل */}
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} ar={ar} />
            ))}
            {isBotTyping && (
              <View
                style={{
                  flexDirection: ar ? "row-reverse" : "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: "#A78BFA",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 12 }}>🤖</Text>
                </View>
                <View
                  style={{
                    backgroundColor: "rgba(167,139,250,0.15)",
                    borderRadius: 18,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  }}
                >
                  <View style={{ flexDirection: "row", gap: 4 }}>
                    {[0, 1, 2].map((i) => (
                      <View
                        key={i}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: "#A78BFA",
                          opacity: 0.6 + i * 0.2,
                        }}
                      />
                    ))}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* اقتراحات سريعة */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ backgroundColor: "#0a0a1a", maxHeight: 44 }}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              gap: 8,
              alignItems: "center",
            }}
          >
            {(ar
              ? [
                  "كيف أبدأ التسجيل؟",
                  "ما هي الأسعار؟",
                  "مشكلة في التطبيق",
                  "تحدث مع وكيل",
                ]
              : [
                  "How to record?",
                  "What are the prices?",
                  "App not working",
                  "Talk to an agent",
                ]
            ).map((q) => (
              <TouchableOpacity
                key={q}
                onPress={() => {
                  setInput(q);
                }}
                style={{
                  backgroundColor: "rgba(0,206,209,0.1)",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: "rgba(0,206,209,0.25)",
                }}
              >
                <Text
                  style={{ color: "#00CED1", fontSize: 11, fontWeight: "600" }}
                >
                  {q}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* حقل الإدخال */}
          <View
            style={{
              flexDirection: ar ? "row-reverse" : "row",
              alignItems: "flex-end",
              padding: 12,
              backgroundColor: "#0a0a1a",
              gap: 10,
              borderTopWidth: 1,
              borderColor: "#1e1e2e",
            }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={ar ? "اكتب رسالتك..." : "Type your message..."}
              placeholderTextColor="#475569"
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
              style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 22,
                paddingHorizontal: 16,
                paddingVertical: 10,
                color: "#F1F5F9",
                fontSize: 14,
                maxHeight: 100,
                textAlign: ar ? "right" : "left",
                borderWidth: 1,
                borderColor: "#1e1e30",
              }}
            />
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!input.trim() || isBotTyping}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: input.trim() ? "#00CED1" : "#1e1e30",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons
                name="send"
                size={20}
                color={input.trim() ? "#0a0a1a" : "#475569"}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* ══ قاعدة المعرفة ══════════════════════════════════════════════ */}
      {activeTab === "knowledge" && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {/* بحث */}
          <View
            style={{
              flexDirection: ar ? "row-reverse" : "row",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 14,
              paddingHorizontal: 14,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "#1e1e30",
            }}
          >
            <MaterialIcons name="search" size={20} color="#64748B" />
            <TextInput
              value={searchKnowledge}
              onChangeText={setSearchKnowledge}
              placeholder={ar ? "ابحث في المقالات..." : "Search articles..."}
              placeholderTextColor="#475569"
              style={{
                flex: 1,
                color: "#F1F5F9",
                paddingVertical: 12,
                paddingHorizontal: 10,
                fontSize: 14,
                textAlign: ar ? "right" : "left",
              }}
            />
          </View>

          {filteredArticles.map((article) => (
            <TouchableOpacity
              key={article.id}
              onPress={() => {
                if (Platform.OS !== "web")
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab("chat");
                setInput(ar ? article.titleAr : article.title);
              }}
              activeOpacity={0.8}
            >
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: "#1e1e30",
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
                  <Text
                    style={{
                      color: "#F1F5F9",
                      fontWeight: "700",
                      fontSize: 14,
                      flex: 1,
                      textAlign: ar ? "right" : "left",
                    }}
                  >
                    {ar ? article.titleAr : article.title}
                  </Text>
                  <View
                    style={{
                      backgroundColor: "rgba(0,206,209,0.15)",
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      marginLeft: ar ? 0 : 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "#00CED1",
                        fontSize: 9,
                        fontWeight: "700",
                      }}
                    >
                      {article.category.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    color: "#64748B",
                    fontSize: 12,
                    lineHeight: 18,
                    textAlign: ar ? "right" : "left",
                  }}
                  numberOfLines={3}
                >
                  {ar ? article.contentAr : article.content}
                </Text>
                <View
                  style={{
                    flexDirection: ar ? "row-reverse" : "row",
                    gap: 16,
                    marginTop: 10,
                  }}
                >
                  <Text style={{ color: "#475569", fontSize: 11 }}>
                    👁️ {article.views}
                  </Text>
                  <Text style={{ color: "#475569", fontSize: 11 }}>
                    👍 {article.helpful}
                  </Text>
                  <Text
                    style={{
                      color: "#00CED1",
                      fontSize: 11,
                      fontWeight: "600",
                    }}
                  >
                    {ar ? "اقرأ المزيد ←" : "Read more →"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredArticles.length === 0 && (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>🔍</Text>
              <Text style={{ color: "#64748B" }}>
                {ar ? "لا توجد مقالات مطابقة" : "No matching articles"}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ══ التذاكر ════════════════════════════════════════════════════ */}
      {activeTab === "tickets" && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {/* زر تذكرة جديدة */}
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS !== "web")
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowNewTicket(!showNewTicket);
            }}
            style={{ marginBottom: 16 }}
          >
            <LinearGradient
              colors={["#00CED1", "#0099A8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 14,
                padding: 16,
                flexDirection: ar ? "row-reverse" : "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
              }}
            >
              <MaterialIcons name="add" size={20} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>
                {ar ? "فتح تذكرة دعم جديدة" : "Open New Support Ticket"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* نموذج تذكرة جديدة */}
          {showNewTicket && (
            <View
              style={{
                backgroundColor: "rgba(0,206,209,0.07)",
                borderRadius: 18,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "rgba(0,206,209,0.2)",
              }}
            >
              <Text
                style={{
                  color: "#00CED1",
                  fontWeight: "700",
                  fontSize: 14,
                  marginBottom: 10,
                  textAlign: ar ? "right" : "left",
                }}
              >
                🎫 {ar ? "تذكرة جديدة" : "New Ticket"}
              </Text>
              <TextInput
                value={newTicketSubject}
                onChangeText={setNewTicketSubject}
                placeholder={ar ? "موضوع المشكلة..." : "Describe your issue..."}
                placeholderTextColor="#475569"
                style={{
                  backgroundColor: "rgba(0,0,0,0.2)",
                  borderRadius: 12,
                  padding: 12,
                  color: "#F1F5F9",
                  fontSize: 13,
                  textAlign: ar ? "right" : "left",
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: "#1e1e30",
                }}
              />
              <View
                style={{ flexDirection: ar ? "row-reverse" : "row", gap: 10 }}
              >
                <TouchableOpacity
                  onPress={createTicket}
                  style={{
                    flex: 1,
                    backgroundColor: "#00CED1",
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#0a0a1a",
                      fontWeight: "800",
                      fontSize: 13,
                    }}
                  >
                    {ar ? "إرسال" : "Submit"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowNewTicket(false)}
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(255,255,255,0.07)",
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#64748B",
                      fontWeight: "700",
                      fontSize: 13,
                    }}
                  >
                    {ar ? "إلغاء" : "Cancel"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* قائمة التذاكر */}
          {loadingTickets ? (
            <ActivityIndicator
              size="large"
              color="#00CED1"
              style={{ marginTop: 40 }}
            />
          ) : tickets.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 50 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🎫</Text>
              <Text
                style={{ color: "#64748B", fontSize: 15, fontWeight: "600" }}
              >
                {ar ? "لا توجد تذاكر بعد" : "No tickets yet"}
              </Text>
              <Text
                style={{
                  color: "#475569",
                  fontSize: 12,
                  marginTop: 6,
                  textAlign: "center",
                }}
              >
                {ar
                  ? "افتح تذكرة لتتبع مشكلتك"
                  : "Open a ticket to track your issue"}
              </Text>
            </View>
          ) : (
            tickets.map((ticket: any) => (
              <View
                key={ticket.id}
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: "#1e1e30",
                }}
              >
                <View
                  style={{
                    flexDirection: ar ? "row-reverse" : "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#F1F5F9",
                      fontWeight: "700",
                      fontSize: 14,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {ticket.subject}
                  </Text>
                  <View
                    style={{
                      backgroundColor: "rgba(0,206,209,0.15)",
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      marginLeft: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "#00CED1",
                        fontSize: 10,
                        fontWeight: "700",
                      }}
                    >
                      {ticket.status?.toUpperCase() ?? "OPEN"}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: ar ? "row-reverse" : "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "#64748B", fontSize: 11 }}>
                    {ticket.category ?? "general"}
                  </Text>
                  <Text style={{ color: "#475569", fontSize: 11 }}>
                    {ticket.createdAt
                      ? new Date(ticket.createdAt).toLocaleDateString()
                      : "—"}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
