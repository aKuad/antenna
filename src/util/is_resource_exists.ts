/**
 * Check an online resource exists (is it returns 2xx response)
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
  await res.body?.cancel();
  return res.ok;
}
