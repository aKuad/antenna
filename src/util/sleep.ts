/**
 * Interval making by async functions awaiting
 * @module
 */


/**
 * Interval making by async functions awaiting
 *
 * @example
 * await sleep(1000);
 *
 * @param duration_ms Sleep duration in milliseconds
 */
export function sleep(duration_ms: number): Promise<undefined> {
  return new Promise(resolve => setTimeout(resolve, duration_ms));
}
