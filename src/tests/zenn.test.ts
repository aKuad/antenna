/**
 * Posts fetching tests from Zenn site
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
      return serveFile(request, "./test_data/zenn/favicon.ico");

    const response_delay_ms = request.headers.get("late-response-test");
    if(response_delay_ms)
      await sleep(Number(response_delay_ms));

    if(request.headers.get("500-error-test") === "true")
      return new Response("", { status: 500 });

    if(url.searchParams.get("username") !== "uid") {
      return await serveFile(request, "./test_data/zenn/err_uid_non_exists.json");
    }

    const res_page = url.searchParams.get("page") === "2" ? "2" : "1";  // If no specified, select 1
    return await serveFile(request, `./test_data/zenn/true_items_page${res_page}.json`);
  });


  /**
   * - Can fetch and return posts data from specified user ID
   */
  await t.step(async function zenn_true() {
    const posts_actual = await fetch_posts([{ site_name: "zenn", uid: "uid" }], undefined, true);

    const posts_expected: FetchResult = {
      posts: [{
        site_name: "Zenn",
        site_icon_url: "https://zenn.dev/favicon.ico",
        title: "知らなかった Markdown のあれこれ",
        url: "https://zenn.dev/akuad/articles/markdown-notes",
        author_name: "aKuad",
        author_url: "https://zenn.dev/akuad",
        author_icon_url: "https://res.cloudinary.com/zenn/image/fetch/s--yXE9U4or--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_70/https://static.zenn.studio/user-upload/avatar/2dac111ba9.jpeg?_a=BACMTiAE",
        description: "",
        thumbnail_url: "",
        post_date: new Date("2023-10-28T06:06:00.000Z"),
        update_date: new Date("2023-10-31T13:52:29.891Z"),
      },
      {
        site_name: "Zenn",
        site_icon_url: "https://zenn.dev/favicon.ico",
        title: "マイコン (Arduino/ATmega328p) 中級者を名乗るのに要る技能 [要出典]",
        url: "https://zenn.dev/akuad/articles/embed-dev-intermediate",
        author_name: "aKuad",
        author_url: "https://zenn.dev/akuad",
        author_icon_url: "https://res.cloudinary.com/zenn/image/fetch/s--yXE9U4or--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_70/https://static.zenn.studio/user-upload/avatar/2dac111ba9.jpeg?_a=BACMTiAE",
        description: "",
        thumbnail_url: "",
        post_date: new Date("2024-01-14T13:42:00.000Z"),
        update_date: new Date("2024-01-14T13:42:10.289Z"),
      },
      {
        site_name: "Zenn",
        site_icon_url: "https://zenn.dev/favicon.ico",
        title: "GitHub リポジトリをイカした見た目にする色々",
        url: "https://zenn.dev/akuad/articles/9d85351eab1ad5",
        author_name: "aKuad",
        author_url: "https://zenn.dev/akuad",
        author_icon_url: "https://res.cloudinary.com/zenn/image/fetch/s--yXE9U4or--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_70/https://static.zenn.studio/user-upload/avatar/2dac111ba9.jpeg?_a=BACMTiAE",
        description: "",
        thumbnail_url: "",
        post_date: new Date("2022-07-10T13:14:15.581Z"),
        update_date: new Date("2025-05-03T03:59:45.441Z"),
      },
      {
        site_name: "Zenn",
        site_icon_url: "https://zenn.dev/favicon.ico",
        title: "いいとも！100人中1人アンケートシステム作り - すぐ使い始められるための工夫",
        url: "https://zenn.dev/akuad/articles/iitomo-1of100-dev",
        author_name: "aKuad",
        author_url: "https://zenn.dev/akuad",
        author_icon_url: "https://res.cloudinary.com/zenn/image/fetch/s--yXE9U4or--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_70/https://static.zenn.studio/user-upload/avatar/2dac111ba9.jpeg?_a=BACMTiAE",
        description: "",
        thumbnail_url: "",
        post_date: new Date("2025-12-14T06:51:00.000Z"),
        update_date: new Date("2026-07-25T08:05:07.717Z"),
      }],
      fail_reasons: []
    };

    assertEquals(posts_actual, posts_expected);
  });


  /**
   * - When response reached timeout duration, returns "TimeoutError" fail reason
   * - When invalid header passed, returns "FetchParamError" fail reason
   * - When non exist ID specified, returns "DataMissing" fail reason
   * - When rate limit exceeded, returns "HTTPError" fail reason
   * - When server error occurred, returns "HTTPError" fail reason
   */
  await t.step(async function zenn_err() {
    const timeout_target       : SiteTarget = { site_name: "zenn", uid: "uid", timeout_ms: 100, headers: { "late-response-test": "500" } };
    const invalid_header_target: SiteTarget = { site_name: "zenn", uid: "uid", headers: { "invalid header": "content" } };
    const uid_non_exists_target: SiteTarget = { site_name: "zenn", uid: "non-exist" };
    const server_error_target  : SiteTarget = { site_name: "zenn", uid: "uid", headers: { "500-error-test": "true" } };

    const timeout_actual        = fetch_posts([timeout_target]       , undefined);
    const invalid_header_actual = fetch_posts([invalid_header_target], undefined);
    const uid_non_exists_actual = fetch_posts([uid_non_exists_target], undefined, true);
    const server_error_actual   = fetch_posts([server_error_target]  , undefined, true);

    const timeout_expected       : FetchResult = { posts: [], fail_reasons: [{ target: timeout_target       , severity: "error"  , category: "TimeoutError"   , detail: "Request timeout" }]};
    const invalid_header_expected: FetchResult = { posts: [], fail_reasons: [{ target: invalid_header_target, severity: "error"  , category: "FetchParamError", detail: 'TypeError: Invalid header name: "invalid header"' }]};
    const uid_non_exists_expected: FetchResult = { posts: [], fail_reasons: [{ target: uid_non_exists_target, severity: "warning", category: "DataMissing"    , detail: "User ID non exist or no posted" }]};
    const server_error_expected  : FetchResult = { posts: [], fail_reasons: [{ target: server_error_target  , severity: "error"  , category: "HTTPError"      , detail: "Internal Server Error" }]};

    assertEquals(await timeout_actual       , timeout_expected);
    assertEquals(await invalid_header_actual, invalid_header_expected);
    assertEquals(await uid_non_exists_actual, uid_non_exists_expected);
    assertEquals(await server_error_actual  , server_error_expected);
  });


  /* Test HTTP server shutdown */
  await sleep(100); // Interval for fetch() completed before shutdown
  await test_server.shutdown();
});
