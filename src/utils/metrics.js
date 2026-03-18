// src/utils/metrics.js

/**
 * Mean Absolute Percentage Error
 * @param {number[]} actualArr - Array of actual values
 * @param {number[]} predArr   - Array of predicted/interpolated values
 * @returns {number|null} MAPE as a percentage, or null if no valid pairs
 */
export function mape(actualArr, predArr) {
  const pairs = actualArr
    .map((a, i) => [a, predArr[i]])
    .filter(([a, p]) => a != null && p != null && Math.abs(a) > 1e-9);
  if (!pairs.length) return null;
  const pct = pairs.map(([a, p]) => Math.abs((a - p) / a));
  return (pct.reduce((s, v) => s + v, 0) / pct.length) * 100;
}

/**
 * Root Mean Square Error
 * @param {number[]} actualArr
 * @param {number[]} predArr
 * @returns {number|null}
 */
export function rmse(actualArr, predArr) {
  const pairs = actualArr
    .map((a, i) => [a, predArr[i]])
    .filter(([a, p]) => a != null && p != null);
  if (!pairs.length) return null;
  const sumSq = pairs.reduce((s, [a, p]) => s + (a - p) ** 2, 0);
  return Math.sqrt(sumSq / pairs.length);
}

/**
 * Median of an array of numbers
 * @param {number[]} arr
 * @returns {number|null}
 */
export function median(arr) {
  const valid = arr.filter(v => v != null && isFinite(v));
  if (!valid.length) return null;
  const sorted = [...valid].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}
