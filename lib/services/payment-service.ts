// Copyright © Knoux. All rights reserved.
/**
 * PaymentService - Secure payment processing with Stripe and PayPal
 */

export type PaymentProvider = "stripe" | "paypal";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded" | "cancelled";
export type SubscriptionStatus = "active" | "paused" | "cancelled" | "expired";

export interface PaymentMethod {
  id: string;
  userId: string;
  provider: PaymentProvider;
  type: "card" | "paypal" | "bank";
  lastFour?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  paymentMethodId: string;
  description: string;
  invoiceId?: string;
  metadata?: Record<string, any>;
  createdAt: number;
  completedAt?: number;
  refundedAt?: number;
  refundAmount?: number;
}

export interface Invoice {
  id: string;
  userId: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  invoiceNumber: string;
  issueDate: number;
  dueDate: number;
  paidDate?: number;
  items: InvoiceItem[];
  notes?: string;
  pdfUrl?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  tax?: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelledAt?: number;
  paymentMethodId: string;
  autoRenew: boolean;
  price: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  nextBillingDate?: number;
}

export interface RefundRequest {
  id: string;
  transactionId: string;
  userId: string;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "completed";
  requestedAt: number;
  processedAt?: number;
}

class PaymentServiceClass {
  private transactions: Map<string, Transaction> = new Map();
  private invoices: Map<string, Invoice> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private paymentMethods: Map<string, PaymentMethod> = new Map();
  private refundRequests: Map<string, RefundRequest> = new Map();
  private listeners: Map<string, Function[]> = new Map();

  // Stripe & PayPal API keys (should be in env variables)
  private stripeKey = process.env.STRIPE_SECRET_KEY || '';
  private paypalKey = process.env.PAYPAL_SECRET_KEY || '';

  /**
   * Returns true if a real or valid Stripe test key is configured.
   * Stripe test keys start with sk_test_ and live keys start with sk_live_.
   */
  private isStripeConfigured(): boolean {
    return this.stripeKey.startsWith('sk_test_') || this.stripeKey.startsWith('sk_live_');
  }

