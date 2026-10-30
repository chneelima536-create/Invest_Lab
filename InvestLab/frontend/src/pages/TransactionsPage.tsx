import React, { useState, useEffect } from 'react';
import {
  ReceiptText,
  Search,
  Download,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Calendar,
} from 'lucide-react';
import { Trade } from '../types';
import { tradingApi } from '../services/api';
import { formatINR, formatDateTime } from '../utils/formatters';

export const TransactionsPage: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [search, setSearch] = useState('');
  const [tradeType, setTradeType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await tradingApi.getTransactions({
        symbol: search.trim() || undefined,
        tradeType: tradeType !== 'ALL' ? tradeType : undefined,
        sortOrder,
      });
      setTrades(data);
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, tradeType, sortOrder]);

  const handleExportCsv = async () => {
    try {
      await tradingApi.exportCsv();
    } catch (err) {
      console.error('CSV export failed', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search, Filter & CSV Export Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Symbol Search */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symbol (e.g. TCS)..."
              className="w-full bg-[#F7F9FC] border border-[#E2E8F0] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>

          {/* Trade Type Filter */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs font-semibold">
            {(['ALL', 'BUY', 'SELL'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTradeType(type)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  tradeType === type
                    ? 'bg-white text-[#172B4D] shadow-xs font-bold'
                    : 'text-[#64748B] hover:text-[#172B4D]'
                }`}
              >
                {type === 'ALL' ? 'All Types' : type}
              </button>
            ))}
          </div>

          {/* Sort Date Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-2 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-xs font-semibold text-[#64748B] flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Date: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={handleExportCsv}
          className="px-4 py-2 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-xs font-bold text-[#172B4D] shadow-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#172B4D]">Transaction Records</h2>
            <p className="text-xs text-[#64748B]">Permanent audit ledger for simulated orders</p>
          </div>
          <span className="text-xs text-[#64748B]">{trades.length} entries</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#64748B]">Loading transactions...</div>
        ) : trades.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#64748B] space-y-2">
            <ReceiptText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-[#172B4D]">No transactions found</p>
            <p>Execute paper trades to generate ledger history.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 text-[#64748B] border-b border-slate-100">
                  <th className="py-3 px-4 font-semibold">Date & Time</th>
                  <th className="py-3 px-4 font-semibold">Stock</th>
                  <th className="py-3 px-4 font-semibold text-center">Type</th>
                  <th className="py-3 px-4 font-semibold text-right">Quantity</th>
                  <th className="py-3 px-4 font-semibold text-right">Execution Price</th>
                  <th className="py-3 px-4 font-semibold text-right">Total Amount</th>
                  <th className="py-3 px-4 font-semibold text-right">Cash Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trades.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-[#64748B] whitespace-nowrap">
                      {formatDateTime(t.createdAt)}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-sm text-[#172B4D]">{t.symbol}</span>
                      <span className="text-[11px] text-[#64748B] block truncate max-w-[180px]">
                        {t.stockName}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          t.tradeType === 'BUY'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {t.tradeType}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-[#172B4D]">{t.quantity}</td>

                    <td className="py-3 px-4 text-right text-[#64748B]">
                      {formatINR(t.executionPrice)}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-[#172B4D]">
                      {formatINR(t.totalAmount)}
                    </td>

                    <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                      {formatINR(t.cashAfterTrade)}
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
