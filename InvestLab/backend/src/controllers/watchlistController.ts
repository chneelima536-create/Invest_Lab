import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { WatchlistService } from '../services/watchlistService.js';

const addWatchlistSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
});

export class WatchlistController {
  static async getWatchlist(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const list = await WatchlistService.getUserWatchlist(req.user.userId);
      return res.status(200).json({
        success: true,
        count: list.length,
        data: list,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch watchlist',
      });
    }
  }

  static async addToWatchlist(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const parsed = addWatchlistSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: parsed.error.errors[0]?.message || 'Invalid symbol',
        });
      }

      const result = await WatchlistService.addToWatchlist(req.user.userId, parsed.data.symbol);
      return res.status(201).json({
        success: true,
        message: `${parsed.data.symbol.toUpperCase()} added to watchlist`,
        data: result,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: err.message || 'Failed to add to watchlist',
      });
    }
  }

  static async removeFromWatchlist(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { symbol } = req.params;
      const removed = await WatchlistService.removeFromWatchlist(req.user.userId, symbol);

      return res.status(200).json({
        success: true,
        message: removed
          ? `${symbol.toUpperCase()} removed from watchlist`
          : `${symbol.toUpperCase()} was not in watchlist`,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to remove from watchlist',
      });
    }
  }
}
