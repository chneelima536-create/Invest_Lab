import crypto from 'crypto';
import { memoryDb } from '../db/index.js';
import { WatchlistEntry } from '../types/index.js';
import { StocksService } from './stocksService.js';

export class WatchlistService {
  static async getUserWatchlist(userId: string): Promise<WatchlistEntry[]> {
    const watchlistMap = memoryDb.getWatchlistMap();
    const allStocks = await StocksService.getAllStocks();
    const stockMap = new Map(allStocks.map((s) => [s.symbol, s]));

    const entries: WatchlistEntry[] = [];
    for (const [key, item] of watchlistMap.entries()) {
      if (!key.startsWith(`${userId}:`)) continue;

      const stock = stockMap.get(item.symbol);
      entries.push({
        id: item.id,
        userId,
        symbol: item.symbol,
        addedAt: item.added_at || item.addedAt || new Date().toISOString(),
        stock,
      });
    }

    return entries;
  }

  static async addToWatchlist(userId: string, symbol: string): Promise<WatchlistEntry> {
    const cleanSymbol = symbol.trim().toUpperCase();
    const stock = await StocksService.getStockBySymbol(cleanSymbol);
    if (!stock) {
      throw new Error(`Stock symbol not found: ${cleanSymbol}`);
    }

    const watchlistMap = memoryDb.getWatchlistMap();
    const key = `${userId}:${cleanSymbol}`;

    if (watchlistMap.has(key)) {
      const existing = watchlistMap.get(key);
      return {
        id: existing.id,
        userId,
        symbol: cleanSymbol,
        addedAt: existing.added_at || existing.addedAt,
        stock,
      };
    }

    const entry = {
      id: `wtc_${crypto.randomUUID()}`,
      user_id: userId,
      userId,
      symbol: cleanSymbol,
      added_at: new Date().toISOString(),
      addedAt: new Date().toISOString(),
    };

    watchlistMap.set(key, entry);

    return {
      id: entry.id,
      userId,
      symbol: cleanSymbol,
      addedAt: entry.addedAt,
      stock,
    };
  }

  static async removeFromWatchlist(userId: string, symbol: string): Promise<boolean> {
    const cleanSymbol = symbol.trim().toUpperCase();
    const watchlistMap = memoryDb.getWatchlistMap();
    const key = `${userId}:${cleanSymbol}`;

    if (watchlistMap.has(key)) {
      watchlistMap.delete(key);
      return true;
    }
    return false;
  }
}
