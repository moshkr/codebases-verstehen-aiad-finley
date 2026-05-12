/**
 * Market Events System
 * Defines historical market shocks and recoveries for realistic simulation
 */

export type AssetCategory =
  | 'ultra-safe'      // 1. Government bonds, gold reserves
  | 'very-safe'       // 2. Blue chip utilities, insurance
  | 'safe'            // 3. Established financials
  | 'conservative'    // 4. Large established companies
  | 'balanced'        // 5. Mixed companies
  | 'growth'          // 6. Growing companies
  | 'aggressive'      // 7. High growth, volatile
  | 'speculative'     // 8. Very high risk
  | 'distressed';     // 9. Financial trouble

export interface MarketEvent {
  date: string;           // ISO date when event occurs
  name: string;           // Event name for reference
  type: 'crash' | 'boom' | 'sector-specific';

  // Impact multipliers by asset category (-1.0 = -100% crash, 0.5 = +50% boom)
  impact: {
    safe: number;         // Safe haven assets (often go up in crashes)
    balanced: number;     // Balanced assets
    growth: number;       // Growth assets
    speculative: number;  // Speculative assets (crash hardest)
  };

  // Recovery period in months
  recoveryMonths: number;
}

/**
 * Historical market events from 1920 to 2025
 * Each event represents a major market shock or boom
 */
export const MARKET_EVENTS: MarketEvent[] = [
  // 1929 - Great Depression Crash
  {
    date: '1929-10-01',
    name: 'Great Depression',
    type: 'crash',
    impact: {
      safe: 0.05,        // Safe havens slightly up
      balanced: -0.45,   // -45%
      growth: -0.60,     // -60%
      speculative: -0.85 // -85% wipeout
    },
    recoveryMonths: 120  // 10 years to recover
  },

  // 1937 - Recession of 1937
  {
    date: '1937-05-01',
    name: 'Recession of 1937',
    type: 'crash',
    impact: {
      safe: 0.02,
      balanced: -0.25,
      growth: -0.35,
      speculative: -0.50
    },
    recoveryMonths: 36
  },

  // 1945 - Post-WWII Boom
  {
    date: '1945-08-01',
    name: 'Post-War Boom',
    type: 'boom',
    impact: {
      safe: 0.10,
      balanced: 0.35,
      growth: 0.50,
      speculative: 0.70
    },
    recoveryMonths: 0  // Immediate boom
  },

  // 1973-1974 - Oil Crisis
  {
    date: '1973-10-01',
    name: 'Oil Crisis',
    type: 'crash',
    impact: {
      safe: 0.08,
      balanced: -0.30,
      growth: -0.40,
      speculative: -0.55
    },
    recoveryMonths: 48
  },

  // 1987 - Black Monday
  {
    date: '1987-10-01',
    name: 'Black Monday',
    type: 'crash',
    impact: {
      safe: 0.05,
      balanced: -0.22,
      growth: -0.35,
      speculative: -0.50
    },
    recoveryMonths: 18  // Quick recovery
  },

  // 1990 - Gulf War
  {
    date: '1990-08-01',
    name: 'Gulf War Recession',
    type: 'crash',
    impact: {
      safe: 0.03,
      balanced: -0.15,
      growth: -0.20,
      speculative: -0.30
    },
    recoveryMonths: 12
  },

  // 2000 - Dot-com Bubble Burst
  {
    date: '2000-03-01',
    name: 'Dot-com Crash',
    type: 'sector-specific',
    impact: {
      safe: 0.10,
      balanced: -0.20,
      growth: -0.50,      // Tech-heavy growth hit hard
      speculative: -0.75  // Speculative tech wiped out
    },
    recoveryMonths: 60
  },

  // 2008 - Financial Crisis
  {
    date: '2008-09-01',
    name: 'Financial Crisis',
    type: 'crash',
    impact: {
      safe: 0.08,
      balanced: -0.38,
      growth: -0.55,
      speculative: -0.70
    },
    recoveryMonths: 48
  },

  // 2020 - COVID-19 Crash
  {
    date: '2020-03-01',
    name: 'COVID-19 Crash',
    type: 'crash',
    impact: {
      safe: 0.05,
      balanced: -0.30,
      growth: -0.35,
      speculative: -0.45
    },
    recoveryMonths: 6   // Very fast recovery
  },

  // 2022 - Inflation Crisis
  {
    date: '2022-01-01',
    name: 'Inflation Crisis',
    type: 'crash',
    impact: {
      safe: -0.05,  // Even safe havens suffered
      balanced: -0.20,
      growth: -0.30,
      speculative: -0.50
    },
    recoveryMonths: 18
  }
];

/**
 * Maps asset IDs to their initial category
 * Categories are now more granular (9 levels)
 */
export function getAssetCategory(assetId: string): AssetCategory {
  // Distressed/failing assets (9)
  if (assetId.includes('bankruptcy')) {
    return 'distressed';
  }
  // Declining assets (8-9)
  else if (assetId.includes('declining') || assetId.includes('legacy')) {
    return 'speculative';  // High risk of further decline
  }
  // Speculative/extreme assets (8)
  else if (assetId.includes('extreme') ||
             assetId.includes('wildcard') ||
             assetId.includes('crypto') ||
             assetId.includes('venture')) {
    return 'speculative';
  }
  // Aggressive/biotech/volatile (7)
  else if (assetId.includes('volatility') ||
             assetId.includes('biotech') ||
             assetId.includes('moonshot') ||
             assetId.includes('speculative-edge')) {
    return 'aggressive';
  }
  // Growth/tech assets (6)
  else if (assetId.includes('tech') ||
             assetId.includes('innovation') ||
             assetId.includes('emerging') ||
             assetId.includes('growth-accelerator') ||
             assetId.includes('smallcap')) {
    return 'growth';
  }
  // Balanced/diversified (5)
  else if (assetId.includes('equilibrium') ||
             assetId.includes('blend') ||
             assetId.includes('horizon') ||
             assetId.includes('balanced-growth') ||
             assetId.includes('momentum')) {
    return 'balanced';
  }
  // Conservative/established (4)
  else if (assetId.includes('dividend')) {
    return 'conservative';
  }
  // Safe/bonds (3)
  else if (assetId.includes('stable') ||
             assetId.includes('treasury')) {
    return 'safe';
  }
  // Very safe/utilities (2)
  else if (assetId.includes('safehaven')) {
    return 'very-safe';
  }
  // Ultra safe (gold) (1)
  else {
    return 'ultra-safe';
  }
}
