import { Request, Response } from 'express';
import { z } from 'zod';
import { SipService } from '../services/sipService.js';

const sipSchema = z.object({
  monthlyInvestment: z.number().positive('Monthly investment must be greater than 0'),
  durationYears: z.number().int().min(1, 'Duration must be at least 1 year').max(50, 'Duration cannot exceed 50 years'),
  annualReturnRatePercent: z.number().min(0, 'Return rate cannot be negative').max(100, 'Return rate cannot exceed 100%'),
});

export class SipController {
  static calculate(req: Request, res: Response) {
    try {
      const parsed = sipSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: parsed.error.errors[0]?.message || 'Invalid parameters',
        });
      }

      const { monthlyInvestment, durationYears, annualReturnRatePercent } = parsed.data;
      const result = SipService.calculateSIP(monthlyInvestment, durationYears, annualReturnRatePercent);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: err.message || 'SIP calculation failed',
      });
    }
  }
}
