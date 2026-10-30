import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateVirtualCash: (newCash: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('investlab_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch {
      localStorage.removeItem('investlab_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    localStorage.setItem('investlab_token', res.data.token);
    setUser(res.data.user);
  };

  const demoLogin = async () => {
    const res = await authApi.demoLogin();
    localStorage.setItem('investlab_token', res.data.token);
    setUser(res.data.user);
  };

  const register = async (fullName: string, email: string, password: string) => {
    const res = await authApi.register(fullName, email, password);
    localStorage.setItem('investlab_token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('investlab_token');
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const updateVirtualCash = (newCash: number) => {
    setUser((prev) => (prev ? { ...prev, virtualCash: newCash } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        demoLogin,
        register,
        logout,
        refreshUser,
        updateVirtualCash,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
