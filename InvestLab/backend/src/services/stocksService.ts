import { memoryDb } from '../db/index.js';
import { Stock, StockPricePoint } from '../types/index.js';

export class StocksService {
  static async getAllStocks(params?: {
    search?: string;
    sector?: string;
    sortBy?: 'name' | 'price' | 'changePercent';
    sortOrder?: 'asc' | 'desc';
  }): Promise<Stock[]> {
    const stocksMap = memoryDb.getStocksMap();
    let list: Stock[] = Array.from(stocksMap.values()).map((s) => ({
      symbol: s.symbol,
      name: s.name,
      sector: s.sector,
      price: Number(s.price),
      changeAmount: Number(s.change_amount ?? s.changeAmount ?? 0),
      changePercent: Number(s.change_percent ?? s.changePercent ?? 0),
      peRatio: s.pe_ratio ? Number(s.pe_ratio) : undefined,
      eps: s.eps ? Number(s.eps) : undefined,
      marketCapCr: s.market_cap_cr ? Number(s.market_cap_cr) : undefined,
      revenueCr: s.revenue_cr ? Number(s.revenue_cr) : undefined,
      netProfitCr: s.net_profit_cr ? Number(s.net_profit_cr) : undefined,
      dividendYield: s.dividend_yield ? Number(s.dividend_yield) : undefined,
      high52w: s.high_52w ? Number(s.high_52w) : undefined,
      low52w: s.low_52w ? Number(s.low_52w) : undefined,
      description: s.description,
      isDemo: Boolean(s.is_demo ?? true),
      lastUpdated: s.last_updated || new Date().toISOString(),
    }));

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      );
    }

    if (params?.sector && params.sector !== 'ALL') {
      list = list.filter((s) => s.sector === params.sector);
    }

    if (params?.sortBy) {
      const field = params.sortBy;
      const order = params.sortOrder === 'desc' ? -1 : 1;
      list.sort((a, b) => {
        if (field === 'name') return order * a.name.localeCompare(b.name);
        return order * ((a[field] ?? 0) - (b[field] ?? 0));
      });
    }

    return list;
  }

  static async getStockBySymbol(symbol: string): Promise<Stock | null> {
    const stocksMap = memoryDb.getStocksMap();
    const s = stocksMap.get(symbol.toUpperCase());
    if (!s) return null;

    return {
      symbol: s.symbol,
      name: s.name,
      sector: s.sector,
      price: Number(s.price),
      changeAmount: Number(s.change_amount ?? s.changeAmount ?? 0),
      changePercent: Number(s.change_percent ?? s.changePercent ?? 0),
      peRatio: s.pe_ratio ? Number(s.pe_ratio) : undefined,
      eps: s.eps ? Number(s.eps) : undefined,
      marketCapCr: s.market_cap_cr ? Number(s.market_cap_cr) : undefined,
      revenueCr: s.revenue_cr ? Number(s.revenue_cr) : undefined,
      netProfitCr: s.net_profit_cr ? Number(s.net_profit_cr) : undefined,
      dividendYield: s.dividend_yield ? Number(s.dividend_yield) : undefined,
      high52w: s.high_52w ? Number(s.high_52w) : undefined,
      low52w: s.low_52w ? Number(s.low_52w) : undefined,
      description: s.description,
      isDemo: Boolean(s.is_demo ?? true),
      lastUpdated: s.last_updated || new Date().toISOString(),
    };
  }

  static async getStockHistory(symbol: string, timeframe: '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL' = '1M'): Promise<StockPricePoint[]> {
    const stock = await this.getStockBySymbol(symbol);
    if (!stock) throw new Error(`Stock not found: ${symbol}`);

    let pointsCount = 30;
    let daysStep = 1;

    switch (timeframe) {
      case '1W':
        pointsCount = 7;
        daysStep = 1;
        break;
      case '1M':
        pointsCount = 30;
        daysStep = 1;
        break;
      case '3M':
        pointsCount = 45;
        daysStep = 2;
        break;
      case '6M':
        pointsCount = 60;
        daysStep = 3;
        break;
      case '1Y':
        pointsCount = 52;
        daysStep = 7;
        break;
      case 'ALL':
        pointsCount = 80;
        daysStep = 10;
        break;
    }

    const currentPrice = stock.price;
    const history: StockPricePoint[] = [];
    const now = new Date();

    // Deterministic pseudo-random seed based on symbol characters
    let seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 100);
    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Generate backward from current price
    let runningPrice = currentPrice;
    const rawPoints: { date: string; close: number }[] = [];

    for (let i = 0; i < pointsCount; i++) {
      const d = new Date(now.getTime() - i * daysStep * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      rawPoints.push({ date: dateStr, close: Number(runningPrice.toFixed(2)) });

      // Daily fluctuation +/- 1.8%
      const deltaPercent = (pseudoRandom() - 0.49) * 0.035;
      runningPrice = runningPrice / (1 + deltaPercent);
    }

    rawPoints.reverse();

    for (let i = 0; i < rawPoints.length; i++) {
      const close = rawPoints[i].close;
      const open = i > 0 ? rawPoints[i - 1].close : close * 0.995;
      const high = Math.max(open, close) * (1 + pseudoRandom() * 0.012);
      const low = Math.min(open, close) * (1 - pseudoRandom() * 0.012);
      const volume = Math.floor(50000 + pseudoRandom() * 150000);

      history.push({
        date: rawPoints[i].date,
        price: close,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume,
      });
    }

    return history;
  }
}
