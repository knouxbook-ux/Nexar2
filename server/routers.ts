// Copyright © Knoux. All rights reserved.
import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addChatMessage,
  cancelSubscription,
  completeReferral,
  createConversation,
  createNotification,
  createPayment,
  createRecording,
  createReferral,
  createSession,
  createSubscription,
  deleteRecording,
  endSession,
  getAllConversations,
  getAllRatings,
  getAllRecordings,
  getAllUsers,
  getAnalyticsSummary,
  getConversationMessages,
  getPaymentStats,
  getRatingsStats,
  getRecordingById,
  getRecordingStats,
  getReferralStats,
  getSubscriptionStats,
  getUnreadNotificationCount,
  getUserAnalytics,
  getUserConversations,
  getUserNotifications,
  getUserPayments,
  getUserRecordings,
  getUserReferrals,
  getUserSessions,
  getUserStats,
  getUserSubscription,
  markAllNotificationsRead,
  markNotificationRead,
  updateConversationStatus,
  updatePaymentStatus,
  updateRecording,
  upsertAnalytics,
  createRating,
  getAllRatings as getRatings,
  activateLicenseKey, createLicenseKey, getUserLicenseKeys, revokeLicenseKey,
  getAuditLogs, getAllFeatureFlags, setFeatureFlag,
} from "./db";

export const appRouter = router({
  system: systemRouter,

  // ─── AUTH ──────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── RECORDINGS ────────────────────────────────────────────────────────────
  recordings: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }).optional())
      .query(({ ctx, input }) =>
        getUserRecordings(ctx.user.id, input?.limit ?? 20, input?.offset ?? 0)
      ),

    stats: protectedProcedure.query(({ ctx }) => getRecordingStats(ctx.user.id)),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getRecordingById(input.id)),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1).max(255),
          description: z.string().optional(),
          duration: z.number().optional(),
          resolution: z.enum(["720p", "1080p", "4K"]).optional(),
          fileSize: z.number().optional(),
          thumbnail: z.string().optional(),
          isPublic: z.number().min(0).max(1).optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        createRecording({ ...input, userId: ctx.user.id })
      ),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          isPublic: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updateRecording(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteRecording(input.id)),
  }),

  // ─── SESSIONS ──────────────────────────────────────────────────────────────
  sessions: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }).optional())
      .query(({ ctx, input }) => getUserSessions(ctx.user.id, input?.limit ?? 20)),

    start: protectedProcedure
      .input(z.object({ type: z.enum(["recording", "streaming", "editing"]) }))
      .mutation(({ ctx, input }) =>
        createSession({ userId: ctx.user.id, type: input.type })
      ),

    end: protectedProcedure
      .input(z.object({ id: z.number(), duration: z.number() }))
      .mutation(({ input }) => endSession(input.id, input.duration)),
  }),

  // ─── ANALYTICS ─────────────────────────────────────────────────────────────
  analytics: router({
    summary: protectedProcedure.query(({ ctx }) => getAnalyticsSummary(ctx.user.id)),

    history: protectedProcedure
      .input(z.object({ days: z.number().default(30) }).optional())
      .query(({ ctx, input }) => getUserAnalytics(ctx.user.id, input?.days ?? 30)),

    track: protectedProcedure
      .input(
        z.object({
          recordingCount: z.number().optional(),
          totalDuration: z.number().optional(),
          storageUsed: z.number().optional(),
          viewsReceived: z.number().optional(),
          engagementRate: z.number().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        upsertAnalytics({ ...input, userId: ctx.user.id })
      ),
  }),

  // ─── SUBSCRIPTIONS ─────────────────────────────────────────────────────────
  subscriptions: router({
    current: protectedProcedure.query(({ ctx }) => getUserSubscription(ctx.user.id)),

    subscribe: protectedProcedure
      .input(
        z.object({
          plan: z.enum(["free", "pro", "premium"]),
          price: z.number(),
          billingCycle: z.enum(["monthly", "yearly"]),
        })
      )
      .mutation(({ ctx, input }) =>
        createSubscription({ ...input, userId: ctx.user.id })
      ),

    cancel: protectedProcedure.mutation(({ ctx }) => cancelSubscription(ctx.user.id)),

    stats: protectedProcedure.query(() => getSubscriptionStats()),
  }),

  // ─── PAYMENTS ──────────────────────────────────────────────────────────────
  payments: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }).optional())
      .query(({ ctx, input }) => getUserPayments(ctx.user.id, input?.limit ?? 20)),

    create: protectedProcedure
      .input(
        z.object({
          amount: z.number(),
          currency: z.string().optional(),
          paymentMethod: z.enum(["card", "paypal", "bank_transfer"]),
          transactionId: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        createPayment({ ...input, userId: ctx.user.id })
      ),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "completed", "failed", "refunded"]),
        })
      )
      .mutation(({ input }) => updatePaymentStatus(input.id, input.status)),

    stats: protectedProcedure.query(() => getPaymentStats()),
  }),

  // ─── LIVE CHAT ─────────────────────────────────────────────────────────────
  chat: router({
    myConversations: protectedProcedure.query(({ ctx }) =>
      getUserConversations(ctx.user.id)
    ),

    startConversation: protectedProcedure
      .input(
        z.object({
          subject: z.string().min(1).max(255),
          category: z.string().optional(),
          priority: z.enum(["low", "medium", "high"]).optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        createConversation({ ...input, userId: ctx.user.id })
      ),

    messages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(({ input }) => getConversationMessages(input.conversationId)),

    sendMessage: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          content: z.string().min(1),
          senderName: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        addChatMessage({
          conversationId: input.conversationId,
          senderId: ctx.user.id,
          senderName: input.senderName,
          content: input.content,
          senderType: "user",
        })
      ),
  }),

  // ─── RATINGS & REVIEWS ─────────────────────────────────────────────────────
  ratings: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(50) }).optional())
      .query(({ input }) => getRatings(input?.limit ?? 50)),

    stats: publicProcedure.query(() => getRatingsStats()),

    submit: protectedProcedure
      .input(
        z.object({
          rating: z.number().min(1).max(5),
          comment: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        createRating({ ...input, userId: ctx.user.id })
      ),
  }),

  // ─── REFERRALS ─────────────────────────────────────────────────────────────
  referrals: router({
    myReferrals: protectedProcedure.query(({ ctx }) =>
      getUserReferrals(ctx.user.id)
    ),

    stats: protectedProcedure.query(({ ctx }) => getReferralStats(ctx.user.id)),

    refer: protectedProcedure
      .input(z.object({ referredUserId: z.number() }))
      .mutation(({ ctx, input }) =>
        createReferral(ctx.user.id, input.referredUserId)
      ),

    complete: protectedProcedure
      .input(z.object({ id: z.number(), commission: z.number() }))
      .mutation(({ input }) => completeReferral(input.id, input.commission)),
  }),

  // ─── NOTIFICATIONS ─────────────────────────────────────────────────────────
  notifications: router({
    list: protectedProcedure
      .input(z.object({ unreadOnly: z.boolean().default(false) }).optional())
      .query(({ ctx, input }) =>
        getUserNotifications(ctx.user.id, input?.unreadOnly ?? false)
      ),

    unreadCount: protectedProcedure.query(({ ctx }) =>
      getUnreadNotificationCount(ctx.user.id)
    ),

    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => markNotificationRead(input.id)),

    markAllRead: protectedProcedure.mutation(({ ctx }) =>
      markAllNotificationsRead(ctx.user.id)
    ),

    send: protectedProcedure
      .input(
        z.object({
          userId: z.number(),
          title: z.string(),
          message: z.string().optional(),
          type: z.enum(["info", "success", "warning", "error"]).optional(),
        })
      )
      .mutation(({ input }) => createNotification(input)),
  }),

  // ─── ADMIN ─────────────────────────────────────────────────────────────────
  admin: router({
    users: protectedProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        return getAllUsers(input?.limit ?? 50, input?.offset ?? 0);
      }),

    userStats: protectedProcedure.query(({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return getUserStats();
    }),

    allRecordings: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }).optional())
      .query(({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        return getAllRecordings(input?.limit ?? 50);
      }),

    allConversations: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }).optional())
      .query(({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        return getAllConversations(input?.limit ?? 50);
      }),

    updateConversation: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["open", "in_progress", "resolved", "closed"]),
          agentId: z.number().optional(),
          agentName: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        return updateConversationStatus(input.id, input.status, input.agentId, input.agentName);
      }),

    subscriptionStats: protectedProcedure.query(({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return getSubscriptionStats();
    }),

    paymentStats: protectedProcedure.query(({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return getPaymentStats();
    }),

    replyToChat: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          content: z.string().min(1),
          agentName: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        return addChatMessage({
          conversationId: input.conversationId,
          senderId: ctx.user.id,
          senderName: input.agentName ?? "Support Agent",
          content: input.content,
          senderType: "agent",
        });
      }),
  }),
});

