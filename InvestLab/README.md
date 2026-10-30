# InvestLab — Learn Investing by Doing

> **Educational FinTech Platform & Paper Trading Simulator**
> Practice buying and selling shares with **₹1,00,000 in virtual cash**, master portfolio management, simulate SIPs, and learn with an AI Finance Tutor.

---

## 🌟 Key Features

1. **₹1,00,000 Virtual Cash Sandbox**
   - Every registered user begins with ₹1,00,000 in virtual paper-trading funds.
   - Zero financial risk; no real payment methods or stock-market orders involved.

2. **Paper Trading Engine & Accounting**
   - Simulated **Buy** and **Sell** execution with live order ticket modals.
   - True **weighted-average cost basis** accounting handling initial and partial sales.
   - Real-time calculation of **Realized P/L**, **Unrealized P/L**, and portfolio equity curve.
   - Atomic balance verification preventing negative balances or overselling.

3. **Stock Discovery & Analysis**
   - Curated Indian bluechips (TCS, Reliance Industries, HDFC Bank, Infosys, ICICI Bank, ITC, SBIN, Wipro).
   - Search by symbol or company name, sector filtering, and price sorting.
   - Fundamental metrics: P/E Ratio, EPS, Market Capitalization (₹ Cr), Revenue, Net Profit, Dividend Yield, 52-Week High/Low.
   - Historical performance charts with 1W, 1M, 3M, 6M, 1Y, and ALL timeframes.

4. **Interactive SIP Simulator**
   - Monthly compounding annuity formula: $FV = P \times \left[ \frac{(1 + r)^n - 1}{r} \right]$.
   - Synchronized sliders and numeric inputs for monthly contribution, years, and return rate.
   - Year-by-year amortization breakdown schedule and compounding growth chart.

5. **10 Structured Financial Learning Modules**
   - Stock Market Basics, Shares & Exchanges, Fundamental Analysis, Technical Analysis, P/E & EPS, Mutual Funds, SIPs, Risk Management, Diversification, and Understanding P&L.
   - Practical Indian Rupee examples and key terminology cards.
   - Progress tracking saved to user database profile.

6. **Quiz System**
   - Interactive multiple-choice questions with 4 options per question.
   - Server-side grading preventing answer exposure before submission.
   - Educational explanations provided for every question upon completion.

7. **AI Finance Tutor**
   - Conversational assistant explaining financial terms and valuation metrics.
   - Integrated with Python FastAPI service (with configurable Gemini/OpenAI LLM support) + robust built-in curated fallback engine with INR examples.
   - Strict safety guardrails: No personalized advice, no return guarantees.

8. **Transaction History & CSV Export**
   - Complete audit trail of all buy/sell transactions with execution prices and post-trade cash balances.
   - Filter by trade type, search by symbol, and 1-click CSV download.

---

## 🏗️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Recharts, Lucide React, Axios.
- **Backend API**: Node.js, Express.js, TypeScript, JWT authentication, bcryptjs, Zod validation, pg.
- **Database**: PostgreSQL with full relational schema (`database/migrations/`), constraints, foreign keys, and indexes. Automated embedded relational engine fallback for zero-config immediate execution.
- **AI Service**: Python 3, FastAPI, Uvicorn, Pydantic, configurable LLM integration.
- **Testing**: Vitest for frontend & backend test suites, Python unittest for AI service.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Start the Backend API (Port 5000)
```bash
cd backend
npm run dev
```
*The backend starts at `http://localhost:5000`. If `DATABASE_URL` is not provided, it automatically runs in embedded mode pre-seeded with Indian bluechips and demo data!*

### 3. Start the Frontend Application (Port 5173)
```bash
cd frontend
npm run dev
```
*Open `http://localhost:5173` in your browser.*

### 4. Optional: Start the Python AI Tutor Service (Port 8000)
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```
*(If the AI service is not running, the platform seamlessly uses the built-in educational fallback tutor).*

---

## 🧪 Running Tests

### Backend API Tests (23 Tests Covering Financial Math & Trading)
```bash
cd backend
npm test
```

### Frontend Component & Formatter Tests
```bash
cd frontend
npm test
```

### Python AI Tutor Tests
```bash
python -m unittest ai-service/tests/test_tutor.py
```

---

## 👤 Demo Login Credentials

For testing without creating a new account:
- **Email:** `demo@investlab.in`
- **Password:** `demo123`
- Or simply click **"Sign In with 1-Click Demo"** on the login or landing page.

---

## 📜 Disclaimer
*InvestLab is an educational paper-trading simulator. All cash balances, transactions, prices, and AI responses are strictly simulated for learning. No real money or actual stock-market orders are involved.*
