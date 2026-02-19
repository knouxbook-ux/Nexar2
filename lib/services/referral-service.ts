// Copyright © Knoux. All rights reserved.
/**
 * ReferralService - Manage referral program and commissions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export interface ReferralCode {
  code: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
  isActive: boolean;
  discountPercentage: number;
  maxUses: number;
  currentUses: number;
  totalEarnings: number;
}

export interface ReferralUser {
  id: string;
  referrerId: string;
  referralCode: string;
  signupDate: number;
  subscriptionTier: string;
  status: "active" | "inactive";
  commissionEarned: number;
}

export interface CommissionRecord {
  id: string;
  userId: string;
  referralUserId: string;
  amount: number;
  percentage: number;
  date: number;
  status: "pending" | "completed" | "paid";
  paymentMethod?: string;
}

class ReferralServiceClass {
  private referralCodes: Map<string, ReferralCode> = new Map();
  private referralUsers: Map<string, ReferralUser[]> = new Map();
  private commissions: Map<string, CommissionRecord> = new Map();
  private listeners: Map<string, Function[]> = new Map();

  private commissionRates = {
    free: 0.1, // 10% for free tier
    pro: 0.15, // 15% for pro tier
    premium: 0.2, // 20% for premium tier
  };

  generateReferralCode(
    userId: string,
    discountPercentage: number = 10,
    maxUses: number = -1
  ): ReferralCode {
    const code = this.generateCode();
    const referralCode: ReferralCode = {
      code,
      userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
      isActive: true,
      discountPercentage,
      maxUses,
      currentUses: 0,
      totalEarnings: 0,
    };

    this.referralCodes.set(code, referralCode);
    this.emit("referralCodeGenerated", { code, referralCode });
    return referralCode;
  }

  getReferralCode(code: string): ReferralCode | undefined {
    return this.referralCodes.get(code);
  }

  getUserReferralCodes(userId: string): ReferralCode[] {
    return Array.from(this.referralCodes.values()).filter(
      (code) => code.userId === userId && code.isActive
    );
  }

  validateReferralCode(code: string): boolean {
    const referralCode = this.referralCodes.get(code);
    if (!referralCode) return false;
    if (!referralCode.isActive) return false;
    if (referralCode.expiresAt < Date.now()) return false;
    if (referralCode.maxUses > 0 && referralCode.currentUses >= referralCode.maxUses)
      return false;
    return true;
  }

  applyReferralCode(
    code: string,
    newUserId: string,
    subscriptionTier: string
  ): { success: boolean; discount: number; message: string } {
    const referralCode = this.referralCodes.get(code);

    if (!referralCode) {
      return { success: false, discount: 0, message: "Invalid referral code" };
    }

    if (!this.validateReferralCode(code)) {
      return { success: false, discount: 0, message: "Referral code is not valid" };
    }

    // Create referral user record
    const referralUser: ReferralUser = {
      id: `ref_user_${Date.now()}`,
      referrerId: referralCode.userId,
      referralCode: code,
      signupDate: Date.now(),
      subscriptionTier,
      status: "active",
      commissionEarned: 0,
    };

    if (!this.referralUsers.has(referralCode.userId)) {
      this.referralUsers.set(referralCode.userId, []);
    }
    this.referralUsers.get(referralCode.userId)!.push(referralUser);

    // Update referral code usage
    referralCode.currentUses++;

    // Calculate and record commission
    const commissionRate =
      this.commissionRates[subscriptionTier as keyof typeof this.commissionRates] ||
      0.1;
    const commissionAmount = 100 * commissionRate; // Assuming base subscription price

    const commission: CommissionRecord = {
      id: `comm_${Date.now()}`,
      userId: referralCode.userId,
      referralUserId: referralUser.id,
      amount: commissionAmount,
      percentage: commissionRate * 100,
      date: Date.now(),
      status: "pending",
    };

    this.commissions.set(commission.id, commission);
    referralCode.totalEarnings += commissionAmount;
    referralUser.commissionEarned = commissionAmount;

    this.emit("referralApplied", {
      referralCode,
      referralUser,
      commission,
    });

    return {
      success: true,
      discount: referralCode.discountPercentage,
      message: `Referral applied! You get ${referralCode.discountPercentage}% discount`,
    };
  }

  getReferralStats(userId: string): {
    totalReferrals: number;
    activeReferrals: number;
    totalEarnings: number;
    pendingEarnings: number;
    completedEarnings: number;
  } {
    const referrals = this.referralUsers.get(userId) || [];
    const userCommissions = Array.from(this.commissions.values()).filter(
      (c) => c.userId === userId
    );

    const activeReferrals = referrals.filter((r) => r.status === "active").length;
    const totalEarnings = referrals.reduce((sum, r) => sum + r.commissionEarned, 0);
    const pendingEarnings = userCommissions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + c.amount, 0);
    const completedEarnings = userCommissions
      .filter((c) => c.status === "completed" || c.status === "paid")
      .reduce((sum, c) => sum + c.amount, 0);

    return {
      totalReferrals: referrals.length,
      activeReferrals,
      totalEarnings,
      pendingEarnings,
      completedEarnings,
    };
  }

  getReferredUsers(userId: string): ReferralUser[] {
    return this.referralUsers.get(userId) || [];
  }

  getCommissionHistory(userId: string): CommissionRecord[] {
    return Array.from(this.commissions.values())
      .filter((c) => c.userId === userId)
      .sort((a, b) => b.date - a.date);
  }

  async requestPayout(userId: string, amount: number): Promise<boolean> {
    const commissions = Array.from(this.commissions.values()).filter(
      (c) => c.userId === userId && c.status === "pending"
    );

    let totalAvailable = 0;
    commissions.forEach((c) => {
      if (totalAvailable < amount) {
        c.status = "completed";
        totalAvailable += c.amount;
      }
    });

    this.emit("payoutRequested", { userId, amount });
    return totalAvailable >= amount;
  }

  private generateCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "REF";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
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

export const ReferralService = new ReferralServiceClass();

export const referralService = ReferralService;
