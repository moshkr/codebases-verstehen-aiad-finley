import seedrandom from 'seedrandom';
import { DataPoint, MarketMood } from '@/types';
import { AssetCategory } from '@/constants/marketEvents';
import { getCategorySensitivity } from '../utils/marketMath';

/**
 * Impulse shock definition
 */
export interface ImpulseShock {
  index: number;
  magnitude: number;        // Percentage change (e.g., -0.10 for -10%)
  moodAtTime: MarketMood;
}

/**
 * Transition Matrix for Market Moods
 * Rows: From, Cols: To (Panic, Fearful, Neutral, Optimistic, Euphoric)
 * Adjusted for STABLE normal markets and TRANSIENT extremes
 */
const TRANSITION_MATRIX: Record<MarketMood, Record<MarketMood, number>> = {
  // Panic is short-lived (Flash Crash logic). High chance to bounce to Fearful/Neutral.
  panic:      { panic: 0.30, fearful: 0.50, neutral: 0.10, optimistic: 0.10, euphoric: 0.00 },
  
  // Fear is a correction phase, tends to go back to Neutral
  fearful:    { panic: 0.05, fearful: 0.60, neutral: 0.30, optimistic: 0.05, euphoric: 0.00 },
  
  // Neutral is the anchor (Most common state)
  neutral:    { panic: 0.01, fearful: 0.10, neutral: 0.80, optimistic: 0.08, euphoric: 0.01 },
  
  // Optimism is sustainable (Bull market)
  optimistic: { panic: 0.00, fearful: 0.05, neutral: 0.15, optimistic: 0.75, euphoric: 0.05 },
  
  // Euphoria is a bubble, bursts or cools down quickly
  euphoric:   { panic: 0.10, fearful: 0.10, neutral: 0.20, optimistic: 0.40, euphoric: 0.20 }
};

const MOOD_ORDER: MarketMood[] = ['panic', 'fearful', 'neutral', 'optimistic', 'euphoric'];

/**
 * Generates a sequence of market moods using a Markov Chain
 */
export function generateMoodSequence(
  seed: string,
  length: number,
  startMood: MarketMood = 'neutral'
): MarketMood[] {
  const rng = seedrandom(seed);
  const moods: MarketMood[] = [startMood];

  for (let i = 1; i < length; i++) {
    const currentMood = moods[i - 1];
    const probabilities = TRANSITION_MATRIX[currentMood];
    const roll = rng();

    let cumulativeProb = 0;
    let nextMood: MarketMood = 'neutral'; // Default

    for (const mood of MOOD_ORDER) {
      cumulativeProb += probabilities[mood];
      if (roll < cumulativeProb) {
        nextMood = mood;
        break;
      }
    }
    moods.push(nextMood);
  }

  return moods;
}

/**
 * Gets shock parameters based on current Mood
 */
function getMoodShockParams(mood: MarketMood): {
  posProb: number;      // Probability that a shock is positive
  posIntensity: number; // Multiplier for positive shocks
  negIntensity: number; // Multiplier for negative shocks
  shockChance: number;  // Probability of a shock occurring in a given month
} {
  switch (mood) {
    case 'euphoric':
      // Reduced burst risk slightly, but maintained high upside
      return { posProb: 0.85, posIntensity: 1.3, negIntensity: 2.5, shockChance: 0.12 }; 
    case 'optimistic':
      return { posProb: 0.70, posIntensity: 1.0, negIntensity: 0.6, shockChance: 0.06 };
    case 'neutral':
      return { posProb: 0.50, posIntensity: 0.8, negIntensity: 0.8, shockChance: 0.03 };
    case 'fearful':
      return { posProb: 0.35, posIntensity: 0.6, negIntensity: 1.1, shockChance: 0.08 };
    case 'panic':
      // Reduced crash intensity slightly (2.5 -> 2.2) to avoid total wipeouts too easily
      return { posProb: 0.15, posIntensity: 1.8, negIntensity: 2.2, shockChance: 0.20 }; 
  }
}

