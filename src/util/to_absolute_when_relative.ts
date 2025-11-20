/**
 * Convert a path to absolute URI - If already absolute, return original URI
 * @module
 */


/**
 * Convert a path to absolute URI - If already absolute, return original URI
 * @private
 *
 * @param may_relative_uri URI string to convert
 * @param feed_uri URI origin of `may_relative_url`
 * @returns Absolute URI
 */
export function to_absolute_when_relative(may_relative_uri: string, feed_uri: string): string {
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
