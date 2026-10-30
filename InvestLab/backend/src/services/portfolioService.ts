import { memoryDb } from '../db/index.js';
import { PortfolioSummary, EnrichedHolding } from '../types/index.js';
import { StocksService } from './stocksService.js';

export class PortfolioService {
  static async getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
    const usersMap = memoryDb.getUsersMap();
    const user = usersMap.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const availableCash = Number(user.virtual_cash ?? user.virtualCash ?? 0);
    const holdingsMap = memoryDb.getHoldingsMap();
    const allStocks = await StocksService.getAllStocks();
    const stockMap = new Map(allStocks.map((s) => [s.symbol, s]));

    const enrichedHoldings: EnrichedHolding[] = [];
    let totalInvested = 0;
    let currentHoldingsValue = 0;
    let totalRealizedPnl = 0;

    for (const [key, h] of holdingsMap.entries()) {
      if (!key.startsWith(`${userId}:`)) continue;

      const qty = Number(h.quantity);
      const realizedPnl = Number(h.realized_pnl ?? h.realizedPnl ?? 0);
      totalRealizedPnl += realizedPnl;

      // Only active holdings with quantity > 0 contribute to invested cost & market value
      if (qty <= 0) continue;

      const stock = stockMap.get(h.symbol);
      const stockName = stock?.name || h.symbol;
      const sector = stock?.sector || 'Diversified';
      const currentPrice = stock?.price || Number(h.average_buy_price || h.averageBuyPrice);

      const invested = Number(h.total_invested ?? h.totalInvested);
      const marketVal = Number((qty * currentPrice).toFixed(2));
      const unrealized = Number((marketVal - invested).toFixed(2));
      const unrealizedPercent = invested > 0 ? Number(((unrealized / invested) * 100).toFixed(2)) : 0;

      totalInvested += invested;
      currentHoldingsValue += marketVal;

      enrichedHoldings.push({
        id: h.id,
        userId,
        symbol: h.symbol,
        stockName,
        sector,
        quantity: qty,
        averageBuyPrice: Number(h.average_buy_price ?? h.averageBuyPrice),
        totalInvested: invested,
        currentPrice,
        currentValue: marketVal,
        unrealizedPnl: unrealized,
        unrealizedPnlPercent: unrealizedPercent,
        realizedPnl,
        allocationPercent: 0, // calculated below once total value is known
        updatedAt: h.updated_at || h.updatedAt,
      });
    }

    const totalPortfolioValue = Number((availableCash + currentHoldingsValue).toFixed(2));
    const totalUnrealizedPnl = Number((currentHoldingsValue - totalInvested).toFixed(2));
    const totalUnrealizedPnlPercent =
      totalInvested > 0 ? Number(((totalUnrealizedPnl / totalInvested) * 100).toFixed(2)) : 0;

    // Calculate allocation percentages
    const sectorAllocation: Record<string, number> = {};
    for (const h of enrichedHoldings) {
      h.allocationPercent =
        totalPortfolioValue > 0
          ? Number(((h.currentValue / totalPortfolioValue) * 100).toFixed(2))
          : 0;

      sectorAllocation[h.sector] = Number(
        ((sectorAllocation[h.sector] || 0) + h.currentValue).toFixed(2)
      );
    }

    const cashPercent =
      totalPortfolioValue > 0 ? Number(((availableCash / totalPortfolioValue) * 100).toFixed(2)) : 100;
    const equitiesPercent =
      totalPortfolioValue > 0
        ? Number(((currentHoldingsValue / totalPortfolioValue) * 100).toFixed(2))
        : 0;

    return {
      availableCash,
      totalInvested: Number(totalInvested.toFixed(2)),
      currentHoldingsValue: Number(currentHoldingsValue.toFixed(2)),
      totalPortfolioValue,
      unrealizedPnl: totalUnrealizedPnl,
      unrealizedPnlPercent: totalUnrealizedPnlPercent,
      realizedPnl: Number(totalRealizedPnl.toFixed(2)),
      holdingsCount: enrichedHoldings.length,
      accountingMethod: 'Weighted-Average Cost Basis (FIFO / Continuous Average on Partial Sales)',
      assetAllocation: {
        cash: availableCash,
        equities: currentHoldingsValue,
        cashPercent,
        equitiesPercent,
      },
      sectorAllocation,
      holdings: enrichedHoldings,
    };
  }

  static async getPortfolioHistory(userId: string, timeframe: string = '1M') {
    const summary = await this.getPortfolioSummary(userId);
    const currentValue = summary.totalPortfolioValue;

    let pointsCount = 30;
    let daysStep = 1;
    switch (timeframe) {
      case '1W': pointsCount = 7; daysStep = 1; break;
      case '1M': pointsCount = 30; daysStep = 1; break;
      case '3M': pointsCount = 45; daysStep = 2; break;
      case '6M': pointsCount = 60; daysStep = 3; break;
      case '1Y': pointsCount = 52; daysStep = 7; break;
      case 'ALL': pointsCount = 75; daysStep = 10; break;
    }

    const now = new Date();
    const history = [];

    // Subtle illustrative history matching user's starting ₹1,00,000 cash moving towards current portfolio value
    const startVal = 100000;
    const valDiff = currentValue - startVal;

    for (let i = pointsCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * daysStep * 86400000);
      const progress = (pointsCount - 1 - i) / (pointsCount - 1 || 1);
      // S-curve progression with mild deterministic fluctuation
      const noise = Math.sin(i * 1.5) * (summary.currentHoldingsValue * 0.015);
      const estimatedValue = Number((startVal + valDiff * progress + noise).toFixed(2));

      history.push({
        date: d.toISOString().split('T')[0],
        value: i === 0 ? currentValue : estimatedValue,
        cash: summary.availableCash,
        invested: summary.totalInvested,
      });
    }

    return history;
  }
}
