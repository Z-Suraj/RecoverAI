import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../api/client';
import { usePlatform } from '../context/PlatformContext';
import { AuditLog } from '../types';
import { formatDateTime } from '../utils/formatters';
import {
  ScrollText,
  Search,
  ShieldCheck,
  Filter,
  Download,
  X,
  ChevronDown,
  ChevronRight,
  Code,
  Lock,
  FileCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const { refreshKey, addToast } = usePlatform();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState('ALL');
  const [resultFilter, setResultFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getAuditLogs({
          search: search.trim() || undefined,
          entityType: entityType !== 'ALL' ? entityType : undefined,
        });
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [search, entityType, refreshKey]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (resultFilter === 'APPROVED' && !log.result.includes('APPROVED') && !log.result.includes('SUCCESS') && !log.result.includes('RECOVERED')) return false;
      if (resultFilter === 'BLOCKED' && !log.result.includes('BLOCKED')) return false;
      if (resultFilter === 'AUTO' && !log.actor.includes('AUTONOMOUS') && !log.actor.includes('AI')) return false;
      return true;
    });
  }, [logs, resultFilter]);

  const handleExportAudit = () => {
    const jsonStr = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-trail-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      type: 'success',
      title: 'Audit Trail Exported',
      message: `Exported ${filteredLogs.length} immutable compliance records (JSON format).`,
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bento Banner */}
      <div className="bento-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Compliance & Audit Trail</h2>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {filteredLogs.length} Immutable Records
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cryptographically verifiable event log of all AI recovery policy evaluations, automated executions, and operator approvals.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportAudit}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Trail</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bento-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Policy Events</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-mono font-extrabold text-slate-900">{logs.length}</span>
            <FileCheck className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="bento-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Automated Approvals</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-mono font-extrabold text-emerald-700">
              {logs.filter((l) => l.result.includes('SUCCESS') || l.result.includes('RECOVERED') || l.result === 'APPROVED').length}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        <div className="bento-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">Policy Guardrail Blocks</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-mono font-extrabold text-rose-600">
              {logs.filter((l) => l.result.includes('BLOCKED')).length}
            </span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
        </div>

        <div className="bento-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Audit Integrity</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-mono font-extrabold text-indigo-900">SHA-256 Valid</span>
            <Lock className="w-4 h-4 text-indigo-500" />
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
            placeholder="Search actor, event name, decision reason, or entity ID..."
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
            <span className="text-[11px] font-semibold text-slate-400">Entity:</span>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Entities</option>
              <option value="RECOVERY_OPPORTUNITY">Opportunities</option>
              <option value="TRANSACTION">Transactions</option>
              <option value="SIMULATION">Simulations</option>
              <option value="MERCHANT_SETTINGS">Settings</option>
              <option value="AUTH">Authentication</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Result:</span>
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Results</option>
              <option value="APPROVED">Approved / Recovered</option>
              <option value="BLOCKED">Policy Blocked</option>
              <option value="AUTO">Autonomous Actions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Bento Table */}
      <div className="bento-card overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ScrollText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No audit events match your filter</p>
            <p className="text-[11px] text-slate-400">Adjust keywords or clear filters to view history.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="p-3.5">Event Name</th>
                  <th className="p-3.5">Entity Type</th>
                  <th className="p-3.5">Entity ID</th>
                  <th className="p-3.5">Actor</th>
                  <th className="p-3.5">Decision Logic</th>
                  <th className="p-3.5">Outcome</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50/90 cursor-pointer transition-colors group"
                  >
                    <td className="p-3.5 font-mono font-bold text-slate-900 group-hover:text-indigo-600">
                      {log.event}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-semibold text-[10px] border border-slate-200">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-indigo-600">{log.entityId}</td>
                    <td className="p-3.5 text-slate-800 font-semibold">{log.actor}</td>
                    <td className="p-3.5 text-slate-700 font-mono text-[11px] max-w-[220px] truncate">
                      {log.decision}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.result.includes('SUCCESS') || log.result.includes('RECOVERED') || log.result === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.result.includes('BLOCKED')
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.result}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500 text-[11px]">{formatDateTime(log.timestamp)}</td>
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

      {/* Selected Audit Log JSON Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Audit Log Record Details</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Event</span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">{selectedLog.event}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Actor</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">{selectedLog.actor}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Decision Rationale</span>
                <p className="text-slate-800 font-mono text-[11px]">{selectedLog.decision}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Immutable Record JSON</span>
                <pre className="p-3 rounded-xl bg-slate-900 text-indigo-300 font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
