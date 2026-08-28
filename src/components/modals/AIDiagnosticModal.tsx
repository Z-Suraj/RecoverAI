import React, { useState, useEffect } from 'react';
import { RecoveryOpportunity } from '../../types';
import { formatINR } from '../../utils/formatters';
import {
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedCounter } from '../common/AnimatedCounter';

interface AIDiagnosticModalProps {
  opportunity: RecoveryOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onExecute?: (opp: RecoveryOpportunity) => void;
}

export const AIDiagnosticModal: React.FC<AIDiagnosticModalProps> = ({
  opportunity,
  isOpen,
  onClose,
  onExecute,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  const steps = [
    'Analyzing transaction payload & gateway latency',
    'Reviewing customer transaction history & CLV',
    'Calculating recovery probability heuristic',
    'Evaluating merchant policy safety bounds',
    'Synthesis complete & recommendation ready',
  ];

  useEffect(() => {
    if (isOpen && opportunity) {
      setCurrentStep(0);
      setCompleted(false);

      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            clearInterval(interval);
            setCompleted(true);
            return steps.length - 1;
          }
          return prev + 1;
        });
      }, 450);

      return () => clearInterval(interval);
    }
  }, [isOpen, opportunity]);

  if (!isOpen || !opportunity) return null;

  const probability = opportunity.aiDiagnosis.recoveryProbability;
  // Circumference for r=38 is 2 * PI * 38 = ~238.76
  const circleCircumference = 238.76;
  const strokeDashoffset = circleCircumference - (circleCircumference * probability) / 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">AI Opportunity Diagnosis</h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  {opportunity.transactionId} • {opportunity.customerName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Step by Step Sequence */}
            <div className="space-y-2.5">
              {steps.map((label, idx) => {
                const isDone = currentStep > idx || completed;
                const isCurrent = currentStep === idx && !completed;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className={`flex items-center space-x-3 p-2.5 rounded-xl border text-xs transition-all ${
                      isDone
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 font-semibold'
                        : isCurrent
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold shadow-2xs'
                        : 'bg-slate-50/50 border-slate-100 text-slate-400'
                    }`}
                  >
                    <div className="shrink-0">
                      {isDone ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <span className="flex-1">{label}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Results Reveal when diagnosis completes */}
            {completed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 pt-2 border-t border-slate-100"
              >
                {/* Circular Gauge and Primary Metric */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-6">
                  {/* Animated Circular Progress Indicator */}
                  <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                      <circle
                        cx="48"
                        cy="48"
                        r="38"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="38"
                        stroke="#10b981"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circleCircumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xl font-black font-mono text-slate-900 leading-none">
                        <AnimatedCounter value={probability} suffix="%" duration={1000} />
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Yield</span>
                    </div>
                  </div>

                  {/* Recommendation details */}
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                      Recommended Strategy
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">
                      {opportunity.aiDiagnosis.recommendedAction}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Channel: <strong className="text-slate-700">{opportunity.aiDiagnosis.recommendedChannel}</strong> • Estimated time: <span className="font-mono font-semibold text-indigo-600">~{opportunity.aiDiagnosis.estimatedTimeToRecoverSeconds}s</span>
                    </p>
                  </div>
                </div>

                {/* Reason Explanation */}
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs">
                  <span className="font-bold text-indigo-950 block mb-0.5">Diagnostic Reasoning:</span>
                  <p className="text-indigo-900/90 leading-relaxed text-[11px]">
                    {opportunity.aiDiagnosis.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Close
            </button>

            {completed && (
              <button
                onClick={() => {
                  onClose();
                  if (onExecute) onExecute(opportunity);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <span>Proceed to Execution</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
