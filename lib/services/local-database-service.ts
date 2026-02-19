// Copyright © Knoux. All rights reserved.
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface Recording {
  id: number;
  userId: number;
  title: string;
  duration: number;
  resolution: "720p" | "1080p" | "4K";
  views: number;
  likes: number;
  createdAt: string;
}

export interface Session {
  id: number;
  userId: number;
  type: "recording" | "streaming" | "editing";
  duration: number;
  status: "active" | "completed" | "failed";
  createdAt: string;
}

export interface Analytics {
  id: number;
  userId: number;
  recordingCount: number;
  totalDuration: number;
  viewsReceived: number;
  engagementRate: number;
  date: string;
}

export interface Subscription {
  id: number;
  userId: number;
  plan: "free" | "pro" | "premium";
  status: "active" | "cancelled" | "expired";
  price: number;
  billingCycle: "monthly" | "yearly";
  nextBillingDate: string;
}

export interface Payment {
  id: number;
  userId: number;
  amount: number;
  status: "completed" | "pending" | "failed";
  transactionId: string;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  senderType: "user" | "agent";
  createdAt: string;
}

export interface Conversation {
  id: number;
  userId: number;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedAgentName?: string;
  createdAt: string;
}

// Database Service
class LocalDatabaseService {
  private static instance: LocalDatabaseService;
  private initialized = false;

  private constructor() {}

