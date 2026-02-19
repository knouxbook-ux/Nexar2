// Copyright © Knoux. All rights reserved.
import { getDb } from "@/server/db";
import {
  users,
  recordings,
  sessions,
  analytics,
  subscriptions,
  ratings,
  referrals,
  chatMessages,
  conversations,
  payments,
  notifications,
} from "@/drizzle/schema";

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  const db = await getDb();
  if (!db) {
    console.error("❌ Database not available");
    process.exit(1);
  }

  try {
    // Seed 1000 users
    console.log("📝 Seeding users...");
    const userIds: number[] = [];
    for (let i = 0; i < 1000; i++) {
      await db.insert(users).values({
        openId: `user_${Date.now()}_${i}`,
        name: `User ${i + 1}`,
        email: `user${i + 1}@nexarpro.app`,
        loginMethod: "oauth",
        role: i === 0 ? "admin" : "user",
      });
      userIds.push(i + 1);
    }
    console.log(`✅ Seeded ${userIds.length} users`);

    // Seed 5000 recordings
    console.log("🎥 Seeding recordings...");
    let recordingCount = 0;
    for (let i = 0; i < 5000; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      await db.insert(recordings).values({
        userId,
        title: `Recording ${i + 1}`,
        description: `This is recording number ${i + 1}`,
        duration: Math.floor(Math.random() * 3600),
        resolution: ["720p", "1080p", "4K"][Math.floor(Math.random() * 3)] as any,
        fileSize: Math.floor(Math.random() * 5000) + 100,
        views: Math.floor(Math.random() * 100000),
        likes: Math.floor(Math.random() * 10000),
        isPublic: Math.random() > 0.3 ? 1 : 0,
        thumbnail: `https://picsum.photos/400/300?random=${i}`,
      });
      recordingCount++;
      if (recordingCount % 500 === 0) console.log(`  ${recordingCount}/5000 recordings seeded...`);
    }
    console.log(`✅ Seeded ${recordingCount} recordings`);

    // Seed 10000 sessions
    console.log("📹 Seeding sessions...");
    let sessionCount = 0;
    for (let i = 0; i < 10000; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const startTime = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      const duration = Math.floor(Math.random() * 3600);
      await db.insert(sessions).values({
        userId,
        type: ["recording", "streaming", "editing"][Math.floor(Math.random() * 3)] as any,
        startTime,
        endTime: new Date(startTime.getTime() + duration * 1000),
        duration,
        status: ["active", "completed", "failed"][Math.floor(Math.random() * 3)] as any,
      });
      sessionCount++;
      if (sessionCount % 1000 === 0) console.log(`  ${sessionCount}/10000 sessions seeded...`);
    }
    console.log(`✅ Seeded ${sessionCount} sessions`);

    // Seed 3000 analytics
    console.log("📊 Seeding analytics...");
    let analyticsCount = 0;
    for (let i = 0; i < 3000; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      await db.insert(analytics).values({
        userId,
        recordingCount: Math.floor(Math.random() * 50),
        totalDuration: Math.floor(Math.random() * 100000),
        storageUsed: Math.floor(Math.random() * 50000),
        viewsReceived: Math.floor(Math.random() * 500000),
        engagementRate: Math.floor(Math.random() * 100),
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      });
      analyticsCount++;
      if (analyticsCount % 500 === 0) console.log(`  ${analyticsCount}/3000 analytics seeded...`);
    }
    console.log(`✅ Seeded ${analyticsCount} analytics`);

    // Seed 2000 subscriptions
    console.log("⭐ Seeding subscriptions...");
    let subscriptionCount = 0;
    for (let i = 0; i < 2000; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const plans = ["free", "pro", "premium"];
      const plan = plans[Math.floor(Math.random() * plans.length)];
      const prices: Record<string, number> = { free: 0, pro: 999, premium: 2999 };
      await db.insert(subscriptions).values({
        userId,
        plan: plan as any,
        status: "active",
        price: prices[plan],
        billingCycle: Math.random() > 0.5 ? "monthly" : "yearly",
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      subscriptionCount++;
      if (subscriptionCount % 500 === 0) console.log(`  ${subscriptionCount}/2000 subscriptions seeded...`);
    }
    console.log(`✅ Seeded ${subscriptionCount} subscriptions`);

    // Seed 1000 ratings
    console.log("⭐ Seeding ratings...");
    let ratingCount = 0;
    for (let i = 0; i < 1000; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      await db.insert(ratings).values({
        userId,
        rating: Math.floor(Math.random() * 5) + 1,
        comment: `Great app! Rating ${i + 1}`,
        helpful: Math.floor(Math.random() * 100),
        notHelpful: Math.floor(Math.random() * 20),
      });
      ratingCount++;
    }
    console.log(`✅ Seeded ${ratingCount} ratings`);

    // Seed 500 referrals
    console.log("🔗 Seeding referrals...");
    let referralCount = 0;
    for (let i = 0; i < 500; i++) {
      const referrerId = userIds[Math.floor(Math.random() * userIds.length)];
      const referredId = userIds[Math.floor(Math.random() * userIds.length)];
      if (referrerId !== referredId) {
        await db.insert(referrals).values({
          referrerId,
          referredId,
          commission: Math.floor(Math.random() * 1000) + 100,
          status: ["pending", "completed", "failed"][Math.floor(Math.random() * 3)] as any,
        });
        referralCount++;
      }
    }
    console.log(`✅ Seeded ${referralCount} referrals`);

    // Seed 100 conversations
    console.log("💬 Seeding conversations...");
    const conversationIds: number[] = [];
    let conversationCount = 0;
    for (let i = 0; i < 100; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      await db.insert(conversations).values({
        userId,
        subject: `Support Ticket ${i + 1}`,
        category: ["technical", "billing", "general"][Math.floor(Math.random() * 3)],
        priority: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as any,
        status: ["open", "in_progress", "resolved"][Math.floor(Math.random() * 3)] as any,
        assignedAgentName: `Agent ${Math.floor(Math.random() * 5) + 1}`,
      });
      conversationIds.push(i + 1);
      conversationCount++;
    }
    console.log(`✅ Seeded ${conversationCount} conversations`);

    // Seed 500 chat messages
    console.log("💬 Seeding chat messages...");
    let messageCount = 0;
    for (let i = 0; i < 500; i++) {
      const conversationId = conversationIds[Math.floor(Math.random() * conversationIds.length)];
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      await db.insert(chatMessages).values({
        conversationId,
        senderId: userId,
        senderName: `User ${userId}`,
        content: `This is message ${i + 1}`,
        senderType: Math.random() > 0.5 ? "user" : "agent",
      });
      messageCount++;
    }
    console.log(`✅ Seeded ${messageCount} chat messages`);

    // Seed 1000 payments
    console.log("💳 Seeding payments...");
    let paymentCount = 0;
    for (let i = 0; i < 1000; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      await db.insert(payments).values({
        userId,
        amount: Math.floor(Math.random() * 10000) + 500,
        currency: "USD",
        paymentMethod: ["card", "paypal", "bank_transfer"][Math.floor(Math.random() * 3)] as any,
        status: ["completed", "pending", "failed"][Math.floor(Math.random() * 3)] as any,
        transactionId: `TXN_${Date.now()}_${i}`,
        invoiceId: `INV_${Date.now()}_${i}`,
      });
      paymentCount++;
      if (paymentCount % 200 === 0) console.log(`  ${paymentCount}/1000 payments seeded...`);
    }
    console.log(`✅ Seeded ${paymentCount} payments`);

    // Seed 500 notifications
    console.log("🔔 Seeding notifications...");
    let notificationCount = 0;
    for (let i = 0; i < 500; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      await db.insert(notifications).values({
        userId,
        title: `Notification ${i + 1}`,
        message: `This is notification message ${i + 1}`,
        type: ["info", "success", "warning", "error"][Math.floor(Math.random() * 4)] as any,
        isRead: Math.random() > 0.5 ? 1 : 0,
      });
      notificationCount++;
    }
    console.log(`✅ Seeded ${notificationCount} notifications`);

    console.log("\n✨ Database seeding completed successfully!");
    console.log(`
📊 Total Records Seeded:
  - Users: 1,000
  - Recordings: 5,000
  - Sessions: 10,000
  - Analytics: 3,000
  - Subscriptions: 2,000
  - Ratings: 1,000
  - Referrals: 500
  - Conversations: 100
  - Chat Messages: 500
  - Payments: 1,000
  - Notifications: 500
  ─────────────────────
  Total: 25,200 records
    `);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
