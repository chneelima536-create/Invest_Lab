# InvestLab Architecture & Technical Specification

## 1. High-Level System Architecture

InvestLab is a multi-tier educational FinTech application designed for simulated paper trading, portfolio management, and financial literacy.

```
                          ┌─────────────────────────┐
                          │   React + Vite Client   │
                          │   (Tailwind CSS, TS)    │
                          │   Port 5173             │
                          └────────────┬────────────┘
                                       │ /api
                                       ▼
                          ┌─────────────────────────┐
                          │  Express.js Backend API │
                          │  (JWT, bcryptjs, Zod)   │
                          │  Port 5000              │
                          └──────┬───────────┬──────┘
                                 │           │
                 ┌───────────────┘           └──────────────┐
                 ▼                                          ▼
   ┌───────────────────────────┐             ┌───────────────────────────┐
   │ Relational Database Layer │             │  FastAPI Python AI Tutor  │
   │ PostgreSQL / Embedded DB  │             │  (Configurable LLM /      │
   │ (Full Relational Schema)  │             │   Curated Fallback Engine)│
   └───────────────────────────┘             │  Port 8000                │
                                             └───────────────────────────┘
```

---

## 2. Paper Trading Engine & Accounting Rules

### Starting Virtual Bankroll
Every registered user is initialized with exactly **₹1,00,000.00** in virtual cash (`virtual_cash`).

### Accounting Basis: Weighted-Average Cost Basis
InvestLab utilizes the standard weighted-average cost basis model:

1. **Simulated Buy Order:**
   - Order cost = $\text{executionPrice} \times \text{quantity}$
   - Cash validation: $\text{availableCash} \ge \text{orderCost}$
   - Deduct cash: $\text{cashAfter} = \text{availableCash} - \text{orderCost}$
   - Update Holding:
     $$\text{newAvgPrice} = \frac{\text{oldInvested} + \text{orderCost}}{\text{oldQuantity} + \text{quantity}}$$
     $$\text{newTotalInvested} = \text{oldInvested} + \text{orderCost}$$

2. **Simulated Sell Order (Partial or Total):**
   - Validation: $\text{ownedQuantity} \ge \text{quantity}$ (Overselling strictly forbidden)
   - Sale proceeds: $\text{proceeds} = \text{executionPrice} \times \text{quantity}$
   - Cost basis of sold shares: $\text{costOfSold} = \text{averageBuyPrice} \times \text{quantity}$
   - Realized Profit/Loss:
     $$\text{realizedPnl} = \text{proceeds} - \text{costOfSold}$$
   - Credit cash: $\text{cashAfter} = \text{availableCash} + \text{proceeds}$
   - Update Holding:
     * If $\text{remainingQuantity} = 0$: Holding is closed ($\text{quantity}=0, \text{invested}=0$).
     * If $\text{remainingQuantity} > 0$: $\text{totalInvested} = \text{averageBuyPrice} \times \text{remainingQuantity}$ (the average cost per share remains unchanged).

3. **Portfolio Net Equity Calculation:**
   $$\text{Total Portfolio Value} = \text{Available Cash} + \sum (\text{holding.quantity} \times \text{currentPrice})$$
   $$\text{Unrealized P/L} = \text{Current Market Value} - \text{Total Invested Cost}$$

---

## 3. SIP Compounding Formula

For a monthly contribution $P$, duration in years $y$, and assumed annual return rate $R\%$:
- Total months $n = y \times 12$
- Monthly rate $r = \frac{R}{100 \times 12}$
- Future Value (Ordinary Annuity):
  $$FV = P \times \left[ \frac{(1 + r)^n - 1}{r} \right]$$
- If $r = 0$, $FV = P \times n$
- Wealth Gained = $FV - \text{Total Invested}$

---

## 4. Database Schema

Schema migrations are located in `database/migrations/001_initial_schema.sql` and `database/seed.sql`:
- `users`: User identity, hashed passwords, virtual cash ledger
- `stocks`: Indian equities catalog with fundamental metrics and demo prices
- `trades`: Immutable transaction ledger recording all simulated buy and sell orders
- `holdings`: Current active portfolio positions with weighted-average cost
- `watchlist`: Per-user isolated stock watchlists
- `learning_modules`, `lessons`: 10 structured FinTech curriculum modules
- `quizzes`, `quiz_questions`, `quiz_attempts`: Server-side validated assessments
- `user_learning_progress`: Lesson completion status tracking
