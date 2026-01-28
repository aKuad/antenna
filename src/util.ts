/**
 * Utility functions
 * @module
 */


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


/**
 * Convert a path to absolute URI - If already absolute, return original URI
 * @private
 *
 * @param may_relative_uri URI string to convert
 * @param feed_uri URI origin of `may_relative_url`
 * @returns Absolute URI
 */
export function to_full_url_when_not(may_relative_uri: string, feed_uri: string): string {
  try {
    // When `Invalid URL` not thrown, it was absolute URL
    new URL(may_relative_uri);
    return may_relative_uri;

  } catch (_) {
    // When thrown, it was relative URL
    const url = new URL(feed_uri);
    url.pathname = may_relative_uri;
    return url.href;
  }
}
