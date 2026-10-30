import { Router } from 'express';
import { WatchlistController } from '../controllers/watchlistController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, WatchlistController.getWatchlist);
router.post('/', authenticateToken, WatchlistController.addToWatchlist);
router.delete('/:symbol', authenticateToken, WatchlistController.removeFromWatchlist);

export default router;
