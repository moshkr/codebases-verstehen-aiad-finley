import { DataPoint, RollingWindowResult, RollingWindowConfig } from '@/types';
import { calculateReturns, calculateMaxDrawdown } from '../portfolio/calculator';
import { standardDeviation } from 'simple-statistics';
import { yearsBetween } from '../utils/date';

/**
 * Performs rolling window analysis on portfolio historical data
 *
 * This analyzes how the portfolio would have performed if invested
 * for a specific time window at different starting points in history
 *
 * @param portfolioHistory - Historical portfolio values
 * @param config - Rolling window configuration
 * @returns Array of rolling window results
 */
export function performRollingWindowAnalysis(
  portfolioHistory: DataPoint[],
  config: RollingWindowConfig
): RollingWindowResult[] {
  const { windowYears } = config;
  const results: RollingWindowResult[] = [];

  // Calculate window size in months (assuming monthly data)
  const windowMonths = windowYears * 12;

  // Slide the window through the data
  for (let i = 0; i <= portfolioHistory.length - windowMonths; i++) {
    const windowData = portfolioHistory.slice(i, i + windowMonths);

    if (windowData.length < 2) continue;

    const startDate = windowData[0].date;
    const endDate = windowData[windowData.length - 1].date;

    // Calculate metrics for this window
    const values = windowData.map(p => p.value);
    const returns = calculateReturns(values);

    // Annualized return
    const startValue = values[0];
    const endValue = values[values.length - 1];
    const years = yearsBetween(startDate, endDate);
    const totalReturn = (endValue - startValue) / startValue;
    const returnPA = years > 0 ? Math.pow(1 + totalReturn, 1 / years) - 1 : 0;

    // Annualized volatility
    const monthlyVolatility = returns.length > 1 ? standardDeviation(returns) : 0;
    const volatilityPA = monthlyVolatility * Math.sqrt(12);

    // Maximum drawdown
    const maxDrawdown = calculateMaxDrawdown(values);

    results.push({
      startDate,
      endDate,
      returnPA,
      volatilityPA,
      maxDrawdown
    });
  }

  return results;
}

/**
 * Calculates summary statistics from rolling window results
 */
export function calculateRollingWindowStatistics(results: RollingWindowResult[]): {
  avgReturn: number;
  minReturn: number;
  maxReturn: number;
  avgVolatility: number;
  avgMaxDrawdown: number;
  worstDrawdown: number;
} {
  if (results.length === 0) {
    return {
      avgReturn: 0,
      minReturn: 0,
      maxReturn: 0,
      avgVolatility: 0,
      avgMaxDrawdown: 0,
      worstDrawdown: 0
    };
  }

  const returns = results.map(r => r.returnPA);
  const volatilities = results.map(r => r.volatilityPA);
  const drawdowns = results.map(r => r.maxDrawdown);

  return {
    avgReturn: returns.reduce((sum, r) => sum + r, 0) / returns.length,
    minReturn: Math.min(...returns),
    maxReturn: Math.max(...returns),
    avgVolatility: volatilities.reduce((sum, v) => sum + v, 0) / volatilities.length,
    avgMaxDrawdown: drawdowns.reduce((sum, d) => sum + d, 0) / drawdowns.length,
    worstDrawdown: Math.max(...drawdowns)
  };
}

/**
 * Helper to get common rolling window configurations
 */
export const COMMON_WINDOWS: RollingWindowConfig[] = [
  { windowYears: 1 },
  { windowYears: 5 },
  { windowYears: 10 },
  { windowYears: 20 }
];
