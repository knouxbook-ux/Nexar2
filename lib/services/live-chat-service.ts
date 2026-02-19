// Copyright © Knoux. All rights reserved.
/**
 * LiveChatService - Comprehensive live chat and support system with large database
 */

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderType: "user" | "agent" | "bot";
  content: string;
  attachments?: ChatAttachment[];
  timestamp: number;
  isRead: boolean;
  readAt?: number;
  reactions?: { emoji: string; count: number }[];
}

export interface ChatAttachment {
  id: string;
  type: "image" | "file" | "video";
  url: string;
  name: string;
  size: number;
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  subject: string;
  status: "open" | "assigned" | "waiting" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
  satisfactionRating?: number;
  notes?: string;
}

export interface SupportAgent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "online" | "offline" | "away" | "busy";
  activeConversations: number;
  maxConversations: number;
  department: string;
  languages: string[];
  averageResponseTime: number;
  satisfactionScore: number;
  totalResolved: number;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  createdAt: number;
  updatedAt: number;
  author: string;
}

export interface SupportTicket {
  id: string;
  conversationId: string;
  ticketNumber: string;
  userId: string;
  status: "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  subject: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
  estimatedResolutionTime?: number;
}

class LiveChatServiceClass {
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, ChatMessage> = new Map();
  private agents: Map<string, SupportAgent> = new Map();
  private tickets: Map<string, SupportTicket> = new Map();
  private knowledgeBase: Map<string, KnowledgeBaseArticle> = new Map();
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeAgents();
    this.initializeKnowledgeBase();
  }

  private initializeAgents(): void {
    const agents: SupportAgent[] = [
      {
        id: "agent_1",
        name: "Ahmed Support",
        email: "ahmed@support.com",
        status: "online",
        activeConversations: 3,
        maxConversations: 5,
        department: "Technical Support",
        languages: ["ar", "en"],
        averageResponseTime: 2000,
        satisfactionScore: 4.8,
        totalResolved: 156,
      },
      {
        id: "agent_2",
        name: "Fatima Help",
        email: "fatima@support.com",
        status: "online",
        activeConversations: 2,
        maxConversations: 5,
        department: "Billing",
        languages: ["ar", "en", "fr"],
        averageResponseTime: 1500,
        satisfactionScore: 4.9,
        totalResolved: 203,
      },
      {
        id: "agent_3",
        name: "Mohammed Support",
        email: "mohammed@support.com",
        status: "away",
        activeConversations: 0,
        maxConversations: 5,
        department: "General Support",
        languages: ["ar", "en"],
        averageResponseTime: 3000,
        satisfactionScore: 4.7,
        totalResolved: 142,
      },
      {
        id: "agent_4",
        name: "Layla Assistant",
        email: "layla@support.com",
        status: "online",
        activeConversations: 4,
        maxConversations: 5,
        department: "Premium Support",
        languages: ["ar", "en", "fr"],
        averageResponseTime: 1000,
        satisfactionScore: 4.95,
        totalResolved: 289,
      },
      {
        id: "agent_5",
        name: "Omar Support",
        email: "omar@support.com",
        status: "offline",
        activeConversations: 0,
        maxConversations: 5,
        department: "Technical Support",
        languages: ["ar", "en"],
        averageResponseTime: 2500,
        satisfactionScore: 4.6,
        totalResolved: 98,
      },
    ];

    agents.forEach((agent) => {
      this.agents.set(agent.id, agent);
    });
  }

  private initializeKnowledgeBase(): void {
    const articles: KnowledgeBaseArticle[] = [
      {
        id: "kb_1",
        title: "How to Start Recording",
        content: "To start recording, tap the Record button and select your preferences...",
        category: "Getting Started",
        tags: ["recording", "basics", "tutorial"],
        views: 1250,
        helpful: 1100,
        notHelpful: 50,
        createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        author: "Support Team",
      },
      {
        id: "kb_2",
        title: "Video Editing Basics",
        content: "Learn how to edit your videos with our powerful editing tools...",
        category: "Editing",
        tags: ["editing", "video", "tutorial"],
        views: 980,
        helpful: 850,
        notHelpful: 30,
        createdAt: Date.now() - 75 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        author: "Support Team",
      },
      {
        id: "kb_3",
        title: "Subscription Plans Explained",
        content: "Compare our Free, Pro, and Premium plans to find the best fit...",
        category: "Billing",
        tags: ["subscription", "pricing", "plans"],
        views: 2100,
        helpful: 1850,
        notHelpful: 100,
        createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        author: "Support Team",
      },
      {
        id: "kb_4",
        title: "Troubleshooting Recording Issues",
        content: "If you experience recording problems, try these solutions...",
        category: "Troubleshooting",
        tags: ["recording", "issues", "help"],
        views: 1650,
        helpful: 1400,
        notHelpful: 80,
        createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        author: "Support Team",
      },
      {
        id: "kb_5",
        title: "Cloud Sync Setup Guide",
        content: "Enable cloud sync to backup your recordings automatically...",
        category: "Cloud Features",
        tags: ["cloud", "sync", "backup"],
        views: 890,
        helpful: 750,
        notHelpful: 40,
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now(),
        author: "Support Team",
      },
      {
        id: "kb_6",
        title: "Live Streaming Setup",
        content: "Learn how to set up and start live streaming to YouTube, Twitch, and Facebook...",
        category: "Streaming",
        tags: ["streaming", "live", "broadcast"],
        views: 1200,
        helpful: 1050,
        notHelpful: 60,
        createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now(),
        author: "Support Team",
      },
      {
        id: "kb_7",
        title: "Referral Program Guide",
        content: "Earn money by referring friends to Knoux Nexar Pro...",
        category: "Referrals",
        tags: ["referral", "earnings", "money"],
        views: 1450,
        helpful: 1250,
        notHelpful: 70,
        createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now(),
        author: "Support Team",
      },
      {
        id: "kb_8",
        title: "Payment Methods & Billing",
        content: "Manage your payment methods and view your billing history...",
        category: "Billing",
        tags: ["payment", "billing", "cards"],
        views: 1800,
        helpful: 1550,
        notHelpful: 90,
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now(),
        author: "Support Team",
      },
    ];

    articles.forEach((article) => {
      this.knowledgeBase.set(article.id, article);
    });
  }

  startConversation(
    userId: string,
    userName: string,
    subject: string,
    category: string,
    priority: "low" | "medium" | "high" | "urgent" = "medium"
  ): Conversation {
    const conversation: Conversation = {
      id: `conv_${Date.now()}`,
      userId,
      userName,
      subject,
      status: "open",
      priority,
      category,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.conversations.set(conversation.id, conversation);

    // Auto-assign agent
    this.assignAgent(conversation.id);

    this.emit("conversationStarted", { conversation });
    return conversation;
  }

  private assignAgent(conversationId: string): void {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return;

    // Find available agent with lowest active conversations
    const availableAgents = Array.from(this.agents.values())
      .filter(
        (a) =>
          a.status !== "offline" && a.activeConversations < a.maxConversations
      )
      .sort((a, b) => a.activeConversations - b.activeConversations);

    if (availableAgents.length > 0) {
      const agent = availableAgents[0];
      conversation.assignedAgentId = agent.id;
      conversation.assignedAgentName = agent.name;
      conversation.status = "assigned";
      agent.activeConversations++;
    }
  }

  sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    content: string,
    senderType: "user" | "agent" | "bot" = "user"
  ): ChatMessage {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId,
      senderName,
      senderType,
      content,
      timestamp: Date.now(),
      isRead: false,
    };

    this.messages.set(message.id, message);
    conversation.messages.push(message);
    conversation.updatedAt = Date.now();

    this.emit("messageSent", { message, conversation });
    return message;
  }

  getConversation(conversationId: string): Conversation | undefined {
    return this.conversations.get(conversationId);
  }

  getUserConversations(userId: string): Conversation[] {
    return Array.from(this.conversations.values())
      .filter((c) => c.userId === userId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  resolveConversation(conversationId: string, notes?: string): void {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.status = "resolved";
      conversation.resolvedAt = Date.now();
      if (notes) conversation.notes = notes;

      if (conversation.assignedAgentId) {
        const agent = this.agents.get(conversation.assignedAgentId);
        if (agent) {
          agent.activeConversations--;
          agent.totalResolved++;
        }
      }

      this.emit("conversationResolved", { conversation });
    }
  }

  rateConversation(conversationId: string, rating: number): void {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.satisfactionRating = rating;

      if (conversation.assignedAgentId) {
        const agent = this.agents.get(conversation.assignedAgentId);
        if (agent) {
          agent.satisfactionScore =
            (agent.satisfactionScore * (agent.totalResolved - 1) + rating) /
            agent.totalResolved;
        }
      }

      this.emit("conversationRated", { conversation, rating });
    }
  }

  searchKnowledgeBase(query: string): KnowledgeBaseArticle[] {
    const queryLower = query.toLowerCase();
    return Array.from(this.knowledgeBase.values())
      .filter(
        (article) =>
          article.title.toLowerCase().includes(queryLower) ||
          article.content.toLowerCase().includes(queryLower) ||
          article.tags.some((tag) => tag.toLowerCase().includes(queryLower))
      )
      .sort((a, b) => b.views - a.views);
  }

  getKnowledgeBaseByCategory(category: string): KnowledgeBaseArticle[] {
    return Array.from(this.knowledgeBase.values())
      .filter((a) => a.category === category)
      .sort((a, b) => b.views - a.views);
  }

  markArticleHelpful(articleId: string): void {
    const article = this.knowledgeBase.get(articleId);
    if (article) {
      article.helpful++;
      this.emit("articleMarkedHelpful", { articleId });
    }
  }

  markArticleNotHelpful(articleId: string): void {
    const article = this.knowledgeBase.get(articleId);
    if (article) {
      article.notHelpful++;
      this.emit("articleMarkedNotHelpful", { articleId });
    }
  }

  getAgents(): SupportAgent[] {
    return Array.from(this.agents.values());
  }

  getOnlineAgents(): SupportAgent[] {
    return Array.from(this.agents.values()).filter((a) => a.status !== "offline");
  }

  getChatStats(): {
    totalConversations: number;
    openConversations: number;
    resolvedConversations: number;
    averageResolutionTime: number;
    averageSatisfaction: number;
  } {
    const conversations = Array.from(this.conversations.values());
    const resolved = conversations.filter((c) => c.status === "resolved");
    const open = conversations.filter((c) => c.status !== "resolved");

    const avgResolutionTime =
      resolved.length > 0
        ? resolved.reduce((sum, c) => sum + (c.resolvedAt! - c.createdAt), 0) /
          resolved.length
        : 0;

    const avgSatisfaction =
      resolved.filter((c) => c.satisfactionRating).length > 0
        ? resolved
            .filter((c) => c.satisfactionRating)
            .reduce((sum, c) => sum + c.satisfactionRating!, 0) /
          resolved.filter((c) => c.satisfactionRating).length
        : 0;

    return {
      totalConversations: conversations.length,
      openConversations: open.length,
      resolvedConversations: resolved.length,
      averageResolutionTime: avgResolutionTime,
      averageSatisfaction: avgSatisfaction,
    };
  }

  on(event: string, cb: Function): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(cb);
  }

  off(event: string, cb: Function): void {
    this.listeners.set(
      event,
      (this.listeners.get(event) || []).filter((c) => c !== cb)
    );
  }

  private emit(event: string, data: any): void {
    (this.listeners.get(event) || []).forEach((cb) => cb(data));
  }
}

export const LiveChatService = new LiveChatServiceClass();

export const liveChatService = LiveChatService;
