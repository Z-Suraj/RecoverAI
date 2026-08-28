// ==========================================
// RECOVERAI - CORE FINTECH TYPE DEFINITIONS
// ==========================================

export type FailureReason =
  | 'INSUFFICIENT_FUNDS'
  | 'BANK_TIMEOUT'
  | 'NETWORK_ERROR'
  | 'CARD_DECLINED'
  | 'AUTHENTICATION_FAILED'
  | 'CUSTOMER_ABANDONED'
  | 'EXPIRED_CARD'
  | 'GATEWAY_ERROR'
  | 'SUBSCRIPTION_INSUFFICIENT_FUNDS'
  | 'INVOICE_PAST_DUE';

export type RecoveryActionType =
  | 'RETRY_PAYMENT'
  | 'SEND_PAYMENT_REMINDER'
  | 'SEND_CHECKOUT_REMINDER'
  | 'RETRY_SUBSCRIPTION'
  | 'SEND_INVOICE_REMINDER'
  | 'MANUAL_REVIEW'
  | 'STOP_RECOVERY';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type OpportunityStatus =
  | 'PENDING'
  | 'DIAGNOSED'
  | 'IN_PROGRESS'
  | 'RECOVERED'
  | 'FAILED'
  | 'MANUAL_REVIEW_REQUIRED'
  | 'STOPPED';

export type TransactionStatus =
  | 'SUCCESS'
  | 'FAILED'
  | 'RECOVERED'
  | 'PROCESSING'
  | 'PENDING_RECOVERY';

export type PaymentMethod =
  | 'UPI'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'NET_BANKING'
  | 'AUTO_DEBIT_NACH'
  | 'WALLET';

export type RevenueCategory =
  | 'FAILED_PAYMENT'
  | 'ABANDONED_CHECKOUT'
  | 'FAILED_SUBSCRIPTION'
  | 'OVERDUE_INVOICE';

export type ConnectionStatus = 'LIVE' | 'RECONNECTING' | 'DEGRADED' | 'OFFLINE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'OPERATIONS_MANAGER' | 'FINANCE_ANALYST' | 'DEVELOPER';
  merchantId: string;
  avatarUrl?: string;
}

export interface Merchant {
  id: string;
  name: string;
  legalEntity: string;
  industry: string;
  country: string;
  currency: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
  onboardingCompleted: boolean;
  recoverySettings: MerchantRecoverySettings;
  createdAt: string;
}

export interface MerchantRecoverySettings {
  maxRetryAttempts: number;
  minRecoveryProbability: number; // e.g. 30 (percent)
  manualApprovalThreshold: number; // e.g. 25000 (INR)
  autoRecoveryEnabled: boolean;
  preferredChannels: ('EMAIL' | 'SMS' | 'WHATSAPP')[];
  retryIntervalHours: number;
  riskScoreThreshold: number; // e.g. 75
}

export interface Customer {
  id: string;
  merchantId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  lifetimeValue: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  recoveredTransactions: number;
  segment: 'VIP_ENTERPRISE' | 'HIGH_VALUE' | 'REGULAR' | 'NEW' | 'AT_RISK';
  optedOutOfReminders: boolean;
  riskScore: number; // 0 - 100
  createdAt: string;
  lastActiveAt: string;
}

export interface TransactionTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'ORDER' | 'PAYMENT_INIT' | 'FAILURE' | 'DIAGNOSIS' | 'POLICY_CHECK' | 'ACTION_TRIGGERED' | 'RECOVERY_SUCCESS' | 'RECOVERY_FAILURE';
  actor: string;
  metadata?: Record<string, any>;
}

export interface Transaction {
  id: string; // e.g. TXN-82941
  orderId: string; // e.g. ORD-94021
  subscriptionId?: string; // e.g. SUB-18342
  invoiceId?: string;
  merchantId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  category: RevenueCategory;
  paymentMethod: PaymentMethod;
  cardNetwork?: string;
  cardLast4?: string;
  bankName?: string;
  upiVpa?: string;
  failureReason: FailureReason;
  failureCode?: string;
  attemptCount: number;
  maxAttempts: number;
  riskScore: number;
  createdAt: string;
  updatedAt: string;
  timeline: TransactionTimelineEvent[];
}

