import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { usePlatform } from '../context/PlatformContext';
import { DashboardSummary, RevenueChartPoint, RecoveryOpportunity } from '../types';
import { formatINR, formatPercent, formatRelativeTime } from '../utils/formatters';
import { getCustomerAvatar, getProductForTransaction, CONTEXT_IMAGES } from '../utils/avatarUtils';
import bannerImg from '../assets/images/fintech_banner_1787764601732.jpg';
import aiEngineImg from '../assets/images/ai_engine_visual_1787764618449.jpg';
import paymentSuccessImg from '../assets/images/payment_success_visual_1787764658923.jpg';
import {
  PriorityBadge,
  OpportunityStatusBadge,
  ProbabilityBar,
  FailureReasonLabel,
} from '../components/common/StatusBadge';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Cpu,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { motion } from 'motion/react';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { LiveActivityFeed } from '../components/dashboard/LiveActivityFeed';
import { WebhookIngestionVisual } from '../components/dashboard/WebhookIngestionVisual';
import { RecoveryExecutionModal } from '../components/modals/RecoveryExecutionModal';
import { AIDiagnosticModal } from '../components/modals/AIDiagnosticModal';
import { SafeImage } from '../components/common/SafeImage';

interface DashboardPageProps {
  navigate: (path: string) => void;
}

const DEFAULT_7D_CHART: RevenueChartPoint[] = [
  { date: '20 Aug', grossRevenue: 168400, successfulPayments: 134000, revenueAtRisk: 34400, recoveredRevenue: 19800 },
  { date: '21 Aug', grossRevenue: 182100, successfulPayments: 148200, revenueAtRisk: 33900, recoveredRevenue: 21400 },
  { date: '22 Aug', grossRevenue: 154900, successfulPayments: 122400, revenueAtRisk: 32500, recoveredRevenue: 18900 },
  { date: '23 Aug', grossRevenue: 192000, successfulPayments: 151000, revenueAtRisk: 41000, recoveredRevenue: 24600 },
  { date: '24 Aug', grossRevenue: 174500, successfulPayments: 139500, revenueAtRisk: 35000, recoveredRevenue: 20100 },
  { date: '25 Aug', grossRevenue: 188200, successfulPayments: 149600, revenueAtRisk: 38600, recoveredRevenue: 22800 },
  { date: '26 Aug', grossRevenue: 188500, successfulPayments: 152900, revenueAtRisk: 35600, recoveredRevenue: 21200 },
];

