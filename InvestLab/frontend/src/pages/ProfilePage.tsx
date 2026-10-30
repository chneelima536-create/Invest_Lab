import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  Wallet,
  RotateCcw,
  LogOut,
  ShieldAlert,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi, learningApi } from '../services/api';
import { formatINR, formatDate } from '../utils/formatters';

export const ProfilePage: React.FC = () => {
  const { user, logout, updateVirtualCash } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    learningApi.getStats().then(setStats).catch(console.error);
  }, []);

  const handleResetPortfolio = async () => {
    setIsResetting(true);
    try {
      const res = await authApi.resetPortfolio();
      updateVirtualCash(res.data.virtualCash);
      setResetSuccessMsg('Portfolio has been successfully reset to ₹1,00,000 virtual cash.');
      setShowResetModal(false);
      window.dispatchEvent(new Event('portfolio-updated'));
    } catch (err) {
      console.error('Reset failed', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {resetSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{resetSuccessMsg}</span>
          </div>
          <button
            onClick={() => setResetSuccessMsg(null)}
            className="text-emerald-700 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* User Information Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#172B4D]">{user?.fullName || 'Demo Student'}</h1>
              {user?.isDemoAccount && (
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Demo Account
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Registered on {formatDate(user?.createdAt)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Learning Statistics Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <GraduationCap className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-[#172B4D]">Learning & Quiz Performance</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[#64748B] font-medium block">Completed Lessons</span>
            <span className="text-xl font-bold text-[#172B4D] mt-1 block">
              {stats?.completedLessons || 0} / {stats?.totalLessons || 0}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[#64748B] font-medium block">Curriculum Progress</span>
            <span className="text-xl font-bold text-blue-600 mt-1 block">
              {stats?.overallProgressPercent || 0}%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[#64748B] font-medium block">Quiz Attempts</span>
            <span className="text-xl font-bold text-[#172B4D] mt-1 block">
              {stats?.quizAttemptsCount || 0}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[#64748B] font-medium block">Quizzes Passed</span>
            <span className="text-xl font-bold text-emerald-600 mt-1 block">
              {stats?.quizzesPassedCount || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Paper-Trading Settings & Portfolio Reset */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Wallet className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-bold text-[#172B4D]">Paper Trading Controls</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <div className="font-bold text-xs text-[#172B4D]">Virtual Cash Balance</div>
            <div className="text-lg font-black text-emerald-700 mt-0.5">
              {formatINR(user?.virtualCash ?? 100000)}
            </div>
            <p className="text-[11px] text-[#64748B]">
              Every account starts with ₹1,00,000 for simulated paper trading.
            </p>
          </div>

          <button
            onClick={() => setShowResetModal(true)}
            className="px-4 py-2.5 rounded-xl border border-amber-300 hover:bg-amber-50 text-amber-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>Reset Demo Portfolio</span>
          </button>
        </div>
      </div>

      {/* Educational Terms and Regulatory Disclaimer */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-[#E2E8F0] space-y-2 text-xs text-[#64748B]">
        <div className="flex items-center gap-2 font-bold text-[#172B4D]">
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          <span>Educational Disclaimer & Terms</span>
        </div>
        <p className="leading-relaxed">
          InvestLab is strictly an educational FinTech platform built to teach students and beginners how financial markets, company valuations, SIP compounding, and portfolio diversification operate. No real money or stock orders are accepted, processed, or placed on real exchanges.
        </p>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] max-w-sm w-full p-5 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-sm font-bold text-[#172B4D]">Reset Simulated Portfolio?</h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                This will reset your virtual cash back to <strong>₹1,00,000.00</strong> and clear all
                active stock holdings and trades. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-xs font-semibold text-[#64748B]"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPortfolio}
                disabled={isResetting}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
              >
                {isResetting ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
