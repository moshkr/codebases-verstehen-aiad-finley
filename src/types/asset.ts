import { MarketMood } from './index';

/**
 * Represents a single data point in a time series
 */
export interface DataPoint {
  date: string;
  value: number;
  mood?: MarketMood;
}

/**
 * Parameters for Geometric Brownian Motion simulation
 */
export interface GBMParams {
  mu: number;    // Drift (expected return)
  sigma: number; // Volatility (standard deviation)
}

/**
 * Represents a financial instrument with historical data
 */
export interface Asset {
  id: string;
  name: string;
  color: string;
  params: GBMParams;
  history: DataPoint[];
}
