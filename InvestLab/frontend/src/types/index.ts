export interface User {
  id: string;
  fullName: string;
  email: string;
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

export interface EnrichedHolding {
  id: string;
  userId: string;
  symbol: string;
  stockName: string;
  sector: string;
  quantity: number;
  averageBuyPrice: number;
  totalInvested: number;
  currentPrice: number;
  currentValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  realizedPnl: number;
  allocationPercent: number;
  updatedAt: string;
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
  explanation?: string;
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

export interface QuizResult {
  quizId: string;
  title: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  passingScore: number;
  questionResults: Array<{
    questionId: string;
    questionText: string;
    userSelection: string | null;
    correctOption: string;
    isCorrect: boolean;
    explanation: string;
  }>;
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'live_llm' | 'curated_demo';
}
