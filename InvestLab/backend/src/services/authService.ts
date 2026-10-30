import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { memoryDb } from '../db/index.js';
import { config } from '../config/index.js';
import { User } from '../types/index.js';

export class AuthService {
  static async register(fullName: string, email: string, password: string):Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const usersMap = memoryDb.getUsersMap();

    // Check if user already exists
    if (usersMap.has(cleanEmail)) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `usr_${crypto.randomUUID()}`;

    const newUser: User = {
      id: userId,
      fullName: fullName.trim(),
      email: cleanEmail,
      passwordHash,
      virtualCash: config.demoStartingCash, // Exactly ₹1,00,000.00
      isDemoAccount: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    usersMap.set(userId, newUser);
    usersMap.set(cleanEmail, newUser);

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword, token };
  }

  static async login(email: string, password: string): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const usersMap = memoryDb.getUsersMap();

    const user = usersMap.get(cleanEmail);
    if (!user) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash || user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.id,
        fullName: user.fullName || user.full_name,
        email: user.email,
        virtualCash: Number(user.virtualCash ?? user.virtual_cash),
        isDemoAccount: Boolean(user.isDemoAccount ?? user.is_demo_account),
        createdAt: user.createdAt || user.created_at,
        updatedAt: user.updatedAt || user.updated_at,
      },
      token,
    };
  }

  static async demoLogin(): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    const usersMap = memoryDb.getUsersMap();
    const demoUser = usersMap.get('demo@investlab.in');

    if (!demoUser) {
      throw new Error('Demo user account not found.');
    }

    const token = jwt.sign(
      { userId: demoUser.id, email: demoUser.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: demoUser.id,
        fullName: demoUser.fullName || demoUser.full_name,
        email: demoUser.email,
        virtualCash: Number(demoUser.virtualCash ?? demoUser.virtual_cash),
        isDemoAccount: true,
        createdAt: demoUser.createdAt || demoUser.created_at,
        updatedAt: demoUser.updatedAt || demoUser.updated_at,
      },
      token,
    };
  }

  static async getUserById(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
    const usersMap = memoryDb.getUsersMap();
    const user = usersMap.get(userId);
    if (!user) return null;

    return {
      id: user.id,
      fullName: user.fullName || user.full_name,
      email: user.email,
      virtualCash: Number(user.virtualCash ?? user.virtual_cash),
      isDemoAccount: Boolean(user.isDemoAccount ?? user.is_demo_account),
      createdAt: user.createdAt || user.created_at,
      updatedAt: user.updatedAt || user.updated_at,
    };
  }

  static async resetPortfolio(userId: string): Promise<{ virtualCash: number }> {
    const usersMap = memoryDb.getUsersMap();
    const user = usersMap.get(userId);
    if (!user) throw new Error('User not found');

    // Reset cash to ₹1,00,000
    user.virtual_cash = config.demoStartingCash;
    user.virtualCash = config.demoStartingCash;
    user.updated_at = new Date().toISOString();

    // Clear holdings for user
    const holdingsMap = memoryDb.getHoldingsMap();
    for (const key of Array.from(holdingsMap.keys())) {
      if (key.startsWith(`${userId}:`)) {
        holdingsMap.delete(key);
      }
    }

    // Keep watchlist intact or reset trades
    const trades = memoryDb.getTradesList();
    const filteredTrades = trades.filter((t) => t.user_id !== userId && t.userId !== userId);
    trades.length = 0;
    trades.push(...filteredTrades);

    return { virtualCash: config.demoStartingCash };
  }
}
