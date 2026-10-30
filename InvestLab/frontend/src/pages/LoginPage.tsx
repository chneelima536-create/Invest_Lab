import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { TrendingUp, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(
    searchParams.get('expired') ? 'Your session has expired. Please sign in again.' : null
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-md">
            <TrendingUp className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#172B4D]">InvestLab</span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#172B4D]">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Enter your credentials or test the platform with 1-click demo access.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-[#E2E8F0]">
          {/* Quick Demo Access Banner */}
          <div className="mb-6 p-3.5 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Want to test immediately?
              </span>
            </div>
            <p className="text-[11px] text-blue-700 mb-2.5">
              Skip registration and launch into Arjun Sharma's pre-funded demo account with ₹84,120 cash and existing portfolio holdings.
            </p>
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={isLoading}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              Sign In with 1-Click Demo
            </button>
          </div>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-xs text-[#64748B] uppercase tracking-wider font-semibold">
              Or with email
            </span>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-[#F7F9FC] border border-[#E2E8F0] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F7F9FC] border border-[#E2E8F0] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#64748B]">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#2563EB] hover:underline">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
