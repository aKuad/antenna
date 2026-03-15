/**
 * Posts fetching tests from Qiita site
 */

import { serveFile } from "jsr:@std/http@1";
import { assertEquals } from "jsr:@std/assert@1";

import { sleep } from "../util.ts";

import { fetch_posts } from "../fetch_posts.ts";
import { SiteTarget, FetchResult } from "../types.ts";


Deno.test(async function test_rss(t) {
  /* Test HTTP server start */
  const test_server = Deno.serve(async request => {
    const url = new URL(request.url);
    if(url.pathname === "/favicon.ico")
      return serveFile(request, "./test_data/qiita/favicon.ico");

    const response_delay_ms = request.headers.get("late-response-test");
    if(response_delay_ms)
      await sleep(Number(response_delay_ms));

    if(request.headers.get("rate-limit-exceeded-test") === "true")
      return await serveFile(request, "./test_data/qiita/err_rate_limit_exceeded.json");

    if(request.headers.get("500-error-test") === "true")
      return new Response("", { status: 500 });

    if(url.searchParams.get("query") !== "user:uid") {
      const res = await serveFile(request, "./test_data/qiita/err_uid_non_exists.json");
      res.headers.append("total-count", "101");
      return res;
    }

    const res_page = url.searchParams.get("page") === "2" ? "2" : "1";  // If no specified, select 1
    const res = await serveFile(request, `./test_data/qiita/true_items_page${res_page}.json`);
    res.headers.append("total-count", "101");
    return res;
  });


  /**
   * - Can fetch and return posts data from specified user ID
   */
  await t.step(async function qiita_true() {});


  /**
   * - When response reached timeout duration, returns "TimeoutError" fail reason
   * - When non exist ID specified, returns "DataMissing" fail reason
   * - When rate limit exceeded, returns "HTTPError" fail reason
   * - When server error occurred, returns "HTTPError" fail reason
   */
  await t.step(async function qiita_err() {
    const timeout_target       : SiteTarget = { site_name: "qiita", uid: "uid", timeout_ms: 100, headers: { "late-response-test": "500" } };
    const uid_non_exists_target: SiteTarget = { site_name: "qiita", uid: "non-exist" };
    const rate_limit_target    : SiteTarget = { site_name: "qiita", uid: "uid", headers: { "rate-limit-exceeded-test": "true" } };
    const server_error_target  : SiteTarget = { site_name: "qiita", uid: "uid", headers: { "500-error-test": "true" } };

    const timeout_actual        = fetch_posts([timeout_target], undefined);
    const uid_non_exists_actual = fetch_posts([uid_non_exists_target], undefined, true);
    const rate_limit_actual     = fetch_posts([rate_limit_target], undefined, true);
    const server_error_actual   = fetch_posts([server_error_target], undefined, true);

    const timeout_expected       : FetchResult = { posts: [], fail_reasons: [{ target: timeout_target       , severity: "error"  , category: "TimeoutError", detail: "Request timeout" }]};
    const uid_non_exists_expected: FetchResult = { posts: [], fail_reasons: [{ target: uid_non_exists_target, severity: "warning", category: "DataMissing" , detail: "User ID non exist or no posted" }]};
    const rate_limit_expected    : FetchResult = { posts: [], fail_reasons: [{ target: rate_limit_target    , severity: "error"  , category: "HTTPError"   , detail: "Rate limit exceeded" }]};
    const server_error_expected  : FetchResult = { posts: [], fail_reasons: [{ target: server_error_target  , severity: "error"  , category: "HTTPError"   , detail: "Internal Server Error" }]};

    assertEquals(await timeout_actual       , timeout_expected);
    assertEquals(await uid_non_exists_actual, uid_non_exists_expected);
    assertEquals(await rate_limit_actual    , rate_limit_expected);
    assertEquals(await server_error_actual  , server_error_expected);
  });


  /* Test HTTP server shutdown */
  await sleep(100); // Interval for fetch() completed before shutdown
  await test_server.shutdown();
});
