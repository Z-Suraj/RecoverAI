import React from 'react';
import { PriorityLevel, OpportunityStatus, TransactionStatus, FailureReason, RevenueCategory } from '../../types';

export const PriorityBadge: React.FC<{ priority: PriorityLevel }> = ({ priority }) => {
  switch (priority) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-red-600 animate-pulse" />
          Critical
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500" />
          High
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          Medium
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          Low
        </span>
      );
  }
};

export const OpportunityStatusBadge: React.FC<{ status: OpportunityStatus }> = ({ status }) => {
  switch (status) {
    case 'RECOVERED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500" />
          Recovered
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-500 animate-spin" />
          In Progress
        </span>
      );
    case 'MANUAL_REVIEW_REQUIRED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-purple-600" />
          Manual Review
        </span>
      );
    case 'DIAGNOSED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
          Ready
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          Unrecovered
        </span>
      );
    case 'STOPPED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          Stopped
        </span>
      );
    case 'PENDING':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          Pending
        </span>
      );
  }
};

export const TransactionStatusBadge: React.FC<{ status: TransactionStatus }> = ({ status }) => {
  switch (status) {
    case 'SUCCESS':
    case 'RECOVERED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          {status === 'RECOVERED' ? 'Recovered' : 'Success'}
        </span>
      );
    case 'PROCESSING':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          Processing
        </span>
      );
    case 'PENDING_RECOVERY':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          Pending Recovery
        </span>
      );
    case 'FAILED':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
          Failed
        </span>
      );
  }
};

export const CategoryBadge: React.FC<{ category: RevenueCategory }> = ({ category }) => {
  switch (category) {
    case 'FAILED_PAYMENT':
      return <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Payment</span>;
    case 'ABANDONED_CHECKOUT':
      return <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Checkout</span>;
    case 'FAILED_SUBSCRIPTION':
      return <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">Subscription</span>;
    case 'OVERDUE_INVOICE':
      return <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">Invoice</span>;
    default:
      return null;
  }
};

export const FailureReasonLabel: React.FC<{ reason: FailureReason }> = ({ reason }) => {
  const map: Record<FailureReason, { label: string; tone: string }> = {
    BANK_TIMEOUT: { label: 'Bank Timeout', tone: 'text-amber-700' },
    NETWORK_ERROR: { label: 'Network Error', tone: 'text-blue-700' },
    CUSTOMER_ABANDONED: { label: 'Checkout Abandoned', tone: 'text-orange-700' },
    INSUFFICIENT_FUNDS: { label: 'Insufficient Balance', tone: 'text-rose-700' },
    SUBSCRIPTION_INSUFFICIENT_FUNDS: { label: 'Auto-Debit Failed', tone: 'text-rose-700' },
    CARD_DECLINED: { label: 'Card Declined', tone: 'text-red-700' },
    EXPIRED_CARD: { label: 'Expired Card', tone: 'text-slate-600' },
    AUTHENTICATION_FAILED: { label: '3DS Auth Failed', tone: 'text-amber-700' },
    GATEWAY_ERROR: { label: 'Gateway Latency', tone: 'text-indigo-700' },
    INVOICE_PAST_DUE: { label: 'Net-30 Overdue', tone: 'text-purple-700' },
  };

  const item = map[reason] || { label: reason.replace(/_/g, ' '), tone: 'text-slate-700' };

  return <span className={`text-xs font-medium ${item.tone}`}>{item.label}</span>;
};

export const ProbabilityBar: React.FC<{ probability: number }> = ({ probability }) => {
  let color = 'bg-emerald-500';
  let textTone = 'text-emerald-700';

  if (probability < 40) {
    color = 'bg-red-500';
    textTone = 'text-red-700';
  } else if (probability < 75) {
    color = 'bg-amber-500';
    textTone = 'text-amber-700';
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="w-14 bg-slate-200 rounded-full h-1.5 overflow-hidden">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${probability}%` }} />
      </div>
      <span className={`text-xs font-bold font-mono ${textTone}`}>{probability}%</span>
    </div>
  );
};
