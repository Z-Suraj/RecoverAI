import React, { useState, useEffect } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { apiClient } from '../../api/client';
import { DashboardSummary, RecoveryOpportunity } from '../../types';
import { formatINR, formatPercent, formatDateTime } from '../../utils/formatters';
import { Download, Printer, X, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ReportExportModal: React.FC = () => {
  const { isReportModalOpen, setIsReportModalOpen } = usePlatform();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [opportunities, setOpportunities] = useState<RecoveryOpportunity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isReportModalOpen) return;

    const load = async () => {
      setLoading(true);
      try {
        const [s, o] = await Promise.all([
          apiClient.getDashboardSummary(),
          apiClient.getOpportunities(),
        ]);
        setSummary(s);
        setOpportunities(o);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isReportModalOpen]);

  const downloadCSV = () => {
    window.location.href = '/api/reports/download-csv';
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isReportModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Revenue Recovery Operational Report</h3>
                <p className="text-xs text-slate-500">Executive Summary & Opportunity Audit</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={downloadCSV}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Report Body */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto print:max-h-none print:overflow-visible">
            {/* Header info */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Report Generated For:</span>
                <p className="font-bold text-slate-900">NovaCart Technologies India Pvt. Ltd.</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-medium">Generated At:</span>
                <p className="font-mono text-slate-700">{formatDateTime(new Date().toISOString())}</p>
              </div>
            </div>

            {/* KPI Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Revenue at Risk
                </span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">
                  {formatINR(summary?.revenueAtRisk || 248500)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Recovered Revenue
                </span>
                <span className="text-lg font-bold text-emerald-700 mt-1 block">
                  {formatINR(summary?.recoveredRevenue || 96400)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Recovery Rate
                </span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">
                  {formatPercent(summary?.recoveryRate || 55.3)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
                <span className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wider block">
                  Opportunities
                </span>
                <span className="text-lg font-bold text-indigo-700 mt-1 block">
                  {summary?.activeOpportunitiesCount || 184}
                </span>
              </div>
            </div>

            {/* Breakdown */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2">Failure Channel Breakdown</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-slate-500 text-[11px]">Failed Payments</span>
                  <p className="font-bold text-slate-900">{formatINR(summary?.riskBreakdown.failedPayments || 112400)}</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-slate-500 text-[11px]">Abandoned Carts</span>
                  <p className="font-bold text-slate-900">{formatINR(summary?.riskBreakdown.abandonedCheckout || 64200)}</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-slate-500 text-[11px]">Failed Subscriptions</span>
                  <p className="font-bold text-slate-900">{formatINR(summary?.riskBreakdown.failedSubscriptions || 48700)}</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-slate-500 text-[11px]">Overdue Invoices</span>
                  <p className="font-bold text-slate-900">{formatINR(summary?.riskBreakdown.overdueInvoices || 23200)}</p>
                </div>
              </div>
            </div>

            {/* Top Opportunities Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2">Priority Recovery Opportunities</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <tr>
                      <th className="p-2.5">Customer</th>
                      <th className="p-2.5">Txn ID</th>
                      <th className="p-2.5">Amount</th>
                      <th className="p-2.5">Issue</th>
                      <th className="p-2.5">Probability</th>
                      <th className="p-2.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {opportunities.slice(0, 6).map((o) => (
                      <tr key={o.id}>
                        <td className="p-2.5 font-medium text-slate-900">{o.customerName}</td>
                        <td className="p-2.5 font-mono text-slate-600">{o.transactionId}</td>
                        <td className="p-2.5 font-bold text-slate-900">{formatINR(o.amount)}</td>
                        <td className="p-2.5 text-slate-600">{o.failureReason.replace(/_/g, ' ')}</td>
                        <td className="p-2.5 font-mono font-bold text-emerald-600">{o.aiDiagnosis.recoveryProbability}%</td>
                        <td className="p-2.5 text-indigo-600 font-medium">{o.aiDiagnosis.recommendedAction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
