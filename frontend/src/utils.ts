/**
 * Utility functions for formatting and calculations
 */

/**
 * Strips fractional parts and formats number with comma groupings for UZS currency.
 * e.g. 125000 -> "125,000 UZS"
 */
export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString("en-US")} UZS`;
}

/**
 * Calculates duration in milliseconds between a starting timestamp and now.
 */
export function calculateDurationMs(startTimeIso: string, currentTimeMs: number): number {
  const start = new Date(startTimeIso).getTime();
  return Math.max(0, currentTimeMs - start);
}

/**
 * Converts milliseconds to hh:mm:ss format.
 */
export function formatDuration(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;

  const pad = (num: number) => String(num).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Calculates computer time session cost.
 * Example model: Exact per-second billing with rate per hour.
 */
export function calculateTimeCost(startTimeIso: string, ratePerHour: number, currentTimeMs: number): number {
  const durationMs = calculateDurationMs(startTimeIso, currentTimeMs);
  const hours = durationMs / (1000 * 60 * 60);
  return hours * ratePerHour;
}
