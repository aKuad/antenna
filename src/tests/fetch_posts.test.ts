/**
 * `fetch_posts()` corner case test
 */

import { assertEquals } from "jsr:@std/assert@1";

import { FetchResult } from "../types.ts";
import { fetch_posts } from "../fetch_posts.ts";


Deno.test(async function test_fetch_posts(t) {
  /**
   * - When unsupported target specified, returns empty array
   */
  await t.step(async function fetch_posts_err() {
    // deno-lint-ignore no-explicit-any
    const target: any = { type: "unsupported-target-name", url: "http://localhost:8000/atom/true_general.xml"};
    const fetch_result_actual = await fetch_posts([target]);

    const fetch_result_expected: FetchResult = {
      posts: [],
      fail_reasons: [{ target, severity: "error", category: "FetchParamError", detail: "Unsupported type - unsupported-target-name" }]
    }

    assertEquals(fetch_result_actual, fetch_result_expected);
  });
});
