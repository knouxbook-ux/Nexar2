// Copyright © Knoux. All rights reserved.
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  analytics, chatMessages, conversations, InsertUser, notifications,
  payments, ratings, recordings, referrals, sessions, subscriptions, users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

// ─── USERS ───────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => {
    const value = user[field]; if (value === undefined) return;
    const normalized = value ?? null; values[field] = normalized; updateSet[field] = normalized;
  });
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0] ?? undefined;
}

export async function getAllUsers(limit = 50, offset = 0) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(users).limit(limit).offset(offset).orderBy(desc(users.createdAt));
}

export async function getUserStats() {
  const db = await getDb(); if (!db) return { total: 0, admins: 0 };
  const [total, adminCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "admin")),
  ]);
  return { total: total[0]?.count ?? 0, admins: adminCount[0]?.count ?? 0 };
}

// ─── RECORDINGS ──────────────────────────────────────────────────────────────

export async function createRecording(data: { userId: number; title: string; description?: string; duration?: number; resolution?: "720p" | "1080p" | "4K"; fileSize?: number; thumbnail?: string; isPublic?: number; }) {
  const db = await getDb(); if (!db) return null;
  return db.insert(recordings).values({ userId: data.userId, title: data.title, description: data.description ?? null, duration: data.duration ?? 0, resolution: data.resolution ?? "1080p", fileSize: data.fileSize ?? 0, thumbnail: data.thumbnail ?? null, isPublic: data.isPublic ?? 1 });
}

export async function getUserRecordings(userId: number, limit = 20, offset = 0) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(recordings).where(eq(recordings.userId, userId)).limit(limit).offset(offset).orderBy(desc(recordings.createdAt));
}

export async function getRecordingById(id: number) {
  const db = await getDb(); if (!db) return null;
  const result = await db.select().from(recordings).where(eq(recordings.id, id)).limit(1);
  return result[0] ?? null;
}

export async function updateRecording(id: number, data: Partial<{ title: string; description: string; isPublic: number; views: number; likes: number }>) {
  const db = await getDb(); if (!db) return;
  await db.update(recordings).set(data).where(eq(recordings.id, id));
}

export async function deleteRecording(id: number) {
  const db = await getDb(); if (!db) return;
  await db.delete(recordings).where(eq(recordings.id, id));
}

export async function getRecordingStats(userId: number) {
  const db = await getDb(); if (!db) return { count: 0, totalDuration: 0, totalSize: 0 };
  const result = await db.select({ count: sql<number>`count(*)`, totalDuration: sql<number>`sum(duration)`, totalSize: sql<number>`sum(fileSize)` }).from(recordings).where(eq(recordings.userId, userId));
  return { count: result[0]?.count ?? 0, totalDuration: result[0]?.totalDuration ?? 0, totalSize: result[0]?.totalSize ?? 0 };
}

export async function getAllRecordings(limit = 50) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(recordings).limit(limit).orderBy(desc(recordings.createdAt));
}

// ─── SESSIONS ────────────────────────────────────────────────────────────────

export async function createSession(data: { userId: number; type: "recording" | "streaming" | "editing" }) {
  const db = await getDb(); if (!db) return null;
  return db.insert(sessions).values({ userId: data.userId, type: data.type, status: "active" });
}

export async function endSession(id: number, duration: number) {
  const db = await getDb(); if (!db) return;
  await db.update(sessions).set({ endTime: new Date(), duration, status: "completed" }).where(eq(sessions.id, id));
}

export async function getUserSessions(userId: number, limit = 20) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(sessions).where(eq(sessions.userId, userId)).limit(limit).orderBy(desc(sessions.startTime));
}

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

export async function upsertAnalytics(data: { userId: number; recordingCount?: number; totalDuration?: number; storageUsed?: number; viewsReceived?: number; engagementRate?: number }) {
  const db = await getDb(); if (!db) return;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  await db.insert(analytics).values({ userId: data.userId, recordingCount: data.recordingCount ?? 0, totalDuration: data.totalDuration ?? 0, storageUsed: data.storageUsed ?? 0, viewsReceived: data.viewsReceived ?? 0, engagementRate: data.engagementRate ?? 0, date: today });
}

