/**
 * Generates a sequence of dates from start year to end year
 * @param startYear - Starting year (e.g., 1920)
 * @param endYear - Ending year (e.g., 2025)
 * @param frequency - 'monthly' or 'daily'
 * @returns Array of date strings in ISO format
 */
export function generateDateRange(
  startYear: number,
  endYear: number,
  frequency: 'monthly' | 'daily' = 'monthly'
): string[] {
  const dates: string[] = [];

  if (frequency === 'monthly') {
    for (let year = startYear; year <= endYear; year++) {
      for (let month = 0; month < 12; month++) {
        const date = new Date(year, month, 1);
        dates.push(date.toISOString().split('T')[0]);
      }
    }
  } else {
    // Daily frequency (simplified - using 365 days per year)
    const startDate = new Date(startYear, 0, 1);
    const endDate = new Date(endYear, 11, 31);
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return dates;
}

/**
 * Calculate years between two dates
 */
export function yearsBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
}
