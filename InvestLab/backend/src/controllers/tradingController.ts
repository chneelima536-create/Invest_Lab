import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { TradingService } from '../services/tradingService.js';
import { PortfolioService } from '../services/portfolioService.js';

const orderSchema = z.object({
  symbol: z.string().min(1, 'Stock symbol is required'),
  quantity: z
    .number({ invalid_type_error: 'Quantity must be a number' })
    .int('Quantity must be an integer')
    .positive('Quantity must be greater than 0'),
});

export class TradingController {
  static async buy(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const parsed = orderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: parsed.error.errors[0]?.message || 'Invalid order parameters',
        });
      }

      const { symbol, quantity } = parsed.data;
      const result = await TradingService.executeBuy(req.user.userId, symbol, quantity);

      return res.status(200).json({
        success: true,
        message: `Successfully bought ${quantity} shares of ${result.trade.stockName} at ₹${result.trade.executionPrice.toLocaleString('en-IN')}`,
        data: result,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: err.message || 'Trade execution failed',
      });
    }
  }

  static async sell(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const parsed = orderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: parsed.error.errors[0]?.message || 'Invalid order parameters',
        });
      }

      const { symbol, quantity } = parsed.data;
      const result = await TradingService.executeSell(req.user.userId, symbol, quantity);

      const pnlPrefix = result.realizedProfitOrLoss >= 0 ? '+' : '';
      return res.status(200).json({
        success: true,
        message: `Successfully sold ${quantity} shares of ${result.trade.stockName}. Realized P&L: ${pnlPrefix}₹${result.realizedProfitOrLoss.toLocaleString('en-IN')}`,
        data: result,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: err.message || 'Trade execution failed',
      });
    }
  }

  static async getPortfolio(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const summary = await PortfolioService.getPortfolioSummary(req.user.userId);
      return res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch portfolio',
      });
    }
  }

  static async getPortfolioHistory(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { timeframe } = req.query;
      const history = await PortfolioService.getPortfolioHistory(
        req.user.userId,
        typeof timeframe === 'string' ? timeframe : '1M'
      );

      return res.status(200).json({
        success: true,
        data: history,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch portfolio history',
      });
    }
  }

  static async getTransactions(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { symbol, tradeType, sortBy, sortOrder } = req.query;
      const trades = await TradingService.getUserTrades(req.user.userId, {
        symbol: typeof symbol === 'string' ? symbol : undefined,
        tradeType: (tradeType as any) || undefined,
        sortBy: (sortBy as any) || undefined,
        sortOrder: (sortOrder as any) || undefined,
      });

      return res.status(200).json({
        success: true,
        count: trades.length,
        data: trades,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch transactions',
      });
    }
  }

  static async exportTransactionsCsv(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const trades = await TradingService.getUserTrades(req.user.userId);

      const headers = ['Transaction ID', 'Date & Time', 'Symbol', 'Company Name', 'Type', 'Quantity', 'Execution Price (INR)', 'Total Amount (INR)', 'Cash Balance (INR)'];
      const rows = trades.map((t) => [
        t.id,
        `"${t.createdAt}"`,
        t.symbol,
        `"${t.stockName}"`,
        t.tradeType,
        t.quantity,
        t.executionPrice.toFixed(2),
        t.totalAmount.toFixed(2),
        t.cashAfterTrade.toFixed(2),
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="investlab_transactions.csv"');
      return res.status(200).send(csvContent);
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to export transactions',
      });
    }
  }
}
