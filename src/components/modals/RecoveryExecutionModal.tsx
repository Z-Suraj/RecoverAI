import React, { useState, useEffect } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { apiClient } from '../../api/client';
import { RecoveryOpportunity } from '../../types';
import { formatINR } from '../../utils/formatters';
import { getCustomerAvatar } from '../../utils/avatarUtils';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  X,
  Lock,
  Zap,
  Check,
  Loader2,
  PhoneCall,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { SafeImage } from '../common/SafeImage';

interface RecoveryExecutionModalProps {
  opportunity: RecoveryOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type ExecutionStage = 'REVIEW' | 'VALIDATING_POLICY' | 'EXECUTING' | 'SUCCESS' | 'FAILED';

export const RecoveryExecutionModal: React.FC<RecoveryExecutionModalProps> = ({
  opportunity,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { triggerRefresh, addToast } = usePlatform();
  const [stage, setStage] = useState<ExecutionStage>('REVIEW');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setStage('REVIEW');
      setErrorMessage(null);
      setActiveStepIdx(0);
    }
  }, [isOpen, opportunity]);

  if (!isOpen || !opportunity) return null;

  const handleStartExecution = async () => {
    setStage('VALIDATING_POLICY');
    setActiveStepIdx(1);
    setErrorMessage(null);

    // Simulated micro-stage for policy check
    setTimeout(async () => {
      setStage('EXECUTING');
      setActiveStepIdx(2);

      try {
        const res = await apiClient.executeRecovery(opportunity.id, false);
        
        setTimeout(() => {
          setStage('SUCCESS');
          setActiveStepIdx(3);
          triggerRefresh();
          addToast({
            type: 'success',
            title: 'Payment Rescued & Settled',
            message: `Recovered ${formatINR(opportunity.amount)} via ${opportunity.aiDiagnosis.recommendedChannel}.`,
          });
          if (onSuccess) onSuccess();
        }, 650);
      } catch (err: any) {
        setStage('FAILED');
        setErrorMessage(err.message || 'Recovery policy blocked execution.');
        addToast({
          type: 'error',
          title: 'Execution Blocked',
          message: err.message || 'Recovery attempt failed.',
        });
      }
    }, 600);
  };

  const steps = [
    { title: 'Review Transaction', desc: 'Verify customer context & amount' },
    { title: 'Policy Engine Check', desc: 'Velocity limits & risk bounds' },
    { title: 'Autonomous Execution', desc: 'Smart retry & WhatsApp rescue' },
    { title: 'Settlement & Ledger', desc: 'Revenue recovered & logged' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Execute Revenue Recovery</h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  {opportunity.transactionId} • {opportunity.customerName}
                </p>
              </div>
            </div>
            {stage !== 'EXECUTING' && stage !== 'VALIDATING_POLICY' && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Stepper Progress Bar */}
          <div className="px-6 pt-5 pb-3 border-b border-slate-100 bg-white">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 z-0" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-600 transition-all duration-500 z-0"
                style={{ width: `${(activeStepIdx / (steps.length - 1)) * 100}%` }}
              />

              {steps.map((step, idx) => {
                const isCompleted = activeStepIdx > idx || stage === 'SUCCESS';
                const isCurrent = activeStepIdx === idx && stage !== 'SUCCESS';

                return (
                  <div key={idx} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isCurrent
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-50 shadow-xs'
                          : 'bg-white text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
              <span>Review</span>
              <span>Policy</span>
              <span>Execute</span>
              <span>Settled</span>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-4">
            {stage === 'REVIEW' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Amount & Customer Summary Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <SafeImage
                      src={getCustomerAvatar(opportunity.customerId, opportunity.customerName)}
                      alt={opportunity.customerName}
                      fallbackType="initials"
                      fallbackText={opportunity.customerName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{opportunity.customerName}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">{opportunity.customerEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Target Amount
                    </span>
                    <span className="text-lg font-black font-mono text-slate-900">
                      {formatINR(opportunity.amount)}
                    </span>
                  </div>
                </div>

                {/* AI Recommendation Box */}
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 font-bold text-indigo-950">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Recommended Recovery Strategy</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {opportunity.aiDiagnosis.recoveryProbability}% Probability
                    </span>
                  </div>
                  <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                    {opportunity.aiDiagnosis.recommendedAction} via {opportunity.aiDiagnosis.recommendedChannel}.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Root Cause: <strong className="text-slate-700">{opportunity.failureReason.replace(/_/g, ' ')}</strong>
                  </p>
                </div>

                {/* Policy Bounds Guarantee */}
                <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Bounded by Safety Rules: Max 3 velocity retries &lt; ₹10,000 floor limit.</span>
                </div>
              </motion.div>
            )}

            {(stage === 'VALIDATING_POLICY' || stage === 'EXECUTING') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-8 text-center space-y-4"
              >
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                  <RotateCcw className="w-6 h-6 text-indigo-600 absolute" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    {stage === 'VALIDATING_POLICY' ? 'Checking Policy Safety Gates...' : 'Dispatching Autonomous Recovery...'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    {stage === 'VALIDATING_POLICY'
                      ? 'Confirming merchant limit bounds and customer eligibility score.'
                      : `Triggering ${opportunity.aiDiagnosis.recommendedChannel} failover routing for ₹${opportunity.amount.toLocaleString('en-IN')}.`}
                  </p>
                </div>
              </motion.div>
            )}

            {stage === 'SUCCESS' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4 text-center space-y-4"
              >
                {/* Green Animated Checkmark Icon */}
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                  <svg className="w-8 h-8 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                      className="animate-[dash_0.6s_ease-in-out_forwards]"
                    />
                  </svg>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Revenue Recovered
                  </span>
                  <div className="text-3xl font-black font-mono text-emerald-600 pt-1">
                    +<AnimatedCounter value={opportunity.amount} prefix="₹" />
                  </div>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto pt-1">
                    Successfully settled transaction <strong className="text-slate-900 font-mono">{opportunity.transactionId}</strong> for <strong>{opportunity.customerName}</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 font-mono">
                  Ledger ID: REC-{opportunity.id.replace('opp_', '')} • Status: SETTLED
                </div>
              </motion.div>
            )}

            {stage === 'FAILED' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-4 text-center space-y-3"
              >
                <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Recovery Blocked</h4>
                <p className="text-xs text-rose-600 max-w-xs mx-auto leading-relaxed">
                  {errorMessage || 'Policy limit or gateway constraint encountered.'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Recommended next action: Flag for manual operator review.
                </p>
              </motion.div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
            {stage === 'REVIEW' && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartExecution}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <span>Execute Recovery</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {(stage === 'VALIDATING_POLICY' || stage === 'EXECUTING') && (
              <div className="w-full text-center text-xs font-mono text-slate-400">
                Executing automated pipeline...
              </div>
            )}

            {(stage === 'SUCCESS' || stage === 'FAILED') && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                Close Panel
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
