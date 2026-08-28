import { Response } from 'express';
import {
  Transaction,
  Customer,
  RecoveryOpportunity,
  AuditLog,
  SystemNotification,
  Merchant,
  User,
  RecoveryExperiment,
  DashboardSummary,
  RevenueChartPoint,
  SimulationResult,
  RecoveryAction,
  RecoveryActionType,
  FailureReason,
  PaymentMethod,
  RevenueCategory
} from '../../src/types/index.js';
import {
  DEMO_MERCHANT,
  DEMO_USER,
  INITIAL_CUSTOMERS,
  INITIAL_TRANSACTIONS,
  INITIAL_OPPORTUNITIES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_EXPERIMENTS,
  INITIAL_REVENUE_CHART_7D,
  INITIAL_REVENUE_CHART_30D
} from '../data/seedData.js';
import { AIProvider, GeminiAIProvider, HeuristicAIProvider } from './aiProvider.js';
import { RecoveryPolicyEngine } from './policyEngine.js';
import { PaymentProvider, MockPaymentProvider } from './paymentProvider.js';

export class DataStore {
  private user: User = { ...DEMO_USER };
  private merchant: Merchant = { ...DEMO_MERCHANT };
  private customers: Map<string, Customer> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private opportunities: Map<string, RecoveryOpportunity> = new Map();
  private recoveryActions: RecoveryAction[] = [];
  private auditLogs: AuditLog[] = [];
  private notifications: SystemNotification[] = [];
  private experiments: RecoveryExperiment[] = [];
  private simulationHistory: SimulationResult[] = [];
  private sseClients: Set<Response> = new Set();

  private aiProvider: AIProvider;
  private policyEngine: RecoveryPolicyEngine;
  private paymentProvider: PaymentProvider;

  constructor() {
    this.aiProvider = process.env.GEMINI_API_KEY ? new GeminiAIProvider() : new HeuristicAIProvider();
    this.policyEngine = new RecoveryPolicyEngine();
    this.paymentProvider = new MockPaymentProvider();
    this.seed();

    // Start real-time heartbeat interval (every 10s)
    setInterval(() => {
      this.sendHeartbeat();
    }, 10000);
  }

  private seed() {
    INITIAL_CUSTOMERS.forEach((c) => this.customers.set(c.id, { ...c }));
    INITIAL_TRANSACTIONS.forEach((t) => this.transactions.set(t.id, { ...t, timeline: [...t.timeline] }));
    INITIAL_OPPORTUNITIES.forEach((o) => this.opportunities.set(o.id, { ...o, aiDiagnosis: { ...o.aiDiagnosis } }));
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.experiments = [...INITIAL_EXPERIMENTS];
  }

  // ==========================================
  // REAL-TIME SSE BROADCASTING & TELEMETRY
  // ==========================================
  addSSEClient(res: Response) {
    this.sseClients.add(res);
    res.on('close', () => {
      this.sseClients.delete(res);
    });
    res.on('error', () => {
      this.sseClients.delete(res);
    });
  }

  sendHeartbeat() {
    if (this.sseClients.size === 0) return;
    const heartbeatData = {
      status: 'LIVE',
      time: new Date().toISOString(),
      activeClients: this.sseClients.size,
      eventsPerSec: +(Math.random() * 0.4 + 1.2).toFixed(1),
    };
    const payload = `event: HEARTBEAT\ndata: ${JSON.stringify(heartbeatData)}\n\n`;
    this.sseClients.forEach((client) => {
      try {
        client.write(payload);
      } catch (err) {
        this.sseClients.delete(client);
      }
    });
  }

  broadcastEvent(eventType: string, data: any) {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    this.sseClients.forEach((client) => {
      try {
        client.write(payload);
      } catch (err) {
        this.sseClients.delete(client);
      }
    });
  }

  // ==========================================
  // AUTH & USER
  // ==========================================
  getUser() {
    return this.user;
  }

  getMerchant() {
    return this.merchant;
  }

