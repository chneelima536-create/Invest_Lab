import axios from 'axios';
import {
  User,
  Stock,
  StockPricePoint,
  Trade,
  PortfolioSummary,
  WatchlistEntry,
  SIPCalculationResult,
  LearningModule,
  Lesson,
  Quiz,
  QuizResult,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('investlab_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login' && window.location.pathname !== '/' && window.location.pathname !== '/register') {
      localStorage.removeItem('investlab_token');
      // Redirect to login if token expired during active usage
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (fullName: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { fullName, email, password });
    return res.data;
  },
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  demoLogin: async () => {
    const res = await api.post('/auth/demo-login');
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },
  resetPortfolio: async () => {
    const res = await api.post('/auth/reset-portfolio');
    return res.data;
  },
};

export const stocksApi = {
  getAll: async (params?: { search?: string; sector?: string; sortBy?: string; sortOrder?: string }): Promise<Stock[]> => {
    const res = await api.get('/stocks', { params });
    return res.data.data;
  },
  getBySymbol: async (symbol: string): Promise<Stock> => {
    const res = await api.get(`/stocks/${symbol}`);
    return res.data.data;
  },
  getHistory: async (symbol: string, timeframe: string = '1M'): Promise<StockPricePoint[]> => {
    const res = await api.get(`/stocks/${symbol}/history`, { params: { timeframe } });
    return res.data.data;
  },
};

export const tradingApi = {
  buy: async (symbol: string, quantity: number) => {
    const res = await api.post('/trading/buy', { symbol, quantity });
    return res.data;
  },
  sell: async (symbol: string, quantity: number) => {
    const res = await api.post('/trading/sell', { symbol, quantity });
    return res.data;
  },
  getPortfolio: async (): Promise<PortfolioSummary> => {
    const res = await api.get('/trading/portfolio');
    return res.data.data;
  },
  getPortfolioHistory: async (timeframe: string = '1M') => {
    const res = await api.get('/trading/portfolio/history', { params: { timeframe } });
    return res.data.data;
  },
  getTransactions: async (params?: { symbol?: string; tradeType?: string; sortBy?: string; sortOrder?: string }): Promise<Trade[]> => {
    const res = await api.get('/trading/transactions', { params });
    return res.data.data;
  },
  exportCsv: async () => {
    const res = await api.get('/trading/transactions/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `investlab_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

export const watchlistApi = {
  get: async (): Promise<WatchlistEntry[]> => {
    const res = await api.get('/watchlist');
    return res.data.data;
  },
  add: async (symbol: string) => {
    const res = await api.post('/watchlist', { symbol });
    return res.data.data;
  },
  remove: async (symbol: string) => {
    const res = await api.delete(`/watchlist/${symbol}`);
    return res.data;
  },
};

export const sipApi = {
  calculate: async (monthlyInvestment: number, durationYears: number, annualReturnRatePercent: number): Promise<SIPCalculationResult> => {
    const res = await api.post('/sip/calculate', {
      monthlyInvestment,
      durationYears,
      annualReturnRatePercent,
    });
    return res.data.data;
  },
};

export const learningApi = {
  getModules: async (): Promise<LearningModule[]> => {
    const res = await api.get('/learning/modules');
    return res.data.data;
  },
  getModuleById: async (id: string): Promise<{ module: LearningModule; lessons: Lesson[] }> => {
    const res = await api.get(`/learning/modules/${id}`);
    return res.data.data;
  },
  updateProgress: async (moduleId: string, lessonId: string, completed: boolean = true) => {
    const res = await api.post('/learning/progress', { moduleId, lessonId, completed });
    return res.data;
  },
  getStats: async () => {
    const res = await api.get('/learning/stats');
    return res.data.data;
  },
};

export const quizApi = {
  getByModule: async (moduleId: string): Promise<Quiz> => {
    const res = await api.get(`/quizzes/module/${moduleId}`);
    return res.data.data;
  },
  submit: async (quizId: string, answers: Record<string, 'A' | 'B' | 'C' | 'D'>): Promise<QuizResult> => {
    const res = await api.post(`/quizzes/${quizId}/submit`, { answers });
    return res.data.data;
  },
  getAttempts: async () => {
    const res = await api.get('/quizzes/attempts');
    return res.data.data;
  },
};

export const tutorApi = {
  chat: async (message: string, history: Array<{ role: string; content: string }>) => {
    const res = await api.post('/tutor/chat', { message, history });
    return res.data.data;
  },
};

export default api;