export async function getUserAnalytics(userId: number, days = 30) {
  const db = await getDb(); if (!db) return [];
  const since = new Date(); since.setDate(since.getDate() - days);
  return db.select().from(analytics).where(and(eq(analytics.userId, userId), gte(analytics.date, since))).orderBy(desc(analytics.date));
}

export async function getAnalyticsSummary(userId: number) {
  const db = await getDb(); if (!db) return null;
  const result = await db.select({ totalRecordings: sql<number>`sum(recordingCount)`, totalDuration: sql<number>`sum(totalDuration)`, totalStorage: sql<number>`sum(storageUsed)`, totalViews: sql<number>`sum(viewsReceived)` }).from(analytics).where(eq(analytics.userId, userId));
  return result[0] ?? null;
}

// ─── SUBSCRIPTIONS ───────────────────────────────────────────────────────────

export async function getUserSubscription(userId: number) {
  const db = await getDb(); if (!db) return null;
  const result = await db.select().from(subscriptions).where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active"))).limit(1).orderBy(desc(subscriptions.createdAt));
  return result[0] ?? null;
}

export async function createSubscription(data: { userId: number; plan: "free" | "pro" | "premium"; price: number; billingCycle: "monthly" | "yearly"; nextBillingDate?: Date }) {
  const db = await getDb(); if (!db) return null;
  await db.update(subscriptions).set({ status: "cancelled" }).where(and(eq(subscriptions.userId, data.userId), eq(subscriptions.status, "active")));
  return db.insert(subscriptions).values({ userId: data.userId, plan: data.plan, status: "active", price: data.price, billingCycle: data.billingCycle, nextBillingDate: data.nextBillingDate ?? null });
}

export async function cancelSubscription(userId: number) {
  const db = await getDb(); if (!db) return;
  await db.update(subscriptions).set({ status: "cancelled" }).where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")));
}

export async function getSubscriptionStats() {
  const db = await getDb(); if (!db) return { free: 0, pro: 0, premium: 0, total: 0, mrr: 0 };
  const result = await db.select({ plan: subscriptions.plan, count: sql<number>`count(*)`, revenue: sql<number>`sum(price)` }).from(subscriptions).where(eq(subscriptions.status, "active")).groupBy(subscriptions.plan);
  const stats = { free: 0, pro: 0, premium: 0, total: 0, mrr: 0 };
  result.forEach((row) => { const plan = row.plan ?? "free"; (stats as any)[plan] = row.count; stats.total += row.count; stats.mrr += row.revenue ?? 0; });
  return stats;
}

// ─── PAYMENTS ────────────────────────────────────────────────────────────────

export async function createPayment(data: { userId: number; amount: number; currency?: string; paymentMethod: "card" | "paypal" | "bank_transfer"; transactionId?: string; invoiceId?: string }) {
  const db = await getDb(); if (!db) return null;
  return db.insert(payments).values({ userId: data.userId, amount: data.amount, currency: data.currency ?? "USD", paymentMethod: data.paymentMethod, status: "pending", transactionId: data.transactionId ?? null, invoiceId: data.invoiceId ?? null });
}

export async function updatePaymentStatus(id: number, status: "pending" | "completed" | "failed" | "refunded") {
  const db = await getDb(); if (!db) return;
  await db.update(payments).set({ status }).where(eq(payments.id, id));
}

export async function getUserPayments(userId: number, limit = 20) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(payments).where(eq(payments.userId, userId)).limit(limit).orderBy(desc(payments.createdAt));
}

export async function getPaymentStats() {
  const db = await getDb(); if (!db) return { total: 0, completed: 0, failed: 0, revenue: 0 };
  const result = await db.select({ total: sql<number>`count(*)`, completed: sql<number>`sum(case when status = 'completed' then 1 else 0 end)`, failed: sql<number>`sum(case when status = 'failed' then 1 else 0 end)`, revenue: sql<number>`sum(case when status = 'completed' then amount else 0 end)` }).from(payments);
  return result[0] ?? { total: 0, completed: 0, failed: 0, revenue: 0 };
}

