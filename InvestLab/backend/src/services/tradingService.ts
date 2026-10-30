import crypto from 'crypto';
import { memoryDb } from '../db/index.js';
import { Trade, Holding } from '../types/index.js';
import { StocksService } from './stocksService.js';

export class TradingService {
  /**
   * Execute a simulated BUY order
   */
  static async executeBuy(
    userId: string,
    symbol: string,
    quantity: number
  ): Promise<{
    trade: Trade;
    holding: Holding;
    remainingCash: number;
    disclaimer: string;
  }> {
    const cleanSymbol = symbol.trim().toUpperCase();

    // 1. Validation
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Quantity must be a positive whole number greater than 0.');
    }

    const stock = await StocksService.getStockBySymbol(cleanSymbol);
    if (!stock) {
      throw new Error(`Invalid stock symbol: ${cleanSymbol}`);
    }

    const usersMap = memoryDb.getUsersMap();
    const user = usersMap.get(userId);
    if (!user) {
      throw new Error('User account not found.');
    }

    const executionPrice = stock.price;
    const totalCost = Number((executionPrice * quantity).toFixed(2));
    const currentCash = Number(user.virtual_cash ?? user.virtualCash ?? 0);

    if (currentCash < totalCost) {
      throw new Error(
        `Insufficient virtual cash. Required: ₹${totalCost.toLocaleString('en-IN')}, Available: ₹${currentCash.toLocaleString('en-IN')}`
      );
    }

    // 2. Deduct virtual cash
    const cashAfterTrade = Number((currentCash - totalCost).toFixed(2));
    user.virtual_cash = cashAfterTrade;
    user.virtualCash = cashAfterTrade;
    user.updated_at = new Date().toISOString();

    // 3. Update holdings using weighted-average cost basis
    const holdingsMap = memoryDb.getHoldingsMap();
    const holdingKey = `${userId}:${cleanSymbol}`;
    let holding = holdingsMap.get(holdingKey);

    if (holding && holding.quantity > 0) {
      const oldQty = Number(holding.quantity);
      const oldInvested = Number(holding.total_invested ?? holding.totalInvested);
      const newQty = oldQty + quantity;
      const newTotalInvested = Number((oldInvested + totalCost).toFixed(2));
      const newAvgPrice = Number((newTotalInvested / newQty).toFixed(2));

      holding.quantity = newQty;
      holding.total_invested = newTotalInvested;
      holding.totalInvested = newTotalInvested;
      holding.average_buy_price = newAvgPrice;
      holding.averageBuyPrice = newAvgPrice;
      holding.updated_at = new Date().toISOString();
    } else {
      holding = {
        id: `hld_${crypto.randomUUID()}`,
        user_id: userId,
        userId,
        symbol: cleanSymbol,
        quantity,
        average_buy_price: executionPrice,
        averageBuyPrice: executionPrice,
        total_invested: totalCost,
        totalInvested: totalCost,
        realized_pnl: holding ? Number(holding.realized_pnl ?? holding.realizedPnl ?? 0) : 0,
        realizedPnl: holding ? Number(holding.realized_pnl ?? holding.realizedPnl ?? 0) : 0,
        updated_at: new Date().toISOString(),
      };
      holdingsMap.set(holdingKey, holding);
    }

    // 4. Record Trade Ledger entry
    const trade: Trade = {
      id: `trd_${crypto.randomUUID()}`,
      userId,
      symbol: cleanSymbol,
      stockName: stock.name,
      tradeType: 'BUY',
      quantity,
      executionPrice,
      totalAmount: totalCost,
      cashAfterTrade,
      notes: `Simulated purchase of ${quantity} shares of ${stock.name}`,
      createdAt: new Date().toISOString(),
    };

    memoryDb.getTradesList().unshift(trade);

