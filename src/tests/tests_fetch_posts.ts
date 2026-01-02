/**
 * `fetch_posts()` corner case test
 */

import { assertEquals } from "jsr:@std/assert@1";

import { fetch_posts } from "../fetch_posts.ts";


/**
 * Test set of fetch_posts.ts module
 *
 * @param t Deno test context for test step indication
 */
export async function tests_fetch_posts(t: Deno.TestContext) {
  /**
   * - When unsupported target specified, returns empty array
   */
  await t.step(async function fetch_posts_err() {
    // deno-lint-ignore no-explicit-any
    const target: any = { type: "unsupported-target-name", url: "http://localhost:8000/atom/true_general.xml"};
    const posts = await fetch_posts([target]);
    assertEquals(posts, []);
  });
};
