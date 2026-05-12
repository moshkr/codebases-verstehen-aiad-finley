import { DataPoint, GBMParams, MarketMood } from '@/types';
import { boxMuller } from '../utils/random';
import { getCategorySensitivity } from '../utils/marketMath';
import seedrandom from 'seedrandom';

/**
 * Gets drift and volatility multipliers based on market mood
 */
function getMoodMultipliers(mood: MarketMood): { driftMult: number; volMult: number } {
  switch (mood) {
    case 'euphoric':
      return { driftMult: 1.5, volMult: 0.6 };
    case 'optimistic':
      return { driftMult: 1.2, volMult: 0.9 };
    case 'neutral':
      return { driftMult: 1.0, volMult: 1.0 };
    case 'fearful':
      return { driftMult: 0.5, volMult: 1.3 };
    case 'panic':
      return { driftMult: -1.5, volMult: 2.5 };
  }
}

/**
 * Generates a price path using Geometric Brownian Motion with dynamic Mood adjustments
 *
 * @param startPrice - Initial price
 * @param params - Base GBM parameters
 * @param dates - Array of date strings
 * @param moods - Array of MarketMoods (must match dates length)
 * @param category - Asset category for risk-based scaling
 * @param rng - Seeded random number generator
 */
export function generateMoodBasedGBMPath(
  startPrice: number,
  params: GBMParams,
  dates: string[],
  moods: MarketMood[],
  category: string,
  rng: seedrandom.PRNG
): DataPoint[] {
  const { mu, sigma } = params;
  const dt = 1 / 12; // Monthly time step
  
  const sensitivity = getCategorySensitivity(category);

  const path: DataPoint[] = [];
  let currentPrice = startPrice;

  for (let i = 0; i < dates.length; i++) {
    // Get mood for this step (or start neutral)
    const currentMood = moods[i] || 'neutral';

    if (i === 0) {
      path.push({ date: dates[i], value: currentPrice, mood: currentMood });
    } else {
      let { driftMult, volMult } = getMoodMultipliers(currentMood);

      // UNIFIED SENSITIVITY LOGIC
      // marketEffect is how much the mood deviates from Neutral (1.0)
      const marketEffect = driftMult - 1;

      if (marketEffect > 0) {
        // POSITIVE MOOD (Optimistic / Euphoric)
        if (sensitivity > 1.2) {
          // High-Risk Assets (Aggressive/Speculative): Use randomized triple-roll boost
          // Each roll is 0-1.0, summing to a max boost factor of 1 + 3 = 4.0
          const x = rng() * 1.0;
          const y = rng() * 1.0;
          const z = rng() * 1.0;
          
          const boostFactor = 1 + x + y + z; // Range: 1.0 to 4.0
          
          // Apply the combined sensitivity and randomized boost
          driftMult = 1 + (marketEffect * sensitivity * boostFactor);
        } else {
          // Low-Risk Assets: Linear dampening based on sensitivity
          driftMult = 1 + (marketEffect * sensitivity);
        }
      } else if (marketEffect < 0) {
        // NEGATIVE MOOD (Fearful / Panic)
        // All assets feel the downside based on their sensitivity (Beta)
        driftMult = 1 + (marketEffect * sensitivity);
      }

            const effectiveMu = mu * driftMult;

            // Volatility also scales with sensitivity

            const effectiveSigma = sigma * (1 + (volMult - 1) * sensitivity);

      

            // Generate random normal variable

            const Z = boxMuller(rng);

      

            // Apply GBM formula with effective parameters

            const drift = (effectiveMu - (effectiveSigma * effectiveSigma) / 2) * dt;

            const diffusion = effectiveSigma * Z * Math.sqrt(dt);

      

            currentPrice = currentPrice * Math.exp(drift + diffusion);

      

            path.push({ date: dates[i], value: currentPrice, mood: currentMood });

      
    }
  }

  return path;
}

/**
 * Generates a price path using Geometric Brownian Motion
 *
 * Formula: S(t+Δt) = S(t) * exp((μ - σ²/2)Δt + σ * Z * √Δt)
 * where Z is a standard normal random variable
 *
 * @param startPrice - Initial price at t=0 (e.g., $100)
 * @param params - GBM parameters (mu: drift, sigma: volatility)
 * @param dates - Array of date strings
 * @param rng - Seeded random number generator
 * @returns Array of DataPoints with historical prices
 */
export function generateGBMPath(
  startPrice: number,
  params: GBMParams,
  dates: string[],
  rng: seedrandom.PRNG
): DataPoint[] {
  const { mu, sigma } = params;
  const dt = 1 / 12; // Monthly time step (1/12 year)

  const path: DataPoint[] = [];
  let currentPrice = startPrice;

  for (let i = 0; i < dates.length; i++) {
    if (i === 0) {
      // First data point is the start price
      path.push({ date: dates[i], value: currentPrice });
    } else {
      // Generate random normal variable
      const Z = boxMuller(rng);

      // Apply GBM formula
      const drift = (mu - (sigma * sigma) / 2) * dt;
      const diffusion = sigma * Z * Math.sqrt(dt);

      currentPrice = currentPrice * Math.exp(drift + diffusion);

      path.push({ date: dates[i], value: currentPrice });
    }
  }

  return path;
}

/**
 * Batch generates multiple GBM paths efficiently
 * Useful for Monte Carlo simulations
 *
 * @param startPrice - Initial price
 * @param params - GBM parameters
 * @param numSteps - Number of time steps
 * @param numPaths - Number of paths to generate
 * @param rng - Seeded random number generator
 * @returns Array of paths, each containing values at each time step
 */
export function generateMultiplePaths(
  startPrice: number,
  params: GBMParams,
  numSteps: number,
  numPaths: number,
  rng: seedrandom.PRNG
): number[][] {
  const { mu, sigma } = params;
  const dt = 1 / 12; // Monthly time step

  const paths: number[][] = [];

  for (let p = 0; p < numPaths; p++) {
    const path: number[] = [startPrice];
    let currentPrice = startPrice;

    for (let i = 1; i < numSteps; i++) {
      const Z = boxMuller(rng);
      const drift = (mu - (sigma * sigma) / 2) * dt;
      const diffusion = sigma * Z * Math.sqrt(dt);

      currentPrice = currentPrice * Math.exp(drift + diffusion);
      path.push(currentPrice);
    }

    paths.push(path);
  }

  return paths;
}
