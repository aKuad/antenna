/**
 * `fetch_posts()` corner case test
 */

import { assertEquals } from "jsr:@std/assert@1";

import { fetch_posts } from "../fetch_posts.ts";


export async function tests_fetch_posts(t: Deno.TestContext) {
  /**
   * - When unsupported target specified, returns empty array
   */
  await t.step(async function unsupported_target() {
    // deno-lint-ignore no-explicit-any
    const target: any = { type: "unsupported-target-name", url: "http://localhost:8000/atom/true_general.xml"};
    const posts = await fetch_posts([target]);
    assertEquals(posts, []);
  });
};
