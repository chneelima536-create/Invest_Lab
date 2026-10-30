import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/authService.js';
import { AuthRequest } from '../middleware/auth.js';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: parsed.error.errors[0]?.message || 'Validation error',
        });
      }

      const { fullName, email, password } = parsed.data;
      const result = await AuthService.register(fullName, email, password);

      return res.status(201).json({
        success: true,
        message: 'Account successfully created. ₹1,00,000 virtual cash credited.',
        data: result,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: err.message || 'Registration failed',
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: parsed.error.errors[0]?.message || 'Validation error',
        });
      }

      const { email, password } = parsed.data;
      const result = await AuthService.login(email, password);

      return res.status(200).json({
        success: true,
        message: 'Successfully logged in.',
        data: result,
      });
    } catch (err: any) {
      return res.status(401).json({
        success: false,
        error: err.message || 'Login failed',
      });
    }
  }

  static async demoLogin(req: Request, res: Response) {
    try {
      const result = await AuthService.demoLogin();
      return res.status(200).json({
        success: true,
        message: 'Signed in with demo sandbox account.',
        data: result,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Demo login failed',
      });
    }
  }

  static async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const user = await AuthService.getUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch profile',
      });
    }
  }

  static async resetPortfolio(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await AuthService.resetPortfolio(req.user.userId);
      return res.status(200).json({
        success: true,
        message: 'Virtual portfolio and cash balance reset to ₹1,00,000.',
        data: result,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to reset portfolio',
      });
    }
  }
}
