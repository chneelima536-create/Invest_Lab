import { SIPCalculationResult } from '../types/index.js';

export class SipService {
  /**
   * Calculate SIP (Systematic Investment Plan) future value with monthly compounding
   * Formula: FV = P * [ ((1 + r)^n - 1) / r ]
   * Where:
   *   P = Monthly investment amount
   *   r = Monthly return rate (annual rate / 12 / 100)
   *   n = Total number of months (years * 12)
   * For r = 0, FV = P * n
   */
  static calculateSIP(
    monthlyInvestment: number,
    durationYears: number,
    annualReturnRatePercent: number
  ): SIPCalculationResult {
    // 1. Validation
    if (monthlyInvestment <= 0) {
      throw new Error('Monthly investment amount must be greater than 0.');
    }
    if (durationYears <= 0 || durationYears > 50) {
      throw new Error('Investment duration must be between 1 and 50 years.');
    }
    if (annualReturnRatePercent < 0 || annualReturnRatePercent > 100) {
      throw new Error('Annual return rate must be between 0% and 100%.');
    }

    const P = monthlyInvestment;
    const totalMonths = durationYears * 12;
    const totalInvested = Number((P * totalMonths).toFixed(2));

    let finalValue = 0;
    const r = annualReturnRatePercent / 100 / 12;

    if (r === 0) {
      finalValue = totalInvested;
    } else {
      finalValue = Number((P * ((Math.pow(1 + r, totalMonths) - 1) / r)).toFixed(2));
    }

    const wealthGained = Number((finalValue - totalInvested).toFixed(2));

    // Year-by-year amortization breakdown
    const yearlyBreakdown: SIPCalculationResult['yearlyBreakdown'] = [];

    for (let yr = 1; yr <= durationYears; yr++) {
      const months = yr * 12;
      const investedSoFar = Number((P * months).toFixed(2));
      let estimatedVal = 0;

      if (r === 0) {
        estimatedVal = investedSoFar;
      } else {
        estimatedVal = Number((P * ((Math.pow(1 + r, months) - 1) / r)).toFixed(2));
      }

      yearlyBreakdown.push({
        year: yr,
        investedSoFar,
        estimatedValue: estimatedVal,
        wealthGained: Number((estimatedVal - investedSoFar).toFixed(2)),
      });
    }

    return {
      monthlyInvestment,
      durationYears,
      annualReturnRatePercent,
      totalInvested,
      estimatedWealthGained: wealthGained,
      estimatedFinalValue: finalValue,
      formulaUsed: 'FV = P * [((1 + r)^n - 1) / r], where r = annual_rate/12 and n = months',
      disclaimer: 'Mutual fund investments are subject to market risks. Simulated projections are for educational purposes only and do not guarantee actual returns.',
      yearlyBreakdown,
    };
  }
}
