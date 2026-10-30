import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import {
  Search,
  ArrowUpDown,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  TrendingDown,
  Info,
  ShieldAlert,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { Stock, WatchlistEntry } from '../types';
import { stocksApi, watchlistApi } from '../services/api';
import { formatINR, formatPercent } from '../utils/formatters';

export const ExploreStocksPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { openTradeModal } = useOutletContext<{ openTradeModal: (stock?: any) => void }>();

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [watchlistSymbols, setWatchlistSymbols] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedSector, setSelectedSector] = useState(searchParams.get('sector') || 'ALL');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'changePercent'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);

  const fetchStocks = async () => {
    setIsLoading(true);
    try {
      const [stockList, watchlist] = await Promise.all([
        stocksApi.getAll({
          search: search.trim() || undefined,
          sector: selectedSector !== 'ALL' ? selectedSector : undefined,
          sortBy,
          sortOrder,
        }),
        watchlistApi.get(),
      ]);

      setStocks(stockList);
      setWatchlistSymbols(new Set(watchlist.map((w) => w.symbol)));
    } catch (err) {
      console.error('Failed to load stocks', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, [search, selectedSector, sortBy, sortOrder]);

  const toggleWatchlist = async (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (watchlistSymbols.has(symbol)) {
        await watchlistApi.remove(symbol);
        setWatchlistSymbols((prev) => {
          const next = new Set(prev);
          next.delete(symbol);
          return next;
        });
      } else {
        await watchlistApi.add(symbol);
        setWatchlistSymbols((prev) => new Set(prev).add(symbol));
      }
    } catch (err) {
      console.error('Watchlist action failed', err);
    }
  };

  const sectors = ['ALL', 'Information Technology', 'Banking & Finance', 'Energy & Telecom', 'Consumer Goods (FMCG)'];

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company name or stock symbol..."
              className="w-full bg-[#F7F9FC] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2 text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>

          {/* Quick Sort Control */}
          <div className="flex items-center gap-2 self-start md:self-auto text-xs">
            <span className="text-[#64748B] font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort by:
            </span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-') as [any, any];
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="bg-[#F7F9FC] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 font-semibold text-[#172B4D] focus:outline-none"
            >
              <option value="name-asc">Company Name (A–Z)</option>
              <option value="name-desc">Company Name (Z–A)</option>
              <option value="price-desc">Price (Highest First)</option>
              <option value="price-asc">Price (Lowest First)</option>
              <option value="changePercent-desc">Top Gainers</option>
              <option value="changePercent-asc">Top Losers</option>
            </select>
          </div>
        </div>

        {/* Sector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[#64748B] font-medium flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Sector:
          </span>
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium ${
                selectedSector === sec
                  ? 'bg-[#2563EB] text-white shadow-xs font-semibold'
                  : 'bg-slate-50 text-[#64748B] hover:text-[#172B4D] hover:bg-slate-100 border border-[#E2E8F0]'
              }`}
            >
              {sec === 'ALL' ? 'All Sectors' : sec}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Catalog Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#172B4D]">Stock Catalog</h2>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Demo Price Quotes
            </span>
          </div>
          <span className="text-xs text-[#64748B]">{stocks.length} equities available</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#64748B]">
            Loading stock catalog...
          </div>
        ) : stocks.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#64748B] space-y-2">
            <p className="font-semibold text-sm text-[#172B4D]">No stocks found</p>
            <p>Try searching with another symbol (e.g. TCS, RELIANCE, INFY) or clear filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 text-[#64748B] border-b border-slate-100">
                  <th className="py-3 px-4 font-semibold">Company & Symbol</th>
                  <th className="py-3 px-4 font-semibold">Sector</th>
                  <th className="py-3 px-4 font-semibold text-right">Price</th>
                  <th className="py-3 px-4 font-semibold text-right">Change</th>
                  <th className="py-3 px-4 font-semibold text-center">Watchlist</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stocks.map((s) => {
                  const isPositive = s.changePercent >= 0;
                  const isWatched = watchlistSymbols.has(s.symbol);

                  return (
                    <tr
                      key={s.symbol}
                      onClick={() => navigate(`/stocks/${s.symbol}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-sm text-[#172B4D]">{s.name}</div>
                        <div className="text-[11px] text-[#64748B] flex items-center gap-1.5">
                          <span className="font-mono font-semibold">{s.symbol}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                            NSE Demo
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[#64748B]">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-[#172B4D] text-[11px] font-medium">
                          {s.sector}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-sm text-[#172B4D]">
                        {formatINR(s.price)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div
                          className={`font-semibold text-xs flex items-center justify-end gap-1 ${
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
                            {formatINR(s.changeAmount)} ({formatPercent(s.changePercent)})
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => toggleWatchlist(s.symbol, e)}
                          title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isWatched
                              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {isWatched ? (
                            <BookmarkCheck className="w-4 h-4" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openTradeModal(s)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1"
                          >
                            <span>Trade</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
