import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../api/client';
import { Customer } from '../types';
import { formatINR } from '../utils/formatters';
import { getCustomerAvatar, CONTEXT_IMAGES } from '../utils/avatarUtils';
import {
  Users,
  Search,
  ChevronRight,
  User,
  ShieldCheck,
  Download,
  X,
  TrendingUp,
  Sparkles,
  Award,
  Phone,
  Mail,
  ArrowUpDown
} from 'lucide-react';
import { SafeImage } from '../components/common/SafeImage';
import { usePlatform } from '../context/PlatformContext';

interface CustomersPageProps {
  navigate: (path: string) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ navigate }) => {
  const { addToast } = usePlatform();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'CLV' | 'RELIABILITY' | 'RECOVERED'>('CLV');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getCustomers(search.trim() || undefined);
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  // Client-side filtering and sorting
  const filteredAndSorted = useMemo(() => {
    let list = customers.filter((c) => {
      if (riskFilter !== 'ALL' && c.riskScore !== riskFilter) return false;
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'CLV') return b.lifetimeValue - a.lifetimeValue;
      if (sortBy === 'RELIABILITY') return b.paymentReliability - a.paymentReliability;
      if (sortBy === 'RECOVERED') return b.recoveredTransactions - a.recoveredTransactions;
      return 0;
    });
  }, [customers, riskFilter, sortBy]);

  // Aggregate Metrics
  const totalCLV = customers.reduce((acc, c) => acc + c.lifetimeValue, 0);
  const avgReliability = customers.length
    ? Math.round(customers.reduce((acc, c) => acc + c.paymentReliability, 0) / customers.length)
    : 0;
  const totalRecoveredCount = customers.reduce((acc, c) => acc + c.recoveredTransactions, 0);
  const vipCount = customers.filter((c) => c.lifetimeValue >= 30000).length;

  const handleExportCSV = () => {
    const headers = ['ID,Name,Email,Phone,CLV_INR,PaymentReliability_Pct,PreferredMethod,SuccessfulTXNs,RecoveredTXNs,RiskScore\n'];
    const rows = filteredAndSorted.map(
      (c) =>
        `"${c.id}","${c.name}","${c.email}","${c.phone}",${c.lifetimeValue},${c.paymentReliability},"${c.preferredPaymentMethod}",${c.successfulTransactions},${c.recoveredTransactions},"${c.riskScore}"\n`
    );
    const blob = new Blob([headers.concat(rows).join('')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-directory-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      type: 'success',
      title: 'Customer Directory Exported',
      message: `Exported ${filteredAndSorted.length} customer profiles.`,
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bento Banner */}
      <div className="bento-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shadow-xs shrink-0 hidden sm:block">
              <SafeImage
                src={CONTEXT_IMAGES.customerClv}
                alt="Customer CLV Intelligence"
                fallbackType="context"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Customer CLV & Payment Reliability</h2>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {filteredAndSorted.length} Active Profiles
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                AI-enriched customer lifetime value, historical payment success ratios, risk tiers, and preferred communication channels.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Directory</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bento-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Portfolio CLV</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-mono font-extrabold text-slate-900">{formatINR(totalCLV)}</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        <div className="bento-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Avg Reliability Score</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-mono font-extrabold text-indigo-900">{avgReliability}%</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
        </div>

        <div className="bento-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Total Recoveries Saved</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-mono font-extrabold text-emerald-700">{totalRecoveredCount} txns</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        <div className="bento-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">High-Value VIPs</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-mono font-extrabold text-slate-900">{vipCount} accounts</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bento-card p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer by name, email, or phone..."
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

        <div className="flex items-center space-x-2.5 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
              <ArrowUpDown className="w-3 h-3" />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="CLV">Highest CLV</option>
              <option value="RELIABILITY">Highest Reliability</option>
              <option value="RECOVERED">Most Recoveries</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table Bento Card */}
      <div className="bento-card overflow-hidden">
        {filteredAndSorted.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No matching customer profiles</p>
            <p className="text-[11px] text-slate-400">Try modifying your search or risk tier filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Contact Details</th>
                  <th className="p-3.5">Lifetime Value (CLV)</th>
                  <th className="p-3.5">Payment Reliability</th>
                  <th className="p-3.5">Preferred Method</th>
                  <th className="p-3.5">Paid vs Recovered</th>
                  <th className="p-3.5">Risk Tier</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSorted.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/customers/${c.id}`)}
                    className="hover:bg-slate-50/90 cursor-pointer transition-colors group"
                  >
                    <td className="p-3.5">
                      <div className="flex items-center space-x-3">
                        <SafeImage
                          src={getCustomerAvatar(c.id, c.name)}
                          alt={c.name}
                          fallbackType="initials"
                          fallbackText={c.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                        />
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-slate-900">{c.name}</span>
                            {c.lifetimeValue >= 30000 && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                VIP
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">ID: {c.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        <span className="text-[11px] text-slate-700 font-medium block flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[150px]">{c.email}</span>
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{c.phone}</span>
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono font-extrabold text-slate-900 text-sm">
                      {formatINR(c.lifetimeValue)}
                    </td>
                    <td className="p-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-emerald-700">{c.paymentReliability}%</span>
                          <span className="text-[10px] text-slate-400 font-medium">Reliable</span>
                        </div>
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              c.paymentReliability >= 85
                                ? 'bg-emerald-500'
                                : c.paymentReliability >= 70
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${c.paymentReliability}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold text-[10px] border border-slate-200">
                        {c.preferredPaymentMethod}
                      </span>
                    </td>
                    <td className="p-3.5 text-xs text-slate-700">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-slate-900">{c.successfulTransactions} paid</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                          +{c.recoveredTransactions} saved
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.riskScore === 'LOW'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : c.riskScore === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {c.riskScore} RISK
                      </span>
                    </td>
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
