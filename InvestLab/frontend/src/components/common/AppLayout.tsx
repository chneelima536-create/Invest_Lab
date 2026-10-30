import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TradeModal } from '../trading/TradeModal';
import { Stock } from '../../types';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [activeTradeStock, setActiveTradeStock] = useState<Stock | null>(null);
  const location = useLocation();

  // Dynamic Page Title mapping
  const getPageTitle = (path: string): { title: string; subtitle: string } => {
    if (path.startsWith('/dashboard')) {
      return { title: 'Dashboard', subtitle: 'Overview of your simulated portfolio and learning progress' };
    }
    if (path.startsWith('/stocks')) {
      return { title: 'Explore Stocks', subtitle: 'Browse Indian bluechip equities with simulated live quotes' };
    }
    if (path.startsWith('/portfolio')) {
      return { title: 'My Portfolio', subtitle: 'Detailed breakdown of holdings, asset allocation, and P&L' };
    }
    if (path.startsWith('/watchlist')) {
      return { title: 'Watchlist', subtitle: 'Stocks you are actively monitoring for paper trading' };
    }
    if (path.startsWith('/transactions')) {
      return { title: 'Transaction History', subtitle: 'Complete ledger of all simulated buy and sell executions' };
    }
    if (path.startsWith('/sip-calculator')) {
      return { title: 'SIP Calculator & Simulator', subtitle: 'Compound interest simulation with monthly compounding formula' };
    }
    if (path.startsWith('/learn')) {
      return { title: 'Learning Center', subtitle: 'Practical financial literacy modules with INR examples and quizzes' };
    }
    if (path.startsWith('/tutor')) {
      return { title: 'InvestLab AI Finance Tutor', subtitle: 'Conversational assistant for investing concepts and metrics' };
    }
    if (path.startsWith('/profile')) {
      return { title: 'Profile & Settings', subtitle: 'Account preferences, paper-trading stats, and disclaimers' };
    }
    return { title: 'InvestLab', subtitle: 'Learn Investing by Doing' };
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  const handleOpenTrade = (stock?: Stock) => {
    setActiveTradeStock(stock || null);
    setTradeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A] flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Header
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(true)}
          onQuickTrade={() => handleOpenTrade()}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openTradeModal: handleOpenTrade }} />
        </main>

        {/* Global FinTech Educational Disclaimer Footer */}
        <footer className="border-t border-[#E2E8F0] bg-white py-4 px-6 text-center text-xs text-[#64748B]">
          <div className="max-w-4xl mx-auto space-y-1">
            <p className="font-semibold text-[#172B4D]">
              InvestLab — Educational Paper Trading Platform · Demo Sandbox
            </p>
            <p className="text-[11px] text-[#94A3B8]">
              Disclaimer: InvestLab is exclusively an educational simulation platform. All cash balances (₹1,00,000 virtual cash), stock prices, and portfolio metrics are simulated and for illustrative purposes. No real money or stock orders are accepted or executed.
            </p>
          </div>
        </footer>
      </div>

      {/* Global Trade Modal */}
      <TradeModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        stock={activeTradeStock}
        onTradeComplete={() => {
          // Trigger refresh event for page listeners if needed
          window.dispatchEvent(new Event('portfolio-updated'));
        }}
      />
    </div>
  );
};
