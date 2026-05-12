import { Asset } from '@/types';
import { generateMoodBasedGBMPath, generateDynamicShocks, applyDynamicShocks, generateMoodSequence } from '../gbm';
import { createSeededRNG } from './random';
import { generateDateRange } from './date';
import { getAssetCategory } from '@/constants/marketEvents';
import {
  ASSET_DEFINITIONS,
  GLOBAL_SEED,
  HISTORY_START_YEAR,
  HISTORY_END_YEAR
} from '@/constants/assets';

/**
 * Generates all assets with historical data using the global seed
 * This ensures all users see the same historical data for educational purposes
 *
 * Now uses a sophisticated Mood-based simulation engine:
 * 1. Each asset generates its own independent Mood Sequence (no global market correlation).
 * 2. Assets react to their own moods based on their Category (Beta).
 * 3. Both the baseline GBM trend and discrete Shock events are mood-driven.
 *
 * @returns Array of fully generated assets with historical price data
 */
export function generateAllAssets(): Asset[] {
  // Generate date range for historical data
  const dates = generateDateRange(HISTORY_START_YEAR, HISTORY_END_YEAR, 'monthly');

  // Create assets with historical data
  const assets: Asset[] = ASSET_DEFINITIONS.map((definition) => {
    // Create a unique seed for each asset based on global seed + asset id
    const assetSeed = `${GLOBAL_SEED}-${definition.id}`;
    const rng = createSeededRNG(assetSeed);

    // 1. Generate Asset-Specific Mood Sequence
    // Each asset has its own psychological cycle independent of others
    const moodSeed = `${assetSeed}-moods`;
    const assetMoods = generateMoodSequence(moodSeed, dates.length, 'neutral');

    // 2. Generate baseline historical price path using Mood-Adjusted GBM
    const initialCategory = getAssetCategory(definition.id);
    let history = generateMoodBasedGBMPath(
      definition.startPrice,
      definition.params,
      dates,
      assetMoods,
      initialCategory,
      rng
    );

    // 3. Generate dynamic shocks based on Moods + Asset Category
    const shockSeed = `${GLOBAL_SEED}-shocks-${definition.id}`;
    
    const shocks = generateDynamicShocks(
      shockSeed,
      assetMoods,
      initialCategory
    );

    // 4. Apply dynamic shocks to the baseline path
    history = applyDynamicShocks(history, shocks);

    return {
      id: definition.id,
      name: definition.name,
      color: definition.color,
      params: definition.params,
      history
    };
  });

  return assets;
}

/**
 * Gets a specific asset by ID
 */
export function getAssetById(assets: Asset[], id: string): Asset | undefined {
  return assets.find(asset => asset.id === id);
}
