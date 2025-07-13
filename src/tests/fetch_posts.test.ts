/**
 * Posts fetching tests via `fetch_posts()` for all [sub]modules
 */

import { assertEquals } from "jsr:@std/assert";

import { fetch_posts } from "../fetch_posts.ts";


Deno.test(async function tests(t) {
  /**
   * - When unsupported target specified, returns empty array
   */
  await t.step(async function unsupported_target() {
    // deno-lint-ignore no-explicit-any
    const target: any = { type: "unsupported-target-name", url: "http://localhost:8000/atom/true_general.xml"};
    const posts = await fetch_posts([target]);
    assertEquals(posts, []);
  });
});
