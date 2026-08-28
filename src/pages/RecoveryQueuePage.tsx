import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { usePlatform } from '../context/PlatformContext';
import { RecoveryOpportunity } from '../types';
import { formatINR } from '../utils/formatters';
import { getCustomerAvatar, getProductForTransaction, CONTEXT_IMAGES } from '../utils/avatarUtils';
import {
  PriorityBadge,
  OpportunityStatusBadge,
  ProbabilityBar,
  FailureReasonLabel,
  CategoryBadge
} from '../components/common/StatusBadge';
import {
  RotateCcw,
  Search,
  CheckSquare,
  Square,
  Play,
  ArrowUpDown,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RecoveryExecutionModal } from '../components/modals/RecoveryExecutionModal';
import { AIDiagnosticModal } from '../components/modals/AIDiagnosticModal';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { SafeImage } from '../components/common/SafeImage';

interface RecoveryQueuePageProps {
  navigate: (path: string) => void;
}

export const RecoveryQueuePage: React.FC<RecoveryQueuePageProps> = ({ navigate }) => {
  const { triggerRefresh, refreshKey, addToast } = usePlatform();
  const [opportunities, setOpportunities] = useState<RecoveryOpportunity[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'PROBABILITY' | 'AMOUNT' | 'DATE'>('PROBABILITY');
  const [loading, setLoading] = useState(true);
  const [bulkExecuting, setBulkExecuting] = useState(false);

  // Modals
  const [executingOpportunity, setExecutingOpportunity] = useState<RecoveryOpportunity | null>(null);
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [diagnosingOpportunity, setDiagnosingOpportunity] = useState<RecoveryOpportunity | null>(null);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);

  useEffect(() => {
    const fetchOpps = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getOpportunities({ tab: activeTab, search });
        setOpportunities(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOpps();
  }, [activeTab, search, refreshKey]);

  const sortedOpportunities = [...opportunities].sort((a, b) => {
    if (sortBy === 'PROBABILITY') {
      return b.aiDiagnosis.recoveryProbability - a.aiDiagnosis.recoveryProbability;
    }
    if (sortBy === 'AMOUNT') {
      return b.amount - a.amount;
    }
    return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
  });

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === sortedOpportunities.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedOpportunities.map((o) => o.id));
    }
  };

  const handleBulkExecute = async () => {
    if (selectedIds.length === 0) return;
    setBulkExecuting(true);
    try {
      const result = await apiClient.executeBulkRecovery(selectedIds);
      addToast({
        type: 'success',
        title: 'Batch Recovery Executed',
        message: `Successfully executed recovery on ${result.processed} items. ₹${(result.totalRecoveredAmount || 0).toLocaleString('en-IN')} recovered.`,
      });
      setSelectedIds([]);
      triggerRefresh();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Execution Error',
        message: err.message || 'Failed to complete batch recovery.',
      });
    } finally {
      setBulkExecuting(false);
    }
  };

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

  const totalSelectedAmount = sortedOpportunities
    .filter((o) => selectedIds.includes(o.id))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPipelineAmount = opportunities.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bento Banner with Metric Badges */}
      <div className="bento-card relative overflow-hidden p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shadow-xs shrink-0 hidden sm:block">
            <SafeImage
              src={CONTEXT_IMAGES.recoveryOperations}
              alt="Recovery Operations"
              fallbackType="context"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Recovery Operations Queue</h2>
              <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                <AnimatedCounter value={opportunities.length} suffix=" Active Items" />
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Priority-ranked leakage opportunities with continuous AI diagnosis, latency tracking, and policy-bounded execution.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Filtered Volume
            </span>
            <span className="text-sm font-black font-mono text-slate-900">
              <AnimatedCounter value={totalPipelineAmount} prefix="₹" />
            </span>
          </div>

          {/* Batch action toolbar */}
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-3 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg border border-slate-800"
            >
              <span className="text-xs font-bold font-mono">
                {selectedIds.length} Selected ({formatINR(totalSelectedAmount)})
              </span>
              <button
                onClick={handleBulkExecute}
                disabled={bulkExecuting}
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{bulkExecuting ? 'Executing...' : 'Execute Batch'}</span>
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Clear
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bento Card */}
      <div className="bento-card p-4 space-y-4">
        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs font-semibold">
          {[
            { id: 'ALL', label: 'All Opportunities' },
            { id: 'FAILED_PAYMENT', label: 'Failed Payments' },
            { id: 'ABANDONED_CHECKOUT', label: 'Abandoned Checkouts' },
            { id: 'FAILED_SUBSCRIPTION', label: 'Failed Subscriptions' },
            { id: 'OVERDUE_INVOICE', label: 'Overdue Invoices' },
            { id: 'MANUAL_REVIEW', label: 'Manual Review' },
            { id: 'RECOVERED', label: 'Recovered' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedIds([]);
              }}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, email, or TXN..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <span className="text-xs text-slate-400 font-medium flex items-center space-x-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort by:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="PROBABILITY">Highest Recovery Probability</option>
              <option value="AMOUNT">Highest Amount</option>
              <option value="DATE">Most Recent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Bento Container */}
      <div className="bento-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <button onClick={selectAll} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                    {selectedIds.length > 0 && selectedIds.length === sortedOpportunities.length ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Transaction</th>
                <th className="py-3 px-3">Customer & Channel</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Failure Reason</th>
                <th className="py-3 px-3">AI Probability</th>
                <th className="py-3 px-3">Recommended Strategy</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    No recovery opportunities match the current filter.
                  </td>
                </tr>
              ) : (
                sortedOpportunities.map((opp) => {
                  const isSelected = selectedIds.includes(opp.id);
                  return (
                    <tr
                      key={opp.id}
                      onClick={() => navigate(`/transactions/${opp.transactionId}`)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center" onClick={(e) => toggleSelect(opp.id, e)}>
                        <button className="text-slate-400 hover:text-slate-700 cursor-pointer">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <PriorityBadge priority={opp.priority} />
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-indigo-600">
                        {opp.transactionId}
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
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-slate-900">{opp.customerName}</span>
                              <CategoryBadge category={opp.category} />
                            </div>
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
                        <span className="text-slate-700 font-medium">{opp.aiDiagnosis.recommendedAction}</span>
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
                })
              )}
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
