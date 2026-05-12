import { DataPoint } from './asset';

/**
 * Rolling window analysis result for a specific time window
 */
export interface RollingWindowResult {
  startDate: string;
  endDate: string;
  returnPA: number;
  volatilityPA: number;
  maxDrawdown: number;
}

/**
 * Configuration for rolling window analysis
 */
export interface RollingWindowConfig {
  windowYears: number; // e.g., 1, 5, 10
}

/**
 * Result of Monte Carlo simulation with percentile paths
 */
export interface SimulationResult {
  percentile10: DataPoint[];  // Worst case (10th percentile)
  percentile50: DataPoint[];  // Median case
  percentile90: DataPoint[];  // Best case (90th percentile)
}

/**
 * Configuration for Monte Carlo simulation
 */
export interface MonteCarloConfig {
  numSimulations: number;  // e.g., 1000
  yearsToForecast: number; // e.g., 10, 20, 30
  startValue: number;      // Initial portfolio value
}