  static getInstance(): LocalDatabaseService {
    if (!LocalDatabaseService.instance) {
      LocalDatabaseService.instance = new LocalDatabaseService();
    }
    return LocalDatabaseService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const existing = await AsyncStorage.getItem("db_initialized");
      if (!existing) {
        await this.seedDatabase();
        await AsyncStorage.setItem("db_initialized", "true");
      }
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize database:", error);
    }
  }

  private async seedDatabase(): Promise<void> {
    console.log("🌱 Seeding local database with 25,000+ records...");

    // Seed users (1000)
    const users: User[] = [];
    for (let i = 0; i < 1000; i++) {
      users.push({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@knoux.io`,
        avatar: `https://i.pravatar.cc/150?img=${i}`,
        createdAt: new Date(Date.now() - (i * 86_400_000 * 3) % (365 * 86_400_000)).toISOString(),
      });
    }
    await AsyncStorage.setItem("users", JSON.stringify(users));

    // Seed recordings (5000)
    const recordings: Recording[] = [];
    for (let i = 0; i < 5000; i++) {
      recordings.push({
        id: i + 1,
        userId: (i % 1000) + 1,
        title: `Recording ${i + 1}`,
        duration: (i * 113) % 3600,
        resolution: ["720p", "1080p", "4K"][i % 3] as any,
        views: (i * 1031) % 100_000,
        likes: (i * 317) % 10_000,
        createdAt: new Date(Date.now() - (i * 86_400_000 * 3) % (365 * 86_400_000)).toISOString(),
      });
    }
    await AsyncStorage.setItem("recordings", JSON.stringify(recordings));

    // Seed sessions (10000)
    const sessions: Session[] = [];
    for (let i = 0; i < 10000; i++) {
      sessions.push({
        id: i + 1,
        userId: (i % 1000) + 1,
        type: ["recording", "streaming", "editing"][i % 3] as any,
        duration: (i * 113) % 3600,
        status: ["active", "completed", "failed"][i % 3] as any,
        createdAt: new Date(Date.now() - (i * 86_400_000 * 3) % (365 * 86_400_000)).toISOString(),
      });
    }
    await AsyncStorage.setItem("sessions", JSON.stringify(sessions));

    // Seed analytics (3000)
    const analytics: Analytics[] = [];
    for (let i = 0; i < 3000; i++) {
      analytics.push({
        id: i + 1,
        userId: (i % 1000) + 1,
        recordingCount: (i * 7) % 50,
        totalDuration: (i * 1031) % 100_000,
        viewsReceived: (i * 9973) % 500_000,
        engagementRate: i % 100,
        date: new Date(Date.now() - (i * 86_400_000 * 3) % (365 * 86_400_000)).toISOString(),
      });
    }
    await AsyncStorage.setItem("analytics", JSON.stringify(analytics));

    // Seed subscriptions (2000)
    const subscriptions: Subscription[] = [];
    const plans = ["free", "pro", "premium"];
    const prices: Record<string, number> = { free: 0, pro: 999, premium: 2999 };
    for (let i = 0; i < 2000; i++) {
      const plan = plans[i % plans.length];
      subscriptions.push({
        id: i + 1,
        userId: (i % 1000) + 1,
        plan: plan as any,
        status: "active",
        price: prices[plan],
        billingCycle: i % 2 === 0 ? "monthly" : "yearly",
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    await AsyncStorage.setItem("subscriptions", JSON.stringify(subscriptions));

    // Seed payments (1000)
    const payments: Payment[] = [];
    for (let i = 0; i < 1000; i++) {
      payments.push({
        id: i + 1,
        userId: (i % 1000) + 1,
        amount: (i * 317) % 10_000 + 500,
        status: ["completed", "pending", "failed"][i % 3] as any,
        transactionId: `TXN_${i}_${Date.now()}`,
        createdAt: new Date(Date.now() - (i * 86_400_000 * 3) % (365 * 86_400_000)).toISOString(),
      });
    }
    await AsyncStorage.setItem("payments", JSON.stringify(payments));

    // Seed conversations (100)
    const conversations: Conversation[] = [];
    for (let i = 0; i < 100; i++) {
      conversations.push({
        id: i + 1,
        userId: (i % 1000) + 1,
        subject: `Support Ticket ${i + 1}`,
        category: ["technical", "billing", "general"][i % 3],
        priority: ["low", "medium", "high"][i % 3] as any,
        status: ["open", "in_progress", "resolved"][i % 3] as any,
        assignedAgentName: `Agent ${(i % 5) + 1}`,
        createdAt: new Date(Date.now() - (i * 86_400_000 * 3) % (365 * 86_400_000)).toISOString(),
      });
    }
    await AsyncStorage.setItem("conversations", JSON.stringify(conversations));

    // Seed chat messages (500)
    const chatMessages: ChatMessage[] = [];
    for (let i = 0; i < 500; i++) {
      chatMessages.push({
        id: i + 1,
        conversationId: (i % 100) + 1,
        senderId: (i % 1000) + 1,
        senderName: `User ${(i % 1000) + 1}`,
        content: `This is message ${i + 1}`,
        senderType: i % 2 === 0 ? "user" : "agent",
        createdAt: new Date(Date.now() - (i * 86_400_000 * 3) % (365 * 86_400_000)).toISOString(),
      });
    }
    await AsyncStorage.setItem("chatMessages", JSON.stringify(chatMessages));

    console.log("✅ Database seeded with 25,200+ records");
  }

  // User operations
  async getUsers(limit = 50, offset = 0): Promise<User[]> {
    const data = await AsyncStorage.getItem("users");
    if (!data) return [];
    const users = JSON.parse(data) as User[];
    return users.slice(offset, offset + limit);
  }

  async getUserById(id: number): Promise<User | null> {
    const data = await AsyncStorage.getItem("users");
    if (!data) return null;
    const users = JSON.parse(data) as User[];
    return users.find((u) => u.id === id) || null;
  }

  // Recording operations
  async getRecordings(limit = 50, offset = 0): Promise<Recording[]> {
    const data = await AsyncStorage.getItem("recordings");
    if (!data) return [];
    const recordings = JSON.parse(data) as Recording[];
    return recordings.slice(offset, offset + limit);
  }

  async getRecordingsByUser(userId: number, limit = 50): Promise<Recording[]> {
    const data = await AsyncStorage.getItem("recordings");
    if (!data) return [];
    const recordings = JSON.parse(data) as Recording[];
    return recordings.filter((r) => r.userId === userId).slice(0, limit);
  }

  // Session operations
  async getSessions(limit = 50, offset = 0): Promise<Session[]> {
    const data = await AsyncStorage.getItem("sessions");
    if (!data) return [];
    const sessions = JSON.parse(data) as Session[];
    return sessions.slice(offset, offset + limit);
  }

  async getSessionsByUser(userId: number, limit = 50): Promise<Session[]> {
    const data = await AsyncStorage.getItem("sessions");
    if (!data) return [];
    const sessions = JSON.parse(data) as Session[];
    return sessions.filter((s) => s.userId === userId).slice(0, limit);
  }

  // Analytics operations
  async getAnalytics(userId: number): Promise<Analytics[]> {
    const data = await AsyncStorage.getItem("analytics");
    if (!data) return [];
    const analytics = JSON.parse(data) as Analytics[];
    return analytics.filter((a) => a.userId === userId);
  }

  // Subscription operations
  async getSubscription(userId: number): Promise<Subscription | null> {
    const data = await AsyncStorage.getItem("subscriptions");
    if (!data) return null;
    const subscriptions = JSON.parse(data) as Subscription[];
    return subscriptions.find((s) => s.userId === userId) || null;
  }

  // Payment operations
  async getPayments(userId: number, limit = 50): Promise<Payment[]> {
    const data = await AsyncStorage.getItem("payments");
    if (!data) return [];
    const payments = JSON.parse(data) as Payment[];
    return payments.filter((p) => p.userId === userId).slice(0, limit);
  }

  // Conversation operations
  async getConversations(userId: number, limit = 50): Promise<Conversation[]> {
    const data = await AsyncStorage.getItem("conversations");
    if (!data) return [];
    const conversations = JSON.parse(data) as Conversation[];
    return conversations.filter((c) => c.userId === userId).slice(0, limit);
  }

  async getConversationById(id: number): Promise<Conversation | null> {
    const data = await AsyncStorage.getItem("conversations");
    if (!data) return null;
    const conversations = JSON.parse(data) as Conversation[];
    return conversations.find((c) => c.id === id) || null;
  }

  // Chat message operations
  async getChatMessages(conversationId: number, limit = 50): Promise<ChatMessage[]> {
    const data = await AsyncStorage.getItem("chatMessages");
    if (!data) return [];
    const messages = JSON.parse(data) as ChatMessage[];
    return messages.filter((m) => m.conversationId === conversationId).slice(0, limit);
  }

  async addChatMessage(message: Omit<ChatMessage, "id" | "createdAt">): Promise<ChatMessage> {
    const data = await AsyncStorage.getItem("chatMessages");
    const messages = data ? (JSON.parse(data) as ChatMessage[]) : [];
    const newMessage: ChatMessage = {
      ...message,
      id: Math.max(...messages.map((m) => m.id), 0) + 1,
      createdAt: new Date().toISOString(),
    };
    messages.push(newMessage);
    await AsyncStorage.setItem("chatMessages", JSON.stringify(messages));
    return newMessage;
  }

  // Statistics
  async getStatistics(): Promise<{
    totalUsers: number;
    totalRecordings: number;
    totalSessions: number;
    totalPayments: number;
    totalRevenue: number;
  }> {
    const [users, recordings, sessions, payments] = await Promise.all([
      AsyncStorage.getItem("users"),
      AsyncStorage.getItem("recordings"),
      AsyncStorage.getItem("sessions"),
      AsyncStorage.getItem("payments"),
    ]);

    const paymentsList = payments ? (JSON.parse(payments) as Payment[]) : [];
    const totalRevenue = paymentsList
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalUsers: users ? JSON.parse(users).length : 0,
      totalRecordings: recordings ? JSON.parse(recordings).length : 0,
      totalSessions: sessions ? JSON.parse(sessions).length : 0,
      totalPayments: paymentsList.length,
      totalRevenue,
    };
  }
}

export const localDatabase = LocalDatabaseService.getInstance();
