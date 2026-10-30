import React, { useState } from 'react';
import { Menu, Search, Bell, Wallet, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/formatters';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  onQuickTrade?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onMenuClick, onQuickTrade }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/stocks?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-[#E2E8F0] px-4 md:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-[#64748B] hover:text-[#172B4D] hover:bg-slate-100 rounded-lg md:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg md:text-xl font-bold text-[#172B4D] truncate">{title}</h1>
          {subtitle && (
            <p className="hidden md:block text-xs text-[#64748B] -mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Middle: Global Stock Search Bar */}
      <div className="hidden lg:block max-w-xs w-full mx-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search TCS, Reliance, Banking..."
            className="w-full bg-[#F7F9FC] border border-[#E2E8F0] rounded-lg pl-9 pr-4 py-1.5 text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
          />
        </form>
      </div>

      {/* Right: Actions, Balance Pill & User Indicator */}
      <div className="flex items-center gap-3">
        {/* Persistent Virtual Cash Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
          <Wallet className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-800">
            {formatINR(user?.virtualCash ?? 100000)}
          </span>
          <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
            Demo Cash
          </span>
        </div>

        {/* Quick Trade CTA Button */}
        {onQuickTrade && (
          <button
            onClick={onQuickTrade}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <span>Trade</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Notifications Icon with simple modal/alert */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationToast(!showNotificationToast)}
            className="p-2 text-[#64748B] hover:text-[#172B4D] hover:bg-slate-100 rounded-lg relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
          </button>

          {showNotificationToast && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="font-semibold text-[#172B4D]">Notifications</span>
                <span className="text-[10px] text-blue-600 font-medium">Simulation active</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-1.5 rounded-lg bg-blue-50/70">
                  <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-[#172B4D]">Welcome to InvestLab</p>
                    <p className="text-[#64748B] text-[11px]">
                      Your demo account has ₹1,00,000 in virtual cash ready for paper trading.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Avatar Profile Link */}
        <button
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-full bg-[#172B4D] text-white font-bold text-xs flex items-center justify-center hover:ring-2 hover:ring-[#2563EB] transition-all"
        >
          {user?.fullName?.charAt(0) || 'U'}
        </button>
      </div>
    </header>
  );
};
