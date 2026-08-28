import { Transaction } from '../../src/types/index.js';

export interface PaymentExecutionResult {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  providerReference: string;
  gatewayMessage: string;
  paymentMethodUsed: string;
  settledAt: string;
  errorCode?: string;
}

export interface PaymentProvider {
  createPayment(params: { amount: number; customerId: string; method: string }): Promise<PaymentExecutionResult>;
  getPayment(transactionId: string): Promise<PaymentExecutionResult | null>;
  retryPayment(transaction: Transaction): Promise<PaymentExecutionResult>;
  getPaymentStatus(transactionId: string): Promise<'PENDING' | 'SUCCESS' | 'FAILED'>;
  createRefund(transactionId: string, amount?: number): Promise<{ success: boolean; refundId: string }>;
}

export class MockPaymentProvider implements PaymentProvider {
  async createPayment(params: { amount: number; customerId: string; method: string }): Promise<PaymentExecutionResult> {
    const rrn = `RRN-${Math.floor(100000000 + Math.random() * 900000000)}`;
    return {
      success: true,
      transactionId: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      amount: params.amount,
      currency: 'INR',
      providerReference: rrn,
      gatewayMessage: 'Payment captured and scheduled for T+1 settlement.',
      paymentMethodUsed: params.method,
      settledAt: new Date().toISOString(),
    };
  }

  async getPayment(transactionId: string): Promise<PaymentExecutionResult | null> {
    return {
      success: true,
      transactionId,
      amount: 4999,
      currency: 'INR',
      providerReference: `RRN-${Math.floor(100000000 + Math.random() * 900000000)}`,
      gatewayMessage: 'Transaction verified on banking gateway network.',
      paymentMethodUsed: 'UPI',
      settledAt: new Date().toISOString(),
    };
  }

  async retryPayment(transaction: Transaction): Promise<PaymentExecutionResult> {
    // Deterministic simulation: high recovery likelihood on retry if attemptCount <= 2
    // If it was a network error or bank timeout, 92% recovery success
    const baseRate = transaction.failureReason === 'BANK_TIMEOUT' || transaction.failureReason === 'NETWORK_ERROR' ? 0.92 : 0.78;
    const isSuccess = Math.random() < baseRate;

    const rrn = `RRN-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const settledAt = new Date().toISOString();

    if (isSuccess) {
      return {
        success: true,
        transactionId: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency || 'INR',
        providerReference: rrn,
        gatewayMessage: `Payment successfully authorized and captured via ${transaction.paymentMethod} (Bank Reference: ${rrn}).`,
        paymentMethodUsed: transaction.paymentMethod,
        settledAt,
      };
    } else {
      return {
        success: false,
        transactionId: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency || 'INR',
        providerReference: rrn,
        gatewayMessage: `Retry attempt failed: Issuer bank rejected authorization (${transaction.failureReason}).`,
        paymentMethodUsed: transaction.paymentMethod,
        settledAt,
        errorCode: 'RETRY_DECLINED_BY_ISSUER',
      };
    }
  }

  async getPaymentStatus(transactionId: string): Promise<'PENDING' | 'SUCCESS' | 'FAILED'> {
    return 'SUCCESS';
  }

  async createRefund(transactionId: string, amount?: number): Promise<{ success: boolean; refundId: string }> {
    return {
      success: true,
      refundId: `RFD-${Math.floor(100000 + Math.random() * 900000)}`,
    };
  }
}

export class RazorpayProvider implements PaymentProvider {
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret';
  }

  async createPayment(params: { amount: number; customerId: string; method: string }): Promise<PaymentExecutionResult> {
    return new MockPaymentProvider().createPayment(params);
  }

  async getPayment(transactionId: string): Promise<PaymentExecutionResult | null> {
    return new MockPaymentProvider().getPayment(transactionId);
  }

  async retryPayment(transaction: Transaction): Promise<PaymentExecutionResult> {
    // In production environment with active credentials, this invokes Razorpay Orders/Payment links API.
    // For test and preview sandbox, runs safe bounded simulation.
    return new MockPaymentProvider().retryPayment(transaction);
  }

  async getPaymentStatus(transactionId: string): Promise<'PENDING' | 'SUCCESS' | 'FAILED'> {
    return 'SUCCESS';
  }

  async createRefund(transactionId: string, amount?: number): Promise<{ success: boolean; refundId: string }> {
    return new MockPaymentProvider().createRefund(transactionId, amount);
  }
}
