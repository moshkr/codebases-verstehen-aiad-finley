import { AssetCategory } from '@/constants/marketEvents';

/**
 * Gets the category sensitivity multiplier (Beta)
 * Defines how strongly an asset reacts to market moods and shocks.
 */
export function getCategorySensitivity(category: AssetCategory | string): number {
  switch (category) {
    case 'ultra-safe':   return 0.1;
    case 'very-safe':    return 0.2;
    case 'safe':         return 0.3;
    case 'conservative': return 0.5;
    case 'balanced':     return 0.7;
    case 'growth':       return 1.2;
    case 'aggressive':   return 1.8;
    case 'speculative':  return 2.5;
    case 'distressed':   return 3.0;
    default:             return 1.0;
  }
}