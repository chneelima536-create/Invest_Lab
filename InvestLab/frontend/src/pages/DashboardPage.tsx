import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  PieChart as PieIcon,
  Clock,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Lightbulb,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PortfolioSummary, Trade, WatchlistEntry, LearningModule } from '../types';
import { tradingApi, watchlistApi, learningApi } from '../services/api';
import { formatINR, formatPercent, formatDate, formatDateTime } from '../utils/formatters';

const ALLOCATION_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B'];

export const DashboardPage: React.FC = () => {
  const { openTradeModal } = useOutletContext<{ openTradeModal: (stock?: any) => void }>();

  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'>('1M');
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [learningStats, setLearningStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [pData, hData, tData, wData, mData, sData] = await Promise.all([
        tradingApi.getPortfolio(),
        tradingApi.getPortfolioHistory(timeframe),
        tradingApi.getTransactions(),
        watchlistApi.get(),
        learningApi.getModules(),
        learningApi.getStats(),
      ]);

      setPortfolio(pData);
      setHistory(hData);
      setRecentTrades(tData.slice(0, 5));
      setWatchlist(wData.slice(0, 4));
      setModules(mData.slice(0, 3));
      setLearningStats(sData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Listen for trades executed anywhere
    const onPortfolioUpdate = () => loadDashboardData();
    window.addEventListener('portfolio-updated', onPortfolioUpdate);
    return () => window.removeEventListener('portfolio-updated', onPortfolioUpdate);
  }, [timeframe]);

  const totalPnl = Number(((portfolio?.unrealizedPnl || 0) + (portfolio?.realizedPnl || 0)).toFixed(2));
  const isPnlPositive = totalPnl >= 0;

  // Donut chart allocation items
  const allocationData = [
    { name: 'Virtual Cash', value: portfolio?.availableCash || 100000, color: '#10B981' },
    ...(portfolio?.holdings || []).map((h, i) => ({
      name: h.symbol,
      value: h.currentValue,
      color: ALLOCATION_COLORS[(i + 1) % ALLOCATION_COLORS.length],
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Simulation Banner Notice */}
      <div className="bg-[#EFF6FF] border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-blue-900">
                Paper Trading Mode
              </span>
              <span className="text-[10px] font-semibold bg-blue-200/70 text-blue-800 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Practice investing safely. All prices and transactions are simulated for education.
            </p>
          </div>
        </div>

        <button
          onClick={() => openTradeModal()}
          className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <span>Simulate New Trade</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Summary Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Portfolio Value */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
            <span className="font-semibold uppercase tracking-wider">Total Portfolio Value</span>
            <Wallet className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-black text-[#172B4D] tracking-tight">
            {formatINR(portfolio?.totalPortfolioValue ?? 100000)}
          </div>
          <div className="text-xs text-[#64748B] mt-1 flex items-center gap-1.5">
            <span>Cash + Equities</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-600 font-medium">Net Worth</span>
          </div>
        </div>

        {/* Card 2: Invested Cost */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
            <span className="font-semibold uppercase tracking-wider">Current Invested</span>
            <PieIcon className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-[#172B4D] tracking-tight">
            {formatINR(portfolio?.totalInvested ?? 0)}
          </div>
          <div className="text-xs text-[#64748B] mt-1">
            <span>{portfolio?.holdingsCount || 0} active holdings (avg cost basis)</span>
          </div>
        </div>

        {/* Card 3: Available Virtual Cash */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
            <span className="font-semibold uppercase tracking-wider">Available Cash</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-[#172B4D] tracking-tight">
            {formatINR(portfolio?.availableCash ?? 100000)}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            <span>{portfolio?.assetAllocation?.cashPercent ?? 100}% of portfolio</span>
          </div>
        </div>

        {/* Card 4: Total Profit / Loss */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
            <span className="font-semibold uppercase tracking-wider">Total Profit / Loss</span>
            {isPnlPositive ? (
              <TrendingUp className="w-4 h-4 text-[#16A34A]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[#DC2626]" />
            )}
          </div>
          <div
            className={`text-2xl font-black tracking-tight ${
              isPnlPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'
            }`}
          >
            {formatINR(totalPnl)}
          </div>
          <div className="text-xs text-[#64748B] mt-1 flex items-center gap-1.5">
            <span>Unrealized: {formatINR(portfolio?.unrealizedPnl || 0)}</span>
            <span className="text-slate-300">•</span>
            <span>Realized: {formatINR(portfolio?.realizedPnl || 0)}</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Line Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-2 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#172B4D]">Portfolio Equity Trend</h2>
              <p className="text-xs text-[#64748B]">
                Illustrative simulated valuation trajectory based on current positions
              </p>
            </div>

            {/* Timeframe Filters */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 self-start sm:self-auto text-xs font-semibold">
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

          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
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
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#172B4D] text-white p-2.5 rounded-xl shadow-lg text-xs space-y-1">
                          <div className="text-slate-300 font-medium">{formatDate(data.date)}</div>
                          <div className="font-bold text-sm text-blue-300">
                            {formatINR(data.value)}
                          </div>
                          <div className="text-[11px] text-slate-300">
                            Invested: {formatINR(data.invested)} | Cash: {formatINR(data.cash)}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#equityGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Allocation Donut Chart (1 Col) */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-[#172B4D]">Asset Allocation</h2>
            <p className="text-xs text-[#64748B]">Cash vs Equity Distribution</p>
          </div>

          <div className="h-44 w-full relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => formatINR(val)}
                  contentStyle={{
                    borderRadius: '12px',
                    backgroundColor: '#172B4D',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label in Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Total</span>
              <span className="text-xs font-bold text-[#172B4D]">
                {formatINR(portfolio?.totalPortfolioValue, false)}
              </span>
            </div>
          </div>

          {/* Allocation Legend */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-[#64748B]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Virtual Cash
              </span>
              <span className="font-bold text-[#172B4D]">
                {portfolio?.assetAllocation?.cashPercent ?? 100}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-[#64748B]">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                Equities / Stocks
              </span>
              <span className="font-bold text-[#172B4D]">
                {portfolio?.assetAllocation?.equitiesPercent ?? 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Row: Recent Transactions & Learning Center Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-[#172B4D]">Recent Trades</h2>
              <p className="text-xs text-[#64748B]">Simulated buy and sell execution records</p>
            </div>
            <Link
              to="/transactions"
              className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentTrades.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#64748B] space-y-2">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-medium">No simulated trades executed yet.</p>
              <button
                onClick={() => openTradeModal()}
                className="text-blue-600 font-bold hover:underline"
              >
                Place your first paper trade →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[#64748B] border-b border-slate-100">
                    <th className="pb-2 font-semibold">Stock</th>
                    <th className="pb-2 font-semibold">Type</th>
                    <th className="pb-2 font-semibold">Qty</th>
                    <th className="pb-2 font-semibold">Price</th>
                    <th className="pb-2 font-semibold">Total</th>
                    <th className="pb-2 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTrades.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 font-bold text-[#172B4D]">{t.symbol}</td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            t.tradeType === 'BUY'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {t.tradeType}
                        </span>
                      </td>
                      <td className="py-2.5 font-semibold text-[#172B4D]">{t.quantity}</td>
                      <td className="py-2.5 text-[#64748B]">{formatINR(t.executionPrice)}</td>
                      <td className="py-2.5 font-bold text-[#172B4D]">{formatINR(t.totalAmount)}</td>
                      <td className="py-2.5 text-[#64748B]">{formatDate(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Learning Progress & Financial Tip */}
        <div className="space-y-6">
          {/* Learning Progress Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#172B4D] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Learning Progress
              </h2>
              <span className="text-xs font-bold text-blue-600">
                {learningStats?.overallProgressPercent || 0}% Complete
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${learningStats?.overallProgressPercent || 0}%` }}
              />
            </div>

            <div className="text-xs text-[#64748B] flex justify-between">
              <span>{learningStats?.completedLessons || 0} Lessons Completed</span>
              <span>{learningStats?.quizzesPassedCount || 0} Quizzes Passed</span>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/learn"
                className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-[#E2E8F0] text-xs font-bold text-[#172B4D] flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Continue Curriculum</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Beginner Financial Tip */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>FinTech Tip: Rupee-Cost Averaging</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Never try to "time" exact market bottoms. By investing a fixed amount monthly through an SIP, you automatically acquire more units when quotes drop, lowering your average cost over time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
