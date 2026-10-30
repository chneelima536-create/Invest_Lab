import { Pool } from 'pg';
import { config } from '../config/index.js';
import crypto from 'crypto';

export interface IDatabase {
  query<T = any>(sql: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }>;
  transaction<T>(callback: (trx: IDatabase) => Promise<T>): Promise<T>;
  isPostgres(): boolean;
}

// In-Memory Relational Engine to ensure zero-friction out-of-the-box execution
class MemoryDatabase implements IDatabase {
  private users: Map<string, any> = new Map();
  private stocks: Map<string, any> = new Map();
  private trades: any[] = [];
  private holdings: Map<string, any> = new Map(); // key: userId:symbol
  private watchlist: Map<string, any> = new Map(); // key: userId:symbol
  private snapshots: any[] = [];
  private learningModules: any[] = [];
  private lessons: any[] = [];
  private quizzes: any[] = [];
  private quizQuestions: any[] = [];
  private quizAttempts: any[] = [];
  private progress: Map<string, any> = new Map(); // key: userId:moduleId:lessonId

  constructor() {
    this.seedInitialData();
  }

  isPostgres(): boolean {
    return false;
  }

  private seedInitialData() {
    // 1. Seed demo user (password: demo123, hash generated with bcrypt)
    const demoUser = {
      id: 'usr_demo_001',
      full_name: 'Arjun Sharma (Demo)',
      email: 'demo@investlab.in',
      password_hash: '$2a$10$wK1Esu1P8W90hJg6aV1YzeJzZ6WvJ6p7T1fJ9mU3FvX/HqGqQ4mQe',
      virtual_cash: 84120.00,
      is_demo_account: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.users.set(demoUser.id, demoUser);
    this.users.set(demoUser.email, demoUser);

    // 2. Seed 8 Indian bluechip stocks
    const seedStocks = [
      {
        symbol: 'RELIANCE',
        name: 'Reliance Industries Ltd.',
        sector: 'Energy & Telecom',
        price: 2940.50,
        change_amount: 24.30,
        change_percent: 0.83,
        pe_ratio: 28.4,
        eps: 103.54,
        market_cap_cr: 1989400.00,
        revenue_cr: 892000.00,
        net_profit_cr: 74200.00,
        dividend_yield: 0.34,
        high_52w: 3024.90,
        low_52w: 2220.30,
        description: "India's largest conglomerate by market capitalization, with market leadership in oil-to-chemicals, retail, and telecommunications (Jio).",
        is_demo: true,
        last_updated: new Date().toISOString(),
      },
      {
        symbol: 'TCS',
        name: 'Tata Consultancy Services Ltd.',
        sector: 'Information Technology',
        price: 3875.20,
        change_amount: -18.70,
        change_percent: -0.48,
        pe_ratio: 31.2,
        eps: 124.20,
        market_cap_cr: 1402100.00,
        revenue_cr: 240890.00,
        net_profit_cr: 46580.00,
        dividend_yield: 1.25,
        high_52w: 4254.75,
        low_52w: 3313.00,
        description: 'TCS is a global leader in IT services, consulting, and business solutions, operating across 55 countries with world-class return on equity.',
        is_demo: true,
        last_updated: new Date().toISOString(),
      },
      {
        symbol: 'HDFCBANK',
        name: 'HDFC Bank Ltd.',
        sector: 'Banking & Finance',
        price: 1682.40,
        change_amount: 15.60,
        change_percent: 0.94,
        pe_ratio: 19.5,
        eps: 86.27,
        market_cap_cr: 1278500.00,
        revenue_cr: 280400.00,
        net_profit_cr: 64060.00,
        dividend_yield: 1.16,
        high_52w: 1794.00,
        low_52w: 1363.55,
        description: "India's largest private sector bank, renowned for pristine asset quality, extensive retail network, and integrated financial services.",
        is_demo: true,
        last_updated: new Date().toISOString(),
      },
      {
        symbol: 'INFY',
        name: 'Infosys Ltd.',
        sector: 'Information Technology',
        price: 1745.80,
        change_amount: -9.40,
        change_percent: -0.54,
        pe_ratio: 27.8,
        eps: 62.79,
        market_cap_cr: 724300.00,
        revenue_cr: 153670.00,
        net_profit_cr: 26230.00,
        dividend_yield: 2.10,
        high_52w: 1953.90,
        low_52w: 1358.35,
        description: 'A next-generation digital services and consulting leader enabling clients in more than 50 countries to navigate digital transformation.',
        is_demo: true,
        last_updated: new Date().toISOString(),
      },
      {
        symbol: 'ICICIBANK',
        name: 'ICICI Bank Ltd.',
        sector: 'Banking & Finance',
        price: 1215.60,
        change_amount: 12.80,
        change_percent: 1.06,
        pe_ratio: 18.2,
        eps: 66.79,
        market_cap_cr: 854000.00,
        revenue_cr: 186200.00,
        net_profit_cr: 44250.00,
        dividend_yield: 0.82,
        high_52w: 1257.80,
        low_52w: 915.00,
        description: 'A prominent Indian multinational banking and financial services company offering comprehensive financial solutions to corporate and retail customers.',
        is_demo: true,
        last_updated: new Date().toISOString(),
      },
      {
        symbol: 'ITC',
        name: 'ITC Ltd.',
        sector: 'Consumer Goods (FMCG)',
        price: 492.30,
        change_amount: 4.10,
        change_percent: 0.84,
        pe_ratio: 28.1,
        eps: 17.52,
        market_cap_cr: 614000.00,
        revenue_cr: 76500.00,
        net_profit_cr: 20400.00,
        dividend_yield: 2.78,
        high_52w: 510.65,
        low_52w: 399.30,
        description: 'A leading FMCG conglomerate in India with diverse businesses including cigarettes, branded packaged foods, hospitality, paperboards, and agri-business.',
        is_demo: true,
        last_updated: new Date().toISOString(),
      },
      {
        symbol: 'SBIN',
        name: 'State Bank of India',
        sector: 'Banking & Finance',
        price: 788.50,
        change_amount: 7.20,
        change_percent: 0.92,
        pe_ratio: 10.4,
        eps: 75.81,
        market_cap_cr: 703600.00,
        revenue_cr: 440200.00,
        net_profit_cr: 67080.00,
        dividend_yield: 1.74,
        high_52w: 912.10,
        low_52w: 555.25,
        description: "The premier public sector bank and largest commercial bank in India, holding over a quarter of the country's banking deposits and loans.",
        is_demo: true,
        last_updated: new Date().toISOString(),
      },
      {
        symbol: 'WIPRO',
        name: 'Wipro Ltd.',
        sector: 'Information Technology',
        price: 512.90,
        change_amount: -3.80,
        change_percent: -0.73,
        pe_ratio: 23.6,
        eps: 21.73,
        market_cap_cr: 268400.00,
        revenue_cr: 89760.00,
        net_profit_cr: 11350.00,
        dividend_yield: 0.19,
        high_52w: 580.00,
        low_52w: 375.00,
        description: 'A global technology services and consulting company focused on building innovative solutions that address clients complex digital transformation needs.',
        is_demo: true,
        last_updated: new Date().toISOString(),
      },
    ];

    for (const stock of seedStocks) {
      this.stocks.set(stock.symbol, stock);
    }

    // 3. Demo Holdings for Arjun
    const demoHoldings = [
      {
        id: 'hld_001',
        user_id: 'usr_demo_001',
        symbol: 'RELIANCE',
        quantity: 3,
        average_buy_price: 2890.00,
        total_invested: 8670.00,
        realized_pnl: 0.00,
        updated_at: new Date().toISOString(),
      },
      {
        id: 'hld_002',
        user_id: 'usr_demo_001',
        symbol: 'TCS',
        quantity: 1,
        average_buy_price: 3810.00,
        total_invested: 3810.00,
        realized_pnl: 0.00,
        updated_at: new Date().toISOString(),
      },
      {
        id: 'hld_003',
        user_id: 'usr_demo_001',
        symbol: 'HDFCBANK',
        quantity: 2,
        average_buy_price: 1700.00,
        total_invested: 3400.00,
        realized_pnl: 0.00,
        updated_at: new Date().toISOString(),
      },
    ];

    for (const h of demoHoldings) {
      this.holdings.set(`${h.user_id}:${h.symbol}`, h);
    }

    // 4. Demo Trades for Arjun
    this.trades.push(
      {
        id: 'trd_001',
        user_id: 'usr_demo_001',
        symbol: 'RELIANCE',
        stock_name: 'Reliance Industries Ltd.',
        trade_type: 'BUY',
        quantity: 3,
        execution_price: 2890.00,
        total_amount: 8670.00,
        cash_after_trade: 91330.00,
        notes: 'Initial portfolio position',
        created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        id: 'trd_002',
        user_id: 'usr_demo_001',
        symbol: 'TCS',
        stock_name: 'Tata Consultancy Services Ltd.',
        trade_type: 'BUY',
        quantity: 1,
        execution_price: 3810.00,
        total_amount: 3810.00,
        cash_after_trade: 87520.00,
        notes: 'IT sector diversification',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'trd_003',
        user_id: 'usr_demo_001',
        symbol: 'HDFCBANK',
        stock_name: 'HDFC Bank Ltd.',
        trade_type: 'BUY',
        quantity: 2,
        execution_price: 1700.00,
        total_amount: 3400.00,
        cash_after_trade: 84120.00,
        notes: 'Banking allocation',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      }
    );

    // 5. Watchlist for Arjun
    const demoWatchlist = ['INFY', 'ICICIBANK', 'ITC'];
    for (const sym of demoWatchlist) {
      this.watchlist.set(`usr_demo_001:${sym}`, {
        id: `wtc_${crypto.randomUUID()}`,
        user_id: 'usr_demo_001',
        symbol: sym,
        added_at: new Date().toISOString(),
      });
    }

    // 6. Learning Modules (10 required categories)
    this.learningModules = [
      {
        id: 'mod_basics',
        category: 'Stock Market Basics',
        title: 'Introduction to the Stock Market',
        description: 'Understand what a stock market is, why companies list their shares, and how everyday investors participate.',
        order_index: 1,
        reading_time_mins: 5,
        icon_name: 'TrendingUp',
        difficulty: 'Beginner',
      },
      {
        id: 'mod_shares_exchanges',
        category: 'Shares & Stock Exchanges',
        title: 'Understanding Shares and Stock Exchanges',
        description: 'Explore NSE, BSE, SEBI regulation, and what owning a share really means in corporate India.',
        order_index: 2,
        reading_time_mins: 6,
        icon_name: 'Building2',
        difficulty: 'Beginner',
      },
      {
        id: 'mod_fundamental',
        category: 'Fundamental Analysis',
        title: 'Basics of Fundamental Analysis',
        description: 'Learn how to read balance sheets, income statements, cash flow, and evaluate business economic moats.',
        order_index: 3,
        reading_time_mins: 8,
        icon_name: 'FileText',
        difficulty: 'Intermediate',
      },
      {
        id: 'mod_technical',
        category: 'Technical Analysis',
        title: 'Introduction to Technical Analysis',
        description: 'Understand price charts, support & resistance levels, volume, and basic trendline indicators.',
        order_index: 4,
        reading_time_mins: 7,
        icon_name: 'BarChart2',
        difficulty: 'Intermediate',
      },
      {
        id: 'mod_pe_eps',
        category: 'P/E Ratio and EPS',
        title: 'Demystifying P/E Ratio and EPS',
        description: 'Master the two most famous valuation metrics. Learn how to calculate Price-to-Earnings and Earnings Per Share.',
        order_index: 5,
        reading_time_mins: 6,
        icon_name: 'Calculator',
        difficulty: 'Beginner',
      },
      {
        id: 'mod_mutual_funds',
        category: 'Mutual Funds',
        title: 'Mutual Funds Explained Simply',
        description: 'Discover how pooled funds work, active vs index passive funds, NAV, and expense ratio impacts.',
        order_index: 6,
        reading_time_mins: 6,
        icon_name: 'PieChart',
        difficulty: 'Beginner',
      },
      {
        id: 'mod_sip',
        category: 'SIPs',
        title: 'Power of Systematic Investment Plans (SIP)',
        description: 'Learn the magic of compounding, rupee-cost averaging, and building disciplined long-term wealth.',
        order_index: 7,
        reading_time_mins: 5,
        icon_name: 'Clock',
        difficulty: 'Beginner',
      },
      {
        id: 'mod_risk',
        category: 'Risk Management',
        title: 'Understanding & Managing Investment Risk',
        description: 'Explore market risk, volatility, liquidity risk, and how asset allocation shields your capital.',
        order_index: 8,
        reading_time_mins: 7,
        icon_name: 'ShieldCheck',
        difficulty: 'Intermediate',
      },
      {
        id: 'mod_diversification',
        category: 'Portfolio Diversification',
        title: 'Art of Portfolio Diversification',
        description: 'Why you should never put all your eggs in one basket. Sector, asset-class, and market-cap balancing.',
        order_index: 9,
        reading_time_mins: 7,
        icon_name: 'Layers',
        difficulty: 'Intermediate',
      },
      {
        id: 'mod_pnl',
        category: 'Understanding Profit and Loss',
        title: 'Deciphering Profit & Loss (Realized vs Unrealized)',
        description: 'Learn how capital gains work, the difference between paper profits and realized cash returns, and taxes.',
        order_index: 10,
        reading_time_mins: 6,
        icon_name: 'Coins',
        difficulty: 'Beginner',
      },
    ];

    // 7. Lessons
    this.lessons = [
      {
        id: 'les_basics_1',
        module_id: 'mod_basics',
        title: 'What is the Stock Market?',
        content: `The stock market is a public marketplace where buyers and sellers trade shares of publicly listed companies. Think of it like a massive digital supermarket for ownership stakes in businesses.\n\nWhen a private company needs capital to expand, build factories, or develop technologies, it can issue shares to the public through an Initial Public Offering (IPO). Once listed, investors can trade these shares freely. In India, key exchanges include the Bombay Stock Exchange (BSE) and the National Stock Exchange (NSE).`,
        practical_example: `Suppose a local bakery called "Delight Bakers" wants to open 10 new branches across India. They need ₹10 Lakhs. Instead of taking an expensive bank loan, they divide their company into 1,000 shares worth ₹1,000 each and sell them to investors. If you buy 10 shares for ₹10,000, you now own 1% of Delight Bakers and participate in its future growth.`,
        key_terms: JSON.stringify([
          { term: 'IPO', def: 'Initial Public Offering - when a private company first sells shares to the public' },
          { term: 'Share', def: 'A unit of ownership in a corporation' },
          { term: 'NSE / BSE', def: 'National Stock Exchange & Bombay Stock Exchange, the premier Indian exchanges' },
        ]),
        order_index: 1,
      },
      {
        id: 'les_shares_1',
        module_id: 'mod_shares_exchanges',
        title: 'How Exchanges and Depositories Function',
        content: `When you buy or sell a share in India, you are protected by a strict regulatory framework governed by SEBI (Securities and Exchange Board of India). Shares are held electronically in a Demat account with depositories like NSDL or CDSL. When an order executes on the NSE or BSE, clearing corporations guarantee settlement on a T+1 (Transaction day + 1 day) cycle.`,
        practical_example: `When you tap "Buy" for 1 share of TCS at ₹3,875, your broker verifies your funds, matches your order with a seller on the NSE within milliseconds, and marks the share for settlement into your NSDL Demat account.`,
        key_terms: JSON.stringify([
          { term: 'SEBI', def: 'Securities and Exchange Board of India, the market regulator' },
          { term: 'Demat Account', def: 'An electronic account holding your dematerialized securities' },
          { term: 'T+1 Settlement', def: 'Settlement finalized within one business day' },
        ]),
        order_index: 1,
      },
      {
        id: 'les_pe_eps_1',
        module_id: 'mod_pe_eps',
        title: 'How to Calculate and Use P/E Ratio & EPS',
        content: `Earnings Per Share (EPS) represents how much net profit a company earns for each outstanding share. It is calculated as: Net Profit ÷ Total Number of Shares.\n\nThe Price-to-Earnings (P/E) Ratio shows how much investors are willing to pay for every ₹1 of profit the company generates: Current Market Price ÷ EPS. A low P/E might indicate an undervalued stock, while a high P/E implies high growth expectations.`,
        practical_example: `Company A has a stock price of ₹1,000 and an EPS of ₹50. Its P/E ratio is 1,000 ÷ 50 = 20. This means you are paying ₹20 for every ₹1 of annual profit earned by Company A.`,
        key_terms: JSON.stringify([
          { term: 'EPS', def: 'Earnings Per Share = Net Annual Profit / Total Shares' },
          { term: 'P/E Ratio', def: 'Price to Earnings Ratio = Share Price / EPS' },
          { term: 'Valuation', def: 'Determining the fair economic value of a business' },
        ]),
        order_index: 1,
      },
      {
        id: 'les_sip_1',
        module_id: 'mod_sip',
        title: 'The Compounding Wonder of SIPs',
        content: `A Systematic Investment Plan (SIP) is a method where an investor commits a fixed sum of money at regular intervals into a mutual fund or equity basket. SIP eliminates the impossible stress of "timing the market". Through Rupee-Cost Averaging, you buy more units when prices fall and fewer units when prices rise.`,
        practical_example: `If you invest ₹5,000 every month for 15 years at an assumed average annual return of 12%, your total investment is ₹9,00,000. Due to compound returns, your estimated final value is approximately ₹25,22,880 — an estimated gain of over ₹16,22,880!`,
        key_terms: JSON.stringify([
          { term: 'SIP', def: 'Systematic Investment Plan - regular periodic investments' },
          { term: 'Rupee-Cost Averaging', def: 'Averaging purchase price across market cycles' },
          { term: 'Compound Interest', def: 'Returns earned on both original principal and prior earnings' },
        ]),
        order_index: 1,
      },
      {
        id: 'les_pnl_1',
        module_id: 'mod_pnl',
        title: 'Realized vs. Unrealized Profit & Loss',
        content: `Unrealized P&L is the profit or loss on stocks you still hold in your portfolio based on current market prices. It changes as quotes fluctuate.\n\nRealized P&L occurs only when you formally execute a SELL order and lock in the difference between your selling price and your weighted-average buy cost.`,
        practical_example: `You buy 10 shares of Infosys at ₹1,500 (total ₹15,000). The price rises to ₹1,700. Your portfolio shows an Unrealized Profit of ₹2,000 (+13.3%). If you sell 5 shares at ₹1,700, you lock in a Realized Profit of 5 × (₹1,700 - ₹1,500) = ₹1,000 in virtual cash immediately.`,
        key_terms: JSON.stringify([
          { term: 'Unrealized P&L', def: 'Paper profit or loss on current holdings' },
          { term: 'Realized P&L', def: 'Locked-in profit or loss after selling shares' },
          { term: 'Cost Basis', def: 'The weighted average purchase price of remaining shares' },
        ]),
        order_index: 1,
      },
      {
        id: 'les_diversification_1',
        module_id: 'mod_diversification',
        title: 'Diversification: The Only Free Lunch in Finance',
        content: `Diversification is the practice of spreading investments across various financial instruments, sectors, and asset classes to reduce exposure to any single risk. If one sector faces regulatory headwinds or cyclical downturns, gains in other sectors help stabilize your overall net worth.`,
        practical_example: `If you invest ₹1,00,000 entirely into one IT company and tech spending drops 30%, your entire portfolio falls 30%. But if you divide your ₹1,00,000 across IT (₹25,000), Banking (₹25,000), FMCG (₹25,000), and Energy (₹25,000), the overall portfolio remains resilient even if one sector lags.`,
        key_terms: JSON.stringify([
          { term: 'Diversification', def: 'Allocating capital across diverse industries to minimize unsystematic risk' },
          { term: 'Sector Risk', def: 'Risk affecting a specific industry like technology or healthcare' },
        ]),
        order_index: 1,
      },
    ];

    // 8. Quizzes
    this.quizzes = [
      {
        id: 'quiz_basics',
        module_id: 'mod_basics',
        title: 'Stock Market Fundamentals Quiz',
        description: 'Test your understanding of stock markets, IPOs, and share ownership.',
        passing_score: 70,
      },
      {
        id: 'quiz_shares',
        module_id: 'mod_shares_exchanges',
        title: 'Exchanges & SEBI Quiz',
        description: 'Verify your knowledge about Indian stock exchanges, demat accounts, and settlements.',
        passing_score: 70,
      },
      {
        id: 'quiz_pe_eps',
        module_id: 'mod_pe_eps',
        title: 'P/E Ratio & EPS Valuation Quiz',
        description: 'Solve practical valuation problems and test your calculation skills.',
        passing_score: 70,
      },
      {
        id: 'quiz_sip',
        module_id: 'mod_sip',
        title: 'SIP & Compounding Mastery Quiz',
        description: 'Evaluate your grasp of rupee-cost averaging and long-term wealth compounding.',
        passing_score: 70,
      },
      {
        id: 'quiz_pnl',
        module_id: 'mod_pnl',
        title: 'P&L Accounting Quiz',
        description: 'Check your comprehension of realized vs unrealized gains and cost-basis accounting.',
        passing_score: 70,
      },
      {
        id: 'quiz_diversification',
        module_id: 'mod_diversification',
        title: 'Portfolio Diversification Quiz',
        description: 'Assess how to allocate capital across sectors and protect against concentrated risk.',
        passing_score: 70,
      },
    ];

    // 9. Quiz Questions
    this.quizQuestions = [
      {
        id: 'q_basics_1',
        quiz_id: 'quiz_basics',
        question: 'What does purchasing a company share represent?',
        option_a: 'A loan made to the company that must be repaid with interest',
        option_b: 'Fractional ownership in the company and its future earnings',
        option_c: 'A guarantee of daily cash dividends',
        option_d: 'An insurance policy against economic inflation',
        correct_option: 'B',
        explanation: 'A share is a unit of equity ownership in a business. As a shareholder, you own a fractional part of the corporation and participate in its growth or losses.',
        order_index: 1,
      },
      {
        id: 'q_basics_2',
        quiz_id: 'quiz_basics',
        question: 'What is an Initial Public Offering (IPO)?',
        option_a: 'A penalty imposed by SEBI on non-compliant brokers',
        option_b: 'The closing price of a stock at the end of the financial year',
        option_c: 'The first time a private company sells its shares to the general public',
        option_d: 'An annual dividend distribution process',
        correct_option: 'C',
        explanation: 'An IPO (Initial Public Offering) marks the transition of a privately held company into a publicly traded company on stock exchanges.',
        order_index: 2,
      },
      {
        id: 'q_shares_1',
        quiz_id: 'quiz_shares',
        question: 'Which statutory regulatory body oversees and protects investors in the Indian stock market?',
        option_a: 'RBI (Reserve Bank of India)',
        option_b: 'SEBI (Securities and Exchange Board of India)',
        option_c: 'IRDAI (Insurance Regulatory Development Authority)',
        option_d: 'NITI Aayog',
        correct_option: 'B',
        explanation: 'SEBI is the primary securities market regulator established to protect the interests of investors and regulate the securities market.',
        order_index: 1,
      },
      {
        id: 'q_pe_1',
        quiz_id: 'quiz_pe_eps',
        question: 'If a stock trades at ₹1,500 and has an annual EPS of ₹75, what is its P/E ratio?',
        option_a: '15',
        option_b: '20',
        option_c: '25',
        option_d: '112.5',
        correct_option: 'B',
        explanation: 'P/E ratio = Current Market Price ÷ EPS = 1,500 ÷ 75 = 20. This indicates investors pay ₹20 for every ₹1 of company earnings.',
        order_index: 1,
      },
      {
        id: 'q_pe_2',
        quiz_id: 'quiz_pe_eps',
        question: 'How is Earnings Per Share (EPS) calculated?',
        option_a: 'Total Revenue divided by Current Share Price',
        option_b: 'Net Profit after taxes divided by Total Number of Outstanding Shares',
        option_c: 'Total Assets minus Total Liabilities',
        option_d: 'Annual Dividend divided by Stock Price',
        correct_option: 'B',
        explanation: 'EPS is calculated as Net Profit divided by the total number of common shares outstanding.',
        order_index: 2,
      },
      {
        id: 'q_sip_1',
        quiz_id: 'quiz_sip',
        question: 'What is the primary benefit of Rupee-Cost Averaging in a SIP?',
        option_a: 'It guarantees a fixed 15% return every year',
        option_b: 'It automatically buys more units when prices are low and fewer when prices are high',
        option_c: 'It eliminates all taxes on capital gains',
        option_d: 'It prevents mutual fund companies from charging expense ratios',
        correct_option: 'B',
        explanation: 'Because you invest a fixed amount each month, when market prices dip your money purchases more units, lowering your average cost over time.',
        order_index: 1,
      },
      {
        id: 'q_pnl_1',
        quiz_id: 'quiz_pnl',
        question: 'You buy 10 shares at ₹200. The price goes up to ₹250. If you do NOT sell, what is your profit called?',
        option_a: 'Realized Profit',
        option_b: 'Dividend Income',
        option_c: 'Unrealized (Paper) Profit',
        option_d: 'Taxable Capital Gain',
        correct_option: 'C',
        explanation: 'Until you sell the shares, the profit is unrealized (on paper) because price movements can still increase or decrease that value before execution.',
        order_index: 1,
      },
      {
        id: 'q_div_1',
        quiz_id: 'quiz_diversification',
        question: 'Why is investing across multiple unrelated sectors considered beneficial?',
        option_a: 'It guarantees that every stock will rise each month',
        option_b: 'It completely eliminates all market risk',
        option_c: 'It reduces unsystematic company or sector-specific risk',
        option_d: 'It doubles the virtual cash balance automatically',
        correct_option: 'C',
        explanation: 'Diversification dampens the impact of individual company or sector failures on the broader portfolio.',
        order_index: 1,
      },
    ];

    // 10. Demo Progress for Arjun
    this.progress.set('usr_demo_001:mod_basics:les_basics_1', {
      id: 'prg_001',
      user_id: 'usr_demo_001',
      module_id: 'mod_basics',
      lesson_id: 'les_basics_1',
      completed: true,
      completed_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    });
  }

  // Repository-style direct accessors for speed and reliability
  getUsersMap() { return this.users; }
  getStocksMap() { return this.stocks; }
  getTradesList() { return this.trades; }
  getHoldingsMap() { return this.holdings; }
  getWatchlistMap() { return this.watchlist; }
  getSnapshotsList() { return this.snapshots; }
  getLearningModulesList() { return this.learningModules; }
  getLessonsList() { return this.lessons; }
  getQuizzesList() { return this.quizzes; }
  getQuizQuestionsList() { return this.quizQuestions; }
  getQuizAttemptsList() { return this.quizAttempts; }
  getProgressMap() { return this.progress; }

  // Generic SQL mock query implementation
  async query<T = any>(sql: string, params: any[] = []): Promise<{ rows: T[]; rowCount: number }> {
    // For direct simple SQL queries
    return { rows: [], rowCount: 0 };
  }

  async transaction<T>(callback: (trx: IDatabase) => Promise<T>): Promise<T> {
    // In-memory operations are synchronous and atomic per node event-loop
    return callback(this);
  }
}

// Singleton database instance
class DatabaseManager {
  private static instance: IDatabase;
  private static memoryDb = new MemoryDatabase();

