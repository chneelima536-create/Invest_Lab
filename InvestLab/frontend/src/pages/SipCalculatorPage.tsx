import React, { useState, useEffect } from 'react';
import {
  Calculator,
  TrendingUp,
  RotateCcw,
  Info,
  Calendar,
  Coins,
  ShieldAlert,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { sipApi } from '../services/api';
import { SIPCalculationResult } from '../types';
import { formatINR } from '../utils/formatters';

export const SipCalculatorPage: React.FC = () => {
  const [monthlyAmount, setMonthlyAmount] = useState<number>(5000);
  const [durationYears, setDurationYears] = useState<number>(10);
  const [returnRate, setReturnRate] = useState<number>(12);
  const [result, setResult] = useState<SIPCalculationResult | null>(null);

  const calculate = async () => {
    try {
      const res = await sipApi.calculate(monthlyAmount, durationYears, returnRate);
      setResult(res);
    } catch (err) {
      console.error('Calculation error', err);
    }
  };

  useEffect(() => {
    calculate();
  }, [monthlyAmount, durationYears, returnRate]);

  const handleReset = () => {
    setMonthlyAmount(5000);
    setDurationYears(10);
    setReturnRate(12);
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <div className="bg-[#EFF6FF] border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="text-xs text-[#64748B] leading-relaxed">
          <strong className="text-[#172B4D]">Educational SIP Simulation:</strong> This simulator uses the standard monthly compounding ordinary annuity formula:
          <code className="mx-1 bg-white px-1.5 py-0.5 rounded border border-blue-200 text-[#172B4D] font-mono">
            FV = P × [((1 + r)^n − 1) / r]
          </code>
          where <span className="font-mono text-blue-700">r</span> is the monthly rate and <span className="font-mono text-blue-700">n</span> is the number of months. Actual equity and mutual fund returns vary and are not guaranteed.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Card (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#172B4D]">Investment Parameters</h2>
              <p className="text-xs text-[#64748B]">Adjust values to simulate your wealth plan</p>
            </div>
            <button
              onClick={handleReset}
              title="Reset defaults"
              className="p-1.5 text-[#64748B] hover:text-[#172B4D] hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Monthly Investment */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <label className="text-[#172B4D]">Monthly Investment (P)</label>
              <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                {formatINR(monthlyAmount, false)}
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="100000"
              step="500"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#64748B]">
              <span>₹500</span>
              <span>₹50,000</span>
              <span>₹1,00,000</span>
            </div>
          </div>

          {/* Time Duration */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <label className="text-[#172B4D]">Duration in Years (y)</label>
              <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                {durationYears} {durationYears === 1 ? 'Year' : 'Years'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="1"
              value={durationYears}
              onChange={(e) => setDurationYears(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#64748B]">
              <span>1 Yr</span>
              <span>15 Yrs</span>
              <span>35 Yrs</span>
            </div>
          </div>

          {/* Expected Return Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <label className="text-[#172B4D]">Expected Annual Return Rate (R)</label>
              <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                {returnRate}% p.a.
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="0.5"
              value={returnRate}
              onChange={(e) => setReturnRate(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#64748B]">
              <span>0% (Zero return)</span>
              <span>12% (Nifty average)</span>
              <span>30%</span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-[#64748B] block mb-2">
              Popular Financial Scenarios:
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => {
                  setMonthlyAmount(3000);
                  setDurationYears(5);
                  setReturnRate(10);
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <div className="font-bold text-[#172B4D]">Student SIP</div>
                <div className="text-[10px] text-[#64748B]">₹3k · 5Y · 10%</div>
              </button>
              <button
                onClick={() => {
                  setMonthlyAmount(10000);
                  setDurationYears(15);
                  setReturnRate(12);
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <div className="font-bold text-[#172B4D]">Wealth Plan</div>
                <div className="text-[10px] text-[#64748B]">₹10k · 15Y · 12%</div>
              </button>
              <button
                onClick={() => {
                  setMonthlyAmount(25000);
                  setDurationYears(20);
                  setReturnRate(13);
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <div className="font-bold text-[#172B4D]">Retirement</div>
                <div className="text-[10px] text-[#64748B]">₹25k · 20Y · 13%</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Output Dashboard (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Output Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <span className="text-xs text-[#64748B] font-semibold uppercase tracking-wider block">
                Total Invested
              </span>
              <div className="text-xl font-black text-[#172B4D] mt-1">
                {formatINR(result?.totalInvested)}
              </div>
              <span className="text-[11px] text-[#64748B]">Out-of-pocket principal</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <span className="text-xs text-[#64748B] font-semibold uppercase tracking-wider block">
                Est. Wealth Gained
              </span>
              <div className="text-xl font-black text-emerald-600 mt-1">
                +{formatINR(result?.estimatedWealthGained)}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">
                Compound growth returns
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <span className="text-xs text-[#64748B] font-semibold uppercase tracking-wider block">
                Estimated Final Corpus
              </span>
              <div className="text-xl font-black text-blue-600 mt-1">
                {formatINR(result?.estimatedFinalValue)}
              </div>
              <span className="text-[11px] text-blue-700 font-semibold">Future value (FV)</span>
            </div>
          </div>

          {/* Growth Area Chart */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#172B4D]">Compounding Wealth Curve</h3>
                <p className="text-xs text-[#64748B]">Invested Principal vs. Total Accumulated Value</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result?.yearlyBreakdown || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sipEstGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="sipInvGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(y) => `Yr ${y}`} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => (v >= 10000000 ? `₹${(v / 10000000).toFixed(1)}Cr` : `₹${(v / 100000).toFixed(1)}L`)}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#172B4D] text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
                            <div className="font-bold text-slate-200">Year {d.year}</div>
                            <div className="text-emerald-400 font-bold">
                              Corpus Value: {formatINR(d.estimatedValue)}
                            </div>
                            <div className="text-blue-300">
                              Invested: {formatINR(d.investedSoFar)}
                            </div>
                            <div className="text-slate-300">
                              Gain: +{formatINR(d.wealthGained)}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="estimatedValue"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fill="url(#sipEstGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="investedSoFar"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fill="url(#sipInvGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center gap-6 text-xs pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-600" />
                <span className="text-[#64748B]">Invested Principal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-[#64748B]">Accumulated Value (with Interest)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Year-by-Year Schedule Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0]">
          <h3 className="text-sm font-bold text-[#172B4D]">Year-by-Year Compounding Breakdown</h3>
          <p className="text-xs text-[#64748B]">Detailed projection schedule over the {durationYears}-year timeline</p>
        </div>

        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 text-[#64748B]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Year</th>
                <th className="py-2.5 px-4 font-semibold text-right">Invested So Far</th>
                <th className="py-2.5 px-4 font-semibold text-right">Estimated Wealth Gained</th>
                <th className="py-2.5 px-4 font-semibold text-right">Estimated Year-End Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result?.yearlyBreakdown.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-4 font-bold text-[#172B4D]">Year {row.year}</td>
                  <td className="py-2.5 px-4 text-right text-[#64748B]">{formatINR(row.investedSoFar)}</td>
                  <td className="py-2.5 px-4 text-right font-semibold text-emerald-600">
                    +{formatINR(row.wealthGained)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-[#172B4D]">
                    {formatINR(row.estimatedValue)}
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
