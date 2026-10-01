import { Asset, DataPoint, PortfolioItem, PortfolioHistory, PortfolioMetrics } from '@/types';
import { standardDeviation } from 'simple-statistics';
import { yearsBetween } from '../utils/date';

/**
 * Calculates the historical value of a portfolio over time
 *
 * Formula: P(t) = Σ(w_i * S_i(t))
 * where w_i is the number of shares and S_i(t) is the price of asset i at time t
 *
 * @param assets - Array of all available assets
 * @param portfolio - Array of portfolio items (asset ID + shares)
 * @returns Array of DataPoints representing portfolio value over time
 *
 * Hilfskommentar:
 * - Portfoliowert pro Monat = Summe aus (Anzahl Aktien × Kurs) aller Positionen
 * - Beispiel: 10 × 50 € + 5 × 100 € = 1.000 €
 * - Ändert der Nutzer die Anzahl, wird alles neu berechnet
 * - Die Kurse selbst ändern sich dabei nicht – nur die Gewichtung im Portfolio
 */
export function calculatePortfolioValue(
  assets: Asset[],
  portfolio: PortfolioItem[]
): DataPoint[] {
  if (portfolio.length === 0) {
    return [];
  }

  // Get the first asset's history to determine the date range
  const firstAsset = assets.find(a => a.id === portfolio[0].assetId);
  if (!firstAsset) return [];

  const portfolioValue: DataPoint[] = [];

  // For each time point, calculate the total portfolio value
  for (let i = 0; i < firstAsset.history.length; i++) {
    const date = firstAsset.history[i].date;
    let totalValue = 0;

    // Sum up the value of all positions
    for (const item of portfolio) {
      const asset = assets.find(a => a.id === item.assetId);
      if (asset && asset.history[i]) {
        totalValue += item.shares * asset.history[i].value;
      }
    }

    portfolioValue.push({ date, value: totalValue });
  }

  return portfolioValue;
}

/**
 * Calculates portfolio performance metrics
 *
 * @param portfolioValue - Historical portfolio values
 * @returns Portfolio metrics (return, volatility, max drawdown)
 *
 * Hilfskommentar:
 * - Rendite p. a.: durchschnittlicher Gewinn pro Jahr (mit Zinseszins)
 *   → (Endwert / Startwert) ^ (1 / Jahre) − 1
 * - Volatilität p. a.: wie stark der Wert schwankt
 *   → Standardabweichung der Monatsrenditen × √12 (Umrechnung auf ein Jahr)
 * - Max Drawdown: größter Verlust vom Höchststand bis zum Tiefpunkt danach
 */
export function calculatePortfolioMetrics(
  portfolioValue: DataPoint[]
): PortfolioMetrics {
  if (portfolioValue.length < 2) {
    return {
      totalValue: portfolioValue[0]?.value || 0,
      returnPA: 0,
      volatilityPA: 0,
      maxDrawdown: 0
    };
  }

  const values = portfolioValue.map(p => p.value);
  const returns = calculateReturns(values);

  // Calculate annualized return
  const startValue = values[0];
  const endValue = values[values.length - 1];
  const startDate = portfolioValue[0].date;
  const endDate = portfolioValue[portfolioValue.length - 1].date;
  const years = yearsBetween(startDate, endDate);

  const totalReturn = (endValue - startValue) / startValue;
  const returnPA = years > 0 ? Math.pow(1 + totalReturn, 1 / years) - 1 : 0;

  // Calculate annualized volatility
  // Monthly volatility * sqrt(12) = Annualized volatility
  const monthlyVolatility = returns.length > 1 ? standardDeviation(returns) : 0;
  const volatilityPA = monthlyVolatility * Math.sqrt(12);

  // Calculate maximum drawdown
  const maxDrawdown = calculateMaxDrawdown(values);

  return {
    totalValue: endValue,
    returnPA,
    volatilityPA,
    maxDrawdown
  };
}

/**
 * Calculates returns from a series of values
 * Returns are calculated as: (V_t - V_{t-1}) / V_{t-1}
 */
export function calculateReturns(values: number[]): number[] {
  const returns: number[] = [];

  for (let i = 1; i < values.length; i++) {
    const returnValue = (values[i] - values[i - 1]) / values[i - 1];
    returns.push(returnValue);
  }

  return returns;
}

/**
 * Calculates maximum drawdown as a percentage
 * Maximum drawdown is the largest peak-to-trough decline
 */
export function calculateMaxDrawdown(values: number[]): number {
  let maxDrawdown = 0;
  let peak = values[0];

  for (let i = 1; i < values.length; i++) {
    if (values[i] > peak) {
      peak = values[i];
    }

    const drawdown = (peak - values[i]) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
}

/**
 * Combines portfolio value calculation with metrics
 */
export function calculatePortfolioHistory(
  assets: Asset[],
  portfolio: PortfolioItem[]
): PortfolioHistory {
  const data = calculatePortfolioValue(assets, portfolio);
  const metrics = calculatePortfolioMetrics(data);

  return { data, metrics };
}

/**
 * Calculates the initial portfolio value (at first time point)
 */
export function calculateInitialValue(
  assets: Asset[],
  portfolio: PortfolioItem[]
): number {
  let totalValue = 0;

  for (const item of portfolio) {
    const asset = assets.find(a => a.id === item.assetId);
    if (asset && asset.history.length > 0) {
      totalValue += item.shares * asset.history[0].value;
    }
  }

  return totalValue;
}