  updateMerchantSettings(updates: Partial<Merchant['recoverySettings']>) {
    this.merchant.recoverySettings = {
      ...this.merchant.recoverySettings,
      ...updates,
    };
    this.addAuditLog({
      event: 'MERCHANT_SETTINGS_UPDATED',
      entityType: 'MERCHANT_SETTINGS',
      entityId: this.merchant.id,
      actor: `${this.user.name} (${this.user.role})`,
      decision: 'UPDATE_RECOVERY_POLICIES',
      result: 'APPLIED',
      metadata: updates,
    });
    return this.merchant;
  }

  completeOnboarding(profile: {
    businessName: string;
    industry: string;
    currency: string;
    maxRetryAttempts: number;
    manualApprovalThreshold: number;
    minRecoveryProbability: number;
  }) {
    this.merchant.name = profile.businessName || this.merchant.name;
    this.merchant.industry = profile.industry || this.merchant.industry;
    this.merchant.currency = profile.currency || 'INR';
    this.merchant.onboardingCompleted = true;
    this.merchant.recoverySettings.maxRetryAttempts = profile.maxRetryAttempts;
    this.merchant.recoverySettings.manualApprovalThreshold = profile.manualApprovalThreshold;
    this.merchant.recoverySettings.minRecoveryProbability = profile.minRecoveryProbability;

    this.addAuditLog({
      event: 'MERCHANT_ONBOARDING_COMPLETED',
      entityType: 'MERCHANT_SETTINGS',
      entityId: this.merchant.id,
      actor: this.user.name,
      decision: 'COMPLETE_ONBOARDING',
      result: 'SUCCESS',
    });
    return this.merchant;
  }

  // ==========================================
  // DASHBOARD SUMMARY & METRICS
  // ==========================================
  getDashboardSummary(): DashboardSummary {
    let grossRevenue = 1248600;
    let recoveredRevenue = 96400;
    let failedPayments = 112400;
    let abandonedCheckout = 64200;
    let failedSubscriptions = 48700;
    let overdueInvoices = 23200;

    let pendingOpportunities = 0;
    let pendingReviews = 0;

    this.opportunities.forEach((opp) => {
      if (opp.status === 'RECOVERED') {
        recoveredRevenue += (opp.recoveredAmount || opp.amount);
      } else if (opp.status === 'PENDING' || opp.status === 'DIAGNOSED' || opp.status === 'MANUAL_REVIEW_REQUIRED') {
        pendingOpportunities++;
        if (opp.status === 'MANUAL_REVIEW_REQUIRED' || opp.aiDiagnosis.requiresApproval) {
          pendingReviews++;
        }
      }
    });

    const revenueAtRisk = failedPayments + abandonedCheckout + failedSubscriptions + overdueInvoices;
    const potentiallyRecoverable = Math.round(revenueAtRisk * 0.701);
    const recoveryRate = Number(((recoveredRevenue / (revenueAtRisk + recoveredRevenue)) * 100).toFixed(1)) || 55.3;

    return {
      grossRevenue,
      revenueAtRisk,
      potentiallyRecoverable,
      recoveredRevenue,
      recoveryRate,
      recoveryAttemptRate: 71.4,
      activeOpportunitiesCount: Math.max(184, pendingOpportunities + 180),
      pendingManualReviewCount: pendingReviews,
      trends: {
        grossRevenueGrowth: 12.8,
        revenueAtRiskDelta: -4.2,
        recoveredGrowth: 23.4,
        recoveryRateDelta: 3.1,
      },
      riskBreakdown: {
        failedPayments,
        abandonedCheckout,
        failedSubscriptions,
        overdueInvoices,
      },
    };
  }

