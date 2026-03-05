/**
 * Posts fetching tests from Qiita site
 */

import { serveFile } from "jsr:@std/http@1";
// import { assertEquals } from "jsr:@std/assert@1";

import { sleep } from "../util.ts";

// import { fetch_posts } from "../fetch_posts.ts";
// import { FetchResult } from "../types.ts";


Deno.test(async function test_rss(t) {
  /* Test HTTP server start */
  const test_server = Deno.serve(async request => {
    const url = new URL(request.url);
    if(url.pathname === "/favicon.ico")
      return serveFile(request, "./test_data/qiita/favicon.ico");

    const response_delay_ms = request.headers.get("late-response-test");
    if(response_delay_ms)
      await sleep(Number(response_delay_ms));

    if(url.searchParams.get("rate-limit-exceeded") === "true")
      return await serveFile(request, "./test_data/qiita/err_rate_limit_exceeded.json");

    if(url.searchParams.get("query") !== "user%2Auid")
      return serveFile(request, "./test_data/qiita/err_uid_non_exists.json");

    if(url.searchParams.get("page") === "2")
      return serveFile(request, "./test_data/qiita/true_items_page2.json");

    return serveFile(request, "./test_data/qiita/true_items_page1.json");
  });


  /**
   * - Can fetch and return posts data from specified user ID
   */
  await t.step(async function qiita_true() {});


  /**
   * -
   */
  await t.step(async function qiita_err() {});


  /* Test HTTP server shutdown */
  await sleep(100); // Interval for fetch() completed before shutdown
  await test_server.shutdown();
});
