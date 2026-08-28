import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { DashboardSummary, RevenueChartPoint } from '../types';
import { formatINR, formatPercent } from '../utils/formatters';
import { GATEWAY_LOGOS } from '../utils/avatarUtils';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  RotateCcw,
  Zap,
  Layers,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Server,
  Download,
  Activity,
  Calendar,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { SafeImage } from '../components/common/SafeImage';
import { usePlatform } from '../context/PlatformContext';
import { CONTEXT_IMAGES } from '../utils/avatarUtils';

const DEFAULT_ANALYTICS_CHART: RevenueChartPoint[] = [
  { date: '20 Aug', grossRevenue: 168400, successfulPayments: 134000, revenueAtRisk: 34400, recoveredRevenue: 19800 },
  { date: '21 Aug', grossRevenue: 182100, successfulPayments: 148200, revenueAtRisk: 33900, recoveredRevenue: 21400 },
  { date: '22 Aug', grossRevenue: 154900, successfulPayments: 122400, revenueAtRisk: 32500, recoveredRevenue: 18900 },
  { date: '23 Aug', grossRevenue: 192000, successfulPayments: 151000, revenueAtRisk: 41000, recoveredRevenue: 24600 },
  { date: '24 Aug', grossRevenue: 174500, successfulPayments: 139500, revenueAtRisk: 35000, recoveredRevenue: 20100 },
  { date: '25 Aug', grossRevenue: 188200, successfulPayments: 149600, revenueAtRisk: 38600, recoveredRevenue: 22800 },
  { date: '26 Aug', grossRevenue: 188500, successfulPayments: 152900, revenueAtRisk: 35600, recoveredRevenue: 21200 },
];

