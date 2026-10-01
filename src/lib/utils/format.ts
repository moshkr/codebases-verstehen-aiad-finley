/**
 * Shared display formatters
 * Used by the dashboard and the exports so both show identical numbers
 */

export const formatPercent = (value: number): string => `${(value * 100).toFixed(2)}%`;

export const formatCurrency = (value: number): string => `${value.toFixed(2)} €`;

/**
 * Converts a history date string into a month label (YYYY-MM)
 *
 * generateDateRange() builds dates via toISOString() from local midnight,
 * so in time zones east of UTC every date lands on the last day of the
 * previous month (e.g. 1920-01-01 becomes "1919-12-31"). We shift those
 * back to the first of the intended month.
 */
export function toMonthLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (date.getUTCDate() !== 1) {
    date.setUTCDate(date.getUTCDate() + 1);
  }
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${date.getUTCFullYear()}-${month}`;
}