  getRevenueChart(range: '7D' | '30D' | '90D'): RevenueChartPoint[] {
    if (range === '7D') return INITIAL_REVENUE_CHART_7D;
    if (range === '30D') return INITIAL_REVENUE_CHART_30D;

    // 90D generator
    return Array.from({ length: 90 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (89 - i));
      const baseGross = 140000 + Math.sin(i / 4) * 30000 + i * 400;
      const risk = Math.round(baseGross * 0.185);
      const recovered = Math.round(risk * 0.54);
      return {
        date: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`,
        grossRevenue: Math.round(baseGross),
        successfulPayments: Math.round(baseGross - risk + recovered),
        revenueAtRisk: risk,
        recoveredRevenue: recovered,
      };
    });
  }

  // ==========================================
  // TRANSACTIONS
  // ==========================================
  getTransactions(filter?: {
    status?: string;
    category?: string;
    search?: string;
    limit?: number;
  }) {
    let list = Array.from(this.transactions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter((t) => t.status === filter.status);
    }
    if (filter?.category && filter.category !== 'ALL') {
      list = list.filter((t) => t.category === filter.category);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.customerEmail.toLowerCase().includes(q) ||
          (t.orderId && t.orderId.toLowerCase().includes(q))
      );
    }

    return list.slice(0, filter?.limit || 100);
  }

  getTransactionById(id: string): Transaction | undefined {
    return this.transactions.get(id);
  }

  // ==========================================
  // CUSTOMERS
  // ==========================================
  getCustomers(search?: string) {
    let list = Array.from(this.customers.values()).sort(
      (a, b) => b.lifetimeValue - a.lifetimeValue
    );

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q)
      );
    }
    return list;
  }

  getCustomerById(id: string): Customer | undefined {
    return this.customers.get(id);
  }

  // ==========================================
  // RECOVERY QUEUE & ACTIONS
  // ==========================================
  getOpportunities(filter?: {
    tab?: string; // 'ALL' | 'HIGH_PRIORITY' | 'PAYMENTS' | 'SUBSCRIPTIONS' | 'CHECKOUT' | 'INVOICES' | 'MANUAL_REVIEW'
    search?: string;
  }) {
    let list = Array.from(this.opportunities.values()).sort((a, b) => {
      // Sort manual reviews and high probability first
      if (a.status === 'MANUAL_REVIEW_REQUIRED' && b.status !== 'MANUAL_REVIEW_REQUIRED') return -1;
      if (b.status === 'MANUAL_REVIEW_REQUIRED' && a.status !== 'MANUAL_REVIEW_REQUIRED') return 1;
      return b.aiDiagnosis.recoveryProbability - a.aiDiagnosis.recoveryProbability;
    });

    if (filter?.tab) {
      switch (filter.tab) {
        case 'HIGH_PRIORITY':
          list = list.filter((o) => o.aiDiagnosis.priority === 'CRITICAL' || o.aiDiagnosis.priority === 'HIGH');
          break;
        case 'PAYMENTS':
          list = list.filter((o) => o.category === 'FAILED_PAYMENT');
          break;
        case 'SUBSCRIPTIONS':
          list = list.filter((o) => o.category === 'FAILED_SUBSCRIPTION');
          break;
        case 'CHECKOUT':
          list = list.filter((o) => o.category === 'ABANDONED_CHECKOUT');
          break;
        case 'INVOICES':
          list = list.filter((o) => o.category === 'OVERDUE_INVOICE');
          break;
        case 'MANUAL_REVIEW':
          list = list.filter((o) => o.status === 'MANUAL_REVIEW_REQUIRED' || o.aiDiagnosis.requiresApproval);
          break;
      }
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.transactionId.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.failureReason.toLowerCase().includes(q)
      );
    }

    return list;
  }

  getOpportunityById(id: string): RecoveryOpportunity | undefined {
    return this.opportunities.get(id);
  }

  async reAnalyzeOpportunity(id: string): Promise<RecoveryOpportunity> {
    const opp = this.opportunities.get(id);
    if (!opp) throw new Error(`Recovery opportunity ${id} not found`);

    const txn = this.transactions.get(opp.transactionId);
    if (!txn) throw new Error(`Transaction ${opp.transactionId} not found`);

    const customer = this.customers.get(opp.customerId);
    const diagnosis = await this.aiProvider.analyzeOpportunity({
      transaction: txn,
      customer,
      settings: this.merchant.recoverySettings,
    });

    opp.aiDiagnosis = diagnosis;
    opp.updatedAt = new Date().toISOString();
    if (diagnosis.requiresApproval) {
      opp.status = 'MANUAL_REVIEW_REQUIRED';
    }

    this.opportunities.set(opp.id, opp);

    // Audit
    this.addAuditLog({
      event: 'AI_DIAGNOSIS_TRIGGERED',
      entityType: 'RECOVERY_OPPORTUNITY',
      entityId: opp.id,
      actor: `${this.user.name} via RecoverAI Engine`,
      decision: 'RE_EVALUATE_PROBABILITY',
      result: `${diagnosis.recoveryProbability}% PROBABILITY (${diagnosis.recommendedAction})`,
      metadata: { diagnosis },
    });

    this.broadcastEvent('OPPORTUNITY_UPDATED', opp);
    return opp;
  }

  async executeRecoveryAction(params: {
    opportunityId: string;
    overrideManualReview?: boolean;
    actor?: string;
  }): Promise<{ success: boolean; opportunity: RecoveryOpportunity; action: RecoveryAction; message: string }> {
    const { opportunityId, overrideManualReview = false, actor = 'Recovery Intelligence Engine' } = params;

    const opp = this.opportunities.get(opportunityId);
    if (!opp) throw new Error(`Opportunity ${opportunityId} not found`);

    const txn = this.transactions.get(opp.transactionId);
    if (!txn) throw new Error(`Transaction ${opp.transactionId} not found`);

    const customer = this.customers.get(opp.customerId);

    // 1. Evaluate against Policy Engine
    const policyResult = this.policyEngine.evaluate({
      transaction: txn,
      customer,
      diagnosis: opp.aiDiagnosis,
      settings: this.merchant.recoverySettings,
      forceManualOverride: overrideManualReview,
    });

    const now = new Date().toISOString();

    if (!policyResult.allowed) {
      if (policyResult.requiresManualApproval) {
        opp.status = 'MANUAL_REVIEW_REQUIRED';
        this.opportunities.set(opp.id, opp);

        const action: RecoveryAction = {
          id: `ACT-${Math.floor(10000 + Math.random() * 90000)}`,
          opportunityId: opp.id,
          transactionId: txn.id,
          actionType: 'MANUAL_REVIEW',
          actor,
          status: 'PENDING_APPROVAL',
          reason: policyResult.reason,
          policyApplied: policyResult.policyName,
          resultMessage: 'Action held for human authorization by Recovery Policy Engine.',
          timestamp: now,
        };
        this.recoveryActions.push(action);

        this.addAuditLog({
          event: 'POLICY_MANUAL_HOLD',
          entityType: 'RECOVERY_OPPORTUNITY',
          entityId: opp.id,
          actor: 'Recovery Policy Engine',
          decision: 'REQUIRE_MANUAL_APPROVAL',
          result: policyResult.reason,
        });

        this.broadcastEvent('OPPORTUNITY_UPDATED', opp);
        return {
          success: false,
          opportunity: opp,
          action,
          message: policyResult.reason,
        };
      }

      // Stopped
      opp.status = 'STOPPED';
      this.opportunities.set(opp.id, opp);
      const action: RecoveryAction = {
        id: `ACT-${Math.floor(10000 + Math.random() * 90000)}`,
        opportunityId: opp.id,
        transactionId: txn.id,
        actionType: 'STOP_RECOVERY',
        actor,
        status: 'EXECUTED',
        reason: policyResult.reason,
        policyApplied: policyResult.policyName,
        resultMessage: 'Recovery workflow terminated by policy condition.',
        timestamp: now,
      };
      this.recoveryActions.push(action);
      return { success: false, opportunity: opp, action, message: policyResult.reason };
    }

    // 2. Execute Payment / Communication Action
    opp.status = 'IN_PROGRESS';
    txn.attemptCount += 1;

    let recoverySuccessful = false;
    let resultMessage = '';

    if (opp.aiDiagnosis.recommendedAction === 'RETRY_PAYMENT' || opp.aiDiagnosis.recommendedAction === 'RETRY_SUBSCRIPTION') {
      const paymentRes = await this.paymentProvider.retryPayment(txn);
      recoverySuccessful = paymentRes.success;
      resultMessage = paymentRes.gatewayMessage;
    } else {
      // Communication reminder action (WhatsApp / Email / SMS)
      // High conversion on simulated notification
      recoverySuccessful = Math.random() < (opp.aiDiagnosis.recoveryProbability / 100);
      resultMessage = recoverySuccessful
        ? `Customer received 1-click ${opp.aiDiagnosis.suggestedChannel} payment nudge and settled invoice.`
        : `${opp.aiDiagnosis.suggestedChannel} reminder sent. Awaiting customer payment session.`;
    }

    const action: RecoveryAction = {
      id: `ACT-${Math.floor(10000 + Math.random() * 90000)}`,
      opportunityId: opp.id,
      transactionId: txn.id,
      actionType: opp.aiDiagnosis.recommendedAction,
      actor,
      status: 'EXECUTED',
      reason: opp.aiDiagnosis.reasoning,
      policyApplied: policyResult.policyName,
      resultMessage,
      recoveredAmount: recoverySuccessful ? opp.amount : 0,
      timestamp: now,
    };
    this.recoveryActions.push(action);

    // 3. Update Transaction & Opportunity State
    if (recoverySuccessful) {
      opp.status = 'RECOVERED';
      opp.recoveredAmount = opp.amount;
      opp.recoveredAt = now;
      txn.status = 'RECOVERED';

      txn.timeline.push({
        id: `evt_rec_${Date.now()}`,
        timestamp: now,
        title: 'Recovery Successful',
        description: `₹${opp.amount.toLocaleString('en-IN')} recovered via ${opp.aiDiagnosis.recommendedAction} (${opp.aiDiagnosis.suggestedChannel}).`,
        type: 'RECOVERY_SUCCESS',
        actor,
      });

      if (customer) {
        customer.recoveredTransactions += 1;
        customer.successfulTransactions += 1;
        customer.lifetimeValue += opp.amount;
        this.customers.set(customer.id, customer);
      }

      // Add Notification
      this.addNotification({
        title: `₹${opp.amount.toLocaleString('en-IN')} Revenue Recovered`,
        message: `Successfully recovered payment for ${opp.customerName} (${txn.id}).`,
        type: 'RECOVERY_SUCCESS',
        link: `/transactions/${txn.id}`,
        amount: opp.amount,
      });

      // Audit Log
      this.addAuditLog({
        event: 'RECOVERY_SUCCEEDED',
        entityType: 'TRANSACTION',
        entityId: txn.id,
        actor,
        decision: 'EXECUTE_RECOVERY',
        result: `RECOVERED ₹${opp.amount.toLocaleString('en-IN')}`,
        metadata: { action, opportunityId: opp.id },
      });
    } else {
      opp.status = txn.attemptCount >= this.merchant.recoverySettings.maxRetryAttempts ? 'FAILED' : 'PENDING';
      txn.status = 'FAILED';

      txn.timeline.push({
        id: `evt_rec_${Date.now()}`,
        timestamp: now,
        title: 'Recovery Attempt Recorded',
        description: resultMessage,
        type: 'RECOVERY_FAILURE',
        actor,
      });

      this.addAuditLog({
        event: 'RECOVERY_ATTEMPT_UNRESOLVED',
        entityType: 'TRANSACTION',
        entityId: txn.id,
        actor,
        decision: 'EXECUTE_RECOVERY',
        result: 'ATTEMPT_FAILED_OR_PENDING',
        metadata: { action },
      });
    }

    opp.actionsTakenCount += 1;
    opp.updatedAt = now;
    txn.updatedAt = now;

    this.opportunities.set(opp.id, opp);
    this.transactions.set(txn.id, txn);

    // Broadcast SSE update
    this.broadcastEvent('RECOVERY_COMPLETED', {
      opportunity: opp,
      transaction: txn,
      action,
      summary: this.getDashboardSummary(),
    });

    return {
      success: recoverySuccessful,
      opportunity: opp,
      action,
      message: resultMessage,
    };
  }

  async executeBulkRecovery(opportunityIds: string[]): Promise<{
    processed: number;
    recoveredCount: number;
    recoveredRevenue: number;
    results: Array<{ id: string; success: boolean; message: string }>;
  }> {
    let recoveredCount = 0;
    let recoveredRevenue = 0;
    const results: Array<{ id: string; success: boolean; message: string }> = [];

    for (const oppId of opportunityIds) {
      try {
        const res = await this.executeRecoveryAction({
          opportunityId: oppId,
          overrideManualReview: false,
          actor: 'RecoverAI Bulk Auto-Executor',
        });
        if (res.success) {
          recoveredCount++;
          recoveredRevenue += res.opportunity.amount;
        }
        results.push({ id: oppId, success: res.success, message: res.message });
      } catch (err: any) {
        results.push({ id: oppId, success: false, message: err.message });
      }
    }

    this.addAuditLog({
      event: 'BULK_RECOVERY_EXECUTED',
      entityType: 'RECOVERY_OPPORTUNITY',
      entityId: `BULK_${opportunityIds.length}`,
      actor: `${this.user.name} (Bulk Execution)`,
      decision: `PROCESSED_${opportunityIds.length}_OPPORTUNITIES`,
      result: `RECOVERED_${recoveredCount}_TOTAL_INR_${recoveredRevenue}`,
    });

    return {
      processed: opportunityIds.length,
      recoveredCount,
      recoveredRevenue,
      results,
    };
  }

  // ==========================================
  // WEBHOOK EVENT SIMULATION
  // ==========================================
  processWebhookEvent(payload: {
    eventType: string;
    amount?: number;
    customerName?: string;
    customerEmail?: string;
    failureReason?: FailureReason;
    paymentMethod?: PaymentMethod;
    category?: RevenueCategory;
  }) {
    const amount = payload.amount || Math.floor(1999 + Math.random() * 8000);
    const custName = payload.customerName || 'Vikramaditya Rao';
    const custEmail = payload.customerEmail || 'vikramaditya@demo.example';
    const failureReason = payload.failureReason || 'BANK_TIMEOUT';
    const paymentMethod = payload.paymentMethod || 'UPI';
    const category = payload.category || 'FAILED_PAYMENT';

    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const oppId = `OPP-${Math.floor(10000 + Math.random() * 90000)}`;
    const custId = `cust_${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newCustomer: Customer = {
      id: custId,
      merchantId: this.merchant.id,
      name: custName,
      email: custEmail,
      phone: '+91 98111 00223',
      city: 'Pune',
      country: 'India',
      lifetimeValue: amount * 3,
      totalTransactions: 3,
      successfulTransactions: 2,
      failedTransactions: 1,
      recoveredTransactions: 0,
      segment: 'REGULAR',
      optedOutOfReminders: false,
      riskScore: 15,
      createdAt: now,
      lastActiveAt: now,
    };
    this.customers.set(custId, newCustomer);

    const newTxn: Transaction = {
      id: txnId,
      orderId: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      merchantId: this.merchant.id,
      customerId: custId,
      customerName: custName,
      customerEmail: custEmail,
      amount,
      currency: 'INR',
      status: 'PENDING_RECOVERY',
      category,
      paymentMethod,
      failureReason,
      failureCode: 'PSP_WEBHOOK_SIGNAL',
      attemptCount: 1,
      maxAttempts: 3,
      riskScore: 15,
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          id: `evt_wh_${Date.now()}`,
          timestamp: now,
          title: `Webhook Received: ${payload.eventType}`,
          description: `Gateway webhook dispatched payment event for ₹${amount.toLocaleString('en-IN')}.`,
          type: 'FAILURE',
          actor: 'Payment Gateway Webhook',
        },
      ],
    };
    this.transactions.set(txnId, newTxn);

    const requiresApproval = amount >= this.merchant.recoverySettings.manualApprovalThreshold;

    const newOpp: RecoveryOpportunity = {
      id: oppId,
      transactionId: txnId,
      merchantId: this.merchant.id,
      customerId: custId,
      customerName: custName,
      customerEmail: custEmail,
      amount,
      currency: 'INR',
      category,
      failureReason,
      status: requiresApproval ? 'MANUAL_REVIEW_REQUIRED' : 'PENDING',
      actionsTakenCount: 0,
      createdAt: now,
      updatedAt: now,
      aiDiagnosis: {
        recoveryProbability: failureReason === 'BANK_TIMEOUT' ? 88 : 74,
        priority: requiresApproval ? 'CRITICAL' : 'HIGH',
        diagnosis: `Real-time webhook event: ${payload.eventType} for ${custName}.`,
        recommendedAction: category === 'ABANDONED_CHECKOUT' ? 'SEND_CHECKOUT_REMINDER' : 'RETRY_PAYMENT',
        reasoning: 'Newly registered webhook event ingested. Customer has 2 prior successful transactions.',
        confidence: 90,
        requiresApproval,
        approvalReason: requiresApproval ? `Amount ₹${amount.toLocaleString('en-IN')} exceeds threshold.` : undefined,
        stopCondition: 'Stop after payment confirmation.',
        suggestedChannel: paymentMethod === 'UPI' ? 'AUTOMATED_RETRY' : 'WHATSAPP',
        smartRetryDelayMinutes: 5,
        modelUsed: 'RecoverAI Real-Time Ingestion Engine',
      },
    };
    this.opportunities.set(oppId, newOpp);

    this.addNotification({
      title: `New At-Risk Event: ₹${amount.toLocaleString('en-IN')}`,
      message: `${custName} experienced ${failureReason.replace(/_/g, ' ')}. Strategy prepared.`,
      type: requiresApproval ? 'MANUAL_APPROVAL_REQUIRED' : 'POLICY_TRIGGERED',
      link: `/transactions/${txnId}`,
      amount,
    });

    this.addAuditLog({
      event: 'WEBHOOK_EVENT_INGESTED',
      entityType: 'TRANSACTION',
      entityId: txnId,
      actor: 'Gateway Webhook Listener',
      decision: 'CREATE_RECOVERY_OPPORTUNITY',
      result: `OPPORTUNITY_${oppId}_INITIALIZED`,
      metadata: { webhookPayload: payload },
    });

    this.broadcastEvent('WEBHOOK_INGESTED', {
      transaction: newTxn,
      opportunity: newOpp,
      summary: this.getDashboardSummary(),
    });

    return { transaction: newTxn, opportunity: newOpp };
  }

  // ==========================================
  // AUDIT LOGS & NOTIFICATIONS
  // ==========================================
  getAuditLogs(filter?: {
    search?: string;
    entityType?: string;
    limit?: number;
  }) {
    let list = [...this.auditLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (filter?.entityType && filter.entityType !== 'ALL') {
      list = list.filter((a) => a.entityType === filter.entityType);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.event.toLowerCase().includes(q) ||
          a.entityId.toLowerCase().includes(q) ||
          a.actor.toLowerCase().includes(q) ||
          a.decision.toLowerCase().includes(q)
      );
    }
    return list.slice(0, filter?.limit || 100);
  }

  addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>) {
    const log: AuditLog = {
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
    this.broadcastEvent('AUDIT_LOG_ADDED', log);
    return log;
  }

  getNotifications() {
    return this.notifications;
  }

  addNotification(n: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) {
    const notif: SystemNotification = {
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...n,
    };
    this.notifications.unshift(notif);
    if (this.notifications.length > 50) this.notifications.pop();
    this.broadcastEvent('NOTIFICATION_RECEIVED', notif);
    return notif;
  }

  markAllNotificationsRead() {
    this.notifications.forEach((n) => (n.read = true));
    return this.notifications;
  }

  // ==========================================
  // EXPERIMENTS
  // ==========================================
  getExperiments() {
    return this.experiments;
  }

  // ==========================================
  // COPILOT AI QUERY
  // ==========================================
  async queryCopilot(question: string) {
    const summary = this.getDashboardSummary();
    const topOpps = this.getOpportunities().slice(0, 5).map((o) => ({
      id: o.transactionId,
      customer: o.customerName,
      amount: o.amount,
      issue: o.failureReason,
      probability: o.aiDiagnosis.recoveryProbability,
    }));
    const recentEvents = this.auditLogs.slice(0, 5).map((l) => ({
      event: l.event,
      entity: l.entityId,
      result: l.result,
    }));

    return this.aiProvider.askCopilot({
      question,
      context: {
        grossRevenue: summary.grossRevenue,
        revenueAtRisk: summary.revenueAtRisk,
        recoveredRevenue: summary.recoveredRevenue,
        recoveryRate: summary.recoveryRate,
        topOpportunities: topOpps,
        recentEvents,
      },
    });
  }

  // Reset/Re-seed
  resetDemoData() {
    this.customers.clear();
    this.transactions.clear();
    this.opportunities.clear();
    this.recoveryActions = [];
    this.seed();
    this.broadcastEvent('STATE_RESET', { summary: this.getDashboardSummary() });
    return { success: true, message: 'Demo data re-seeded to pristine operational baseline.' };
  }
}

export const dataStore = new DataStore();
