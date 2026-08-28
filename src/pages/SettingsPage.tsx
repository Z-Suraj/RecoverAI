import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlatform } from '../context/PlatformContext';
import { apiClient } from '../api/client';
import {
  Settings,
  ShieldCheck,
  RotateCcw,
  Bell,
  Users,
  Save,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Sliders,
  MessageSquare,
  Mail,
  CreditCard,
  Send,
  Lock,
  Sparkles
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { merchant, updateMerchantSettings } = useAuth();
  const { addToast, triggerRefresh } = usePlatform();

  const [activeTab, setActiveTab] = useState<'POLICIES' | 'DUNNING' | 'GATEWAYS' | 'DANGER'>('POLICIES');

  // Policy Settings
  const [autoRetry, setAutoRetry] = useState(merchant?.recoverySettings.autoRetryEnabled ?? true);
  const [maxRetries, setMaxRetries] = useState(merchant?.recoverySettings.maxRetryAttempts ?? 3);
  const [threshold, setThreshold] = useState(merchant?.recoverySettings.manualReviewThresholdINR ?? 10000);
  const [whatsApp, setWhatsApp] = useState(merchant?.recoverySettings.enableWhatsAppNudges ?? true);
  const [email, setEmail] = useState(merchant?.recoverySettings.enableEmailNudges ?? true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await updateMerchantSettings({
        autoRetryEnabled: autoRetry,
        maxRetryAttempts: Number(maxRetries),
        manualReviewThresholdINR: Number(threshold),
        enableWhatsAppNudges: whatsApp,
        enableEmailNudges: email,
      });
      addToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'Recovery policy guardrails updated successfully.',
      });
      triggerRefresh();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Failed to save settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestWhatsApp = () => {
    addToast({
      type: 'success',
      title: 'WhatsApp Test Dispatched',
      message: 'Sent demo 1-click recovery intent link to merchant registered number.',
    });
  };

  const handleSendTestEmail = () => {
    addToast({
      type: 'success',
      title: 'Email Dunning Test Sent',
      message: 'Dispatched dynamic invoice retry sequence to merchant inbox.',
    });
  };

  const handleResetData = async () => {
    if (!window.confirm('Reset all demo opportunities, transactions, and audit logs to pristine defaults?')) {
      return;
    }
    setResetting(true);
    try {
      await apiClient.resetDemoData();
      triggerRefresh();
      addToast({
        type: 'info',
        title: 'Demo Reset Completed',
        message: 'Fintech state restored to clean initial data.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Reset Failed',
        message: err.message,
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Bento Banner */}
      <div className="bento-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Workspace & Policy Guardrails</h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Autonomous Governance
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure automated retry boundaries, human approval thresholds, and multi-channel dunning channels.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving Changes...' : 'Save Guardrails'}</span>
        </button>
      </div>

      {/* Settings Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-bold">
        {[
          { id: 'POLICIES', label: 'Policy Guardrails', icon: ShieldCheck },
          { id: 'DUNNING', label: 'Multi-Channel Dunning', icon: MessageSquare },
          { id: 'GATEWAYS', label: 'Gateways & Routing', icon: CreditCard },
          { id: 'DANGER', label: 'Demo Maintenance', icon: Trash2 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Policies */}
      {activeTab === 'POLICIES' && (
        <div className="bento-card p-6 space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Autonomous Recovery Guardrails</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <label className="text-xs font-bold text-slate-900 block">Autonomous Smart Retries</label>
                <span className="text-[11px] text-slate-500">
                  Allow automated gateway retry attempts when AI confidence is ≥ 70%
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoRetry}
                onChange={(e) => setAutoRetry(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <label className="text-xs font-bold text-slate-900 block">Maximum Retry Velocity Limit</label>
                <span className="text-[11px] text-slate-500">
                  Maximum automated retries allowed per transaction before terminating
                </span>
              </div>
              <select
                value={maxRetries}
                onChange={(e) => setMaxRetries(Number(e.target.value))}
                className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={2}>2 attempts</option>
                <option value={3}>3 attempts (Recommended)</option>
                <option value={4}>4 attempts</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <label className="text-xs font-bold text-slate-900 block">Human Operator Approval Floor (INR)</label>
                <span className="text-[11px] text-slate-500">
                  Transactions above this value require manual human sign-off before executing retry
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-32 bg-white border border-slate-200 text-xs font-mono font-bold rounded-lg px-2.5 py-1.5 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Dunning Channels */}
      {activeTab === 'DUNNING' && (
        <div className="bento-card p-6 space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Customer Outreach & 1-Click Dunning</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">WhatsApp 1-Click Recovery Links</span>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                    Highest Conversion (48%)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Send authenticated instant payment links when checkout is abandoned or UPI times out.
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleSendTestWhatsApp}
                  className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 transition-colors"
                >
                  Send Test
                </button>
                <input
                  type="checkbox"
                  checked={whatsApp}
                  onChange={(e) => setWhatsApp(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">Email Dunning Sequence</span>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-100 text-blue-800">
                    B2B & SaaS Invoices
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Automated smart follow-ups for failed recurring subscription payments.
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 transition-colors"
                >
                  Send Test
                </button>
                <input
                  type="checkbox"
                  checked={email}
                  onChange={(e) => setEmail(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Gateways & Routing */}
      {activeTab === 'GATEWAYS' && (
        <div className="bento-card p-6 space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Connected Gateways & Fallback Priority</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {[
              { name: 'Razorpay PG', status: 'Primary Ingestion', uptime: '99.99%', color: 'border-blue-200 bg-blue-50/40' },
              { name: 'Stripe India', status: 'Card & Global Routing', uptime: '99.98%', color: 'border-indigo-200 bg-indigo-50/40' },
              { name: 'Cashfree AutoCollect', status: 'UPI Instant Fallback', uptime: '99.95%', color: 'border-purple-200 bg-purple-50/40' },
              { name: 'PhonePe PG', status: 'QR & Intent Backup', uptime: '99.92%', color: 'border-violet-200 bg-violet-50/40' },
            ].map((gw, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${gw.color} flex items-center justify-between`}>
                <div>
                  <span className="font-extrabold text-slate-900 block">{gw.name}</span>
                  <span className="text-[11px] text-slate-500 font-medium">{gw.status}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-emerald-700">
                  {gw.uptime}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Demo Maintenance & Reset */}
      {activeTab === 'DANGER' && (
        <div className="bento-card p-6 space-y-5 border-rose-200 bg-rose-50/30 animate-in fade-in duration-150">
          <div className="flex items-center space-x-2 pb-3 border-b border-rose-100">
            <Trash2 className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-extrabold text-rose-950 tracking-tight">Pristine State Maintenance</h3>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Reset all demo opportunities, mock simulated webhooks, and audit logs back to pristine seed defaults.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetData}
                disabled={resetting}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center space-x-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
                <span>{resetting ? 'Restoring State...' : 'Reset Demo Data to Defaults'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
