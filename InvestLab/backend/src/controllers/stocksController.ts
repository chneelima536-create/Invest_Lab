import { Request, Response } from 'express';
import { StocksService } from '../services/stocksService.js';

export class StocksController {
  static async getStocks(req: Request, res: Response) {
    try {
      const { search, sector, sortBy, sortOrder } = req.query;
      const stocks = await StocksService.getAllStocks({
        search: typeof search === 'string' ? search : undefined,
        sector: typeof sector === 'string' ? sector : undefined,
        sortBy: (sortBy as any) || undefined,
        sortOrder: (sortOrder as any) || undefined,
      });

      return res.status(200).json({
        success: true,
        count: stocks.length,
        data: stocks,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch stocks',
      });
    }
  }

  static async getStockBySymbol(req: Request, res: Response) {
    try {
      const { symbol } = req.params;
      const stock = await StocksService.getStockBySymbol(symbol);

      if (!stock) {
        return res.status(404).json({
          success: false,
          error: `Stock with symbol "${symbol}" not found in demo catalog.`,
        });
      }

      return res.status(200).json({
        success: true,
        data: stock,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch stock',
      });
    }
  }

  static async getStockHistory(req: Request, res: Response) {
    try {
      const { symbol } = req.params;
      const { timeframe } = req.query;
      const history = await StocksService.getStockHistory(
        symbol,
        (timeframe as any) || '1M'
      );

      return res.status(200).json({
        success: true,
        symbol: symbol.toUpperCase(),
        timeframe: timeframe || '1M',
        data: history,
      });
    } catch (err: any) {
      return res.status(404).json({
        success: false,
        error: err.message || 'Failed to fetch stock history',
      });
    }
  }
}
