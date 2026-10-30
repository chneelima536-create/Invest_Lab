-- ==============================================================================
-- InvestLab Seed Data
-- Realistic demo stock catalog, 10 learning modules, lessons, and quizzes
-- ==============================================================================

-- 1. Demo Stocks Catalog
INSERT INTO stocks (symbol, name, sector, price, change_amount, change_percent, pe_ratio, eps, market_cap_cr, revenue_cr, net_profit_cr, dividend_yield, high_52w, low_52w, description, is_demo)
VALUES
('RELIANCE', 'Reliance Industries Ltd.', 'Energy & Telecom', 2940.50, 24.30, 0.83, 28.4, 103.54, 1989400.00, 892000.00, 74200.00, 0.34, 3024.90, 2220.30, 'Reliance Industries is India''s largest conglomerate by market capitalization, with market leadership in oil-to-chemicals, retail, and telecommunications (Jio).', TRUE),
('TCS', 'Tata Consultancy Services Ltd.', 'Information Technology', 3875.20, -18.70, -0.48, 31.2, 124.20, 1402100.00, 240890.00, 46580.00, 1.25, 4254.75, 3313.00, 'TCS is a global leader in IT services, consulting, and business solutions, operating across 55 countries with world-class return on equity.', TRUE),
('HDFCBANK', 'HDFC Bank Ltd.', 'Banking & Finance', 1682.40, 15.60, 0.94, 19.5, 86.27, 1278500.00, 280400.00, 64060.00, 1.16, 1794.00, 1363.55, 'India''s largest private sector bank, renowned for pristine asset quality, extensive retail network, and integrated financial services.', TRUE),
('INFY', 'Infosys Ltd.', 'Information Technology', 1745.80, -9.40, -0.54, 27.8, 62.79, 724300.00, 153670.00, 26230.00, 2.10, 1953.90, 1358.35, 'A next-generation digital services and consulting leader enabling clients in more than 50 countries to navigate digital transformation.', TRUE),
('ICICIBANK', 'ICICI Bank Ltd.', 'Banking & Finance', 1215.60, 12.80, 1.06, 18.2, 66.79, 854000.00, 186200.00, 44250.00, 0.82, 1257.80, 915.00, 'A prominent Indian multinational banking and financial services company offering comprehensive financial solutions to corporate and retail customers.', TRUE),
('ITC', 'ITC Ltd.', 'Consumer Goods (FMCG)', 492.30, 4.10, 0.84, 28.1, 17.52, 614000.00, 76500.00, 20400.00, 2.78, 510.65, 399.30, 'A leading FMCG conglomerate in India with diverse businesses including cigarettes, branded packaged foods, hospitality, paperboards, and agri-business.', TRUE),
('SBIN', 'State Bank of India', 'Banking & Finance', 788.50, 7.20, 0.92, 10.4, 75.81, 703600.00, 440200.00, 67080.00, 1.74, 912.10, 555.25, 'The premier public sector bank and largest commercial bank in India, holding over a quarter of the country''s banking deposits and loans.', TRUE),
('WIPRO', 'Wipro Ltd.', 'Information Technology', 512.90, -3.80, -0.73, 23.6, 21.73, 268400.00, 89760.00, 11350.00, 0.19, 580.00, 375.00, 'A global technology services and consulting company focused on building innovative solutions that address clients'' most complex digital transformation needs.', TRUE)
ON CONFLICT (symbol) DO UPDATE SET
  price = EXCLUDED.price,
  change_amount = EXCLUDED.change_amount,
  change_percent = EXCLUDED.change_percent,
  pe_ratio = EXCLUDED.pe_ratio,
  eps = EXCLUDED.eps,
  last_updated = CURRENT_TIMESTAMP;

-- 2. Demo User Seed (Password is demo123, pre-hashed with bcrypt)
INSERT INTO users (id, full_name, email, password_hash, virtual_cash, is_demo_account)
VALUES
('usr_demo_001', 'Arjun Sharma (Demo)', 'demo@investlab.in', '$2a$10$wK1Esu1P8W90hJg6aV1YzeJzZ6WvJ6p7T1fJ9mU3FvX/HqGqQ4mQe', 84120.00, TRUE)
ON CONFLICT (email) DO NOTHING;

-- 3. Initial Demo Holdings for Arjun Sharma to showcase dashboard immediately
INSERT INTO holdings (id, user_id, symbol, quantity, average_buy_price, total_invested, realized_pnl)
VALUES
('hld_001', 'usr_demo_001', 'RELIANCE', 3, 2890.00, 8670.00, 0.00),
('hld_002', 'usr_demo_001', 'TCS', 1, 3810.00, 3810.00, 0.00),
('hld_003', 'usr_demo_001', 'HDFCBANK', 2, 1700.00, 3400.00, 0.00)
ON CONFLICT (user_id, symbol) DO NOTHING;

