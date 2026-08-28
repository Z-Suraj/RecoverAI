import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { usePlatform } from '../context/PlatformContext';
import { SimulationResult, SimulationScenario } from '../types';
import { formatINR, formatPercent } from '../utils/formatters';
import {
  Cpu,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  Zap,
  Sliders,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { SafeImage } from '../components/common/SafeImage';
import { CONTEXT_IMAGES } from '../utils/avatarUtils';

interface SimulationPageProps {
  navigate: (path: string) => void;
}

export const SimulationPage: React.FC<SimulationPageProps> = ({ navigate }) => {
  const { addToast, triggerRefresh } = usePlatform();
  const [transactionCount, setTransactionCount] = useState<number>(1000);
  const [scenario, setScenario] = useState<SimulationScenario>('NORMAL_DAY');
  const [autoExecute, setAutoExecute] = useState<boolean>(true);
  const [running, setRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState<string>('Initializing synthetic stream...');
  const [result, setResult] = useState<SimulationResult | null>(null);

  const flowNodes = [
    { label: 'Transactions Stream', sub: 'Razorpay / UPI / Stripe' },
    { label: 'Risk Detection', sub: 'Anomaly & dropoff triggers' },
    { label: 'AI Diagnosis', sub: 'Root cause classification' },
    { label: 'Policy Bounds', sub: 'Merchant limits check' },
    { label: 'Autonomous Recovery', sub: 'Smart failover & links' },
    { label: 'Settled GMV', sub: 'Incremental revenue won' },
  ];

  const handleRunSimulation = async () => {
    setRunning(true);
    setProgress(15);
    setProcessingStage(`Generating ${transactionCount.toLocaleString('en-IN')} synthetic transactions...`);
    setResult(null);

    const stages = [
      'Injecting gateway failure vectors and network drops...',
      'AI Root-cause diagnosis & clustering running...',
      'Executing smart retries, WhatsApp recovery & PSP failovers...',
      'Aggregating revenue yield and calculating ROI metrics...',
    ];

    let stageIdx = 0;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) {
          clearInterval(interval);
          return 90;
        }
        if (stageIdx < stages.length) {
          setProcessingStage(stages[stageIdx]);
          stageIdx++;
        }
        return prev + 22;
      });
    }, 350);

    try {
      const data = await apiClient.runSimulation({
        transactionCount,
        scenario,
        autoExecuteHighProbability: autoExecute,
      });

      clearInterval(interval);
      setProgress(100);
      setProcessingStage('Simulation finalized.');
      setResult(data);
      triggerRefresh();

      if (data.successfullyRecovered > 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      }

      addToast({
        type: 'success',
        title: 'Simulation Complete',
        message: `Analyzed ${data.transactionsAnalyzed} transactions. Recovered ${formatINR(data.successfullyRecovered)} (${data.recoveryRate}% rate).`,
      });
    } catch (err: any) {
      clearInterval(interval);
      addToast({
        type: 'error',
        title: 'Simulation Failed',
        message: err.message || 'Error executing synthetic simulation.',
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bento Card */}
      <div id="simulation-header-card" className="bento-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Recovery Simulation Engine</h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Safe Sandboxed Mode
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Model high-volume transaction scenarios, stress-test recovery heuristics, and project bottom-line financial yield.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/experiments')}
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 transition-all flex items-center space-x-1 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>A/B Experiments</span>
          </button>
        </div>
      </div>

      {/* Visual Operational Flow Diagram */}
      <div className="bento-card p-6 space-y-4 bg-slate-950 text-white border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono">
              Autonomous Recovery Pipeline Architecture
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Zero-Latency Closed Loop</span>
        </div>

        {/* Nodes and Flow Lines */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
          {flowNodes.map((node, idx) => (
            <div
              key={node.label}
              className={`p-3 rounded-xl border relative transition-all ${
                running
                  ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-sm'
                  : 'bg-slate-900/80 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-indigo-400">0{idx + 1}</span>
                <span className={`w-2 h-2 rounded-full ${running ? 'bg-indigo-400 animate-ping' : 'bg-slate-600'}`} />
              </div>
              <h4 className="text-xs font-bold text-white leading-tight">{node.label}</h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">{node.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Simulation Configuration Bento Card */}
      <div id="simulation-config-card" className="bento-card p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Scenario & Scale Parameters</h3>
          <span className="text-xs text-slate-400 font-mono">Engine v2.4-sim</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Parameter 1: Volume */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Transaction Volume Scale</label>
            <div className="grid grid-cols-2 gap-2">
              {[100, 500, 1000, 5000].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setTransactionCount(count)}
                  className={`p-2.5 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer ${
                    transactionCount === count
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {count.toLocaleString('en-IN')} TXNs
                </button>
              ))}
            </div>
          </div>

          {/* Parameter 2: Scenario */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-2">Simulated Stress Scenario</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: 'NORMAL_DAY',
                  title: 'Normal Day',
                  desc: '14% baseline leakage across all payment channels',
                  image: CONTEXT_IMAGES.merchantDashboard,
                },
                {
                  id: 'PAYMENT_FAILURE_SPIKE',
                  title: 'UPI Failure Spike',
                  desc: 'Heavy bank server latency & 3DS timeouts',
                  image: CONTEXT_IMAGES.paymentTerminal,
                },
                {
                  id: 'SUBSCRIPTION_RENEWAL_FAILURE',
                  title: 'Renewal Failure',
                  desc: 'Recurring auto-debit cards expiring',
                  image: CONTEXT_IMAGES.enterpriseServer,
                },
                {
                  id: 'CHECKOUT_ABANDONMENT_SPIKE',
                  title: 'Checkout Spike',
                  desc: 'Flash sale surge & abandoned cart dropoffs',
                  image: CONTEXT_IMAGES.onlineShopping,
                },
                {
                  id: 'MIXED_REVENUE_LEAKAGE',
                  title: 'Mixed Multi-Channel Leakage',
                  desc: 'Multi-gateway network degradation',
                  image: CONTEXT_IMAGES.mobileCheckout,
                },
              ].map((s) => (
                <div
                  key={s.id}
                  onClick={() => setScenario(s.id as any)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                    scenario === s.id
                      ? 'bg-indigo-50/80 border-indigo-600 text-indigo-950 shadow-xs'
                      : 'bg-slate-50 border-slate-200/90 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-200">
                    <SafeImage
                      src={s.image}
                      alt={s.title}
                      fallbackType="context"
                      fallbackText={s.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">{s.title}</span>
                      {scenario === s.id && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 ml-1" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Policy toggle */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Autonomous Policy Interventions</span>
              <span className="text-[11px] text-slate-500">
                Apply intelligent recovery heuristics (Smart Retries, WhatsApp checkout nudges) during run
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={autoExecute}
            onChange={(e) => setAutoExecute(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded bg-white border-slate-300 cursor-pointer"
          />
        </div>

        {/* Run button & progress */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            id="btn-run-simulation-exec"
            onClick={handleRunSimulation}
            disabled={running}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{running ? 'Simulating High-Volume Flow...' : 'Execute Recovery Simulation'}</span>
          </button>

          {running && (
            <div className="w-full sm:w-80 space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span className="truncate max-w-[200px]">{processingStage}</span>
                <span className="font-mono">{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulation Results Output Bento Card */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          id="simulation-results-card"
          className="bento-card p-6 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Simulation Run Completed</h3>
                <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {result.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Scenario: <span className="font-semibold text-slate-800">{result.scenario}</span> • Analyzed {result.transactionsAnalyzed.toLocaleString('en-IN')} synthetic transactions
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/recovery')}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
              >
                <span>View Production Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Results Bento Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Revenue at Risk
              </span>
              <span className="text-xl font-black text-rose-600 font-mono mt-1 block">
                <AnimatedCounter value={result.revenueAtRisk} prefix="₹" />
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {result.recoveryOpportunitiesDetected} opportunities detected
              </span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Successfully Recovered
              </span>
              <span className="text-xl font-black text-emerald-700 font-mono mt-1 block">
                <AnimatedCounter value={result.successfullyRecovered} prefix="₹" />
              </span>
              <span className="text-[10px] text-emerald-600 font-medium mt-1 block">
                {result.actionsExecuted} policy interventions
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Recovery Rate
              </span>
              <span className="text-xl font-black text-slate-900 font-mono mt-1 block">
                <AnimatedCounter value={result.recoveryRate} suffix="%" />
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Calculated from scenario dataset</span>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200">
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">
                Avg Recovery Time
              </span>
              <span className="text-xl font-black text-indigo-700 font-mono mt-1 block">
                {result.averageTimeToRecoverySeconds}s
              </span>
              <span className="text-[10px] text-indigo-600 font-medium mt-1 block">
                Zero human overhead
              </span>
            </div>
          </div>

          {/* AI Diagnostics & Recommendations Box */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 border border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Engine Simulation Diagnostics</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Based on this simulation run, enabling <strong className="text-white">Smart Delay for UPI 504 errors</strong> and <strong className="text-white">instant 1-Click WhatsApp links</strong> rescued <strong className="text-emerald-400 font-mono">{formatINR(result.successfullyRecovered)}</strong> that would have otherwise churned permanently.
            </p>
          </div>

          {/* Breakdown by Category Bento Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-3">Leakage & Recovery Breakdown by Channel</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Category</th>
                    <th className="p-3">Simulated Revenue at Risk</th>
                    <th className="p-3">Recovered Revenue</th>
                    <th className="p-3">Channel Recovery Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.breakdownByCategory.map((cat) => (
                    <tr key={cat.category}>
                      <td className="p-3 font-bold text-slate-900">{cat.category}</td>
                      <td className="p-3 font-mono font-semibold text-rose-600">{formatINR(cat.atRisk)}</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">{formatINR(cat.recovered)}</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full"
                              style={{ width: `${cat.rate}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-slate-700">{cat.rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
