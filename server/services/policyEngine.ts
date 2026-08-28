import {
  Transaction,
  Customer,
  MerchantRecoverySettings,
  AIDiagnosisResult,
  RecoveryActionType
} from '../../src/types/index.js';

export interface PolicyEvaluationResult {
  allowed: boolean;
  action: RecoveryActionType;
  requiresManualApproval: boolean;
  policyName: string;
  reason: string;
  stopReason?: string;
}

export class RecoveryPolicyEngine {
  /**
   * Evaluates if an automated or manual recovery action is permissible under merchant rules
   */
  evaluate(params: {
    transaction: Transaction;
    customer?: Customer;
    diagnosis: AIDiagnosisResult;
    settings: MerchantRecoverySettings;
    forceManualOverride?: boolean;
  }): PolicyEvaluationResult {
    const { transaction, customer, diagnosis, settings, forceManualOverride } = params;

    // Rule 1: Stop if payment already succeeded / recovered
    if (transaction.status === 'SUCCESS' || transaction.status === 'RECOVERED') {
      return {
        allowed: false,
        action: 'STOP_RECOVERY',
        requiresManualApproval: false,
        policyName: 'RULE_PAYMENT_ALREADY_SETTLED',
        reason: 'Payment has already been confirmed as collected. No recovery necessary.',
        stopReason: 'SETTLED',
      };
    }

    // Rule 2: Stop if max retry attempts reached
    if (transaction.attemptCount >= (settings.maxRetryAttempts || 3)) {
      return {
        allowed: false,
        action: 'STOP_RECOVERY',
        requiresManualApproval: false,
        policyName: 'RULE_MAX_ATTEMPTS_EXCEEDED',
        reason: `Maximum allowed retry attempts (${settings.maxRetryAttempts}) reached for this transaction.`,
        stopReason: 'MAX_RETRIES_REACHED',
      };
    }

    // Rule 3: Stop if customer opted out of communication reminders
    if (customer?.optedOutOfReminders && diagnosis.recommendedAction.includes('REMINDER')) {
      return {
        allowed: false,
        action: 'STOP_RECOVERY',
        requiresManualApproval: false,
        policyName: 'RULE_CUSTOMER_COMMUNICATION_OPT_OUT',
        reason: 'Customer has explicitly opted out of automated reminders and marketing nudges.',
        stopReason: 'CUSTOMER_OPTED_OUT',
      };
    }

    // Rule 4: High risk score check -> Manual Review
    if ((customer?.riskScore || 0) >= (settings.riskScoreThreshold || 75) || transaction.riskScore >= (settings.riskScoreThreshold || 75)) {
      return {
        allowed: !forceManualOverride,
        action: 'MANUAL_REVIEW',
        requiresManualApproval: true,
        policyName: 'RULE_FRAUD_RISK_THRESHOLD_EXCEEDED',
        reason: `Risk score (${Math.max(customer?.riskScore || 0, transaction.riskScore)}) exceeds safety threshold (${settings.riskScoreThreshold}). Manual agent verification required.`,
      };
    }

    // Rule 5: High transaction value check -> Manual Approval required
    if (transaction.amount >= settings.manualApprovalThreshold && !forceManualOverride) {
      return {
        allowed: false,
        action: 'MANUAL_REVIEW',
        requiresManualApproval: true,
        policyName: 'RULE_TRANSACTION_VALUE_APPROVAL_LIMIT',
        reason: `Transaction amount (₹${transaction.amount.toLocaleString('en-IN')}) exceeds auto-recovery threshold (₹${settings.manualApprovalThreshold.toLocaleString('en-IN')}). Requires human authorization.`,
      };
    }

    // Rule 6: Low probability -> Do not attempt / Stop
    if (diagnosis.recoveryProbability < settings.minRecoveryProbability) {
      return {
        allowed: false,
        action: 'STOP_RECOVERY',
        requiresManualApproval: false,
        policyName: 'RULE_MIN_PROBABILITY_FLOOR',
        reason: `Estimated recovery probability (${diagnosis.recoveryProbability}%) is below merchant minimum threshold (${settings.minRecoveryProbability}%).`,
        stopReason: 'PROBABILITY_TOO_LOW',
      };
    }

    // Rule 7: Auto-recovery disabled globally in settings
    if (!settings.autoRecoveryEnabled && !forceManualOverride) {
      return {
        allowed: false,
        action: 'MANUAL_REVIEW',
        requiresManualApproval: true,
        policyName: 'RULE_AUTO_RECOVERY_DISABLED',
        reason: 'Merchant has globally paused automated recovery triggers. Requires manual execution.',
      };
    }

    // Permitted: Priority or standard execution
    const isPriority = diagnosis.recoveryProbability >= 80;
    return {
      allowed: true,
      action: diagnosis.recommendedAction,
      requiresManualApproval: false,
      policyName: isPriority ? 'POLICY_PRIORITY_RECOVERY_FAST_PATH' : 'POLICY_STANDARD_BOUNDED_RECOVERY',
      reason: isPriority
        ? `High probability (${diagnosis.recoveryProbability}%) recovery opportunity with trusted customer profile.`
        : `Standard bounded recovery approved under merchant rules (${diagnosis.recoveryProbability}% probability).`,
    };
  }
}
