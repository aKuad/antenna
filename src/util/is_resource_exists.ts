/**
 * Check an online resource exists (is it returns 2xx response)
 * @module
 */


/**
 * Check an online resource exists (is it returns 2xx response)
 *
 * @param url Resource URL to check
 * @returns When the resource exists: true, When not: false
 */
export async function is_resource_exists(url: string): Promise<boolean> {
  const res = await fetch(url);
  await res.body?.cancel();
  return res.ok;
}