    return {
      trade,
      holding: {
        id: holding.id,
        userId: holding.user_id || holding.userId,
        symbol: holding.symbol,
        quantity: Number(holding.quantity),
        averageBuyPrice: Number(holding.average_buy_price || holding.averageBuyPrice),
        totalInvested: Number(holding.total_invested || holding.totalInvested),
        realizedPnl: Number(holding.realized_pnl || holding.realizedPnl || 0),
        updatedAt: holding.updated_at || holding.updatedAt,
      },
      remainingCash: cashAfterTrade,
      disclaimer: 'This is a simulated transaction. No real money or stock-market order is involved.',
    };
  }

  /**
   * Execute a simulated SELL order
   */
  static async executeSell(
    userId: string,
    symbol: string,
    quantity: number
  ): Promise<{
    trade: Trade;
    holding: Holding | null;
    remainingCash: number;
    realizedProfitOrLoss: number;
    disclaimer: string;
  }> {
    const cleanSymbol = symbol.trim().toUpperCase();

    // 1. Validation
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Quantity must be a positive whole number greater than 0.');
    }

    const stock = await StocksService.getStockBySymbol(cleanSymbol);
    if (!stock) {
      throw new Error(`Invalid stock symbol: ${cleanSymbol}`);
    }

    const usersMap = memoryDb.getUsersMap();
    const user = usersMap.get(userId);
    if (!user) {
      throw new Error('User account not found.');
    }

    const holdingsMap = memoryDb.getHoldingsMap();
    const holdingKey = `${userId}:${cleanSymbol}`;
    const holding = holdingsMap.get(holdingKey);

    const ownedQty = holding ? Number(holding.quantity) : 0;
    if (ownedQty < quantity) {
      throw new Error(
        `Cannot oversell. You own ${ownedQty} shares of ${cleanSymbol}, but attempted to sell ${quantity}.`
      );
    }

    const executionPrice = stock.price;
    const saleProceeds = Number((executionPrice * quantity).toFixed(2));
    const avgCost = Number(holding.average_buy_price ?? holding.averageBuyPrice);
    const costBasisForSoldShares = Number((avgCost * quantity).toFixed(2));
    const realizedPnlOnSale = Number((saleProceeds - costBasisForSoldShares).toFixed(2));

    // 2. Credit virtual cash
    const currentCash = Number(user.virtual_cash ?? user.virtualCash ?? 0);
    const cashAfterTrade = Number((currentCash + saleProceeds).toFixed(2));
    user.virtual_cash = cashAfterTrade;
    user.virtualCash = cashAfterTrade;
    user.updated_at = new Date().toISOString();

    // 3. Update holdings with partial or complete sale
    const remainingQty = ownedQty - quantity;
    const existingRealizedPnl = Number(holding.realized_pnl ?? holding.realizedPnl ?? 0);
    const newTotalRealizedPnl = Number((existingRealizedPnl + realizedPnlOnSale).toFixed(2));

    if (remainingQty === 0) {
      holding.quantity = 0;
      holding.total_invested = 0;
      holding.totalInvested = 0;
      holding.average_buy_price = 0;
      holding.averageBuyPrice = 0;
      holding.realized_pnl = newTotalRealizedPnl;
      holding.realizedPnl = newTotalRealizedPnl;
      holding.updated_at = new Date().toISOString();
    } else {
      const newTotalInvested = Number((avgCost * remainingQty).toFixed(2));
      holding.quantity = remainingQty;
      holding.total_invested = newTotalInvested;
      holding.totalInvested = newTotalInvested;
      holding.realized_pnl = newTotalRealizedPnl;
      holding.realizedPnl = newTotalRealizedPnl;
      holding.updated_at = new Date().toISOString();
    }

    // 4. Record Trade Ledger entry
    const trade: Trade = {
      id: `trd_${crypto.randomUUID()}`,
      userId,
      symbol: cleanSymbol,
      stockName: stock.name,
      tradeType: 'SELL',
      quantity,
      executionPrice,
      totalAmount: saleProceeds,
      cashAfterTrade,
      notes: `Simulated sale of ${quantity} shares of ${stock.name}. Realized P&L: ₹${realizedPnlOnSale >= 0 ? '+' : ''}${realizedPnlOnSale.toLocaleString('en-IN')}`,
      createdAt: new Date().toISOString(),
    };

    memoryDb.getTradesList().unshift(trade);

    return {
      trade,
      holding: {
        id: holding.id,
        userId: holding.user_id || holding.userId,
        symbol: holding.symbol,
        quantity: Number(holding.quantity),
        averageBuyPrice: Number(holding.average_buy_price || holding.averageBuyPrice),
        totalInvested: Number(holding.total_invested || holding.totalInvested),
        realizedPnl: Number(holding.realized_pnl || holding.realizedPnl),
        updatedAt: holding.updated_at || holding.updatedAt,
      },
      remainingCash: cashAfterTrade,
      realizedProfitOrLoss: realizedPnlOnSale,
      disclaimer: 'This is a simulated transaction. No real money or stock-market order is involved.',
    };
  }

  /**
   * Get all transactions for a user with filtering, sorting and pagination
   */
  static async getUserTrades(
    userId: string,
    filter?: {
      symbol?: string;
      tradeType?: 'BUY' | 'SELL' | 'ALL';
      sortBy?: 'date' | 'amount';
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<Trade[]> {
    const allTrades = memoryDb.getTradesList();
    let userTrades = allTrades.filter(
      (t) => (t.user_id === userId || t.userId === userId)
    );

    if (filter?.symbol) {
      const sym = filter.symbol.toUpperCase().trim();
      userTrades = userTrades.filter((t) => t.symbol === sym);
    }

    if (filter?.tradeType && filter.tradeType !== 'ALL') {
      userTrades = userTrades.filter((t) => (t.trade_type || t.tradeType) === filter.tradeType);
    }

    userTrades.sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt).getTime();
      const dateB = new Date(b.created_at || b.createdAt).getTime();
      return filter?.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return userTrades.map((t) => ({
      id: t.id,
      userId: t.user_id || t.userId,
      symbol: t.symbol,
      stockName: t.stock_name || t.stockName,
      tradeType: t.trade_type || t.tradeType,
      quantity: Number(t.quantity),
      executionPrice: Number(t.execution_price || t.executionPrice),
      totalAmount: Number(t.total_amount || t.totalAmount),
      cashAfterTrade: Number(t.cash_after_trade || t.cashAfterTrade),
      notes: t.notes,
      createdAt: t.created_at || t.createdAt,
    }));
  }
}
