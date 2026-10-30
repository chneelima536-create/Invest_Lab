import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, User, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }
    if (!acceptTerms) {
      setErrorMsg('You must accept the terms of simulated educational use.');
      return;
    }

    setIsLoading(true);
    try {
      await register(fullName, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Registration failed.');
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
          Create your free account
        </h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Receive <strong className="text-emerald-600 font-bold">₹1,00,000</strong> in virtual cash upon registration.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-[#E2E8F0]">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Rahul Verma"
                  className="w-full bg-[#F7F9FC] border border-[#E2E8F0] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                />
              </div>
            </div>

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
                  placeholder="rahul@domain.com"
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
                  placeholder="At least 6 characters"
                  className="w-full bg-[#F7F9FC] border border-[#E2E8F0] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full bg-[#F7F9FC] border border-[#E2E8F0] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-[11px] text-[#64748B] leading-tight">
                I understand that InvestLab is an educational simulator. No real money or stock orders are involved.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span>{isLoading ? 'Creating Account...' : 'Register & Claim ₹1,00,000'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#64748B]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#2563EB] hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
