import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { usePlatform } from '../context/PlatformContext';
import { Transaction, Customer, RecoveryOpportunity } from '../types';
import { formatINR, formatDateTime, formatRelativeTime } from '../utils/formatters';
import { getCustomerAvatar } from '../utils/avatarUtils';
import {
  PriorityBadge,
  OpportunityStatusBadge,
  ProbabilityBar,
  FailureReasonLabel,
  TransactionStatusBadge
} from '../components/common/StatusBadge';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  User,
  Clock,
  Check,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { RecoveryExecutionModal } from '../components/modals/RecoveryExecutionModal';
import { AIDiagnosticModal } from '../components/modals/AIDiagnosticModal';
import { SafeImage } from '../components/common/SafeImage';

interface TransactionDetailPageProps {
  transactionId: string;
  navigate: (path: string) => void;
}

export const TransactionDetailPage: React.FC<TransactionDetailPageProps> = ({
  transactionId,
  navigate,
}) => {
  const { triggerRefresh, refreshKey, addToast } = usePlatform();
  const [data, setData] = useState<{
    transaction: Transaction;
    customer?: Customer;
    opportunity?: RecoveryOpportunity;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);

  useEffect(() => {
    const fetchTxn = async () => {
      setLoading(true);
      try {
        const res = await apiClient.getTransactionById(transactionId);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTxn();
  }, [transactionId, refreshKey]);

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center text-xs text-slate-500">
        Loading transaction details and recovery telemetry...
      </div>
    );
  }

  if (!data || !data.transaction) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Transaction Not Found</h3>
        <button
          onClick={() => navigate('/recovery')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          Return to Queue
        </button>
      </div>
    );
  }

  const { transaction: txn, customer, opportunity: opp } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Back Button & Header Bento Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bento-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/recovery')}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-lg font-black text-slate-900">{txn.id}</span>
              <TransactionStatusBadge status={txn.status} />
              {opp && <PriorityBadge priority={opp.priority} />}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ingested {formatDateTime(txn.createdAt)} • Payment Processor: <span className="font-bold text-slate-700">{txn.gateway}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {opp && opp.status !== 'RECOVERED' && (
            <>
              <button
                onClick={() => setIsDiagnosticModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Re-Diagnose AI</span>
              </button>

              <button
                onClick={() => setIsExecutionModalOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Execute Recovery</span>
              </button>
            </>
          )}

          {opp?.status === 'RECOVERED' && (
            <div className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Revenue Settled (+{formatINR(opp.amount)})</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Grid: Main Analysis (2 cols) + Customer Context (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Diagnosis & Policy Checks */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Diagnosis Card */}
          {opp ? (
            <div className="bento-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">AI Recovery Diagnosis</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-medium">Recovery Probability:</span>
                  <ProbabilityBar probability={opp.aiDiagnosis.recoveryProbability} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-500 font-medium block">Root Cause Analysis</span>
                  <p className="font-bold text-slate-900 mt-0.5">{opp.aiDiagnosis.rootCause}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200">
                  <span className="text-indigo-700 font-medium block">Optimal Recovery Channel</span>
                  <p className="font-bold text-indigo-900 mt-0.5">{opp.aiDiagnosis.recommendedChannel}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px] mb-1">
                  Strategy Reasoning & Telemetry
                </span>
                <p className="text-slate-700 leading-relaxed">{opp.aiDiagnosis.explanation}</p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-500">Execution Plan:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  {opp.aiDiagnosis.recommendedAction}
                </span>
                <span className="text-slate-500 font-mono">
                  (Estimated settlement: ~{opp.aiDiagnosis.estimatedTimeToRecoverSeconds}s)
                </span>
              </div>
            </div>
          ) : (
            <div className="bento-card p-6 text-xs text-slate-500">
              No active recovery opportunity linked.
            </div>
          )}

          {/* Policy Gatekeeper & Safety Guardrails */}
          <div className="bento-card p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Recovery Policy & Safety Gatekeeper</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50">
                <span className="text-slate-500 text-[11px] block">Retry Attempts</span>
                <p className="font-bold text-slate-900 mt-0.5">{txn.retryCount} of 3 attempts</p>
                <span className="text-[10px] text-emerald-600 font-medium">Within safe velocity limit</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50">
                <span className="text-slate-500 text-[11px] block">Approval Threshold</span>
                <p className="font-bold text-slate-900 mt-0.5">{formatINR(txn.amount)}</p>
                <span className="text-[10px] text-slate-500 font-medium">Floor: ₹10,000</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50">
                <span className="text-slate-500 text-[11px] block">Customer Risk Level</span>
                <p className="font-bold text-slate-900 mt-0.5">{customer?.riskScore || 'Low'}</p>
                <span className="text-[10px] text-indigo-600 font-medium">{customer?.paymentReliability || 95}% reliability</span>
              </div>
            </div>
          </div>

          {/* Audit Event Timeline */}
          <div className="bento-card p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight pb-2 border-b border-slate-100">
              Event Timeline & Audit Trail
            </h3>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              <div className="flex items-start space-x-3 relative">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                  <Clock className="w-3 h-3" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-900">Transaction Initiated</span>
                  <span className="text-slate-400 ml-2 font-mono">{formatDateTime(txn.createdAt)}</span>
                  <p className="text-slate-600 mt-0.5">Attempted payment of {formatINR(txn.amount)} via {txn.paymentMethod}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 relative">
                <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 z-10 shadow-xs">
                  <AlertTriangle className="w-3 h-3" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-rose-700">Payment Failed ({txn.failureReason.replace(/_/g, ' ')})</span>
                  <span className="text-slate-400 ml-2 font-mono">{formatDateTime(txn.updatedAt)}</span>
                  <p className="text-slate-600 mt-0.5">Gateway response: {txn.metadata?.gatewayErrorCode || 'PSP timeout'}</p>
                </div>
              </div>

              {opp && (
                <div className="flex items-start space-x-3 relative">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 z-10 shadow-xs">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-indigo-900">AI Diagnosis Generated</span>
                    <span className="text-slate-400 ml-2 font-mono">{formatDateTime(opp.detectedAt)}</span>
                    <p className="text-slate-600 mt-0.5">Assigned {opp.aiDiagnosis.recoveryProbability}% probability with {opp.aiDiagnosis.recommendedAction}</p>
                  </div>
                </div>
              )}

              {opp?.status === 'RECOVERED' && (
                <div className="flex items-start space-x-3 relative">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-emerald-700">Recovery Settled</span>
                    <span className="text-slate-400 ml-2 font-mono">{formatDateTime(txn.updatedAt)}</span>
                    <p className="text-slate-600 mt-0.5">Automated retry succeeded on alternate routing channel.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Intelligence */}
        <div className="space-y-6">
          <div className="bento-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Customer Profile</h3>
              </div>
              {customer && (
                <button
                  onClick={() => navigate(`/customers/${customer.id}`)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-0.5 cursor-pointer"
                >
                  <span>View CLV</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            {customer ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center space-x-3">
                  <SafeImage
                    src={getCustomerAvatar(customer.id, customer.name)}
                    alt={customer.name}
                    fallbackType="initials"
                    fallbackText={customer.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{customer.name}</h4>
                    <p className="text-slate-500 font-mono text-[11px] mt-0.5">{customer.email}</p>
                    <p className="text-slate-500 font-mono text-[11px]">{customer.phone}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 text-[10px] block">Lifetime Value</span>
                    <span className="font-bold text-slate-900 font-mono mt-0.5 block">
                      <AnimatedCounter value={customer.lifetimeValue} prefix="₹" />
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 text-[10px] block">Reliability</span>
                    <span className="font-bold text-emerald-700 font-mono mt-0.5 block">{customer.paymentReliability}%</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
                  <span className="text-slate-500 text-[11px] block">Preferred Method</span>
                  <span className="font-bold text-indigo-950 uppercase mt-0.5 block">{customer.preferredPaymentMethod}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">Customer profile unavailable</div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {opp && (
        <>
          <RecoveryExecutionModal
            opportunity={opp}
            isOpen={isExecutionModalOpen}
            onClose={() => setIsExecutionModalOpen(false)}
          />

          <AIDiagnosticModal
            opportunity={opp}
            isOpen={isDiagnosticModalOpen}
            onClose={() => setIsDiagnosticModalOpen(false)}
            onExecute={() => setIsExecutionModalOpen(true)}
          />
        </>
      )}
    </div>
  );
};