export interface AIDiagnosisResult {
  recoveryProbability: number; // 0 - 100
  priority: PriorityLevel;
  diagnosis: string;
  recommendedAction: RecoveryActionType;
  reasoning: string;
  confidence: number; // 0 - 100
  requiresApproval: boolean;
  approvalReason?: string;
  stopCondition: string;
  suggestedChannel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'AUTOMATED_RETRY' | 'DIRECT_CALL';
  smartRetryDelayMinutes: number;
  modelUsed: string;
}

export interface RecoveryOpportunity {
  id: string; // e.g. OPP-38291
  transactionId: string;
  merchantId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  category: RevenueCategory;
  failureReason: FailureReason;
  status: OpportunityStatus;
  aiDiagnosis: AIDiagnosisResult;
  assignedTo?: string;
  actionsTakenCount: number;
  recoveredAmount?: number;
  recoveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecoveryAction {
  id: string; // e.g. ACT-91823
  opportunityId: string;
  transactionId: string;
  actionType: RecoveryActionType;
  actor: string; // e.g. 'Recovery Intelligence Engine' | 'Suraj Sharma (Manual)'
  status: 'EXECUTED' | 'FAILED' | 'PENDING_APPROVAL';
  reason: string;
  policyApplied: string;
  resultMessage: string;
  recoveredAmount?: number;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  event: string;
  entityType: 'TRANSACTION' | 'RECOVERY_OPPORTUNITY' | 'POLICY' | 'MERCHANT_SETTINGS' | 'SIMULATION' | 'AUTH';
  entityId: string;
  actor: string;
  decision: string;
  result: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'RECOVERY_SUCCESS' | 'HIGH_RISK_ALERT' | 'MANUAL_APPROVAL_REQUIRED' | 'SYSTEM' | 'POLICY_TRIGGERED';
  timestamp: string;
  read: boolean;
  link?: string;
  amount?: number;
}

export interface DashboardSummary {
  grossRevenue: number;
  revenueAtRisk: number;
  potentiallyRecoverable: number;
  recoveredRevenue: number;
  recoveryRate: number; // percentage e.g. 55.3
  recoveryAttemptRate: number; // percentage e.g. 71.4
  activeOpportunitiesCount: number;
  pendingManualReviewCount: number;
  trends: {
    grossRevenueGrowth: number;
    revenueAtRiskDelta: number;
    recoveredGrowth: number;
    recoveryRateDelta: number;
  };
  riskBreakdown: {
    failedPayments: number;
    abandonedCheckout: number;
    failedSubscriptions: number;
    overdueInvoices: number;
  };
}

export interface RevenueChartPoint {
  date: string;
  grossRevenue: number;
  successfulPayments: number;
  revenueAtRisk: number;
  recoveredRevenue: number;
}

export type SimulationScenario =
  | 'NORMAL_DAY'
  | 'PAYMENT_FAILURE_SPIKE'
  | 'SUBSCRIPTION_RENEWAL_FAILURE'
  | 'CHECKOUT_ABANDONMENT_SPIKE'
  | 'MIXED_REVENUE_LEAKAGE';

export interface SimulationConfig {
  transactionCount: number; // 100, 500, 1000, 5000
  scenario: SimulationScenario;
  autoExecuteHighProbability: boolean;
}

export interface SimulationResult {
  id: string;
  scenario: string;
  transactionsAnalyzed: number;
  revenueAtRisk: number;
  recoveryOpportunitiesDetected: number;
  actionsExecuted: number;
  successfullyRecovered: number;
  recoveryRate: number;
  averageTimeToRecoverySeconds: number;
  topRecoveredCategory: string;
  topRecoveryMethod: string;
  completedAt: string;
  breakdownByCategory: {
    category: string;
    atRisk: number;
    recovered: number;
    rate: number;
  }[];
}

export interface RecoveryExperiment {
  id: string;
  name: string;
  strategy: string;
  description: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  trafficAllocation: number; // e.g. 33%
  totalAttempts: number;
  recoveredCount: number;
  recoveryRate: number;
  revenueRecovered: number;
  avgRecoveryTimeHours: number;
  startDate: string;
}

export interface WebhookEventPayload {
  eventId: string;
  eventType:
    | 'payment.failed'
    | 'payment.recovered'
    | 'subscription.failed'
    | 'checkout.abandoned'
    | 'recovery.completed'
    | 'recovery.manual_review_required';
  timestamp: string;
  data: Record<string, any>;
}

export interface CopilotMessage {
  id: string;
  sender: 'USER' | 'COPILOT';
  text: string;
  timestamp: string;
  dataSummary?: Record<string, any>;
  actionSuggestions?: string[];
}
