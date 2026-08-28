import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Customer, Transaction } from '../types';
import { formatINR, formatDateTime } from '../utils/formatters';
import { getCustomerAvatar } from '../utils/avatarUtils';
import { TransactionStatusBadge, FailureReasonLabel } from '../components/common/StatusBadge';
import { ArrowLeft, User, Phone, Mail, MapPin, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react';
import { SafeImage } from '../components/common/SafeImage';

interface CustomerDetailPageProps {
  customerId: string;
  navigate: (path: string) => void;
}

export const CustomerDetailPage: React.FC<CustomerDetailPageProps> = ({ customerId, navigate }) => {
  const [data, setData] = useState<{ customer: Customer; transactions: Transaction[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      try {
        const res = await apiClient.getCustomerById(customerId);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [customerId]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading customer profile and history...</div>;
  }

  if (!data || !data.customer) {
    return (
      <div className="p-8 text-center space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Customer Not Found</h3>
        <button onClick={() => navigate('/customers')} className="text-xs text-indigo-600 font-bold">
          Return to Customers
        </button>
      </div>
    );
  }

  const { customer, transactions } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bento Banner with Avatar */}
      <div className="bento-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/customers')}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <SafeImage
            src={getCustomerAvatar(customer.id, customer.name)}
            alt={customer.name}
            fallbackType="initials"
            fallbackText={customer.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-100 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{customer.name}</h2>
              <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded-full text-slate-700 font-bold border border-slate-200">
                {customer.id}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  customer.riskScore === 'LOW'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {customer.riskScore} RISK
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{customer.email}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{customer.phone}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{customer.city}, {customer.country}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs">
            <span className="text-[10px] font-bold text-indigo-700 uppercase block">Preferred Gateway</span>
            <span className="font-extrabold text-indigo-950">{customer.preferredPaymentMethod}</span>
          </div>
        </div>
      </div>

      {/* Customer Metrics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bento-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lifetime Value</span>
          <span className="text-xl font-extrabold font-mono text-slate-900 mt-1 block">
            {formatINR(customer.lifetimeValue)}
          </span>
        </div>
        <div className="bento-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Reliability</span>
          <span className="text-xl font-extrabold font-mono text-emerald-700 mt-1 block">
            {customer.paymentReliability}%
          </span>
        </div>
        <div className="bento-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Transactions</span>
          <span className="text-xl font-extrabold font-mono text-slate-900 mt-1 block">
            {customer.totalTransactions}
          </span>
        </div>
        <div className="bento-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recovered Transactions</span>
          <span className="text-xl font-extrabold font-mono text-indigo-600 mt-1 block">
            {customer.recoveredTransactions}
          </span>
        </div>
      </div>

      {/* History Table Bento Card */}
      <div className="bento-card overflow-hidden space-y-0">
        <div className="p-5 border-b border-slate-200/80">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Transaction History ({transactions.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="p-3">Transaction ID</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Method</th>
                <th className="p-3">Gateway</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => navigate(`/transactions/${t.id}`)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-mono font-bold text-indigo-600">{t.id}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">{formatINR(t.amount)}</td>
                  <td className="p-3 uppercase font-bold text-slate-600 text-[10px]">{t.paymentMethod}</td>
                  <td className="p-3 text-slate-700">{t.gateway}</td>
                  <td className="p-3">
                    <TransactionStatusBadge status={t.status} />
                  </td>
                  <td className="p-3 text-slate-500 font-mono">{formatDateTime(t.createdAt)}</td>
                  <td className="p-3 text-right">
                    <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
