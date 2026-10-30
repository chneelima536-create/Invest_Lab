import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Bookmark,
  BookmarkCheck,
  Building2,
  Calendar,
  ShieldAlert,
  ArrowUpRight,
  Calculator,
  Info,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Stock, StockPricePoint } from '../types';
import { stocksApi, watchlistApi } from '../services/api';
import { formatINR, formatPercent, formatDate, formatNumberIN } from '../utils/formatters';

export const StockDetailPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { openTradeModal } = useOutletContext<{ openTradeModal: (stock?: any) => void }>();

  const [stock, setStock] = useState<Stock | null>(null);
  const [history, setHistory] = useState<StockPricePoint[]>([]);
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'>('1M');
  const [isWatched, setIsWatched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;
    setIsLoading(true);

    Promise.all([
      stocksApi.getBySymbol(symbol),
      stocksApi.getHistory(symbol, timeframe),
      watchlistApi.get(),
    ])
      .then(([s, h, wl]) => {
        setStock(s);
        setHistory(h);
        setIsWatched(wl.some((w) => w.symbol === symbol.toUpperCase()));
      })
      .catch((err) => {
        console.error('Failed to load stock details', err);
      })
      .finally(() => setIsLoading(false));
  }, [symbol, timeframe]);

  const toggleWatchlist = async () => {
    if (!stock) return;
    try {
      if (isWatched) {
        await watchlistApi.remove(stock.symbol);
        setIsWatched(false);
      } else {
        await watchlistApi.add(stock.symbol);
        setIsWatched(true);
      }
    } catch (err) {
      console.error('Watchlist toggle failed', err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-[#64748B]">
        Loading stock details for {symbol}...
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] text-center space-y-3">
        <h2 className="text-lg font-bold text-[#172B4D]">Stock Not Found</h2>
        <p className="text-xs text-[#64748B]">The symbol {symbol} does not exist in our catalog.</p>
        <button
          onClick={() => navigate('/stocks')}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  const isPositive = stock.changePercent >= 0;

  return (
    <div className="space-y-6">
      {/* Back button and quick actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/stocks')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#172B4D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Stock Explorer</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleWatchlist}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isWatched
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-white border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
            }`}
          >
            {isWatched ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{isWatched ? 'In Watchlist' : 'Add to Watchlist'}</span>
          </button>

          <button
            onClick={() => openTradeModal(stock)}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            <span>Trade {stock.symbol}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stock Hero Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold bg-slate-100 text-[#172B4D] px-2 py-0.5 rounded">
                {stock.symbol}
              </span>
              <span className="text-xs text-[#64748B] font-medium bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                {stock.sector}
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Demo Quote
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#172B4D] tracking-tight">{stock.name}</h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Simulated Feed · Last updated {formatDate(stock.lastUpdated)}
            </p>
          </div>

          <div className="text-left md:text-right">
            <div className="text-3xl font-black text-[#172B4D] tracking-tight">
              {formatINR(stock.price)}
            </div>
            <div
              className={`text-xs font-bold mt-1 flex items-center md:justify-end gap-1 ${
                isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'
              }`}
            >
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>
                {isPositive ? '+' : ''}
                {formatINR(stock.changeAmount)} ({formatPercent(stock.changePercent)})
              </span>
              <span className="text-[#64748B] font-normal text-[11px]">Today</span>
            </div>
          </div>
        </div>

        {/* Historical Price Chart */}
        <div className="pt-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#172B4D]">Price Performance Chart</span>
            {/* Timeframe selector */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-semibold">
              {(['1W', '1M', '3M', '6M', '1Y', 'ALL'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    timeframe === tf
                      ? 'bg-white text-[#2563EB] shadow-xs font-bold'
                      : 'text-[#64748B] hover:text-[#172B4D]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="stockChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? '#10B981' : '#2563EB'} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={isPositive ? '#10B981' : '#2563EB'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickFormatter={(val) => formatDate(val).slice(0, 6)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickFormatter={(val) => `₹${val}`}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#172B4D] text-white p-2.5 rounded-xl shadow-lg text-xs space-y-1">
                          <div className="text-slate-300">{formatDate(data.date)}</div>
                          <div className="font-bold text-sm text-emerald-400">
                            {formatINR(data.price)}
                          </div>
                          <div className="text-[10px] text-slate-300">
                            High: {formatINR(data.high)} | Low: {formatINR(data.low)}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? '#10B981' : '#2563EB'}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#stockChartGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fundamental Metrics Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-[#172B4D]">Fundamental Valuation Metrics</h2>
            <p className="text-xs text-[#64748B]">Simulated financial indicators for educational analysis</p>
          </div>
          <span className="text-[11px] text-blue-600 font-medium">Demo Data</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[#64748B] block font-medium">P/E Ratio</span>
            <span className="text-base font-bold text-[#172B4D] mt-0.5 block">
              {stock.peRatio ?? 'Not available'}
            </span>
            <span className="text-[10px] text-slate-400">Price to Earnings</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[#64748B] block font-medium">EPS (INR)</span>
            <span className="text-base font-bold text-[#172B4D] mt-0.5 block">
              {stock.eps ? `₹${stock.eps.toFixed(2)}` : 'Not available'}
            </span>
            <span className="text-[10px] text-slate-400">Earnings Per Share</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[#64748B] block font-medium">Market Cap (₹ Cr)</span>
            <span className="text-base font-bold text-[#172B4D] mt-0.5 block">
              {stock.marketCapCr ? `₹${formatNumberIN(stock.marketCapCr)} Cr` : 'Not available'}
            </span>
            <span className="text-[10px] text-slate-400">Total Company Valuation</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[#64748B] block font-medium">Dividend Yield</span>
            <span className="text-base font-bold text-[#172B4D] mt-0.5 block">
              {stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : 'Not available'}
            </span>
            <span className="text-[10px] text-slate-400">Annual Dividend %</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[#64748B] block font-medium">Annual Revenue (₹ Cr)</span>
            <span className="text-base font-bold text-[#172B4D] mt-0.5 block">
              {stock.revenueCr ? `₹${formatNumberIN(stock.revenueCr)} Cr` : 'Not available'}
            </span>
            <span className="text-[10px] text-slate-400">Gross Inflow</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[#64748B] block font-medium">Net Profit (₹ Cr)</span>
            <span className="text-base font-bold text-[#172B4D] mt-0.5 block">
              {stock.netProfitCr ? `₹${formatNumberIN(stock.netProfitCr)} Cr` : 'Not available'}
            </span>
            <span className="text-[10px] text-slate-400">After Tax Earnings</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[#64748B] block font-medium">52-Week High</span>
            <span className="text-base font-bold text-[#172B4D] mt-0.5 block">
              {stock.high52w ? formatINR(stock.high52w) : 'Not available'}
            </span>
            <span className="text-[10px] text-emerald-600">Peak price</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[#64748B] block font-medium">52-Week Low</span>
            <span className="text-base font-bold text-[#172B4D] mt-0.5 block">
              {stock.low52w ? formatINR(stock.low52w) : 'Not available'}
            </span>
            <span className="text-[10px] text-red-600">Trough price</span>
          </div>
        </div>
      </div>

      {/* Company Overview Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-2">
        <h2 className="text-sm font-bold text-[#172B4D]">About {stock.name}</h2>
        <p className="text-xs text-[#64748B] leading-relaxed">{stock.description}</p>
      </div>
    </div>
  );
};
