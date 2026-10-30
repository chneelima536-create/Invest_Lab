import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import { SipService } from '../src/services/sipService.js';
import { TradingService } from '../src/services/tradingService.js';
import { AuthService } from '../src/services/authService.js';

describe('InvestLab Core Financial & Trading Tests', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Register a brand new unique user
    const uniqueEmail = `test_${Date.now()}@investlab.test`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Priya Sharma',
        email: uniqueEmail,
        password: 'Password@123',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.virtualCash).toBe(100000.00); // Starting virtual balance ₹1,00,000
    authToken = res.body.data.token;
    testUserId = res.body.data.user.id;
  });

  describe('Authentication & User Isolation', () => {
    it('prevents duplicate email registration', async () => {
      // Try registering with demo user email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Duplicate Arjun',
          email: 'demo@investlab.in',
          password: 'Password@123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('already exists');
    });

    it('rejects invalid login credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'demo@investlab.in',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('allows demo 1-click login', async () => {
      const res = await request(app).post('/api/auth/demo-login');
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('demo@investlab.in');
      expect(res.body.data.token).toBeDefined();
    });

    it('blocks access to protected endpoints without token', async () => {
      const res = await request(app).get('/api/trading/portfolio');
      expect(res.status).toBe(401);
    });
  });

  describe('Paper Trading Engine & Accounting', () => {
    it('rejects invalid or non-positive quantities', async () => {
      const res = await request(app)
        .post('/api/trading/buy')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ symbol: 'RELIANCE', quantity: -5 });

      expect(res.status).toBe(400);
    });

    it('rejects invalid stock symbol', async () => {
      const res = await request(app)
        .post('/api/trading/buy')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ symbol: 'INVALID_STOCK', quantity: 1 });

      expect(res.status).toBe(400);
    });

    it('executes a valid virtual BUY order and deducts cash', async () => {
      // Buy 5 shares of RELIANCE
      const res = await request(app)
        .post('/api/trading/buy')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ symbol: 'RELIANCE', quantity: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.trade.tradeType).toBe('BUY');
      expect(res.body.data.trade.quantity).toBe(5);
      expect(res.body.data.holding.quantity).toBe(5);
      expect(res.body.data.remainingCash).toBeLessThan(100000);
    });

    it('rejects purchases that exceed available cash', async () => {
      const res = await request(app)
        .post('/api/trading/buy')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ symbol: 'TCS', quantity: 500 }); // Cost would exceed ₹19 Lakhs

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Insufficient virtual cash');
    });

    it('handles multiple buys with weighted-average cost basis', async () => {
      // Buy 5 more shares of RELIANCE
      const res = await request(app)
        .post('/api/trading/buy')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ symbol: 'RELIANCE', quantity: 5 });

      expect(res.status).toBe(200);
      expect(res.body.data.holding.quantity).toBe(10);
      expect(res.body.data.holding.averageBuyPrice).toBeGreaterThan(0);
    });

    it('prevents overselling shares not owned', async () => {
      const res = await request(app)
        .post('/api/trading/sell')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ symbol: 'RELIANCE', quantity: 25 }); // Only 10 owned

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Cannot oversell');
    });

    it('handles partial sales with accurate realized profit/loss and cash credit', async () => {
      // Sell 4 shares out of 10 owned
      const res = await request(app)
        .post('/api/trading/sell')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ symbol: 'RELIANCE', quantity: 4 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.trade.tradeType).toBe('SELL');
      expect(res.body.data.trade.quantity).toBe(4);
      expect(res.body.data.holding.quantity).toBe(6); // 10 - 4 = 6 remaining
      expect(res.body.data.realizedProfitOrLoss).toBeDefined();
    });

    it('records transactions accurately in history', async () => {
      const res = await request(app)
        .get('/api/trading/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      expect(res.body.data[0].tradeType).toBe('SELL');
    });

    it('exports transaction history as CSV', async () => {
      const res = await request(app)
        .get('/api/trading/transactions/export')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Transaction ID,Date & Time,Symbol');
    });
  });

  describe('SIP Compound Interest Calculations', () => {
    it('correctly calculates future value using monthly compounding formula', () => {
      // Monthly 5000, 10 years, 12% annual return
      const result = SipService.calculateSIP(5000, 10, 12);
      // FV = 5000 * [((1 + 0.01)^120 - 1) / 0.01] = 1,150,193.45
      expect(result.estimatedFinalValue).toBeGreaterThan(1149000);
      expect(result.estimatedFinalValue).toBeLessThan(1152000);
      expect(result.estimatedWealthGained).toBe(
        Number((result.estimatedFinalValue - result.totalInvested).toFixed(2))
      );
      expect(result.yearlyBreakdown.length).toBe(10);
    });

    it('correctly handles edge case of 0% return rate (FV = P * n)', () => {
      const result = SipService.calculateSIP(10000, 5, 0);
      expect(result.totalInvested).toBe(600000);
      expect(result.estimatedFinalValue).toBe(600000);
      expect(result.estimatedWealthGained).toBe(0);
    });

    it('calculates SIP via POST endpoint', async () => {
      const res = await request(app)
        .post('/api/sip/calculate')
        .send({
          monthlyInvestment: 5000,
          durationYears: 10,
          annualReturnRatePercent: 12,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.estimatedFinalValue).toBeGreaterThan(600000);
    });
  });

  describe('Watchlist Operations', () => {
    it('adds and removes a stock from personal watchlist', async () => {
      // Add INFY
      const addRes = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ symbol: 'INFY' });

      expect(addRes.status).toBe(201);
      expect(addRes.body.data.symbol).toBe('INFY');

      // Get watchlist
      const getRes = await request(app)
        .get('/api/watchlist')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.some((w: any) => w.symbol === 'INFY')).toBe(true);

      // Remove INFY
      const delRes = await request(app)
        .delete('/api/watchlist/INFY')
        .set('Authorization', `Bearer ${authToken}`);

      expect(delRes.status).toBe(200);
    });
  });

  describe('Learning Center & Quiz Scoring', () => {
    it('retrieves learning modules with progress info', async () => {
      const res = await request(app)
        .get('/api/learning/modules')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(10); // All 10 categories
    });

    it('marks a lesson as completed and updates stats', async () => {
      const res = await request(app)
        .post('/api/learning/progress')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          moduleId: 'mod_basics',
          lessonId: 'les_basics_1',
          completed: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const statsRes = await request(app)
        .get('/api/learning/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(statsRes.status).toBe(200);
      expect(statsRes.body.data.completedLessons).toBeGreaterThanOrEqual(1);
    });

    it('retrieves quiz without revealing correct answers', async () => {
      const res = await request(app)
        .get('/api/quizzes/module/mod_basics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.questions.length).toBeGreaterThan(0);
      // Ensure answers are hidden before submit
      expect(res.body.data.questions[0].correctOption).toBeUndefined();
    });

    it('scores quiz server-side and provides educational explanations', async () => {
      const res = await request(app)
        .post('/api/quizzes/quiz_basics/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: {
            q_basics_1: 'B', // Correct
            q_basics_2: 'C', // Correct
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.data.score).toBe(100);
      expect(res.body.data.passed).toBe(true);
      expect(res.body.data.questionResults[0].explanation).toBeDefined();
    });
  });

  describe('AI Finance Tutor & Fallback Mode', () => {
    it('responds to educational questions with structured INR explanations', async () => {
      const res = await request(app)
        .post('/api/tutor/chat')
        .send({ message: 'What is a P/E ratio and how is it used?' });

      expect(res.status).toBe(200);
      expect(res.body.data.message).toContain('Price-to-Earnings');
      expect(res.body.data.disclaimer).toContain('educational information only');
      expect(res.body.data.source).toBeDefined();
    });

    it('responds safely with disclaimer when asked about SIPs', async () => {
      const res = await request(app)
        .post('/api/tutor/chat')
        .send({ message: 'Explain SIPs with an example' });

      expect(res.status).toBe(200);
      expect(res.body.data.message).toContain('Systematic Investment Plan');
      expect(res.body.data.message).toContain('Rupee-Cost Averaging');
    });
  });
});
