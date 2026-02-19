// Copyright © Knoux. All rights reserved.
/**
 * AdminDashboardService - Comprehensive admin dashboard and management system
 */

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin" | "moderator" | "support_agent";
  permissions: string[];
  lastLogin: number;
  createdAt: number;
}

export interface UserManagement {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  churnedUsers: number;
  premiumUsers: number;
  freeUsers: number;
}

export interface SubscriptionStats {
  totalActiveSubscriptions: number;
  monthlyRecurringRevenue: number;
  yearlyRecurringRevenue: number;
  subscriptionsByPlan: {
    free: number;
    pro: number;
    premium: number;
  };
  churnRate: number;
  conversionRate: number;
  averageSubscriptionValue: number;
}

export interface RevenueStats {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueThisYear: number;
  revenueByPaymentMethod: {
    stripe: number;
    paypal: number;
    bank: number;
  };
  topRevenueCountries: { country: string; revenue: number }[];
  refundRate: number;
  averageTransactionValue: number;
}

export interface SystemHealth {
  serverStatus: "healthy" | "degraded" | "down";
  databaseStatus: "healthy" | "degraded" | "down";
  apiResponseTime: number;
  errorRate: number;
  uptime: number;
  activeConnections: number;
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: Record<string, any>;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface ModeratedContent {
  id: string;
  userId: string;
  contentType: "review" | "comment" | "message" | "report";
  content: string;
  status: "pending" | "approved" | "rejected" | "flagged";
  reason?: string;
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
}

class AdminDashboardServiceClass {
  private adminUsers: Map<string, AdminUser> = new Map();
  private activityLogs: ActivityLog[] = [];
  private moderatedContent: Map<string, ModeratedContent> = new Map();
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeAdminUsers();
  }

  private initializeAdminUsers(): void {
    const admins: AdminUser[] = [
      {
        id: "admin_1",
        email: "admin@knoux.io",
        name: "Sadek Elgazar",
        role: "super_admin",
        permissions: ["all"],
        lastLogin: Date.now() - 2 * 60 * 60 * 1000,
        createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
      },
      {
        id: "admin_2",
        email: "support@knoux.io",
        name: "Support Manager",
        role: "admin",
        permissions: ["users", "support", "content_moderation", "reports"],
        lastLogin: Date.now() - 30 * 60 * 1000,
        createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
      },
      {
        id: "admin_3",
        email: "billing@knoux.io",
        name: "Billing Manager",
        role: "admin",
        permissions: ["subscriptions", "payments", "refunds", "invoices"],
        lastLogin: Date.now() - 1 * 60 * 60 * 1000,
        createdAt: Date.now() - 120 * 24 * 60 * 60 * 1000,
      },
    ];

    admins.forEach((admin) => {
      this.adminUsers.set(admin.id, admin);
    });
  }

  getDashboardOverview(): {
    users: UserManagement;
    subscriptions: SubscriptionStats;
    revenue: RevenueStats;
    health: SystemHealth;
  } {
    return {
      users: {
        totalUsers: 15420,
        activeUsers: 12890,
        newUsersToday: 145,
        newUsersThisWeek: 1020,
        newUsersThisMonth: 4560,
        churnedUsers: 230,
        premiumUsers: 3420,
        freeUsers: 12000,
      },
      subscriptions: {
        totalActiveSubscriptions: 3420,
        monthlyRecurringRevenue: 68400,
        yearlyRecurringRevenue: 820800,
        subscriptionsByPlan: {
          free: 12000,
          pro: 2100,
          premium: 1320,
        },
        churnRate: 2.5,
        conversionRate: 22.1,
        averageSubscriptionValue: 240,
      },
      revenue: {
        totalRevenue: 2456800,
        revenueThisMonth: 68400,
        revenueThisYear: 820800,
        revenueByPaymentMethod: {
          stripe: 1640640,
          paypal: 656160,
          bank: 160000,
        },
        topRevenueCountries: [
          { country: "United States", revenue: 820320 },
          { country: "United Kingdom", revenue: 328128 },
          { country: "Canada", revenue: 246560 },
          { country: "Germany", revenue: 164032 },
          { country: "France", revenue: 123520 },
        ],
        refundRate: 1.2,
        averageTransactionValue: 240,
      },
      health: {
        serverStatus: "healthy",
        databaseStatus: "healthy",
        apiResponseTime: 145,
        errorRate: 0.02,
        uptime: 99.98,
        activeConnections: 2340,
        cpuUsage: 35,
        memoryUsage: 62,
        storageUsage: 78,
      },
    };
  }