const DEFAULT_SUMMARY: DashboardSummary = {
  grossRevenue: 1250000,
  revenueAtRisk: 248500,
  potentiallyRecoverable: 174200,
  recoveredRevenue: 137400,
  recoveryRate: 55.3,
  recoveryAttemptRate: 71.4,
  activeOpportunitiesCount: 184,
  pendingManualReviewCount: 14,
  trends: {
    grossRevenueGrowth: 8.4,
    revenueAtRiskDelta: -2.1,
    recoveredGrowth: 18.2,
    recoveryRateDelta: 4.3,
  },
  riskBreakdown: {
    failedPayments: 111825,
    abandonedCheckout: 64610,
    failedSubscriptions: 47215,
    overdueInvoices: 24850,
  },
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const { triggerRefresh, refreshKey, setIsCopilotOpen } = usePlatform();
  const [summary, setSummary] = useState<DashboardSummary>(DEFAULT_SUMMARY);
  const [chartData, setChartData] = useState<RevenueChartPoint[]>(DEFAULT_7D_CHART);
  const [opportunities, setOpportunities] = useState<RecoveryOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartRange, setChartRange] = useState<'7D' | '30D' | '90D'>('7D');
  
  // Modals
  const [executingOpportunity, setExecutingOpportunity] = useState<RecoveryOpportunity | null>(null);
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [diagnosingOpportunity, setDiagnosingOpportunity] = useState<RecoveryOpportunity | null>(null);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [sum, chart, opps] = await Promise.all([
          apiClient.getDashboardSummary(),
          apiClient.getRevenueChart(chartRange),
          apiClient.getOpportunities(),
        ]);
        if (isMounted) {
          if (sum) setSummary(sum);
          if (chart && chart.length > 0) setChartData(chart);
          if (opps) setOpportunities(opps);
        }
      } catch (err) {
        console.warn('Dashboard data fetched via local cache / fallback:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [chartRange, refreshKey]);

  const handleOpenExecution = (e: React.MouseEvent, opp: RecoveryOpportunity) => {
    e.stopPropagation();
    setExecutingOpportunity(opp);
    setIsExecutionModalOpen(true);
  };

  const handleOpenDiagnosis = (e: React.MouseEvent, opp: RecoveryOpportunity) => {
    e.stopPropagation();
    setDiagnosingOpportunity(opp);
    setIsDiagnosticModalOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bento Banner with Real-time Loop Status & Merchant Context */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        id="dashboard-header-banner"
        className="bento-card relative overflow-hidden p-6 bg-slate-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-slate-800 shadow-lg"
      >
        {/* Ambient background image */}
        <div className="absolute inset-0 pointer-events-none opacity-25 mix-blend-screen overflow-hidden bg-slate-950">
          <SafeImage
            src={bannerImg}
            alt="Fintech Payment Flow"
            fallbackType="hero"
            fallbackText="Fintech Revenue Stream"
            className="w-full h-full object-cover object-right-top"
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
        </div>

        <div className="relative z-10 space-y-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30 shadow-inner">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-white tracking-tight">RecoverAI Mission Control</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Autopilot Active</span>
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Continuous transaction telemetry, automated gateway triage, and policy-bounded recovery execution.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center space-x-2 shrink-0">
          <button
            id="btn-simulate-failure-dash"
            onClick={() => navigate('/simulation')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 transition-all shadow-xs cursor-pointer backdrop-blur-xs hover:border-slate-600"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulate Failure</span>
          </button>
          <button
            id="btn-recovery-queue-dash"
            onClick={() => navigate('/recovery')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recovery Queue ({summary?.activeOpportunitiesCount || 184})</span>
          </button>
        </div>
      </motion.div>

      {/* KPI Bento Tiles Grid with Animated Counter & Micro-elevation */}
      <div id="dashboard-kpi-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI Tile 1: Revenue at Risk */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          whileHover={{ y: -2 }}
          id="kpi-revenue-at-risk"
          className="bento-card p-5 flex flex-col justify-between hover:shadow-md transition-all border-slate-200/90 bg-white"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Revenue at Risk</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                <AnimatedCounter value={summary?.revenueAtRisk || 248500} prefix="₹" />
              </div>
              {/* Mini Sparkline SVG */}
              <div className="h-6 w-16 text-rose-500">
                <svg viewBox="0 0 60 20" className="w-full h-full stroke-current fill-none stroke-[2]">
                  <polyline points="0,15 10,12 20,16 30,8 40,11 50,5 60,9" />
                </svg>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">{summary?.activeOpportunitiesCount || 184} active leakage cases</span>
            <span className="text-rose-600 font-semibold font-mono text-[11px] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 flex items-center space-x-0.5">
              <TrendingDown className="w-3 h-3 inline" />
              <span>-8.2% 7D</span>
            </span>
          </div>
        </motion.div>

        {/* KPI Tile 2: Recovered Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          whileHover={{ y: -2 }}
          id="kpi-recovered-revenue"
          className="bento-card p-5 flex flex-col justify-between bg-linear-to-b from-white to-emerald-50/20 border-emerald-200/80 hover:shadow-md hover:border-emerald-300 transition-all"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Recovered Revenue</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
                <AnimatedCounter value={summary?.recoveredRevenue || 96400} prefix="₹" />
              </div>
              {/* Green Mini Sparkline SVG */}
              <div className="h-6 w-16 text-emerald-500">
                <svg viewBox="0 0 60 20" className="w-full h-full stroke-current fill-none stroke-[2]">
                  <polyline points="0,18 10,15 20,12 30,13 40,7 50,4 60,2" />
                </svg>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-100/60 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Pipeline: {formatINR(summary?.potentiallyRecoverable || 174200)}</span>
            <span className="text-emerald-700 font-bold font-mono text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center space-x-0.5">
              <TrendingUp className="w-3 h-3 inline" />
              <span>+23.4%</span>
            </span>
          </div>
        </motion.div>

        {/* KPI Tile 3: Recoverable Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          whileHover={{ y: -2 }}
          id="kpi-recoverable-pipeline"
          className="bento-card p-5 flex flex-col justify-between hover:shadow-md transition-all border-slate-200/90 bg-white"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Recoverable Pipeline</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              <AnimatedCounter value={summary?.potentiallyRecoverable || 174200} prefix="₹" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 w-full">
              <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '70.1%' }} />
              </div>
              <span className="text-indigo-700 font-bold font-mono text-[11px] shrink-0">70.1% confidence</span>
            </div>
          </div>
        </motion.div>

        {/* KPI Tile 4: Recovery Success Rate */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          whileHover={{ y: -2 }}
          id="kpi-recovery-rate"
          className="bento-card p-5 flex flex-col justify-between hover:shadow-md transition-all border-slate-200/90 bg-white"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Recovery Success Rate</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Zap className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              <AnimatedCounter value={summary?.recoveryRate || 55.3} suffix="%" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Attempt success</span>
            <span className="text-blue-700 font-bold font-mono text-[11px] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
              {formatPercent(summary?.attemptSuccessRate || 71.4)}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Section 10: "Today's Recovery Insight" Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        id="recovery-daily-insight-card"
        className="bento-card p-0 overflow-hidden bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-900/60 shadow-md"
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="p-6 md:w-2/3 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 font-mono">
                Today's AI Recovery Insight
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Peak Window Analysis</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white leading-tight">
              Payment failures spiked during the evening checkout surge (18:00 – 21:30 IST).
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              68 high-intent customer transactions worth <strong className="text-white font-mono">₹1,74,200</strong> remain recoverable via UPI 1-click fallback and instant WhatsApp checkout rescue links.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <button
                id="btn-review-opportunities-insight"
                onClick={() => navigate('/recovery')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Review opportunities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                id="btn-open-copilot-insight"
                onClick={() => setIsCopilotOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer backdrop-blur-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Ask AI Copilot</span>
              </button>
            </div>
          </div>

          <div className="md:w-1/3 w-full h-48 md:h-56 relative overflow-hidden shrink-0 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950">
            <SafeImage
              src={CONTEXT_IMAGES.recoveryInsight}
              alt="Checkout Recovery Operations"
              fallbackType="context"
              fallbackText="Checkout Insights"
              className="w-full h-full object-cover object-center brightness-90 contrast-105"
            />
            <div className="absolute inset-0 bg-linear-to-t md:bg-linear-to-r from-slate-900 via-slate-900/40 to-transparent pointer-events-none" />
            <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60 text-[10px] text-slate-300 font-mono">
              68 Recoverable Orders
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Bento Row: Performance Chart (2 cols) + Channel Breakdown (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bento Box: Interactive Performance Chart (2 Cols) */}
        <div id="chart-performance-card" className="lg:col-span-2 bento-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Revenue Recovery Performance</h3>
                <p className="text-xs text-slate-500">At-risk leakage volume vs. recovered revenue over time</p>
              </div>
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200/60">
                {(['7D', '30D', '90D'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setChartRange(r)}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      chartRange === r ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-80 w-full min-h-[300px] min-w-0">
              <ResponsiveContainer width="100%" height="100%" minHeight={280} minWidth={100}>
                <AreaChart
                  data={chartData.length > 0 ? chartData : DEFAULT_7D_CHART}
                  margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="riskColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="recoveredColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={{ stroke: '#cbd5e1' }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      formatINR(Number(val)),
                      name === 'revenueAtRisk' || name === 'Revenue at Risk' ? 'Revenue at Risk' : 'Recovered Revenue',
                    ]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px', fontWeight: 600 }} />
                  <Area
                    type="monotone"
                    dataKey="revenueAtRisk"
                    name="Revenue at Risk"
                    stroke="#f43f5e"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#riskColor)"
                    dot={{ r: 3.5, fill: '#f43f5e', strokeWidth: 1.5, stroke: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#f43f5e' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="recoveredRevenue"
                    name="Recovered Revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#recoveredColor)"
                    dot={{ r: 3.5, fill: '#10b981', strokeWidth: 1.5, stroke: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#10b981' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bento Box: Revenue at Risk by Channel (1 Col) */}
        <div id="chart-channel-breakdown" className="bento-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Risk by Channel</h3>
              <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {formatINR(summary?.revenueAtRisk || 248500)}
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: 'Failed Payments (UPI/Card)',
                  amount: summary?.riskBreakdown.failedPayments || 112400,
                  pct: 45.2,
                  barColor: 'bg-indigo-600',
                  cat: 'FAILED_PAYMENT',
                },
                {
                  label: 'Abandoned Checkouts',
                  amount: summary?.riskBreakdown.abandonedCheckout || 64200,
                  pct: 25.8,
                  barColor: 'bg-amber-500',
                  cat: 'ABANDONED_CHECKOUT',
                },
                {
                  label: 'Failed Subscriptions',
                  amount: summary?.riskBreakdown.failedSubscriptions || 48700,
                  pct: 19.6,
                  barColor: 'bg-blue-600',
                  cat: 'FAILED_SUBSCRIPTION',
                },
                {
                  label: 'Overdue Invoices',
                  amount: summary?.riskBreakdown.overdueInvoices || 23200,
                  pct: 9.4,
                  barColor: 'bg-purple-600',
                  cat: 'OVERDUE_INVOICE',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  onClick={() => navigate('/recovery')}
                  className="p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-800">{item.label}</span>
                    <span className="font-bold text-slate-900 font-mono">{formatINR(item.amount)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex items-center">
                    <div className={`h-full rounded-full ${item.barColor}`} style={{ width: `${item.pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                    <span>{item.pct}% of total risk</span>
                    <span className="text-indigo-600 font-semibold hover:underline">View queue →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-linear-to-r from-indigo-900 to-slate-900 text-white border border-indigo-500/30 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg overflow-hidden border border-indigo-400/40 shrink-0 bg-slate-900">
                <SafeImage
                  src={aiEngineImg}
                  alt="AI Engine"
                  fallbackType="icon"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-xs text-white font-bold block">Autonomous Copilot Active</span>
                <span className="text-[10px] text-indigo-300">Live anomaly detection & dynamic smart retries</span>
              </div>
            </div>
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-xs cursor-pointer"
            >
              Open AI Copilot
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Activity Feed + Live Highlights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Activity Stream Feed */}
        <div className="lg:col-span-1">
          <LiveActivityFeed />
        </div>

        {/* Real-time Gateway Health Badges & Visual Highlight */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Webhook Ingestion Engine Telemetry Visual Component */}
          <div id="webhook-ingestion-engine-card" className="bento-card p-0 overflow-hidden bg-slate-950 border-slate-800 shadow-xl">
            <div className="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-tight">Real-Time Webhook Ingestion Engine</h3>
                  <p className="text-[11px] text-slate-400">Live multi-gateway failure detection and autonomous intercept pipeline</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/80">
                14.2ms Interception Speed
              </span>
            </div>
            <div className="p-3 sm:p-5 bg-slate-950">
              <WebhookIngestionVisual idPrefix="mission-control-ingest-" />
            </div>
          </div>

          <div id="gateways-health-card" className="bento-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Payment Gateways & Direct Ingress Health</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                All 6 Gateways Operational
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-3">
              {[
                { id: 'RAZORPAY', name: 'Razorpay', uptime: '99.98%', latency: '180ms', status: 'Optimal' },
                { id: 'STRIPE', name: 'Stripe', uptime: '99.99%', latency: '140ms', status: 'Optimal' },
                { id: 'CASHFREE', name: 'Cashfree', uptime: '99.85%', latency: '210ms', status: 'Healthy' },
                { id: 'PHONEPE', name: 'PhonePe PG', uptime: '99.92%', latency: '165ms', status: 'Optimal' },
                { id: 'PAYTM', name: 'Paytm UPI', uptime: '99.80%', latency: '230ms', status: 'Healthy' },
                { id: 'HDFC_PG', name: 'HDFC SmartHub', uptime: '99.70%', latency: '290ms', status: 'Normal' },
              ].map((gw) => (
                <div key={gw.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">{gw.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex items-baseline justify-between text-[11px] font-mono">
                    <span className="text-slate-500">{gw.latency}</span>
                    <span className="text-emerald-700 font-bold">{gw.uptime}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Dynamic smart routing switches failovers in &lt; 400ms</span>
              <button
                onClick={() => navigate('/settings')}
                className="text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                Configure Policy Routing →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Recovery Opportunities Bento Table */}
      <div id="priority-opportunities-table" className="bento-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Priority Recovery Opportunities</h3>
            <p className="text-xs text-slate-500">
              High-probability cases diagnosed with recommended recovery interventions
            </p>
          </div>
          <button
            onClick={() => navigate('/recovery')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 cursor-pointer"
          >
            <span>View All ({opportunities.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Transaction & Product</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Failure Reason</th>
                <th className="py-3 px-3">AI Probability</th>
                <th className="py-3 px-3">Recommended Strategy</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {opportunities.slice(0, 5).map((opp) => {
                const product = getProductForTransaction(opp.transactionId, opp.amount);
                return (
                  <tr
                    key={opp.id}
                    onClick={() => navigate(`/transactions/${opp.transactionId}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3">
                      <PriorityBadge priority={opp.priority} />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2.5">
                        <SafeImage
                          src={product.image}
                          alt={product.name}
                          fallbackType="product"
                          fallbackText={product.name}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0 shadow-2xs"
                        />
                        <div>
                          <span className="font-mono font-bold text-indigo-600 block">{opp.transactionId}</span>
                          <span className="text-[11px] text-slate-500 truncate max-w-[140px] block">{product.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2.5">
                        <SafeImage
                          src={getCustomerAvatar(opp.customerId, opp.customerName)}
                          alt={opp.customerName}
                          fallbackType="initials"
                          fallbackText={opp.customerName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{opp.customerName}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{opp.customerEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {formatINR(opp.amount)}
                    </td>
                    <td className="py-3 px-3">
                      <FailureReasonLabel reason={opp.failureReason} />
                    </td>
                    <td className="py-3 px-3">
                      <div
                        onClick={(e) => handleOpenDiagnosis(e, opp)}
                        className="hover:opacity-80 transition-opacity"
                        title="Click to view AI Diagnosis sequence"
                      >
                        <ProbabilityBar probability={opp.aiDiagnosis.recoveryProbability} />
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-xs text-slate-700 font-medium">{opp.aiDiagnosis.recommendedAction}</span>
                    </td>
                    <td className="py-3 px-3">
                      <OpportunityStatusBadge status={opp.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      {opp.status === 'RECOVERED' ? (
                        <span className="text-xs font-bold text-emerald-600 font-mono">Settled</span>
                      ) : (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={(e) => handleOpenDiagnosis(e, opp)}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-indigo-200 text-xs transition-all cursor-pointer"
                            title="Diagnose AI"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleOpenExecution(e, opp)}
                            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            Execute
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <RecoveryExecutionModal
        opportunity={executingOpportunity}
        isOpen={isExecutionModalOpen}
        onClose={() => {
          setIsExecutionModalOpen(false);
          setExecutingOpportunity(null);
        }}
      />

      <AIDiagnosticModal
        opportunity={diagnosingOpportunity}
        isOpen={isDiagnosticModalOpen}
        onClose={() => {
          setIsDiagnosticModalOpen(false);
          setDiagnosingOpportunity(null);
        }}
        onExecute={(opp) => {
          setExecutingOpportunity(opp);
          setIsExecutionModalOpen(true);
        }}
      />
    </div>
  );
};
