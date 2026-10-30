export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  virtualCash: number;
  isDemoAccount: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  changeAmount: number;
  changePercent: number;
  peRatio?: number;
  eps?: number;
  marketCapCr?: number;
  revenueCr?: number;
  netProfitCr?: number;
  dividendYield?: number;
  high52w?: number;
  low52w?: number;
  description: string;
  isDemo: boolean;
  lastUpdated: string;
}

export interface StockPricePoint {
  date: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  stockName: string;
  tradeType: 'BUY' | 'SELL';
  quantity: number;
  executionPrice: number;
  totalAmount: number;
  cashAfterTrade: number;
  notes?: string;
  createdAt: string;
}

export interface Holding {
  id: string;
  userId: string;
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  totalInvested: number;
  realizedPnl: number;
  updatedAt: string;
}

export interface EnrichedHolding extends Holding {
  stockName: string;
  sector: string;
  currentPrice: number;
  currentValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  allocationPercent: number;
}

export interface PortfolioSummary {
  availableCash: number;
  totalInvested: number;
  currentHoldingsValue: number;
  totalPortfolioValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  realizedPnl: number;
  holdingsCount: number;
  accountingMethod: string;
  assetAllocation: {
    cash: number;
    equities: number;
    cashPercent: number;
    equitiesPercent: number;
  };
  sectorAllocation: Record<string, number>;
  holdings: EnrichedHolding[];
}

export interface WatchlistEntry {
  id: string;
  userId: string;
  symbol: string;
  addedAt: string;
  stock?: Stock;
}

export interface SIPCalculationResult {
  monthlyInvestment: number;
  durationYears: number;
  annualReturnRatePercent: number;
  totalInvested: number;
  estimatedWealthGained: number;
  estimatedFinalValue: number;
  formulaUsed: string;
  disclaimer: string;
  yearlyBreakdown: Array<{
    year: number;
    investedSoFar: number;
    estimatedValue: number;
    wealthGained: number;
  }>;
}

export interface LearningModule {
  id: string;
  category: string;
  title: string;
  description: string;
  orderIndex: number;
  readingTimeMins: number;
  iconName: string;
  difficulty: string;
  lessonsCount?: number;
  completedLessonsCount?: number;
  isCompleted?: boolean;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  practicalExample?: string;
  keyTerms?: Array<{ term: string; def: string }>;
  orderIndex: number;
  isCompleted?: boolean;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption?: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  orderIndex: number;
}

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  passingScore: number;
  questions?: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  submittedAt: string;
}

export interface TutorMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}