-- 4. Initial Demo Trades
INSERT INTO trades (id, user_id, symbol, stock_name, trade_type, quantity, execution_price, total_amount, cash_after_trade, notes)
VALUES
('trd_001', 'usr_demo_001', 'RELIANCE', 'Reliance Industries Ltd.', 'BUY', 3, 2890.00, 8670.00, 91330.00, 'Initial portfolio position'),
('trd_002', 'usr_demo_001', 'TCS', 'Tata Consultancy Services Ltd.', 'BUY', 1, 3810.00, 3810.00, 87520.00, 'IT sector diversification'),
('trd_003', 'usr_demo_001', 'HDFCBANK', 'HDFC Bank Ltd.', 'BUY', 2, 1700.00, 3400.00, 84120.00, 'Banking allocation')
ON CONFLICT (id) DO NOTHING;

-- 5. Initial Watchlist
INSERT INTO watchlist (id, user_id, symbol)
VALUES
('wtc_001', 'usr_demo_001', 'INFY'),
('wtc_002', 'usr_demo_001', 'ICICIBANK'),
('wtc_003', 'usr_demo_001', 'ITC')
ON CONFLICT (user_id, symbol) DO NOTHING;

-- 6. Learning Modules (All 10 required categories)
INSERT INTO learning_modules (id, category, title, description, order_index, reading_time_mins, icon_name, difficulty)
VALUES
('mod_basics', 'Stock Market Basics', 'Introduction to the Stock Market', 'Understand what a stock market is, why companies list their shares, and how everyday investors participate.', 1, 5, 'TrendingUp', 'Beginner'),
('mod_shares_exchanges', 'Shares & Exchanges', 'Understanding Shares and Stock Exchanges', 'Explore NSE, BSE, SEBI regulation, and what owning a share really means in corporate India.', 2, 6, 'Building2', 'Beginner'),
('mod_fundamental', 'Fundamental Analysis', 'Basics of Fundamental Analysis', 'Learn how to read balance sheets, income statements, cash flow, and evaluate business economic moats.', 3, 8, 'FileText', 'Intermediate'),
('mod_technical', 'Technical Analysis', 'Introduction to Technical Analysis', 'Understand price charts, support & resistance levels, volume, and basic trendline indicators.', 4, 7, 'BarChart2', 'Intermediate'),
('mod_pe_eps', 'P/E Ratio & EPS', 'Demystifying P/E Ratio and EPS', 'Master the two most famous valuation metrics. Learn how to calculate Price-to-Earnings and Earnings Per Share.', 5, 6, 'Calculator', 'Beginner'),
('mod_mutual_funds', 'Mutual Funds', 'Mutual Funds Explained Simply', 'Discover how pooled funds work, active vs index passive funds, NAV, and expense ratio impacts.', 6, 6, 'PieChart', 'Beginner'),
('mod_sip', 'SIPs', 'Power of Systematic Investment Plans (SIP)', 'Learn the magic of compounding, rupee-cost averaging, and building disciplined long-term wealth.', 7, 5, 'Clock', 'Beginner'),
('mod_risk', 'Risk Management', 'Understanding & Managing Investment Risk', 'Explore market risk, volatility, liquidity risk, and how asset allocation shields your capital.', 8, 7, 'ShieldCheck', 'Intermediate'),
('mod_diversification', 'Portfolio Diversification', 'Art of Portfolio Diversification', 'Why you should never put all your eggs in one basket. Sector, asset-class, and market-cap balancing.', 9, 7, 'Layers', 'Intermediate'),
('mod_pnl', 'Understanding P&L', 'Deciphering Profit & Loss (Realized vs Unrealized)', 'Learn how capital gains work, the difference between paper profits and realized cash returns, and taxes.', 10, 6, 'Coins', 'Beginner')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index;