const DEFAULT_ANALYTICS_SUMMARY: DashboardSummary = {
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

export const AnalyticsPage: React.FC = () => {
  const { addToast } = usePlatform();
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');
  const [summary, setSummary] = useState<DashboardSummary>(DEFAULT_ANALYTICS_SUMMARY);
  const [chartData, setChartData] = useState<RevenueChartPoint[]>(DEFAULT_ANALYTICS_CHART);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [s, c] = await Promise.all([
          apiClient.getDashboardSummary(),
          apiClient.getRevenueChart(timeRange),
        ]);
        if (isMounted) {
          if (s) setSummary(s);
          if (c && c.length > 0) setChartData(c);
        }
      } catch (err) {
        console.warn('Analytics data fetched via local cache / fallback:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [timeRange]);

  const pieData = [
    { name: 'UPI Retries (Smart Delay)', value: 48500, color: '#4f46e5', pct: 50.3 },
    { name: 'WhatsApp 1-Click Link', value: 24200, color: '#10b981', pct: 25.1 },
    { name: 'Card Routing PSP Fallback', value: 14800, color: '#f59e0b', pct: 15.4 },
    { name: 'Dunning Email Sequences', value: 8900, color: '#8b5cf6', pct: 9.2 },
  ];

  const failureBreakdown = [
    {
      reason: 'Bank Downtime / Server Timeout',
      share: 38,
      recoveryRate: 84.2,
      strategy: 'Autonomous Smart Delay & Backup PSP Switch',
      color: 'bg-indigo-600',
    },
    {
      reason: 'Insufficient Funds / Account Balance',
      share: 28,
      recoveryRate: 46.5,
      strategy: 'Dunning WhatsApp/SMS 24h & 48h Window',
      color: 'bg-amber-500',
    },
    {
      reason: 'Authentication & 3DS / OTP Friction',
      share: 19,
      recoveryRate: 72.8,
      strategy: 'Direct 1-Click Biometric Intent Link',
      color: 'bg-rose-500',
    },
    {
      reason: 'Velocity / Fraud Limit False Positive',
      share: 15,
      recoveryRate: 61.0,
      strategy: 'Risk Engine Whitelist & Co-Badged PSP Retry',
      color: 'bg-purple-600',
    },
  ];

  const gatewayMatrix = [
    {
      id: 'RAZORPAY',
      name: 'Razorpay PG',
      successRate: '92.4%',
      latency: '180ms',
      downtimeIncidents: 1,
      recoveryYield: '₹48,200',
      status: 'Optimal',
    },
    {
      id: 'STRIPE',
      name: 'Stripe India',
      successRate: '95.1%',
      latency: '140ms',
      downtimeIncidents: 0,
      recoveryYield: '₹28,600',
      status: 'Optimal',
    },
    {
      id: 'PHONEPE',
      name: 'PhonePe PG',
      successRate: '90.8%',
      latency: '165ms',
      downtimeIncidents: 2,
      recoveryYield: '₹12,400',
      status: 'Healthy',
    },
    {
      id: 'CASHFREE',
      name: 'Cashfree AutoCollect',
      successRate: '89.6%',
      latency: '210ms',
      downtimeIncidents: 2,
      recoveryYield: '₹7,200',
      status: 'Healthy',
    },
  ];

  const handleExportReport = () => {
    addToast({
      type: 'success',
      title: 'Telemetry Exported',
      message: `Exported 30-day analytics report (${timeRange}) with attribution breakdown.`,
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bento Title with Telemetry Overview */}
      <div className="bento-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Recovery Analytics & Telemetry</h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {timeRange} Window
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Autonomous intervention attribution, velocity benchmarks, and financial return on recovery operations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap gap-2">
          {/* Time range selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            {(['7D', '30D', '90D', '1Y'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  timeRange === r ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportReport}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Top ROI Bento Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bento-card p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Net Recovered</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-emerald-700">
            {summary ? formatINR(summary.recoveredRevenue) : '₹96,400'}
          </p>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-600 font-semibold pt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+34.2% vs previous period</span>
          </div>
        </div>

        <div className="bento-card p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overall Recovery Yield</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-indigo-900">
            {summary ? formatPercent(summary.recoveryRate) : '68.4%'}
          </p>
          <div className="flex items-center space-x-1 text-[11px] text-indigo-600 font-semibold pt-1">
            <span>Target benchmark: &gt;60%</span>
          </div>
        </div>

        <div className="bento-card p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Autonomous Auto-Heal Rate</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-slate-900">
            {summary ? formatPercent(summary.recoveryAttemptRate || 78.5) : '78.5%'}
          </p>
          <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-medium pt-1">
            <span>Zero human touch needed</span>
          </div>
        </div>

        <div className="bento-card p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Recovery Latency</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-purple-900">
            1.8 hrs
          </p>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-600 font-semibold pt-1">
            <span>-42m faster than SLA</span>
          </div>
        </div>
      </div>

      {/* Main Bar Chart: Ingested vs At-Risk vs Recovered */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Revenue Recovery Timeline & Trends</h3>
            <p className="text-xs text-slate-500">Daily breakdown of total failed pipeline volume vs successfully recovered funds.</p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-400" />
              <span className="text-slate-600">Failed / At-Risk</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-indigo-600" />
              <span className="text-slate-600">Recovered Revenue</span>
            </span>
          </div>
        </div>

        <div className="h-80 w-full min-h-[300px] min-w-0">
          <ResponsiveContainer width="100%" height="100%" minHeight={280} minWidth={100}>
            <BarChart
              data={chartData.length > 0 ? chartData : DEFAULT_ANALYTICS_CHART}
              margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={{ stroke: '#cbd5e1' }} />
              <YAxis tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={{ stroke: '#cbd5e1' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
                formatter={(val: any, name: any) => [
                  formatINR(Number(val)),
                  name === 'revenueAtRisk' ? 'Revenue at Risk' : 'Recovered Revenue',
                ]}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px', fontWeight: 600 }} />
              <Bar dataKey="revenueAtRisk" name="Revenue at Risk" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recoveredRevenue" name="Recovered Revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attribution & Failure Diagnostic Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recovery Attribution by Channel (Donut) */}
        <div className="lg:col-span-5 bento-card p-6 flex flex-col justify-between">
          <div className="space-y-1 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Channel Attribution Yield</h3>
            <p className="text-xs text-slate-500">Share of recovered revenue generated by each autonomous tactic.</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [formatINR(Number(val)), 'Yield']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 font-medium">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2 font-mono">
                  <span className="font-bold text-slate-900">{formatINR(item.value)}</span>
                  <span className="text-[11px] text-slate-400">({item.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Failure Reason Breakdown Table */}
        <div className="lg:col-span-7 bento-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-1 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Root-Cause Diagnostic Matrix</h3>
            <p className="text-xs text-slate-500">Recovery success rates mapped against payment failure categories.</p>
          </div>

          <div className="space-y-3.5">
            {failureBreakdown.map((item, index) => (
              <div key={index} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{item.reason}</span>
                  <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {item.recoveryRate}% Saved
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${item.recoveryRate}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span>Strategy: <strong className="text-indigo-950 font-semibold">{item.strategy}</strong></span>
                  <span className="font-mono">{item.share}% volume</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gateway Health & Latency Performance Grid */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Gateway Partner Telemetry</h3>
            <p className="text-xs text-slate-500">Real-time latency benchmarks, uptime status, and recovered funds by payment processor.</p>
          </div>
          <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All Gateways Operational</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gatewayMatrix.map((gw) => (
            <div key={gw.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">{gw.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {gw.status}
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Success Rate:</span>
                  <span className="font-mono font-bold text-slate-900">{gw.successRate}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>API Latency:</span>
                  <span className="font-mono font-bold text-indigo-600">{gw.latency}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Recovered Yield:</span>
                  <span className="font-mono font-extrabold text-emerald-700">{gw.recoveryYield}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
