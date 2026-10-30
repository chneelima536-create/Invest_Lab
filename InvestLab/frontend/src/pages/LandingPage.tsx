import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ShieldCheck,
  GraduationCap,
  Calculator,
  Bot,
  PieChart,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Coins,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/formatters';

export const LandingPage: React.FC = () => {
  const { demoLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleExploreDemo = async () => {
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A] flex flex-col font-sans">
      {/* Public Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#172B4D]">InvestLab</span>
              <span className="text-[10px] block font-semibold tracking-wider text-[#64748B] -mt-1">
                LEARN BY DOING
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-lg bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition-colors shadow-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <button
                  onClick={handleExploreDemo}
                  className="px-4 py-2 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-xs font-semibold text-[#172B4D] transition-colors"
                >
                  Explore Demo
                </button>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span>Start Learning</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        {/* Subtle Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] border border-blue-200 text-xs font-semibold text-[#2563EB] mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FinTech Education · Zero Risk Paper Trading</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#172B4D] tracking-tight max-w-4xl mx-auto leading-tight">
          Learn Investing by Doing.
        </h1>

        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
          Build financial confidence with virtual money, practical lessons, and intelligent learning tools. Practice buying and selling shares with ₹1,00,000 in virtual cash.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            to="/register"
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Start Learning</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={handleExploreDemo}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#172B4D] font-bold text-sm shadow-sm transition-all"
          >
            Explore 1-Click Demo
          </button>
        </div>

        {/* Dashboard Preview Card */}
        <div className="mt-12 sm:mt-16 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-4 sm:p-6 text-left max-w-5xl mx-auto overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#E2E8F0] gap-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wide">
                  Live Paper Trading Sandbox
                </span>
                <span className="text-xs text-[#64748B] block">
                  Simulated Portfolio · Weighted Average Cost Basis
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Starting Cash: ₹1,00,000.00
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0]">
              <span className="text-xs text-[#64748B] font-medium">Available Virtual Cash</span>
              <div className="text-xl font-bold text-[#172B4D] mt-1">{formatINR(84120)}</div>
              <span className="text-[11px] text-[#64748B]">Ready for simulated orders</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0]">
              <span className="text-xs text-[#64748B] font-medium">Current Holdings Value</span>
              <div className="text-xl font-bold text-[#172B4D] mt-1">{formatINR(16065)}</div>
              <span className="text-[11px] text-emerald-600 font-semibold">+₹185.00 (+1.17%)</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0]">
              <span className="text-xs text-[#64748B] font-medium">Total Portfolio Value</span>
              <div className="text-xl font-bold text-blue-600 mt-1">{formatINR(100185)}</div>
              <span className="text-[11px] text-[#64748B]">Total Net Equity</span>
            </div>
          </div>

          {/* Quick interactive ticker preview */}
          <div className="bg-[#F7F9FC] rounded-xl p-3 border border-[#E2E8F0]">
            <div className="text-xs font-semibold text-[#64748B] mb-2">
              Supported Indian Bluechips (Demo Catalog):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2 rounded-lg border border-slate-200 flex justify-between">
                <span className="font-bold text-[#172B4D]">RELIANCE</span>
                <span className="text-emerald-600 font-semibold">₹2,940.50</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 flex justify-between">
                <span className="font-bold text-[#172B4D]">TCS</span>
                <span className="text-red-600 font-semibold">₹3,875.20</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 flex justify-between">
                <span className="font-bold text-[#172B4D]">HDFCBANK</span>
                <span className="text-emerald-600 font-semibold">₹1,682.40</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 flex justify-between">
                <span className="font-bold text-[#172B4D]">INFY</span>
                <span className="text-red-600 font-semibold">₹1,745.80</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How InvestLab Works: Learn -> Simulate -> Analyze */}
      <section className="py-16 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
              Educational Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172B4D] mt-1">
              How InvestLab Works
            </h2>
            <p className="text-sm text-[#64748B] mt-2">
              A structured 3-step cycle designed to turn complete beginners into confident, rational investors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-[#E2E8F0] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-base font-bold text-[#172B4D]">Learn the Fundamentals</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Study 10 curated modules covering stock exchanges, P/E ratios, EPS, balance sheets, and compounding. Complete interactive quizzes to test your knowledge.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-[#E2E8F0] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-base font-bold text-[#172B4D]">Simulate Real Trades</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Put theory into practice with ₹1,00,000 in virtual cash. Place simulated buy and sell orders, manage position sizes, and track execution prices.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-[#E2E8F0] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-base font-bold text-[#172B4D]">Analyze & Refine</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Inspect your asset allocation donut, sector diversification, realized vs unrealized gains, and consult the AI Finance Tutor whenever questions arise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
            Comprehensive FinTech Suite
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#172B4D] mt-1">
            Engineered for Practical Financial Literacy
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-2.5">
            <Coins className="w-6 h-6 text-emerald-600" />
            <h3 className="text-base font-bold text-[#172B4D]">₹1,00,000 Virtual Cash</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Every registered user receives a fresh simulated bankroll. Zero credit card or payment gateway involved.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-2.5">
            <PieChart className="w-6 h-6 text-blue-600" />
            <h3 className="text-base font-bold text-[#172B4D]">Portfolio & P/L Analytics</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              True weighted-average cost basis accounting. Understand how partial sales lock in realized profit vs unrealized paper returns.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-2.5">
            <Calculator className="w-6 h-6 text-indigo-600" />
            <h3 className="text-base font-bold text-[#172B4D]">SIP Compound Interest Tool</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Simulate monthly compounding with our documented formula. Visualize how rupee-cost averaging builds long-term wealth.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-2.5">
            <GraduationCap className="w-6 h-6 text-amber-600" />
            <h3 className="text-base font-bold text-[#172B4D]">10 Structured Modules</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              From Stock Market Basics to Risk Management and EPS valuation, with practical Indian Rupee examples.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-2.5">
            <Bot className="w-6 h-6 text-sky-600" />
            <h3 className="text-base font-bold text-[#172B4D]">AI Finance Tutor</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Ask questions naturally. The AI tutor breaks down complex financial terms into simple, safe analogies.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-2.5">
            <Lock className="w-6 h-6 text-slate-700" />
            <h3 className="text-base font-bold text-[#172B4D]">Per-User Data Isolation</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Your trades, watchlist, and quiz scores belong solely to your account with JWT authentication and bcrypt password hashing.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <HelpCircle className="w-7 h-7 text-[#2563EB] mx-auto mb-2" />
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172B4D]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-slate-50 border border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#172B4D]">Is any real money involved in InvestLab?</h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                No. InvestLab is 100% educational. All ₹1,00,000 balances, orders, and portfolios are virtual simulations. We never accept deposits, debit cards, or execute real stock-market orders.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#172B4D]">What accounting method is used for my portfolio?</h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                We use the weighted-average cost basis method. When you make multiple purchases of a share, your average purchase price adjusts accordingly. When you partially sell, your cost basis per share remains consistent and realized capital gain is accurately recorded.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#172B4D]">Does the AI Finance Tutor provide stock advice?</h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                Never. The AI Finance Tutor is strictly programmed with safety guardrails to explain financial concepts, formulas, and terminology. It never guarantees returns, never predicts price directions, and is not a certified financial adviser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-gradient-to-b from-white to-[#EFF6FF] border-t border-[#E2E8F0] text-center px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#172B4D]">
            Ready to Begin Your Financial Journey?
          </h2>
          <p className="text-sm text-[#64748B] max-w-xl mx-auto">
            Test your investment strategies, learn with interactive quizzes, and explore the markets without risking a single rupee.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-8 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#2563EB] flex items-center justify-center text-white text-xs font-bold">
              IL
            </div>
            <span className="font-bold text-[#172B4D]">InvestLab</span>
            <span className="text-slate-400">|</span>
            <span>Educational FinTech Platform</span>
          </div>

          <div className="text-center md:text-right text-[11px] text-[#94A3B8] max-w-xl">
            Disclaimer: InvestLab is an educational paper-trading simulator. All prices, trades, portfolios, and AI responses are simulated. Mutual fund and stock investments are subject to market risks.
          </div>
        </div>
      </footer>
    </div>
  );
};
