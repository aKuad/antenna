/**
 * Utility functions
 * @module
 */

import { FeedTarget } from "./types.ts";


/**
 * Check an online resource exists (is it returns 2xx response)
 *
 * @param url Resource URL to check
 * @param headers Headers of exist checking fetch
 * @returns When the resource exists: true, When not: false
 */
export async function is_resource_exists(url: string, headers?: HeadersInit): Promise<boolean> {
  const res = await fetch(url, { headers });
  await res.bytes();
  return res.ok;
}


/**
 * Check is an object `FeedTarget` type
 *
 * @param obj Object to check is FeedTarget type
 * @returns `obj` is `FeedTarget` type: true, otherwise: false
 */
// deno-lint-ignore no-explicit-any
export function isFeedTarget(obj: any): obj is FeedTarget {
  return obj && typeof obj.feed_type === "string" && typeof obj.url === "string";
}


/**
 * Interval making by async functions awaiting
 *
 * @example
 * await sleep(1000);
 *
 * @param duration_ms Sleep duration in milliseconds
 */
export function sleep(duration_ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, duration_ms));
}