  public static getDatabase(): IDatabase {
    if (!this.instance) {
      if (config.databaseUrl) {
        try {
          const pool = new Pool({
            connectionString: config.databaseUrl,
            ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
          });
          // We wrap pool in our interface
          this.instance = {
            async query(sql: string, params: any[] = []) {
              const res = await pool.query(sql, params);
              return { rows: res.rows, rowCount: res.rowCount ?? 0 };
            },
            async transaction<T>(callback: (trx: IDatabase) => Promise<T>): Promise<T> {
              const client = await pool.connect();
              try {
                await client.query('BEGIN');
                const trxDb: IDatabase = {
                  async query(s, p) {
                    const r = await client.query(s, p);
                    return { rows: r.rows, rowCount: r.rowCount ?? 0 };
                  },
                  transaction: () => { throw new Error('Nested transactions not supported'); },
                  isPostgres: () => true,
                };
                const result = await callback(trxDb);
                await client.query('COMMIT');
                return result;
              } catch (err) {
                await client.query('ROLLBACK');
                throw err;
              } finally {
                client.release();
              }
            },
            isPostgres() {
              return true;
            },
          };
          console.log('[Database] Connected to PostgreSQL at:', config.databaseUrl);
        } catch (err) {
          console.warn('[Database] Failed to connect to PostgreSQL. Falling back to embedded relational storage engine.', err);
          this.instance = this.memoryDb;
        }
      } else {
        console.log('[Database] No DATABASE_URL specified. Running embedded relational engine with full demo seed catalog.');
        this.instance = this.memoryDb;
      }
    }
    return this.instance;
  }

  public static getMemoryDb(): MemoryDatabase {
    return this.memoryDb;
  }
}

export const db = DatabaseManager.getDatabase();
export const memoryDb = DatabaseManager.getMemoryDb();
