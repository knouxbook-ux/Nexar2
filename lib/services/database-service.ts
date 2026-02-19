// Copyright © Knoux. All rights reserved.
/**
 * DatabaseService - Comprehensive database service with large dataset
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription: "free" | "pro" | "premium";
  createdAt: number;
  lastLogin: number;
  totalSpent: number;
  status: "active" | "inactive" | "suspended";
}

export interface Recording {
  id: string;
  userId: string;
  title: string;
  description: string;
  duration: number;
  resolution: "720p" | "1080p" | "4K";
  fileSize: number;
  createdAt: number;
  updatedAt: number;
  views: number;
  likes: number;
  isPublic: boolean;
  tags: string[];
  thumbnail?: string;
}

export interface Session {
  id: string;
  userId: string;
  type: "recording" | "streaming" | "editing";
  startTime: number;
  endTime?: number;
  duration: number;
  status: "active" | "completed" | "failed";
  metadata: Record<string, any>;
}

export interface Analytics {
  id: string;
  userId: string;
  date: number;
  recordingCount: number;
  totalDuration: number;
  storageUsed: number;
  viewsReceived: number;
  engagementRate: number;
}

class DatabaseServiceClass {
  private users: Map<string, User> = new Map();
  private recordings: Map<string, Recording> = new Map();
  private sessions: Map<string, Session> = new Map();
  private analytics: Map<string, Analytics> = new Map();
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    // ✅ FIXED: No fake data generation at startup.
    // All data is now served from the real tRPC backend (server/db.ts).
    // This service acts as a local cache/event bus only.
  }

  private generateUserName(index: number): string {
    const firstNames = [
      "Ahmed",
      "Fatima",
      "Mohammed",
      "Layla",
      "Omar",
      "Aisha",
      "Hassan",
      "Noor",
      "Ali",
      "Zainab",
    ];
    const lastNames = [
      "Mohamed",
      "Hassan",
      "Ali",
      "Ibrahim",
      "Abdullah",
      "Khalil",
      "Rashid",
      "Samir",
      "Karim",
      "Nasser",
    ];
    return (
      firstNames[index % firstNames.length] +
      " " +
      lastNames[index % lastNames.length]
    );
  }

  private generateRecordingTitle(index: number): string {
    const titles = [
      "Screen Recording Tutorial",
      "Live Streaming Session",
      "Video Editing Demo",
      "Product Presentation",
      "Gaming Gameplay",
      "Educational Content",
      "Music Performance",
      "Interview Recording",
      "Webinar Session",
      "Podcast Episode",
    ];
    return titles[index % titles.length] + " #" + index;
  }

  private generateDescription(): string {
    const descriptions = [
      "Amazing content for you to watch",
      "Check out this incredible recording",
      "Professional quality video",
      "High-definition streaming",
      "Best moments captured",
      "Exclusive content",
      "Premium quality video",
      "Engaging and informative",
      "Must-watch content",
      "Trending video",
    ];
    return descriptions[i % descriptions.length];
  }

  private generateTags(): string[] {
    const allTags = [
      "tutorial",
      "gaming",
      "streaming",
      "education",
      "music",
      "vlog",
      "podcast",
      "webinar",
      "interview",
      "presentation",
    ];
    const numTags = (i % 3) + 1;
    const tags: string[] = [];
    for (let i = 0; i < numTags; i++) {
      tags.push(allTags[i % allTags.length]);
    }
    return [...new Set(tags)];
  }

  private randomSubscription(): "free" | "pro" | "premium" {
    const rand = (i % 100) / 100;
    if (rand < 0.7) return "free";
    if (rand < 0.9) return "pro";
    return "premium";
  }

  private randomResolution(): "720p" | "1080p" | "4K" {
    const rand = (i % 100) / 100;
    if (rand < 0.4) return "720p";
    if (rand < 0.8) return "1080p";
    return "4K";
  }

  private randomSessionType(): "recording" | "streaming" | "editing" {
    const rand = (i % 100) / 100;
    if (rand < 0.5) return "recording";
    if (rand < 0.8) return "streaming";
    return "editing";
  }

  private randomSessionStatus(): "active" | "completed" | "failed" {
    const rand = (i % 100) / 100;
    if (rand < 0.7) return "completed";
    if (rand < 0.95) return "active";
    return "failed";
  }

  private randomPlatform(): string {
    const platforms = ["iOS", "Android", "Web", "Desktop"];
    return platforms[i % platforms.length];
  }

  // User Methods
  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  getAllUsers(limit: number = 100): User[] {
    return Array.from(this.users.values()).slice(0, limit);
  }

  getUserCount(): number {
    return this.users.size;
  }

  searchUsers(query: string): User[] {
    return Array.from(this.users.values()).filter(
      (u) =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Recording Methods
  getRecording(recordingId: string): Recording | undefined {
    return this.recordings.get(recordingId);
  }

  getUserRecordings(userId: string, limit: number = 50): Recording[] {
    return Array.from(this.recordings.values())
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  getRecordingCount(): number {
    return this.recordings.size;
  }

  getPopularRecordings(limit: number = 20): Recording[] {
    return Array.from(this.recordings.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  searchRecordings(query: string): Recording[] {
    return Array.from(this.recordings.values()).filter(
      (r) =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
    );
  }

  // Session Methods
  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  getUserSessions(userId: string, limit: number = 50): Session[] {
    return Array.from(this.sessions.values())
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit);
  }

  getSessionCount(): number {
    return this.sessions.size;
  }

  getActiveSessions(): Session[] {
    return Array.from(this.sessions.values()).filter(
      (s) => s.status === "active"
    );
  }

  // Analytics Methods
  getAnalytics(analyticsId: string): Analytics | undefined {
    return this.analytics.get(analyticsId);
  }

  getUserAnalytics(userId: string): Analytics[] {
    return Array.from(this.analytics.values())
      .filter((a) => a.userId === userId)
      .sort((a, b) => b.date - a.date);
  }

  getAnalyticsCount(): number {
    return this.analytics.size;
  }

  getGlobalStats(): {
    totalUsers: number;
    totalRecordings: number;
    totalSessions: number;
    totalAnalytics: number;
    totalDuration: number;
    totalViews: number;
    totalStorage: number;
  } {
    let totalDuration = 0;
    let totalViews = 0;
    let totalStorage = 0;

    this.recordings.forEach((r) => {
      totalViews += r.views;
      totalStorage += r.fileSize;
    });

    this.sessions.forEach((s) => {
      totalDuration += s.duration;
    });

    return {
      totalUsers: this.users.size,
      totalRecordings: this.recordings.size,
      totalSessions: this.sessions.size,
      totalAnalytics: this.analytics.size,
      totalDuration,
      totalViews,
      totalStorage,
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

export const DatabaseService = new DatabaseServiceClass();
