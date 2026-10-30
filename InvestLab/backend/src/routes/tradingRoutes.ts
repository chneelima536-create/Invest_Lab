import { Router } from 'express';
import { TradingController } from '../controllers/tradingController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Protected trading actions
router.post('/buy', authenticateToken, TradingController.buy);
router.post('/sell', authenticateToken, TradingController.sell);
router.get('/portfolio', authenticateToken, TradingController.getPortfolio);
router.get('/portfolio/history', authenticateToken, TradingController.getPortfolioHistory);
router.get('/transactions', authenticateToken, TradingController.getTransactions);
router.get('/transactions/export', authenticateToken, TradingController.exportTransactionsCsv);

export default router;