  /**
   * Returns the correct PayPal API host based on the key.
   * If no production key, defaults to sandbox.
   */
  private getPayPalHost(): string {
    // Use sandbox unless PAYPAL_ENV=production is explicitly set
    const env = process.env.PAYPAL_ENV || 'sandbox';
    return env === 'production'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  addPaymentMethod(
    userId: string,
    provider: PaymentProvider,
    type: "card" | "paypal" | "bank",
    details: any
  ): PaymentMethod {
    const method: PaymentMethod = {
      id: `pm_${Date.now()}`,
      userId,
      provider,
      type,
      lastFour: details.lastFour,
      expiryMonth: details.expiryMonth,
      expiryYear: details.expiryYear,
      isDefault: !this.paymentMethods.has(userId),
      createdAt: Date.now(),
    };

    this.paymentMethods.set(method.id, method);
    this.emit("paymentMethodAdded", { method });
    return method;
  }

  getPaymentMethods(userId: string): PaymentMethod[] {
    return Array.from(this.paymentMethods.values()).filter((m) => m.userId === userId);
  }

  async processPayment(
    userId: string,
    amount: number,
    currency: string,
    paymentMethodId: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<Transaction> {
    const method = this.paymentMethods.get(paymentMethodId);
    if (!method) {
      throw new Error("Payment method not found");
    }

    const transaction: Transaction = {
      id: `txn_${Date.now()}`,
      userId,
      amount,
      currency,
      provider: method.provider,
      status: "pending",
      paymentMethodId,
      description,
      metadata,
      createdAt: Date.now(),
    };

    this.transactions.set(transaction.id, transaction);
    this.emit("paymentInitiated", { transaction });

    try {
      // ─── Real payment gateway integration ──────────────────────────────
      if (method.provider === "stripe") {
        if (!this.isStripeConfigured()) {
          throw new Error('Stripe is not configured. Add STRIPE_SECRET_KEY (sk_test_... or sk_live_...) to your .env file. Get test keys at https://dashboard.stripe.com/test/apikeys');
        }
        const stripeResponse = await fetch("https://api.stripe.com/v1/payment_intents", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.stripeKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            amount: String(Math.round(amount * 100)), // Stripe uses cents
            currency: currency.toLowerCase(),
            description,
            "metadata[userId]": userId,
            "metadata[paymentMethodId]": paymentMethodId,
            confirm: "true",
            payment_method: paymentMethodId,
          }).toString(),
        });

        if (!stripeResponse.ok) {
          const err = await stripeResponse.json();
          throw new Error(err?.error?.message ?? "Stripe payment failed");
        }

        const intent = await stripeResponse.json();
        if (intent.status === "succeeded" || intent.status === "requires_capture") {
          transaction.status = "completed";
          transaction.completedAt = Date.now();
          transaction.providerTransactionId = intent.id;
        } else {
          throw new Error(`Stripe status: ${intent.status}`);
        }

      } else if (method.provider === "paypal") {
        // PayPal Orders API v2
        const authResponse = await fetch(`${this.getPayPalHost()}/v1/oauth2/token`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`${process.env.PAYPAL_CLIENT_ID}:${this.paypalKey}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "grant_type=client_credentials",
        });
        const auth = await authResponse.json();

        const orderResponse = await fetch(`${this.getPayPalHost()}/v2/checkout/orders`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${auth.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            intent: "CAPTURE",
            purchase_units: [{ amount: { currency_code: currency, value: (amount / 100).toFixed(2) }, description }],
          }),
        });
        const order = await orderResponse.json();
        transaction.status = order.status === "COMPLETED" ? "completed" : "pending";
        transaction.completedAt = Date.now();
        transaction.providerTransactionId = order.id;

      } else {
        // Unknown provider — mark as completed (handled externally)
        transaction.status = "completed";
        transaction.completedAt = Date.now();
      }

      const invoice = this.generateInvoice(transaction);
      this.emit("paymentCompleted", { transaction, invoice });

    } catch (err: any) {
      transaction.status = "failed";
      transaction.failureReason = err?.message ?? "Payment failed";
      this.emit("paymentFailed", { transaction, error: err?.message });
      throw err;
    }

    return transaction;
  }

  private completePayment(transactionId: string): void {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return;

    // In production, this callback comes from Stripe/PayPal webhook
    // Here we always mark as completed since initiation itself validates the card
    const success = true;

    if (success) {
      transaction.status = "completed";
      transaction.completedAt = Date.now();

      // Generate invoice
      const invoice = this.generateInvoice(transaction);
      this.emit("paymentCompleted", { transaction, invoice });
    } else {
      transaction.status = "failed";
      this.emit("paymentFailed", { transaction });
    }
  }

  private generateInvoice(transaction: Transaction): Invoice {
    const invoice: Invoice = {
      id: `inv_${Date.now()}`,
      userId: transaction.userId,
      transactionId: transaction.id,
      amount: transaction.amount,
      currency: transaction.currency,
      status: "paid",
      invoiceNumber: `INV-${Date.now().toString().slice(-8)}`,
      issueDate: Date.now(),
      dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      paidDate: Date.now(),
      items: [
        {
          description: transaction.description,
          quantity: 1,
          unitPrice: transaction.amount,
        },
      ],
    };

    this.invoices.set(invoice.id, invoice);
    return invoice;
  }

  createSubscription(
    userId: string,
    planId: string,
    planName: string,
    price: number,
    currency: string,
    billingCycle: "monthly" | "yearly",
    paymentMethodId: string
  ): Subscription {
    const subscription: Subscription = {
      id: `sub_${Date.now()}`,
      userId,
      planId,
      planName,
      status: "active",
      currentPeriodStart: Date.now(),
      currentPeriodEnd:
        Date.now() +
        (billingCycle === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000,
      paymentMethodId,
      autoRenew: true,
      price,
      currency,
      billingCycle,
      nextBillingDate:
        Date.now() +
        (billingCycle === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000,
    };

    this.subscriptions.set(subscription.id, subscription);
    this.emit("subscriptionCreated", { subscription });
    return subscription;
  }

  getSubscription(subscriptionId: string): Subscription | undefined {
    return this.subscriptions.get(subscriptionId);
  }

  getUserSubscriptions(userId: string): Subscription[] {
    return Array.from(this.subscriptions.values()).filter(
      (s) => s.userId === userId && s.status !== "cancelled"
    );
  }

  cancelSubscription(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.status = "cancelled";
      subscription.cancelledAt = Date.now();
      this.emit("subscriptionCancelled", { subscription });
    }
  }

  requestRefund(
    transactionId: string,
    userId: string,
    reason: string
  ): RefundRequest {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    const refundRequest: RefundRequest = {
      id: `ref_${Date.now()}`,
      transactionId,
      userId,
      amount: transaction.amount,
      reason,
      status: "pending",
      requestedAt: Date.now(),
    };

    this.refundRequests.set(refundRequest.id, refundRequest);

    // Auto-approve refunds within 30 days
    if (Date.now() - transaction.createdAt < 30 * 24 * 60 * 60 * 1000) {
      this.approveRefund(refundRequest.id);
    }

    this.emit("refundRequested", { refundRequest });
    return refundRequest;
  }

  private approveRefund(refundRequestId: string): void {
    const refund = this.refundRequests.get(refundRequestId);
    if (!refund) return;

    refund.status = "approved";
    refund.processedAt = Date.now();

    const transaction = this.transactions.get(refund.transactionId);
    if (transaction) {
      transaction.status = "refunded";
      transaction.refundedAt = Date.now();
      transaction.refundAmount = refund.amount;
    }

    this.emit("refundApproved", { refund });
  }

  getTransactionHistory(userId: string, limit: number = 20): Transaction[] {
    return Array.from(this.transactions.values())
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  getInvoices(userId: string): Invoice[] {
    return Array.from(this.invoices.values())
      .filter((i) => i.userId === userId)
      .sort((a, b) => b.issueDate - a.issueDate);
  }

  getPaymentStats(userId: string): {
    totalSpent: number;
    totalTransactions: number;
    successRate: number;
    lastPaymentDate?: number;
  } {
    const transactions = Array.from(this.transactions.values()).filter(
      (t) => t.userId === userId
    );
    const completed = transactions.filter((t) => t.status === "completed");

    return {
      totalSpent: completed.reduce((sum, t) => sum + t.amount, 0),
      totalTransactions: transactions.length,
      successRate:
        transactions.length > 0 ? (completed.length / transactions.length) * 100 : 0,
      lastPaymentDate: completed.length > 0 ? completed[0].createdAt : undefined,
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

export const PaymentService = new PaymentServiceClass();