// ─── LIVE CHAT ───────────────────────────────────────────────────────────────

export async function createConversation(data: { userId: number; subject: string; category?: string; priority?: "low" | "medium" | "high" }) {
  const db = await getDb(); if (!db) return null;
  return db.insert(conversations).values({ userId: data.userId, subject: data.subject, category: data.category ?? "general", priority: data.priority ?? "medium", status: "open" });
}

export async function getUserConversations(userId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(conversations).where(eq(conversations.userId, userId)).orderBy(desc(conversations.createdAt));
}

export async function getAllConversations(limit = 50) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(conversations).limit(limit).orderBy(desc(conversations.updatedAt));
}

export async function updateConversationStatus(id: number, status: "open" | "in_progress" | "resolved" | "closed", agentId?: number, agentName?: string) {
  const db = await getDb(); if (!db) return;
  await db.update(conversations).set({ status, assignedAgentId: agentId ?? null, assignedAgentName: agentName ?? null }).where(eq(conversations.id, id));
}

export async function addChatMessage(data: { conversationId: number; senderId: number; senderName?: string; content: string; senderType: "user" | "agent" }) {
  const db = await getDb(); if (!db) return null;
  const result = await db.insert(chatMessages).values({ conversationId: data.conversationId, senderId: data.senderId, senderName: data.senderName ?? null, content: data.content, senderType: data.senderType });
  await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, data.conversationId));
  return result;
}

export async function getConversationMessages(conversationId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(chatMessages).where(eq(chatMessages.conversationId, conversationId)).orderBy(chatMessages.createdAt);
}

// ─── RATINGS ─────────────────────────────────────────────────────────────────

export async function createRating(data: { userId: number; rating: number; comment?: string }) {
  const db = await getDb(); if (!db) return null;
  return db.insert(ratings).values({ userId: data.userId, rating: data.rating, comment: data.comment ?? null });
}

export async function getAllRatings(limit = 50) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(ratings).limit(limit).orderBy(desc(ratings.createdAt));
}

export async function getRatingsStats() {
  const db = await getDb(); if (!db) return { average: 0, total: 0, fiveStar: 0 };
  const result = await db.select({ average: sql<number>`avg(rating)`, total: sql<number>`count(*)`, fiveStar: sql<number>`sum(case when rating = 5 then 1 else 0 end)` }).from(ratings);
  return result[0] ?? { average: 0, total: 0, fiveStar: 0 };
}

// ─── REFERRALS ───────────────────────────────────────────────────────────────

export async function createReferral(referrerId: number, referredId: number) {
  const db = await getDb(); if (!db) return null;
  return db.insert(referrals).values({ referrerId, referredId, status: "pending", commission: 0 });
}

export async function completeReferral(id: number, commission: number) {
  const db = await getDb(); if (!db) return;
  await db.update(referrals).set({ status: "completed", commission }).where(eq(referrals.id, id));
}

export async function getUserReferrals(userId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(referrals).where(eq(referrals.referrerId, userId)).orderBy(desc(referrals.createdAt));
}

export async function getReferralStats(userId: number) {
  const db = await getDb(); if (!db) return { total: 0, completed: 0, totalCommission: 0 };
  const result = await db.select({ total: sql<number>`count(*)`, completed: sql<number>`sum(case when status = 'completed' then 1 else 0 end)`, totalCommission: sql<number>`sum(commission)` }).from(referrals).where(eq(referrals.referrerId, userId));
  return result[0] ?? { total: 0, completed: 0, totalCommission: 0 };
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

export async function createNotification(data: { userId: number; title: string; message?: string; type?: "info" | "success" | "warning" | "error" }) {
  const db = await getDb(); if (!db) return null;
  return db.insert(notifications).values({ userId: data.userId, title: data.title, message: data.message ?? null, type: data.type ?? "info", isRead: 0 });
}

export async function getUserNotifications(userId: number, unreadOnly = false) {
  const db = await getDb(); if (!db) return [];
  const conditions = unreadOnly ? and(eq(notifications.userId, userId), eq(notifications.isRead, 0)) : eq(notifications.userId, userId);
  return db.select().from(notifications).where(conditions).orderBy(desc(notifications.createdAt));
}

export async function markNotificationRead(id: number) {
  const db = await getDb(); if (!db) return;
  await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, id));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb(); if (!db) return;
  await db.update(notifications).set({ isRead: 1 }).where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)));
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb(); if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)));
  return result[0]?.count ?? 0;
}

