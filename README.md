<div align="center">

# 📈 InvestLab

### Learn Investing by Doing

**An educational FinTech platform and paper-trading simulator.**
Practice with ₹1,00,000 in virtual cash, simulate SIPs, study structured finance modules, and ask an AI tutor, all with zero financial risk.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-supported-4169E1?logo=postgresql&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-AI%20Service-009688?logo=fastapi&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Core Financial Logic](#-core-financial-logic)
- [Testing](#-testing)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Disclaimer](#-disclaimer)

---

## 🔎 Overview

**InvestLab** helps beginners build real-world investing skills in a safe sandbox. Every new user receives **₹1,00,000 in virtual cash** to buy and sell shares of curated Indian blue-chip companies, track portfolio performance, and learn the fundamentals through structured lessons, quizzes, and an AI Finance Tutor.

No real money, brokerage account, or live market order is ever involved.

---

## ✨ Features

| Module | What it does |
|---|---|
| 💰 **Virtual Cash Sandbox** | Every user starts with ₹1,00,000 in simulated funds. Portfolio can be reset at any time. |
| 🔁 **Paper Trading Engine** | Simulated buy and sell orders with weighted-average cost basis, realized and unrealized P/L, and validation against negative balances and overselling. |
| 🔍 **Stock Discovery** | Browse Indian blue chips (TCS, Reliance, HDFC Bank, Infosys, ICICI Bank, ITC, SBIN, Wipro) with search, sector filters, and price sorting. |
| 📊 **Fundamentals & Charts** | P/E, EPS, market cap, revenue, net profit, dividend yield, and 52-week high/low, with 1W / 1M / 3M / 6M / 1Y / ALL history charts. |
| 🧮 **SIP Simulator** | Interactive monthly-compounding calculator with synchronized sliders, a year-by-year breakdown, and a growth chart. |
| 📚 **Learning Center** | 10 structured modules (market basics, fundamental and technical analysis, P/E and EPS, mutual funds, SIPs, risk, diversification, P&L) with progress tracking. |
| 📝 **Quiz System** | Multiple-choice quizzes graded **server-side**, so answers are never exposed before submission, with explanations after completion. |
| 🤖 **AI Finance Tutor** | Conversational tutor on a FastAPI service with optional Gemini/OpenAI integration and a built-in curated fallback. It is built to avoid personalized advice and return guarantees. |
| ⭐ **Watchlist** | Per-user stock watchlists. |
| 🧾 **Transaction History** | Full audit trail with post-trade cash balances, filtering, search, and one-click **CSV export**. |

---

## 🛠 Tech Stack

**Frontend**
React 18 · Vite · TypeScript · Tailwind CSS · React Router v6 · Recharts · React Hook Form · Zod · Axios · Lucide React

**Backend**
Node.js · Express · TypeScript · JWT · bcryptjs · Zod · `pg`

**Database**
PostgreSQL (relational schema with constraints, foreign keys, and indexes), with an embedded fallback for zero-config local runs

**AI Service**
Python 3.10+ · FastAPI · Uvicorn · Pydantic

**Testing**
Vitest · Supertest · Testing Library · Python `unittest`

---

## 🏛 Architecture

```
                 ┌─────────────────────────┐
                 │   React + Vite Client   │
                 │   (Tailwind CSS, TS)    │
                 │        :5173            │
                 └────────────┬────────────┘
                              │  /api (proxied)
                              ▼
                 ┌─────────────────────────┐
                 │  Express.js Backend API │
                 │  (JWT, bcryptjs, Zod)   │
                 │        :5000            │
                 └──────┬───────────┬──────┘
                        │           │
          ┌─────────────┘           └──────────────┐
          ▼                                        ▼
┌───────────────────────────┐        ┌───────────────────────────┐
│  PostgreSQL / Embedded DB │        │   FastAPI AI Tutor        │
│  (Relational schema)      │        │   (LLM or curated         │
│                           │        │    fallback)  :8000       │
└───────────────────────────┘        └───────────────────────────┘
```

For a deeper technical walkthrough, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 📁 Project Structure

```
InvestLab/
├── frontend/          # React + Vite client
│   └── src/
│       ├── components/    # Layout, header, sidebar, trade modal
│       ├── context/       # Auth context
│       ├── pages/         # Dashboard, Portfolio, Explore, SIP, Learning, AI Tutor...
│       ├── services/      # API client
│       └── utils/         # Formatters
├── backend/           # Express REST API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic (trading, portfolio, SIP, quiz...)
│   │   ├── routes/        # Route definitions
│   │   ├── middleware/    # JWT authentication
│   │   └── db/            # Database layer
│   └── tests/
├── ai-service/        # FastAPI AI tutor
│   ├── app/
│   └── tests/
├── database/
│   ├── migrations/        # 001_initial_schema.sql
│   └── seed.sql
└── docs/
    └── ARCHITECTURE.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **Python** v3.10 or higher (only for the optional AI service)
- **PostgreSQL** (optional; the backend falls back to an embedded database)

### 1. Clone the repository

```bash
git clone https://github.com/chneelima536-create/Invest_Lab.git
cd Invest_Lab/InvestLab
```

### 2. Install dependencies

```bash
npm --prefix backend install
npm --prefix frontend install
```

### 3. Start the backend (port 5000)

```bash
npm run dev:backend
```

If `DATABASE_URL` is not set, the backend runs in embedded mode, pre-seeded with Indian blue chips and demo data.

### 4. Start the frontend (port 5173)

```bash
npm run dev:frontend
```

Open **http://localhost:5173**.

### 5. (Optional) Start the AI tutor service (port 8000)

```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

If the AI service is not running, the platform uses its built-in educational fallback tutor.

### Demo account

| Field | Value |
|---|---|
| Email | `demo@investlab.in` |
| Password | `demo123` |

You can also click **"Sign In with 1-Click Demo"** on the landing or login page.

### Using PostgreSQL

Create a database, then apply the schema and seed data:

```bash
psql "$DATABASE_URL" -f database/migrations/001_initial_schema.sql
psql "$DATABASE_URL" -f database/seed.sql
```

---

## ⚙️ Environment Variables

Create a `.env` file in `backend/` (all values are optional for local development).

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Backend API port |
| `JWT_SECRET` | demo value | Secret for signing JWTs. **Change this in any non-demo deployment.** |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `DATABASE_URL` | *(empty)* | PostgreSQL connection string. Empty uses the embedded database. |
| `AI_SERVICE_URL` | `http://localhost:8000` | Location of the FastAPI tutor |
| `NODE_ENV` | `development` | Runtime environment |

For the AI service (`ai-service/.env`):

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` or `OPENAI_API_KEY` | Enables LLM-backed answers. Without a key, the curated fallback engine is used. |

---

## 🔌 API Reference

All routes are prefixed with `/api`. 🔒 marks routes that require a `Bearer` JWT.

<details>
<summary><b>Auth</b> — <code>/api/auth</code></summary>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | | Create an account |
| POST | `/login` | | Sign in |
| POST | `/demo-login` | | One-click demo sign-in |
| GET | `/me` | 🔒 | Current user profile |
| POST | `/reset-portfolio` | 🔒 | Reset virtual cash and holdings |

</details>

<details>
<summary><b>Stocks</b> — <code>/api/stocks</code></summary>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | | List and search stocks |
| GET | `/:symbol` | | Stock details and fundamentals |
| GET | `/:symbol/history` | | Historical price data |

</details>

<details>
<summary><b>Trading</b> — <code>/api/trading</code></summary>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/buy` | 🔒 | Place a simulated buy order |
| POST | `/sell` | 🔒 | Place a simulated sell order |
| GET | `/portfolio` | 🔒 | Holdings, cash, and P/L |
| GET | `/portfolio/history` | 🔒 | Portfolio value over time |
| GET | `/transactions` | 🔒 | Transaction history |
| GET | `/transactions/export` | 🔒 | Export transactions as CSV |

</details>

<details>
<summary><b>Watchlist</b> — <code>/api/watchlist</code></summary>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | 🔒 | Get watchlist |
| POST | `/` | 🔒 | Add a stock |
| DELETE | `/:symbol` | 🔒 | Remove a stock |

</details>

<details>
<summary><b>Learning, Quizzes, SIP, Tutor</b></summary>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/learning/modules` | 🔒 | List learning modules |
| GET | `/learning/modules/:id` | 🔒 | Module detail |
| POST | `/learning/progress` | 🔒 | Update lesson progress |
| GET | `/learning/stats` | 🔒 | Learning statistics |
| GET | `/quizzes/module/:moduleId` | 🔒 | Get a module's quiz |
| POST | `/quizzes/:id/submit` | 🔒 | Submit answers for grading |
| GET | `/quizzes/attempts` | 🔒 | Past quiz attempts |
| POST | `/sip/calculate` | | Run SIP projection |
| POST | `/tutor/chat` | | Ask the AI Finance Tutor |
| GET | `/health` | | Service health check |

</details>

---

## 🧠 Core Financial Logic

**Weighted-average cost basis**

- **Buy:** `newAvgPrice = (oldInvested + orderCost) / (oldQty + qty)`
- **Sell:** `realizedPnL = proceeds − (avgBuyPrice × qty)`, and the average cost per share is unchanged on partial sells
- **Portfolio value:** `cash + Σ(quantity × currentPrice)`

**SIP future value (ordinary annuity)**

```
FV = P × [ ((1 + r)^n − 1) / r ]
```

where `P` is the monthly contribution, `r = annualRate / 12 / 100`, and `n = years × 12`. If `r = 0`, then `FV = P × n`.

Full details live in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 🧪 Testing

```bash
# Backend API and financial-math tests
npm run test:backend

# Frontend component and formatter tests
npm run test:frontend

# AI tutor tests (from the InvestLab directory)
python -m unittest ai-service/tests/test_tutor.py
```

---

## 🗺 Roadmap

- [ ] Live or delayed market data integration
- [ ] Limit and stop-loss order simulation
- [ ] Mutual fund paper trading
- [ ] Leaderboards and achievements
- [ ] Docker Compose setup for one-command startup
- [ ] CI pipeline (lint, test, build)

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please make sure tests pass before submitting.

---

## 📜 Disclaimer

InvestLab is an **educational paper-trading simulator**. All cash balances, transactions, prices, and AI responses are simulated for learning purposes only. Nothing in this application constitutes financial, investment, or legal advice, and no real money or actual stock-market orders are involved.

---

<div align="center">

Made with ❤️ for aspiring investors

</div>
