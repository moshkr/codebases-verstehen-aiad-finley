import seedrandom from 'seedrandom';

/**
 * Box-Muller transform to generate standard normal random variables
 * @param rng - Seeded random number generator
 * @returns A standard normal (mean=0, std=1) random value
 *
 * Hilfskommentar:
 * - rng() liefert gleichverteilte Zahlen zwischen 0 und 1
 * - Box-Muller macht daraus normalverteilte Zahlen (Glockenkurve um 0)
 * - Kleine Kursbewegungen sind so häufig, große selten – wie an der echten Börse
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
 *
 * Hilfskommentar:
 * - PRNG = Pseudo-Zufallsgenerator: rechnet Zahlen aus, die zufällig aussehen
 * - Gleicher Seed → immer exakt dieselbe Zahlenfolge
 * - Deshalb sind alle Kurse trotz „Zufall" bei jedem Start identisch (deterministisch)
 * - Math.random() wird bewusst nicht verwendet – das wäre jedes Mal anders
 */
export function createSeededRNG(seed: string): seedrandom.PRNG {
  return seedrandom(seed);
}
