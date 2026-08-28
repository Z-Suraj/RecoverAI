import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  CreditCard,
  Sliders,
  Check
} from 'lucide-react';

interface OnboardingWizardProps {
  navigate: (path: string) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ navigate }) => {
  const { merchant, completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState(merchant?.name || 'NovaCart Commerce');
  const [industry, setIndustry] = useState('E-commerce & D2C');
  const [monthlyVolume, setMonthlyVolume] = useState('₹50L – ₹2 Cr / month');
  const [connectedGateways, setConnectedGateways] = useState<string[]>(['Razorpay', 'Cashfree']);
  const [autoRetry, setAutoRetry] = useState(true);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [manualApprovalLimit, setManualApprovalLimit] = useState(10000);
  const [enableWhatsApp, setEnableWhatsApp] = useState(true);

  const toggleGateway = (gw: string) => {
    setConnectedGateways((prev) =>
      prev.includes(gw) ? prev.filter((g) => g !== gw) : [...prev, gw]
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await completeOnboarding({
        name,
        recoverySettings: {
          autoRetryEnabled: autoRetry,
          maxRetryAttempts: maxAttempts,
          manualReviewThresholdINR: manualApprovalLimit,
          enableWhatsAppNudges: enableWhatsApp,
          enableEmailNudges: true,
          requireHumanApprovalForHighValue: true,
          highValueThresholdINR: 15000,
          paymentProviders: connectedGateways,
        },
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 mx-auto mb-3">
            <RotateCcw className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Setup Your Recovery Engine</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure merchant gateways, risk policies, and recovery automation guardrails.
          </p>

          {/* Stepper Header */}
          <div className="flex items-center justify-center space-x-3 mt-6">
            {[
              { num: 1, label: 'Profile' },
              { num: 2, label: 'Gateways' },
              { num: 3, label: 'Policies' },
            ].map((s) => (
              <div key={s.num} className="flex items-center space-x-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === s.num
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/20'
                      : step > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span className={`text-xs font-medium ${step === s.num ? 'text-white' : 'text-slate-500'}`}>
                  {s.label}
                </span>
                {s.num < 3 && <div className="w-8 h-0.5 bg-slate-800" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step Cards */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl">
          {/* STEP 1: Profile */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Merchant Business Profile</h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Company / Brand Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Primary Business Model</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>E-commerce & D2C Brands</option>
                  <option>SaaS & Subscription Software</option>
                  <option>EdTech & Digital Goods</option>
                  <option>Marketplaces & Aggregators</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Estimated Monthly GMV</label>
                <select
                  value={monthlyVolume}
                  onChange={(e) => setMonthlyVolume(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>₹10L – ₹50L / month</option>
                  <option>₹50L – ₹2 Cr / month</option>
                  <option>₹2 Cr – ₹10 Cr / month</option>
                  <option>₹10 Cr+ / month (Enterprise)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all"
                >
                  <span>Next: Connect Gateways</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Gateways */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Connect Payment & Data Gateways</h3>
              </div>
              <p className="text-xs text-slate-400">
                Select your active payment processors. RecoverAI will listen for failure webhooks and execute retries
                over these channels.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { id: 'Razorpay', label: 'Razorpay India', subtitle: 'UPI, Cards, Mandates' },
                  { id: 'Cashfree', label: 'Cashfree Payments', subtitle: 'Auto-collect & Subscriptions' },
                  { id: 'Stripe', label: 'Stripe Global', subtitle: 'International Cards & Wallets' },
                  { id: 'PayU', label: 'PayU India', subtitle: 'NetBanking & BNPL' },
                ].map((gw) => {
                  const active = connectedGateways.includes(gw.id);
                  return (
                    <div
                      key={gw.id}
                      onClick={() => toggleGateway(gw.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                        active
                          ? 'bg-indigo-950/40 border-indigo-600 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold block">{gw.label}</span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">{gw.subtitle}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          active ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-600'
                        }`}
                      >
                        {active && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all"
                >
                  <span>Next: Policy Safety Limits</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Policies */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Recovery Governance & Policy Rules</h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Autonomous Smart Retries</span>
                    <span className="text-[11px] text-slate-400">
                      Auto-trigger gateway retries when recovery probability is ≥ 70%
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoRetry}
                    onChange={(e) => setAutoRetry(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded bg-slate-950 border-slate-700"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Maximum Retry Attempts per Transaction</span>
                    <span className="text-[11px] text-slate-400">Strict safety cap to avoid card velocity blocks</span>
                  </div>
                  <select
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-700 text-xs font-bold text-white rounded-lg px-2.5 py-1"
                  >
                    <option value={2}>2 attempts</option>
                    <option value={3}>3 attempts</option>
                    <option value={4}>4 attempts</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Manual Approval Floor (INR)</span>
                    <span className="text-[11px] text-slate-400">
                      Transactions above this amount require human operator sign-off
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950 px-2 py-1 rounded border border-indigo-800">
                    ₹{manualApprovalLimit.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">WhatsApp Instant Nudges</span>
                    <span className="text-[11px] text-slate-400">
                      Send 1-click retry payment links via verified business API
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableWhatsApp}
                    onChange={(e) => setEnableWhatsApp(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded bg-slate-950 border-slate-700"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleFinish}
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-emerald-600/30"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Initializing...' : 'Launch Operational Dashboard'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
