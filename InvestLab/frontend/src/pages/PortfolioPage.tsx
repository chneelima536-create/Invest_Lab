import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  ShieldCheck,
  Layers,
  ArrowUpRight,
  Info,
  Building2,
  Coins,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import { PortfolioSummary, EnrichedHolding } from '../types';
import { tradingApi } from '../services/api';
import { formatINR, formatPercent } from '../utils/formatters';

const SECTOR_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

export const PortfolioPage: React.FC = () => {
  const { openTradeModal } = useOutletContext<{ openTradeModal: (stock?: any) => void }>();

  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPortfolio = async () => {
    setIsLoading(true);
    try {
      const data = await tradingApi.getPortfolio();
      setPortfolio(data);
    } catch (err) {
      console.error('Failed to load portfolio', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();

    const onUpdate = () => fetchPortfolio();
    window.addEventListener('portfolio-updated', onUpdate);
    return () => window.removeEventListener('portfolio-updated', onUpdate);
  }, []);

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-[#64748B]">Loading your portfolio...</div>;
  }

  const holdings = portfolio?.holdings || [];
  const totalValue = portfolio?.totalPortfolioValue || 100000;
  const isUnrealizedPositive = (portfolio?.unrealizedPnl || 0) >= 0;

  // Sector chart data
  const sectorData = Object.entries(portfolio?.sectorAllocation || {}).map(([sec, val], idx) => ({
    name: sec,
    value: val,
    color: SECTOR_COLORS[idx % SECTOR_COLORS.length],
  }));

  // Asset allocation donut data
  const assetData = [
    { name: 'Virtual Cash', value: portfolio?.availableCash || 100000, color: '#10B981' },
    { name: 'Equities', value: portfolio?.currentHoldingsValue || 0, color: '#2563EB' },
  ];

  return (
    <div className="space-y-6">
      {/* Portfolio Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Portfolio Value */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block">
            Total Net Value
          </span>
          <div className="text-2xl font-black text-[#172B4D] mt-1">
            {formatINR(portfolio?.totalPortfolioValue)}
          </div>
          <div className="text-xs text-[#64748B] mt-1 flex justify-between">
            <span>Cash: {formatINR(portfolio?.availableCash)}</span>
            <span>Holdings: {formatINR(portfolio?.currentHoldingsValue)}</span>
          </div>
        </div>

        {/* Unrealized P/L */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block">
            Unrealized Returns (Paper)
          </span>
          <div
            className={`text-2xl font-black mt-1 ${
              isUnrealizedPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'
            }`}
          >
            {formatINR(portfolio?.unrealizedPnl)} ({formatPercent(portfolio?.unrealizedPnlPercent)})
          </div>
          <div className="text-xs text-[#64748B] mt-1">
            <span>Current Invested: {formatINR(portfolio?.totalInvested)}</span>
          </div>
        </div>

        {/* Realized P/L */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block">
            Realized Capital Gains
          </span>
          <div
            className={`text-2xl font-black mt-1 ${
              (portfolio?.realizedPnl || 0) >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
            }`}
          >
            {formatINR(portfolio?.realizedPnl)}
          </div>
          <div className="text-xs text-[#64748B] mt-1">
            <span>Permanent gains locked in from sold shares</span>
          </div>
        </div>
      </div>

      {/* Accounting Methodology Banner */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] flex items-start gap-2.5 text-xs text-[#64748B]">
        <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#172B4D]">Accounting Method:</strong>{' '}
          {portfolio?.accountingMethod}. When you acquire additional shares of an existing position,
          the cost basis recalculates using weighted average purchase pricing. When you partially sell shares,
          your cost per share remains identical and realized gain or loss is booked directly into virtual cash.
        </div>
      </div>

      {/* Holdings Breakdown Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#172B4D]">Equity Holdings</h2>
            <p className="text-xs text-[#64748B]">{holdings.length} companies currently held</p>
          </div>
          <button
            onClick={() => openTradeModal()}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1"
          >
            <span>+ Buy Shares</span>
          </button>
        </div>

        {holdings.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#64748B] space-y-3">
            <Coins className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-[#172B4D]">You currently own no simulated shares.</p>
            <p className="max-w-md mx-auto">
              You have {formatINR(portfolio?.availableCash)} in virtual cash ready to invest. Explore
              bluechip stocks and execute your first paper trade.
            </p>
            <Link
              to="/stocks"
              className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700 transition-colors"
            >
              Explore Stocks Now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 text-[#64748B] border-b border-slate-100">
                  <th className="py-3 px-4 font-semibold">Stock</th>
                  <th className="py-3 px-4 font-semibold text-right">Qty</th>
                  <th className="py-3 px-4 font-semibold text-right">Avg Cost</th>
                  <th className="py-3 px-4 font-semibold text-right">Latest Quote</th>
                  <th className="py-3 px-4 font-semibold text-right">Invested Value</th>
                  <th className="py-3 px-4 font-semibold text-right">Market Value</th>
                  <th className="py-3 px-4 font-semibold text-right">Unrealized P&L</th>
                  <th className="py-3 px-4 font-semibold text-center">Trade Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {holdings.map((h) => {
                  const isPos = h.unrealizedPnl >= 0;
                  return (
                    <tr key={h.symbol} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          to={`/stocks/${h.symbol}`}
                          className="font-bold text-sm text-[#172B4D] hover:text-blue-600 transition-colors"
                        >
                          {h.symbol}
                        </Link>
                        <div className="text-[11px] text-[#64748B]">{h.stockName}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#172B4D]">{h.quantity}</td>
                      <td className="py-3 px-4 text-right text-[#64748B]">
                        {formatINR(h.averageBuyPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-[#172B4D]">
                        {formatINR(h.currentPrice)}
                      </td>
                      <td className="py-3 px-4 text-right text-[#64748B]">
                        {formatINR(h.totalInvested)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#172B4D]">
                        {formatINR(h.currentValue)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className={`font-bold ${isPos ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                          {isPos ? '+' : ''}
                          {formatINR(h.unrealizedPnl)}
                        </div>
                        <div className={`text-[10px] ${isPos ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                          {formatPercent(h.unrealizedPnlPercent)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() =>
                              openTradeModal({
                                symbol: h.symbol,
                                name: h.stockName,
                                price: h.currentPrice,
                              })
                            }
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[#172B4D] font-bold text-[11px] transition-colors"
                          >
                            Trade
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

      {/* Allocation & Diversification Charts */}
      {holdings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset Allocation Donut */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
            <h3 className="text-sm font-bold text-[#172B4D] mb-1">Asset Allocation</h3>
            <p className="text-xs text-[#64748B] mb-4">Cash vs Equities ratio</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {assetData.map((e, idx) => (
                      <Cell key={idx} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatINR(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-around text-xs pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[#64748B]">Cash:</span>
                <span className="font-bold text-[#172B4D]">
                  {portfolio?.assetAllocation.cashPercent}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-[#64748B]">Equities:</span>
                <span className="font-bold text-[#172B4D]">
                  {portfolio?.assetAllocation.equitiesPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Sector Diversification Bar */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
            <h3 className="text-sm font-bold text-[#172B4D] mb-1">Sector Diversification</h3>
            <p className="text-xs text-[#64748B] mb-4">Capital allocated by economic industry</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} width={90} />
                  <Tooltip formatter={(v: number) => formatINR(v)} />
                  <Bar dataKey="value" fill="#2563EB" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
