/**
 * `fetch_posts()` corner case test
 */

import { assertEquals } from "jsr:@std/assert@1";

import { FetchResult } from "../types.ts";
import { fetch_posts } from "../fetch_posts.ts";


Deno.test(async function test_fetch_posts(t) {
  /**
   * - When unsupported feed-type/site-name specified, return 'FetchParamError'
   */
  await t.step(async function fetch_posts_err() {
    // deno-lint-ignore no-explicit-any
    const target_unsupported_feed: any = { type: "unsupported-feed-type", url: "http://localhost:8000/atom/true_general.xml"};
    // deno-lint-ignore no-explicit-any
    const target_unsupported_site: any = { site: "unsupported-site-name", uid: "akuad" };

    const fetch_feed_actual = await fetch_posts([target_unsupported_feed]);
    const fetch_site_actual = await fetch_posts([target_unsupported_site]);

    const fetch_feed_expected: FetchResult = {
      posts: [],
      fail_reasons: [{ target: target_unsupported_feed, severity: "error", category: "FetchParamError", detail: "Unsupported feed - unsupported-feed-type" }]
    }
    const fetch_site_expected: FetchResult = {
      posts: [],
      fail_reasons: [{ target: target_unsupported_site, severity: "error", category: "FetchParamError", detail: "Unsupported site - unsupported-site-name" }]
    }

    assertEquals(fetch_feed_actual, fetch_feed_expected);
    assertEquals(fetch_site_actual, fetch_site_expected);
  });
});
