import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { RecoveryExperiment } from '../types';
import { formatINR } from '../utils/formatters';
import {
  FlaskConical,
  TrendingUp,
  CheckCircle2,
  Zap,
  Clock,
  ShieldCheck,
  BarChart2,
  Plus,
  Play,
  Pause,
  Award,
  ArrowUpRight,
  Sliders,
  X
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';

export const ExperimentsPage: React.FC = () => {
  const { addToast } = usePlatform();
  const [experiments, setExperiments] = useState<RecoveryExperiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Experiment Form State
  const [newExpName, setNewExpName] = useState('');
  const [newExpStrategy, setNewExpStrategy] = useState('Smart Delay 120s vs Immediate Retry');
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpTraffic, setNewExpTraffic] = useState(30);

  const fetchExp = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getExperiments();
      setExperiments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExp();
  }, []);

  const toggleExperimentStatus = (id: string) => {
    setExperiments((prev) =>
      prev.map((exp) => {
        if (exp.id === id) {
          const nextStatus = exp.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
          addToast({
            type: 'info',
            title: `Experiment ${exp.id} Updated`,
            message: `Status changed to ${nextStatus}.`,
          });
          return { ...exp, status: nextStatus as any };
        }
        return exp;
      })
    );
  };

  const handlePromoteExperiment = (exp: RecoveryExperiment) => {
    addToast({
      type: 'success',
      title: 'Strategy Promoted to Default Policy',
      message: `"${exp.strategy}" is now active as primary merchant routing rule (Yield: ${exp.recoveryRate}%).`,
    });
  };

  const handleCreateExperiment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpName.trim()) return;

    const newExperiment: RecoveryExperiment = {
      id: `EXP-00${experiments.length + 1}`,
      name: newExpName,
      strategy: newExpStrategy,
      description: newExpDesc || 'Evaluating conversion delta across multi-gateway fallback policies.',
      status: 'ACTIVE',
      trafficAllocation: newExpTraffic,
      totalAttempts: 0,
      recoveredCount: 0,
      revenueRecovered: 0,
      recoveryRate: 0,
      avgRecoveryTimeHours: 1.5,
      startDate: new Date().toISOString().slice(0, 10),
    };

    setExperiments((prev) => [newExperiment, ...prev]);
    setShowCreateModal(false);
    setNewExpName('');
    setNewExpDesc('');
    addToast({
      type: 'success',
      title: 'Experiment Launched',
      message: `A/B Test ${newExperiment.id} is now allocating ${newExpTraffic}% of live failure traffic.`,
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bento Banner */}
      <div className="bento-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Recovery Policy Experiments (A/B)</h2>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {experiments.filter((e) => e.status === 'ACTIVE').length} Running Tests
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Empirically evaluate recovery channels, latency delays, and routing strategies for maximum conversion yield.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New A/B Experiment</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bento-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Experiments</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-mono font-extrabold text-indigo-900">
              {experiments.filter((e) => e.status === 'ACTIVE').length} / {experiments.length}
            </span>
            <FlaskConical className="w-4 h-4 text-indigo-500" />
          </div>
        </div>

        <div className="bento-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Top Winning Strategy</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-mono font-extrabold text-emerald-700">76.4% Yield</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        <div className="bento-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total A/B Revenue Won</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-mono font-extrabold text-slate-900">
              {formatINR(experiments.reduce((acc, e) => acc + e.revenueRecovered, 0))}
            </span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="bento-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">Avg Response Latency</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-mono font-extrabold text-purple-900">1.4 hrs</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading live policy experiments...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiments.map((exp) => (
            <div
              key={exp.id}
              className="bento-card p-6 space-y-4 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-bold border border-slate-200">
                        {exp.id}
                      </span>
                      <button
                        onClick={() => toggleExperimentStatus(exp.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center space-x-1 transition-all cursor-pointer ${
                          exp.status === 'ACTIVE'
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                            : 'text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            exp.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span>{exp.status}</span>
                      </button>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 mt-2 line-clamp-2">{exp.name}</h3>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-0.5">
                    Target Strategy
                  </span>
                  <p className="font-semibold text-indigo-950">{exp.strategy}</p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{exp.description}</p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Recovery Rate
                    </span>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-xl font-extrabold font-mono text-emerald-700">{exp.recoveryRate}%</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {exp.recoveredCount}/{exp.totalAttempts}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Recovered Sum
                    </span>
                    <div className="mt-1">
                      <span className="text-base font-extrabold font-mono text-indigo-900 block truncate">
                        {formatINR(exp.revenueRecovered)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-medium">{exp.trafficAllocation}% Traffic Allocation</span>
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-slate-600">
                    {exp.avgRecoveryTimeHours}h avg
                  </span>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    onClick={() => handlePromoteExperiment(exp)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Promote to Policy</span>
                  </button>
                  <button
                    onClick={() => toggleExperimentStatus(exp.id)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors cursor-pointer"
                    title={exp.status === 'ACTIVE' ? 'Pause Experiment' : 'Resume Experiment'}
                  >
                    {exp.status === 'ACTIVE' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Experiment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FlaskConical className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">Create A/B Recovery Experiment</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExperiment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Experiment Name</label>
                <input
                  type="text"
                  required
                  value={newExpName}
                  onChange={(e) => setNewExpName(e.target.value)}
                  placeholder="e.g. Smart Delay 120s vs Immediate Retry on UPI"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Strategy Profile</label>
                <select
                  value={newExpStrategy}
                  onChange={(e) => setNewExpStrategy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-700"
                >
                  <option value="Smart Delay 120s vs Immediate Retry">Smart Delay 120s vs Immediate Retry</option>
                  <option value="Razorpay to Cashfree Dual PSP Fallback">Razorpay to Cashfree Dual PSP Fallback</option>
                  <option value="Instant WhatsApp 1-Click Link vs Email Dunning">Instant WhatsApp 1-Click Link vs Email Dunning</option>
                  <option value="Co-Badged RuPay / UPI Intent Routing">Co-Badged RuPay / UPI Intent Routing</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Hypothesis</label>
                <textarea
                  rows={2}
                  value={newExpDesc}
                  onChange={(e) => setNewExpDesc(e.target.value)}
                  placeholder="Describe what you want to validate..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700">Traffic Allocation: {newExpTraffic}%</label>
                  <span className="text-slate-400 font-mono">Control: {100 - newExpTraffic}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={newExpTraffic}
                  onChange={(e) => setNewExpTraffic(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors cursor-pointer"
                >
                  Launch Experiment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
