import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  PieChart,
  Bookmark,
  ReceiptText,
  Calculator,
  GraduationCap,
  Bot,
  UserCheck,
  LogOut,
  TrendingUp,
  Wallet,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/formatters';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Explore Stocks', path: '/stocks', icon: Search },
    { name: 'My Portfolio', path: '/portfolio', icon: PieChart },
    { name: 'Watchlist', path: '/watchlist', icon: Bookmark },
    { name: 'Transactions', path: '/transactions', icon: ReceiptText },
    { name: 'SIP Calculator', path: '/sip-calculator', icon: Calculator },
    { name: 'Learn', path: '/learn', icon: GraduationCap },
    { name: 'AI Finance Tutor', path: '/tutor', icon: Bot, badge: 'AI' },
    { name: 'Profile & Settings', path: '/profile', icon: UserCheck },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-[#E2E8F0] flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#172B4D]">InvestLab</span>
              <span className="text-[10px] block font-semibold tracking-wider text-[#64748B] -mt-1">
                LEARN BY DOING
              </span>
            </div>
          </NavLink>
        </div>

        {/* Paper Trading Mode Notice */}
        <div className="px-4 pt-3 pb-2">
          <div className="bg-[#EFF6FF] border border-blue-200 rounded-lg p-2.5 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-[#172B4D] tracking-wide uppercase">
                Paper Trading · Demo
              </div>
              <p className="text-[11px] text-[#64748B] leading-tight mt-0.5">
                Simulated market data. No real money or orders.
              </p>
            </div>
          </div>
        </div>

        {/* Virtual Cash Balance Widget */}
        <div className="px-4 py-2">
          <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                Virtual Cash Balance
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-xl font-bold text-[#172B4D] tracking-tight">
              {formatINR(user?.virtualCash ?? 100000)}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
                    : 'text-[#64748B] hover:text-[#172B4D] hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#2563EB]">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer User Info */}
        <div className="p-3 border-t border-[#E2E8F0] bg-slate-50/50">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#172B4D] truncate">
                  {user?.fullName || 'Demo User'}
                </div>
                <div className="text-[11px] text-[#64748B] truncate">
                  {user?.email || 'demo@investlab.in'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-[#64748B] hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
