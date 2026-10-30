import { Router } from 'express';
import { StocksController } from '../controllers/stocksController.js';

const router = Router();

router.get('/', StocksController.getStocks);
router.get('/:symbol', StocksController.getStockBySymbol);
router.get('/:symbol/history', StocksController.getStockHistory);

export default router;