  getUserManagementData(): {
    users: any[];
    totalPages: number;
    currentPage: number;
  } {
    // Simulated user data
    const users = [
      {
        id: "user_1",
        email: "ahmed.knoux@nexarpro.app",
        name: "Ahmed Mohamed",
        subscription: "premium",
        joinDate: Date.now() - 180 * 24 * 60 * 60 * 1000,
        lastActive: Date.now() - 2 * 60 * 60 * 1000,
        status: "active",
        totalSpent: 720,
      },
      {
        id: "user_2",
        email: "sara.pro@nexarpro.app",
        name: "Fatima Hassan",
        subscription: "pro",
        joinDate: Date.now() - 90 * 24 * 60 * 60 * 1000,
        lastActive: Date.now() - 12 * 60 * 60 * 1000,
        status: "active",
        totalSpent: 240,
      },
      {
        id: "user_3",
        email: "knoux.admin@nexarpro.app",
        name: "Mohammed Ali",
        subscription: "free",
        joinDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
        lastActive: Date.now() - 5 * 24 * 60 * 60 * 1000,
        status: "inactive",
        totalSpent: 0,
      },
    ];

    return {
      users,
      totalPages: 5142,
      currentPage: 1,
    };
  }

  getSubscriptionManagement(): {
    subscriptions: any[];
    stats: any;
  } {
    return {
      subscriptions: [
        {
          id: "sub_1",
          userId: "user_1",
          plan: "premium",
          status: "active",
          startDate: Date.now() - 180 * 24 * 60 * 60 * 1000,
          renewalDate: Date.now() + 15 * 24 * 60 * 60 * 1000,
          amount: 29.99,
          billingCycle: "monthly",
        },
        {
          id: "sub_2",
          userId: "user_2",
          plan: "pro",
          status: "active",
          startDate: Date.now() - 90 * 24 * 60 * 60 * 1000,
          renewalDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
          amount: 9.99,
          billingCycle: "monthly",
        },
      ],
      stats: {
        totalActive: 3420,
        totalCancelled: 450,
        pendingRenewal: 340,
        expiringSoon: 125,
      },
    };
  }

  logActivity(
    userId: string,
    action: string,
    details: Record<string, any>,
    ipAddress?: string
  ): void {
    const log: ActivityLog = {
      id: `log_${Date.now()}`,
      userId,
      action,
      details,
      timestamp: Date.now(),
      ipAddress,
    };

    this.activityLogs.push(log);
    if (this.activityLogs.length > 100000) {
      this.activityLogs = this.activityLogs.slice(-100000);
    }

    this.emit("activityLogged", { log });
  }

  getActivityLogs(limit: number = 100): ActivityLog[] {
    return this.activityLogs.slice(-limit).reverse();
  }

  submitContentForModeration(
    userId: string,
    contentType: string,
    content: string
  ): ModeratedContent {
    const modContent: ModeratedContent = {
      id: `mod_${Date.now()}`,
      userId,
      contentType: contentType as any,
      content,
      status: "pending",
      submittedAt: Date.now(),
    };

    this.moderatedContent.set(modContent.id, modContent);
    this.emit("contentSubmittedForModeration", { modContent });
    return modContent;
  }

  reviewContent(
    contentId: string,
    status: "approved" | "rejected" | "flagged",
    reviewedBy: string,
    reason?: string
  ): void {
    const content = this.moderatedContent.get(contentId);
    if (content) {
      content.status = status;
      content.reviewedAt = Date.now();
      content.reviewedBy = reviewedBy;
      if (reason) content.reason = reason;

      this.emit("contentReviewed", { content });
    }
  }

  getPendingContent(): ModeratedContent[] {
    return Array.from(this.moderatedContent.values())
      .filter((c) => c.status === "pending")
      .sort((a, b) => a.submittedAt - b.submittedAt);
  }

  getSystemHealth(): SystemHealth {
    return {
      serverStatus: "healthy",
      databaseStatus: "healthy",
      apiResponseTime: 145,
      errorRate: 0.02,
      uptime: 99.98,
      activeConnections: 2340,
      cpuUsage: 35,
      memoryUsage: 62,
      storageUsage: 78,
    };
  }

  getReports(): {
    userReports: any[];
    contentReports: any[];
    bugReports: any[];
  } {
    return {
      userReports: [
        {
          id: "report_1",
          reportedUserId: "user_5",
          reportedBy: "user_1",
          reason: "Inappropriate behavior",
          status: "open",
          createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        },
      ],
      contentReports: [
        {
          id: "report_2",
          contentId: "content_1",
          reportedBy: "user_2",
          reason: "Violates community guidelines",
          status: "investigating",
          createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        },
      ],
      bugReports: [
        {
          id: "report_3",
          reportedBy: "user_3",
          description: "Recording stops unexpectedly",
          status: "assigned",
          priority: "high",
          createdAt: Date.now() - 6 * 60 * 60 * 1000,
        },
      ],
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

export const AdminDashboardService = new AdminDashboardServiceClass();