/**
 * Generates dynamic shocks based on Mood sequence and Asset Category
 */
export function generateDynamicShocks(
  seed: string,
  moods: MarketMood[],
  category: AssetCategory
): ImpulseShock[] {
  const rng = seedrandom(seed);
  const shocks: ImpulseShock[] = [];
  const categoryMult = getCategorySensitivity(category);

  for (let i = 0; i < moods.length; i++) {
    const mood = moods[i];
    const params = getMoodShockParams(mood);

    // 1. Check if a shock occurs this month
    if (rng() < params.shockChance) {
      // 2. Determine Direction
      const isPositive = rng() < params.posProb;

      // 3. Determine Base Magnitude (Random variable)
      // Base shock is between 1% and 5%
      const baseMagnitude = 0.01 + rng() * 0.04;

      // 4. Apply Multipliers
      const intensity = isPositive ? params.posIntensity : params.negIntensity;
      
      // Calculate final magnitude (signed)
      // Formula: Base * CategoryMult * MoodIntensity * Direction
      let magnitude = baseMagnitude * categoryMult * intensity;
      
      if (!isPositive) magnitude *= -1;

      shocks.push({
        index: i,
        magnitude,
        moodAtTime: mood
      });
      
      // Prevent immediate consecutive shocks to avoid total chaos (optional cooldown)
      i += 2; 
    }
  }

  return shocks;
}

/**
 * Applies dynamic shocks to a price path
 */
export function applyDynamicShocks(
  baselinePath: DataPoint[],
  shocks: ImpulseShock[]
): DataPoint[] {
  // Clone path to avoid mutation of original
  const shockedPath: DataPoint[] = JSON.parse(JSON.stringify(baselinePath));

  for (const shock of shocks) {
    applyImpulseShock(shockedPath, shock);
  }

  return shockedPath;
}

/**
 * Applies a single impulse shock with recovery logic
 */
function applyImpulseShock(
  path: DataPoint[],
  shock: ImpulseShock
): void {
  const { index, magnitude } = shock;

  if (index >= path.length) return;

  // Apply immediate shock
  const shockFactor = 1 + magnitude;
  path[index].value *= shockFactor;

  // Recovery / Decay Logic
  // Crashes recover (Mean Reversion), Booms decay
  
  const isCrash = magnitude < 0;
  const absMag = Math.abs(magnitude);
  
  // Recovery duration depends on severity
  // 10% move -> ~12 months recovery
  // 50% move -> ~48 months recovery
  const recoveryMonths = Math.max(6, Math.floor(absMag * 100)); 
  const recoveryEndIndex = Math.min(index + recoveryMonths, path.length - 1);

  if (isCrash) {
    // CRASH RECOVERY
    
    // Target: We assume the asset *would* have continued growing or stayed flat.
    // We can't know the counterfactual, so we model a return towards the 
    // trajectory relative to the *previous* point, dampened.
    
    for (let i = index + 1; i <= recoveryEndIndex; i++) {
      const progress = (i - index) / recoveryMonths;

      // Simple model: The price gradually climbs back a portion of the loss
      // relative to where it started the crash.
      // Note: This modifies the *subsequent* GBM movements cumulatively
      // because we are iterating and modifying path[i].
      
      // We recover a bit more in the beginning, then taper off.
      path[i].value *= (1 + (Math.abs(magnitude) * 0.05 * (1 - progress)));
    }
  } else {
    // BOOM DECAY
    // Booms tend to pull back.
    for (let i = index + 1; i <= recoveryEndIndex; i++) {
      const progress = (i - index) / recoveryMonths;
      // Drag down subsequent prices slightly to simulate "overbought" correction
      const decayFactor = 1 - (magnitude * 0.8 * (1/recoveryMonths) * (1-progress));
      path[i].value *= decayFactor;
    }
  }
}

/**
 * Easing function
 */
