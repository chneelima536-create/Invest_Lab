import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/common/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExploreStocksPage } from './pages/ExploreStocksPage';
import { StockDetailPage } from './pages/StockDetailPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { SipCalculatorPage } from './pages/SipCalculatorPage';
import { LearningCenterPage } from './pages/LearningCenterPage';
import { ModuleDetailPage } from './pages/ModuleDetailPage';
import { AiTutorPage } from './pages/AiTutorPage';
import { ProfilePage } from './pages/ProfilePage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center text-xs text-[#64748B]">
        Initializing InvestLab session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Dashboard & App Pages */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/stocks" element={<ExploreStocksPage />} />
            <Route path="/stocks/:symbol" element={<StockDetailPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/sip-calculator" element={<SipCalculatorPage />} />
            <Route path="/learn" element={<LearningCenterPage />} />
            <Route path="/learn/:id" element={<ModuleDetailPage />} />
            <Route path="/tutor" element={<AiTutorPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
