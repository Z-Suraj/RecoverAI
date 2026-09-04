import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../api/client';
import { Transaction } from '../types';
import { formatINR, formatDateTime } from '../utils/formatters';
import { getCustomerAvatar, GATEWAY_LOGOS, getProductForTransaction } from '../utils/avatarUtils';
import { VISUAL_ASSETS } from '../assets/images';
import { TransactionStatusBadge, FailureReasonLabel } from '../components/common/StatusBadge';
import {
  ArrowLeftRight,
  Search,
  Filter,
  ChevronRight,
  Download,
  X,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Clock,
  ShieldCheck,
  CreditCard,
  Building,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import { SafeImage } from '../components/common/SafeImage';
import { usePlatform } from '../context/PlatformContext';

interface TransactionsPageProps {
  navigate: (path: string) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({ navigate }) => {
  const { addToast } = usePlatform();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [gatewayFilter, setGatewayFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchTxns = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getTransactions({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxns();
  }, [search, statusFilter]);

  // Client-side quick filter for gateway and method
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (gatewayFilter !== 'ALL' && t.gateway !== gatewayFilter) return false;
      if (methodFilter !== 'ALL' && t.paymentMethod !== methodFilter) return false;
      return true;
    });
  }, [transactions, gatewayFilter, methodFilter]);

  // Summary Metrics calculations
  const totalVolume = transactions.reduce((acc, t) => acc + t.amount, 0);
  const failedSum = transactions.filter((t) => t.status === 'FAILED').reduce((acc, t) => acc + t.amount, 0);
  const recoveredSum = transactions.filter((t) => t.status === 'RECOVERED').reduce((acc, t) => acc + t.amount, 0);
  const pendingCount = transactions.filter((t) => t.status === 'PENDING_RECOVERY').length;

  const handleExportCSV = () => {
    const headers = ['ID,Customer,Amount,Gateway,Method,Status,FailureReason,Retries,CreatedAt\n'];
    const rows = filteredTransactions.map(
      (t) =>
        `"${t.id}","${t.customerName}",${t.amount},"${t.gateway}","${t.paymentMethod}","${t.status}","${t.failureReason}",${t.retryCount},"${t.createdAt}"\n`
    );
    const blob = new Blob([headers.concat(rows).join('')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      type: 'success',
      title: 'CSV Export Generated',
      message: `Exported ${filteredTransactions.length} transaction records successfully.`,
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bento Banner with Real-time Financial Transaction Intelligence Background */}
      <div className="bento-card relative overflow-hidden p-6 bg-slate-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-slate-800 shadow-lg">
        {/* Photorealistic Digital Payment Processing Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <SafeImage
            src={VISUAL_ASSETS.transactions}
            alt="Digital Payment Processing & POS Gateway"
            fallbackType="hero"
            className="w-full h-full object-cover object-right md:object-center opacity-65 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
        </div>

        <div className="relative z-10 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-500/30 shadow-inner shrink-0">
            <CreditCard className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-extrabold text-white tracking-tight">Real-Time Financial Transaction Intelligence</h2>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {filteredTransactions.length} of {transactions.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              High-throughput ingestion ledger of all settled, failed, and AI-recovered payment flows across multi-gateway routing topologies.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center space-x-2.5">
          <button
            onClick={fetchTxns}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer backdrop-blur-xs"
            title="Refresh stream"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bento-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Volume Ingested</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-mono font-extrabold text-slate-900">{formatINR(totalVolume)}</span>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="bento-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">Failed / At-Risk</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-mono font-extrabold text-rose-600">{formatINR(failedSum)}</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
        </div>

        <div className="bento-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Recovered Revenue</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-mono font-extrabold text-emerald-700">{formatINR(recoveredSum)}</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        <div className="bento-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Active In Queue</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-mono font-extrabold text-indigo-900">{pendingCount} pending</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Interactive Filters Bar */}
      <div className="bento-card p-4 space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-100">
          {[
            { id: 'ALL', label: 'All Transactions' },
            { id: 'FAILED', label: 'Failed (Actionable)' },
            { id: 'PENDING_RECOVERY', label: 'Pending Recovery' },
            { id: 'RECOVERED', label: 'Recovered' },
            { id: 'SUCCESS', label: 'Settled Success' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Secondary Dropdowns */}
        <div className="flex flex-col md:flex-row items-center gap-3 pt-1">
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by TXN ID, customer name, email, or failure reason..."
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2.5 w-full md:w-auto">
            {/* Gateway Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">Gateway:</span>
              <select
                value={gatewayFilter}
                onChange={(e) => setGatewayFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Gateways</option>
                <option value="Razorpay">Razorpay</option>
                <option value="Stripe">Stripe</option>
                <option value="Cashfree">Cashfree</option>
                <option value="PhonePe">PhonePe</option>
                <option value="Paytm">Paytm</option>
              </select>
            </div>

            {/* Payment Method Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">Method:</span>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Methods</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="NETBANKING">Netbanking</option>
                <option value="WALLET">Wallet</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table Bento Card */}
      <div className="bento-card overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ArrowLeftRight className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No matching transactions found</p>
            <p className="text-[11px] text-slate-400">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="p-3.5">Transaction ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Gateway</th>
                  <th className="p-3.5">Failure Diagnostic</th>
                  <th className="p-3.5 text-center">Retries</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => navigate(`/transactions/${t.id}`)}
                    className="hover:bg-slate-50/90 cursor-pointer transition-colors group"
                  >
                    <td className="p-3.5 font-mono font-bold text-indigo-600 group-hover:text-indigo-700">
                      {t.id}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center space-x-2.5">
                        <SafeImage
                          src={getCustomerAvatar(t.customerId, t.customerName)}
                          alt={t.customerName}
                          fallbackType="initials"
                          fallbackText={t.customerName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{t.customerName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {t.customerId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono font-extrabold text-slate-900">{formatINR(t.amount)}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold text-[10px] border border-slate-200">
                        {t.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-800">{t.gateway}</span>
                    </td>
                    <td className="p-3.5 max-w-[200px]">
                      <FailureReasonLabel reason={t.failureReason} />
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-slate-600">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] ${t.retryCount > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500'}`}>
                        {t.retryCount}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <TransactionStatusBadge status={t.status} />
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">{formatDateTime(t.createdAt)}</td>
                    <td className="p-3.5 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 ml-auto transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