-- 7. Lessons Data
INSERT INTO lessons (id, module_id, title, content, practical_example, key_terms, order_index)
VALUES
(
  'les_basics_1',
  'mod_basics',
  'What is the Stock Market?',
  'The stock market is a public marketplace where buyers and sellers trade shares of publicly listed companies. Think of it like a massive digital supermarket for ownership stakes in businesses. When a private company needs capital to expand, build factories, or develop technologies, it can issue shares to the public through an Initial Public Offering (IPO). Once listed, investors can trade these shares freely. In India, key exchanges include the Bombay Stock Exchange (BSE) and the National Stock Exchange (NSE).',
  'Suppose a local bakery called "Delight Bakers" wants to open 10 new branches across India. They need ₹10 Lakhs. Instead of taking an expensive bank loan, they divide their company into 1,000 shares worth ₹1,000 each and sell them to investors. If you buy 10 shares for ₹10,000, you now own 1% of Delight Bakers and participate in its future growth.',
  '[{"term":"IPO","def":"Initial Public Offering - when a private company first sells shares to the public"},{"term":"Share","def":"A unit of ownership in a corporation"},{"term":"NSE/BSE","def":"National Stock Exchange & Bombay Stock Exchange, the premier Indian exchanges"}]',
  1
),
(
  'les_shares_1',
  'mod_shares_exchanges',
  'How Exchanges and Depositories Function',
  'When you buy or sell a share in India, you are protected by a strict regulatory framework governed by SEBI (Securities and Exchange Board of India). Shares are not paper certificates anymore; they are held electronically in a Demat account with depositories like NSDL or CDSL. When an order executes on the NSE or BSE, clearing corporations guarantee settlement on a T+1 (Transaction day + 1 day) cycle, ensuring the seller receives funds and the buyer receives shares safely.',
  'When you tap "Buy" for 1 share of TCS at ₹3,875, your broker verifies your funds, matches your order with a seller on the NSE within milliseconds, and marks the share for settlement into your NSDL Demat account.',
  '[{"term":"SEBI","def":"Securities and Exchange Board of India, the market watchdog"},{"term":"Demat Account","def":"An electronic account holding your dematerialized shares"},{"term":"T+1 Settlement","def":"Trade settlement finalized within one business day"}]',
  1
),
(
  'les_pe_eps_1',
  'mod_pe_eps',
  'How to Calculate and Use P/E Ratio & EPS',
  'Earnings Per Share (EPS) represents how much net profit a company earns for each outstanding share. It is calculated as: Net Profit ÷ Total Number of Shares. The Price-to-Earnings (P/E) Ratio shows how much investors are willing to pay for every ₹1 of profit the company generates. It is calculated as: Current Market Price ÷ EPS. A low P/E might indicate that a stock is undervalued, or that the market expects low future growth. A high P/E suggests investors expect strong earnings expansion in future years.',
  'Company A has a stock price of ₹1,000 and an EPS of ₹50. Its P/E ratio is 1,000 ÷ 50 = 20. This means you are paying ₹20 for every ₹1 of annual profit earned by Company A. If competitor Company B has a P/E of 45 in the same sector, Company A may offer a more attractive valuation if its growth prospects are similar.',
  '[{"term":"EPS","def":"Earnings Per Share = Net Annual Profit / Total Shares"},{"term":"P/E Ratio","def":"Price to Earnings Ratio = Share Price / EPS"},{"term":"Valuation","def":"The process of determining the fair economic value of a company"}]',
  1
),
(
  'les_sip_1',
  'mod_sip',
  'The Compounding Wonder of SIPs',
  'A Systematic Investment Plan (SIP) is a method where an investor commits a fixed sum of money at regular intervals (usually monthly) into a mutual fund or equity basket. SIP eliminates the impossible stress of "timing the market". Through Rupee-Cost Averaging, you buy more units when prices fall and fewer units when prices rise, bringing down your average acquisition cost over time while harnessing the exponential power of compounding interest.',
  'If you invest ₹5,000 every month for 15 years at an assumed average annual return of 12%, your total out-of-pocket investment is ₹9,00,000. However, due to compound returns, your estimated wealth grew to approximately ₹25,22,880 — an estimated gain of over ₹16,22,880!',
  '[{"term":"SIP","def":"Systematic Investment Plan - regular periodic investments"},{"term":"Rupee-Cost Averaging","def":"Averaging purchase price across market cycles without timing tops and bottoms"},{"term":"Compound Interest","def":"Earning returns on your original investment plus previously accumulated returns"}]',
  1
),
(
  'les_pnl_1',
  'mod_pnl',
  'Realized vs. Unrealized Profit & Loss',
  'Understanding the difference between Unrealized (paper) P&L and Realized P&L is essential for sound financial decision-making. Unrealized P&L is the profit or loss on stocks you still hold in your portfolio based on current market prices. It changes every second as prices fluctuate. Realized P&L occurs only when you formally execute a SELL order and lock in the difference between your selling price and your weighted-average buy cost.',
  'You buy 10 shares of Infosys at ₹1,500 (total ₹15,000). The price rises to ₹1,700. Your portfolio shows an Unrealized Profit of ₹2,000 (+13.3%). If the stock falls back to ₹1,400 tomorrow, that paper profit disappears. If instead you sell 5 shares at ₹1,700, you lock in a Realized Profit of 5 × (₹1,700 - ₹1,500) = ₹1,000 in virtual cash immediately.',
  '[{"term":"Unrealized P&L","def":"Paper profit or loss on current holdings based on live quotes"},{"term":"Realized P&L","def":"Permanent profit or loss locked in after selling an asset"},{"term":"Cost Basis","def":"The weighted average purchase price of your remaining shares"}]',
  1
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  practical_example = EXCLUDED.practical_example,
  key_terms = EXCLUDED.key_terms;

-- 8. Quizzes
INSERT INTO quizzes (id, module_id, title, description, passing_score)
VALUES
('quiz_basics', 'mod_basics', 'Stock Market Fundamentals Quiz', 'Test your understanding of stock markets, IPOs, and share ownership.', 70),
('quiz_shares', 'mod_shares_exchanges', 'Exchanges & SEBI Quiz', 'Verify your knowledge about Indian stock exchanges, demat accounts, and settlements.', 70),
('quiz_pe_eps', 'mod_pe_eps', 'P/E Ratio & EPS Valuation Quiz', 'Solve practical valuation problems and test your calculation skills.', 70),
('quiz_sip', 'mod_sip', 'SIP & Compounding Mastery Quiz', 'Evaluate your grasp of rupee-cost averaging and long-term wealth compounding.', 70),
('quiz_pnl', 'mod_pnl', 'P&L Accounting Quiz', 'Check your comprehension of realized vs unrealized gains and cost-basis accounting.', 70)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- 9. Quiz Questions
INSERT INTO quiz_questions (id, quiz_id, question, option_a, option_b, option_c, option_d, correct_option, explanation, order_index)
VALUES
(
  'q_basics_1',
  'quiz_basics',
  'What does purchasing a company''s share represent?',
  'A loan made to the company that must be repaid with interest',
  'Fractional ownership in the company and its future earnings',
  'A guarantee of daily cash dividends',
  'An insurance policy against economic inflation',
  'B',
  'A share is a unit of equity ownership in a business. As a shareholder, you own a fractional part of the corporation and participate in its growth or losses.',
  1
),
(
  'q_basics_2',
  'quiz_basics',
  'What is an Initial Public Offering (IPO)?',
  'A penalty imposed by SEBI on non-compliant brokers',
  'The closing price of a stock at the end of the financial year',
  'The first time a private company sells its shares to the general public',
  'An annual dividend distribution process',
  'C',
  'An IPO (Initial Public Offering) marks the transition of a privately held company into a publicly traded company on stock exchanges.',
  2
),
(
  'q_pe_1',
  'quiz_pe_eps',
  'If a stock trades at ₹1,500 and has an annual EPS of ₹75, what is its P/E ratio?',
  '15',
  '20',
  '25',
  '112.5',
  'B',
  'P/E ratio = Current Market Price ÷ EPS = 1,500 ÷ 75 = 20. This indicates investors pay ₹20 for every ₹1 of company earnings.',
  1
),
(
  'q_pe_2',
  'quiz_pe_eps',
  'How is Earnings Per Share (EPS) calculated?',
  'Total Revenue divided by Current Share Price',
  'Net Profit after taxes divided by Total Number of Outstanding Shares',
  'Total Assets minus Total Liabilities',
  'Annual Dividend divided by Stock Price',
  'B',
  'EPS is calculated as Net Profit divided by the total number of common shares outstanding.',
  2
),
(
  'q_sip_1',
  'quiz_sip',
  'What is the primary benefit of Rupee-Cost Averaging in a SIP?',
  'It guarantees a fixed 15% return every year',
  'It automatically buys more units when prices are low and fewer when prices are high',
  'It eliminates all taxes on capital gains',
  'It prevents mutual fund companies from charging expense ratios',
  'B',
  'Because you invest a fixed amount each month, when market prices dip your money purchases more units, lowering your average cost over time.',
  1
),
(
  'q_pnl_1',
  'quiz_pnl',
  'You buy 10 shares at ₹200. The price goes up to ₹250. If you do NOT sell, what is your profit called?',
  'Realized Profit',
  'Dividend Income',
  'Unrealized (Paper) Profit',
  'Taxable Capital Gain',
  'C',
  'Until you sell the shares, the profit is unrealized (on paper) because price movements can still increase or decrease that value before execution.',
  1
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  explanation = EXCLUDED.explanation;
