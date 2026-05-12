import seedrandom from 'seedrandom';

/**
 * Box-Muller transform to generate standard normal random variables
 * @param rng - Seeded random number generator
 * @returns A standard normal (mean=0, std=1) random value
 */
export function boxMuller(rng: seedrandom.PRNG): number {
  const u1 = rng();
  const u2 = rng();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

/**
 * Creates a seeded random number generator
 * @param seed - Seed string for reproducible randomness
 * @returns A seeded PRNG
 */
export function createSeededRNG(seed: string): seedrandom.PRNG {
  return seedrandom(seed);
}
