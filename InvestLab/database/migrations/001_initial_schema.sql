-- ==============================================================================
-- InvestLab PostgreSQL Database Schema Migration 001
-- Description: Core tables for users, paper-trading, portfolio, watchlist,
--              learning center, and quizzes with relational integrity and indexes.
-- ==============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    virtual_cash NUMERIC(14, 2) NOT NULL DEFAULT 100000.00 CHECK (virtual_cash >= 0),
    is_demo_account BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Stocks Catalog & Market Quotes (Simulated Demo Data)
CREATE TABLE IF NOT EXISTS stocks (
    symbol VARCHAR(20) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    sector VARCHAR(80) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    change_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    change_percent NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    pe_ratio NUMERIC(8, 2),
    eps NUMERIC(8, 2),
    market_cap_cr NUMERIC(14, 2),
    revenue_cr NUMERIC(14, 2),
    net_profit_cr NUMERIC(14, 2),
    dividend_yield NUMERIC(6, 2),
    high_52w NUMERIC(10, 2),
    low_52w NUMERIC(10, 2),
    description TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT TRUE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stocks_sector ON stocks(sector);

-- 3. Stock Price History (For Charts)
CREATE TABLE IF NOT EXISTS stock_price_history (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL REFERENCES stocks(symbol) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    open_price NUMERIC(10, 2) NOT NULL,
    high_price NUMERIC(10, 2) NOT NULL,
    low_price NUMERIC(10, 2) NOT NULL,
    close_price NUMERIC(10, 2) NOT NULL,
    volume BIGINT DEFAULT 100000
);

CREATE INDEX IF NOT EXISTS idx_price_history_symbol_time ON stock_price_history(symbol, recorded_at);

-- 4. Trades (Simulated Paper Trading Ledger)
CREATE TABLE IF NOT EXISTS trades (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL REFERENCES stocks(symbol),
    stock_name VARCHAR(150) NOT NULL,
    trade_type VARCHAR(10) NOT NULL CHECK (trade_type IN ('BUY', 'SELL')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    execution_price NUMERIC(10, 2) NOT NULL CHECK (execution_price > 0),
    total_amount NUMERIC(14, 2) NOT NULL CHECK (total_amount > 0),
    cash_after_trade NUMERIC(14, 2) NOT NULL CHECK (cash_after_trade >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at DESC);

-- 5. User Portfolio Holdings
-- Uses weighted-average cost basis accounting for precision
CREATE TABLE IF NOT EXISTS holdings (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL REFERENCES stocks(symbol),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    average_buy_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (average_buy_price >= 0),
    total_invested NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (total_invested >= 0),
    realized_pnl NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_symbol UNIQUE(user_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON holdings(user_id);

-- 6. User Watchlist
CREATE TABLE IF NOT EXISTS watchlist (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL REFERENCES stocks(symbol) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_watchlist_user_symbol UNIQUE(user_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id);

-- 7. Portfolio Snapshots (For Historical Equity Curve)
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    portfolio_value NUMERIC(14, 2) NOT NULL,
    cash_balance NUMERIC(14, 2) NOT NULL,
    invested_value NUMERIC(14, 2) NOT NULL,
    snapshot_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_snapshot_date UNIQUE(user_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_user_date ON portfolio_snapshots(user_id, snapshot_date);

-- 8. Learning Modules & Categories
CREATE TABLE IF NOT EXISTS learning_modules (
    id VARCHAR(50) PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    reading_time_mins INTEGER NOT NULL DEFAULT 5,
    icon_name VARCHAR(50) DEFAULT 'BookOpen',
    difficulty VARCHAR(20) DEFAULT 'Beginner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Lessons in Modules
CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(50) PRIMARY KEY,
    module_id VARCHAR(50) NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    practical_example TEXT,
    key_terms TEXT, -- JSON array of terms and definitions
    order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);

-- 10. Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
    id VARCHAR(50) PRIMARY KEY,
    module_id VARCHAR(50) NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    passing_score INTEGER NOT NULL DEFAULT 70,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Quiz Questions
CREATE TABLE IF NOT EXISTS quiz_questions (
    id VARCHAR(50) PRIMARY KEY,
    quiz_id VARCHAR(50) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    explanation TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions(quiz_id);

-- 12. Quiz Attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id VARCHAR(50) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    answers_json TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);

-- 13. User Learning Progress
CREATE TABLE IF NOT EXISTS user_learning_progress (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id VARCHAR(50) NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
    lesson_id VARCHAR(50) REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT TRUE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_progress UNIQUE(user_id, module_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON user_learning_progress(user_id);