export const extrasRouter = router({
  licenses: router({
    myKeys: protectedProcedure.query(({ ctx }) => getUserLicenseKeys(ctx.user.id)),

    generate: protectedProcedure
      .input(z.object({
        plan: z.enum(["free", "pro", "premium"]),
        maxDevices: z.number().min(1).max(10).optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => createLicenseKey({ ...input, userId: ctx.user.id })),

    activate: protectedProcedure
      .input(z.object({ key: z.string().min(1) }))
      .mutation(({ input }) => activateLicenseKey(input.key)),

    revoke: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        return revokeLicenseKey(input.id);
      }),
  }),

  featureFlags: router({
    list: protectedProcedure.query(({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return getAllFeatureFlags();
    }),

    set: protectedProcedure
      .input(z.object({ name: z.string(), enabled: z.boolean() }))
      .mutation(({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        return setFeatureFlag(input.name, input.enabled);
      }),
  }),

  auditLogs: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(100) }).optional())
      .query(({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        return getAuditLogs(input?.limit ?? 100);
      }),
  }),
});

export const fullRouter = router({
  system: appRouter.system,
  auth: appRouter.auth,
  recordings: appRouter.recordings,
  sessions: appRouter.sessions,
  analytics: appRouter.analytics,
  subscriptions: appRouter.subscriptions,
  payments: appRouter.payments,
  chat: appRouter.chat,
  ratings: appRouter.ratings,
  referrals: appRouter.referrals,
  notifications: appRouter.notifications,
  admin: appRouter.admin,
  licenses: extrasRouter.licenses,
  featureFlags: extrasRouter.featureFlags,
  auditLogs: extrasRouter.auditLogs,
});

export type AppRouter = typeof fullRouter;
