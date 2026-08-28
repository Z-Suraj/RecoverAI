import React, { useState, useEffect } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { apiClient } from '../../api/client';
import { Transaction, Customer, RecoveryOpportunity } from '../../types';
import { formatINR } from '../../utils/formatters';
import { Search, ArrowRight, User, ArrowLeftRight, RotateCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GlobalSearchModalProps {
  navigate: (path: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ navigate }) => {
  const { isSearchOpen, setIsSearchOpen } = usePlatform();
  const [query, setQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [opportunities, setOpportunities] = useState<RecoveryOpportunity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSearchOpen) {
      setQuery('');
      return;
    }

    const timer = setTimeout(async () => {
      if (!query.trim()) {
        try {
          const [t, c, o] = await Promise.all([
            apiClient.getTransactions({ limit: 4 }),
            apiClient.getCustomers(),
            apiClient.getOpportunities(),
          ]);
          setTransactions(t.slice(0, 4));
          setCustomers(c.slice(0, 3));
          setOpportunities(o.slice(0, 4));
        } catch (err) {
          console.error(err);
        }
        return;
      }

      setLoading(true);
      try {
        const [t, c, o] = await Promise.all([
          apiClient.getTransactions({ search: query, limit: 6 }),
          apiClient.getCustomers(query),
          apiClient.getOpportunities({ search: query }),
        ]);
        setTransactions(t.slice(0, 6));
        setCustomers(c.slice(0, 4));
        setOpportunities(o.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, isSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        >
          {/* Input Header */}
          <div className="p-4 border-b border-slate-200 flex items-center space-x-3 bg-slate-50/50">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Transaction ID (e.g. TXN-82941), customer name, or issue..."
              className="w-full bg-transparent border-none text-slate-900 text-sm focus:outline-none placeholder:text-slate-400 font-medium"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline text-[10px] font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-500 shadow-xs">
              ESC
            </kbd>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
            {/* Opportunities */}
            {opportunities.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Recovery Opportunities</span>
                </h4>
                <div className="space-y-1.5">
                  {opportunities.map((opp) => (
                    <button
                      key={opp.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        navigate(`/transactions/${opp.transactionId}`);
                      }}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-indigo-50/50 hover:border-indigo-200 border border-transparent flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {opp.transactionId}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{opp.customerName}</p>
                          <p className="text-[11px] text-slate-500">{opp.failureReason.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-bold text-slate-900">{formatINR(opp.amount)}</span>
                        <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          {opp.aiDiagnosis.recoveryProbability}%
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Transactions */}
            {transactions.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Transactions</span>
                </h4>
                <div className="space-y-1.5">
                  {transactions.map((txn) => (
                    <button
                      key={txn.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        navigate(`/transactions/${txn.id}`);
                      }}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 border border-transparent flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs font-semibold text-slate-700">{txn.id}</span>
                        <span className="text-xs text-slate-900 font-medium">{txn.customerName}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {txn.paymentMethod}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-bold text-slate-900">{formatINR(txn.amount)}</span>
                        <span className="text-xs text-slate-500">{txn.status}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customers */}
            {customers.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Customers</span>
                </h4>
                <div className="space-y-1.5">
                  {customers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        navigate(`/customers/${c.id}`);
                      }}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 border border-transparent flex items-center justify-between group transition-all"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{c.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{c.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900">CLV: {formatINR(c.lifetimeValue)}</span>
                        <p className="text-[10px] text-emerald-600 font-medium">{c.successfulTransactions} paid / {c.recoveredTransactions} recovered</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {transactions.length === 0 && customers.length === 0 && opportunities.length === 0 && !loading && (
              <div className="p-8 text-center text-xs text-slate-500">
                No matching transactions or customers found for "{query}".
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
            <span>Navigation: Click or press Enter to view details</span>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
