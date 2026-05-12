import { GBMParams } from '@/types';

/**
 * Asset definition template
 */
export interface AssetDefinition {
  id: string;
  name: string;
  color: string;
  startPrice: number;
  params: GBMParams;
}

/**
 * Pre-defined fictitious assets with varying risk/return profiles
 *
 * Categories:
 * - Safe Haven: Low volatility (5-10%), moderate returns (3-6%)
 * - Balanced: Medium volatility (10-20%), medium returns (6-10%)
 * - Growth: High volatility (20-35%), high returns (8-15%)
 * - Speculative: Very high volatility (35-50%), very high returns (10-20%)
 */
export const ASSET_DEFINITIONS: AssetDefinition[] = [
  // Mixed order with realistic German company names
  {
    id: 'growth-accelerator',
    name: 'Afurt Media GmbH [Medien]',
    color: '#AB47BC',
    startPrice: 19,
    params: { mu: 0.042, sigma: 0.24 } // Reduced from 0.058
  },
  {
    id: 'stable-bonds',
    name: 'Nordheim Finanz AG [Finanzdienstleister]',
    color: '#4A90E2',
    startPrice: 92,
    params: { mu: 0.015, sigma: 0.05 } // Reduced from 0.02
  },
  {
    id: 'volatility-power',
    name: 'Quantris Technologies AG [Quantentechnologie]',
    color: '#D32F2F',
    startPrice: 12,
    params: { mu: 0.055, sigma: 0.38 } // Reduced from 0.07, sigma slightly reduced
  },
  {
    id: 'diversified-horizon',
    name: 'Bergfeld Produktion AG [Fertigung]',
    color: '#95E1D3',
    startPrice: 38,
    params: { mu: 0.032, sigma: 0.13 } // Reduced from 0.042
  },
  {
    id: 'safehaven-gold',
    name: 'Trünstein Metall AG [Edelmetalle]',
    color: '#FFD700',
    startPrice: 85,
    params: { mu: 0.018, sigma: 0.08 } // Reduced from 0.025
  },
  {
    id: 'crypto-frontier',
    name: 'Kryptohaus Ventures GmbH [Kryptowährungen]',
    color: '#F57C00',
    startPrice: 8,
    params: { mu: 0.065, sigma: 0.42 } // Reduced from 0.08, sigma 0.45 -> 0.42
  },
  {
    id: 'dividend-defender',
    name: 'Westfalenwerk Energie GmbH [Energieversorgung]',
    color: '#50C878',
    startPrice: 68,
    params: { mu: 0.022, sigma: 0.09 } // Reduced from 0.03
  },
  {
    id: 'legacy-industries',
    name: 'Kohler Industriewerke AG [Schwerindustrie]',
    color: '#616161',
    startPrice: 24,
    params: { mu: 0.005, sigma: 0.15 } // Kept low
  },
  {
    id: 'techrocket-2000',
    name: 'Rheinsoft Solutions GmbH [Software]',
    color: '#FF1744',
    startPrice: 28,
    params: { mu: 0.045, sigma: 0.25 } // Reduced from 0.06
  },
  {
    id: 'market-blend',
    name: 'Hanseatische Konsumgüter GmbH [Konsumgüter]',
    color: '#4ECDC4',
    startPrice: 42,
    params: { mu: 0.035, sigma: 0.15 } // Reduced from 0.045
  },
  {
    id: 'speculative-edge',
    name: 'Automatis Robotik AG [Künstliche Intelligenz]',
    color: '#5E35B1',
    startPrice: 10,
    params: { mu: 0.050, sigma: 0.32 } // Reduced from 0.06, sigma 0.35 -> 0.32
  },
  {
    id: 'treasury-shield',
    name: 'Müller & Schmidt Versicherung SE [Versicherungen]',
    color: '#7B68EE',
    startPrice: 78,
    params: { mu: 0.016, sigma: 0.06 } // Reduced from 0.022
  },
  {
    id: 'smallcap-express',
    name: 'Solarkraft Freiburg GmbH [Erneuerbare Energien]',
    color: '#26C6DA',
    startPrice: 31,
    params: { mu: 0.048, sigma: 0.28 } // Reduced from 0.062, sigma 0.30 -> 0.28
  },
  {
    id: 'balanced-growth',
    name: 'Kaufland Handelsgruppe GmbH [Einzelhandel]',
    color: '#F38181',
    startPrice: 47,
    params: { mu: 0.036, sigma: 0.16 } // Reduced from 0.048
  },
  {
    id: 'venture-wildcard',
    name: 'Sternflug Aerospace GmbH [Raumfahrttechnologie]',
    color: '#C2185B',
    startPrice: 6,
    params: { mu: 0.060, sigma: 0.40 } // Reduced from 0.075, sigma 0.42 -> 0.40
  },
  {
    id: 'global-equilibrium',
    name: 'Eisenbach Maschinenbau AG [Maschinenbau]',
    color: '#FF6B6B',
    startPrice: 55,
    params: { mu: 0.030, sigma: 0.12 } // Reduced from 0.04
  },
  {
    id: 'biotech-moonshot',
    name: 'Biowerk Heidelberg AG [Biotechnologie]',
    color: '#7B1FA2',
    startPrice: 15,
    params: { mu: 0.052, sigma: 0.35 } // Reduced from 0.065, sigma 0.38 -> 0.35
  },
  {
    id: 'declining-sector',
    name: 'Dortmunder Stahlwerk AG [Stahlindustrie]',
    color: '#424242',
    startPrice: 16,
    params: { mu: -0.01, sigma: 0.20 } // Kept same
  },
  {
    id: 'midcap-momentum',
    name: 'Südenergie Kraftwerke AG [Energieversorgung]',
    color: '#AA96DA',
    startPrice: 51,
    params: { mu: 0.038, sigma: 0.18 } // Reduced from 0.05
  },
  {
    id: 'innovation-ventures',
    name: 'Datenwolke Systems AG [IT-Dienstleistungen]',
    color: '#00E676',
    startPrice: 22,
    params: { mu: 0.040, sigma: 0.22 } // Reduced from 0.055
  },
  {
    id: 'extreme-alpha',
    name: 'Mikrotec Industries AG [Nanotechnologie]',
    color: '#D84315',
    startPrice: 4,
    params: { mu: 0.070, sigma: 0.45 } // Reduced from 0.09, sigma 0.50 -> 0.45
  },
  {
    id: 'emerging-titans',
    name: 'Vitalpharm Arzneimittel AG [Pharmazie]',
    color: '#FFA726',
    startPrice: 35,
    params: { mu: 0.050, sigma: 0.26 } // Reduced from 0.065, sigma 0.28 -> 0.26
  },
  {
    id: 'bankruptcy-bound',
    name: 'Schlecker Einzelhandel GmbH [Einzelhandel]',
    color: '#212121',
    startPrice: 3,
    params: { mu: -0.03, sigma: 0.55 } // Kept same
  }
];

/**
 * Global seed for deterministic asset generation
 * All students using this seed will see identical asset histories
 */
export const GLOBAL_SEED = 'Semester2025';

/**
 * Historical data range
 */
export const HISTORY_START_YEAR = 1920;
export const HISTORY_END_YEAR = 2025;
