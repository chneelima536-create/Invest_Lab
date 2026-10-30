import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import {
  Bookmark,
  Search,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { WatchlistEntry } from '../types';
import { watchlistApi } from '../services/api';
import { formatINR, formatPercent } from '../utils/formatters';

export const WatchlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { openTradeModal } = useOutletContext<{ openTradeModal: (stock?: any) => void }>();

  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchWatchlist = async () => {
    setIsLoading(true);
    try {
      const data = await watchlistApi.get();
      setWatchlist(data);
    } catch (err) {
      console.error('Failed to load watchlist', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleRemove = async (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await watchlistApi.remove(symbol);
      setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol));
    } catch (err) {
      console.error('Failed to remove from watchlist', err);
    }
  };

  const filtered = watchlist.filter((w) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      w.symbol.toLowerCase().includes(q) ||
      (w.stock?.name && w.stock.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stocks in your watchlist..."
            className="w-full bg-[#F7F9FC] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          />
        </div>

        <Link
          to="/stocks"
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add More Stocks</span>
        </Link>
      </div>

      {/* Watchlist Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-[#64748B]">Loading watchlist...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E2E8F0] text-center space-y-3">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-[#172B4D]">Your Watchlist is Empty</h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            Keep track of companies you want to monitor before buying shares. Browse the stock
            explorer to add stocks to your personal watchlist.
          </p>
          <Link
            to="/stocks"
            className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700 transition-colors"
          >
            Explore Stock Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const stock = item.stock;
            const isPositive = (stock?.changePercent ?? 0) >= 0;

            return (
              <div
                key={item.id}
                onClick={() => navigate(`/stocks/${item.symbol}`)}
                className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-mono text-xs font-bold bg-slate-100 text-[#172B4D] px-2 py-0.5 rounded inline-block">
                        {item.symbol}
                      </div>
                      <h3 className="font-bold text-sm text-[#172B4D] mt-1.5 truncate">
                        {stock?.name || item.symbol}
                      </h3>
                      <span className="text-[11px] text-[#64748B]">{stock?.sector}</span>
                    </div>

                    <button
                      onClick={(e) => handleRemove(item.symbol, e)}
                      title="Remove from watchlist"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="text-lg font-black text-[#172B4D]">
                      {formatINR(stock?.price)}
                    </span>
                    <div
                      className={`text-xs font-bold flex items-center gap-1 ${
                        isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {isPositive ? '+' : ''}
                        {formatPercent(stock?.changePercent)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openTradeModal(stock)}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1"
                  >
                    <span>Trade</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => navigate(`/stocks/${item.symbol}`)}
                    className="px-3 py-2 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-xs font-semibold text-[#64748B] transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