// ─── LICENSE KEYS ─────────────────────────────────────────────────────────────

import { licenseKeys, auditLogs, featureFlags } from "../drizzle/schema";
import crypto from "crypto";

export function generateLicenseKey(plan: "free" | "pro" | "premium"): string {
  const prefix = plan === "premium" ? "NXPR" : plan === "pro" ? "NXPO" : "NXFR";
  const segment = () => crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${segment()}-${segment()}-${segment()}`;
}

export async function createLicenseKey(data: {
  userId: number;
  plan: "free" | "pro" | "premium";
  maxDevices?: number;
  expiresAt?: Date;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const key = generateLicenseKey(data.plan);
  const result = await db.insert(licenseKeys).values({
    userId: data.userId,
    key,
    plan: data.plan,
    status: "active",
    maxDevices: data.maxDevices ?? 1,
    usedDevices: 0,
    expiresAt: data.expiresAt ?? null,
    notes: data.notes ?? null,
  });
  return { insertId: result, key };
}

export async function activateLicenseKey(key: string) {
  const db = await getDb();
  if (!db) return { success: false, reason: "db_unavailable" };
  const result = await db
    .select()
    .from(licenseKeys)
    .where(and(eq(licenseKeys.key, key), eq(licenseKeys.status, "active")))
    .limit(1);
  if (!result.length) return { success: false, reason: "key_not_found" };
  const record = result[0];
  if (record.expiresAt && record.expiresAt < new Date()) {
    await db.update(licenseKeys).set({ status: "expired" }).where(eq(licenseKeys.id, record.id));
    return { success: false, reason: "key_expired" };
  }
  if (record.usedDevices >= record.maxDevices) {
    return { success: false, reason: "max_devices_reached" };
  }
  await db
    .update(licenseKeys)
    .set({ usedDevices: record.usedDevices + 1, activatedAt: new Date(), status: record.usedDevices + 1 >= record.maxDevices ? "used" : "active" })
    .where(eq(licenseKeys.id, record.id));
  return { success: true, plan: record.plan, key: record.key };
}

export async function getUserLicenseKeys(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(licenseKeys).where(eq(licenseKeys.userId, userId)).orderBy(desc(licenseKeys.createdAt));
}

export async function revokeLicenseKey(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(licenseKeys).set({ status: "revoked" }).where(eq(licenseKeys.id, id));
}

// ─── AUDIT LOGS ──────────────────────────────────────────────────────────────

export async function addAuditLog(data: {
  userId?: number;
  action: string;
  resource?: string;
  resourceId?: number;
  details?: string;
  ipAddress?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values({
    userId: data.userId ?? null,
    action: data.action,
    resource: data.resource ?? null,
    resourceId: data.resourceId ?? null,
    details: data.details ?? null,
    ipAddress: data.ipAddress ?? null,
  });
}

export async function getAuditLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLogs).limit(limit).orderBy(desc(auditLogs.createdAt));
}

// ─── FEATURE FLAGS ───────────────────────────────────────────────────────────

export async function getAllFeatureFlags() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(featureFlags).orderBy(featureFlags.name);
}

export async function isFeatureEnabled(name: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return true; // default open
  const result = await db.select().from(featureFlags).where(eq(featureFlags.name, name)).limit(1);
  if (!result.length) return true;
  return result[0].enabled === 1;
}

export async function setFeatureFlag(name: string, enabled: boolean) {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(featureFlags)
    .values({ name, enabled: enabled ? 1 : 0, description: null, rolloutPercentage: 100 })
    .onDuplicateKeyUpdate({ set: { enabled: enabled ? 1 : 0, updatedAt: new Date() } });
}
