/**
 * Canonical chart point contract used across all chart-based cards.
 *
 * Provider rows from Firebase, Neon, Supabase, or REST APIs should be mapped
 * into this shape before passing to card components.
 */
export interface ChartDataPoint {
  /** X-axis label (date, category, bucket name, etc.). */
  name: string;
  /** Numeric value rendered on the chart Y-axis. */
  value: number;
}

/**
 * Lightweight adapter to map provider rows into `ChartDataPoint[]`.
 *
 * @example
 * const points = mapRowsToChartData(rows, (r) => r.date, (r) => r.total);
 */
export function mapRowsToChartData<T>(
  rows: T[],
  getName: (row: T) => string,
  getValue: (row: T) => number,
): ChartDataPoint[] {
  return rows.map((row) => ({
    name: getName(row),
    value: getValue(row),
  }));
}
