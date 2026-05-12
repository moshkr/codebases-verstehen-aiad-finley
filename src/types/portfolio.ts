import { DataPoint } from './asset';

/**
 * Represents a single position in the portfolio
 */
export interface PortfolioItem {
  assetId: string;
  shares: number;
}

/**
 * Portfolio performance metrics
 */
export interface PortfolioMetrics {
  totalValue: number;
  returnPA: number;      // Annualized return percentage
  volatilityPA: number;  // Annualized volatility
  maxDrawdown: number;   // Maximum drawdown percentage
}

/**
 * Historical portfolio value over time
 */
export interface PortfolioHistory {
  data: DataPoint[];
  metrics: PortfolioMetrics;
}
