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
      res.headers.append("total-count", "101"); // Actual item count on test is 4, but it for paging test
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
  await t.step(async function qiita_true() {
    const posts_actual = await fetch_posts([{ site_name: "qiita", uid: "uid" }], undefined, true);

    const posts_expected: FetchResult = {
      posts: [{
        site_name: "Qiita",
        site_icon_url: "https://qiita.com/favicon.ico",
        title: "GitHub Actions 上で PlatformIO を素早くセットアップしてビルドチェックする",
        url: "https://qiita.com/aKuad/items/c797897dbda98f8f86ec",
        author_name: "aKuad",
        author_url: "https://qiita.com/aKuad",
        author_icon_url: "https://avatars2.githubusercontent.com/u/53811809?v=4",
        description: "## きっかけ  [個人開発](https://github.com/aKuad/web-dmx)にて、[PlatformIO](https://platformio.org/)[^pio] でマイコ",
        thumbnail_url: "",
        post_date: new Date("2025-12-22T13:20:00.000Z"),
        update_date: new Date("2025-12-30T14:07:21.000Z"),
      },
      {
        site_name: "Qiita",
        site_icon_url: "https://qiita.com/favicon.ico",
        title: "GitHub Actions バージョンアプデ自動化めちゃ楽だった 〜はじめての Dependabot〜",
        url: "https://qiita.com/aKuad/items/afd4585e7479dc4319f0",
        author_name: "aKuad",
        author_url: "https://qiita.com/aKuad",
        author_icon_url: "https://avatars2.githubusercontent.com/u/53811809?v=4",
        description: "## ある日  [あるリポジトリ](https://github.com/aKuad/docs-gen-samples)を久々に更新して、そのついでにワークフローで使用している Action のバージ",
        thumbnail_url: "",
        post_date: new Date("2026-01-11T06:19:08.000Z"),
        update_date: new Date("2026-01-11T06:19:08.000Z"),
      },
      {
        site_name: "Qiita",
        site_icon_url: "https://qiita.com/favicon.ico",
        title: "〜プレビューデプロイを求めて〜 GitHub Actions から Cloudflare Pages へデプロイ",
        url: "https://qiita.com/aKuad/items/86c9b6774329f58f7695",
        author_name: "aKuad",
        author_url: "https://qiita.com/aKuad",
        author_icon_url: "https://avatars2.githubusercontent.com/u/53811809?v=4",
        description: "## 取り扱っているのは  こちら、Doxygen などソースコードドキュメントジェネレータのサンプル集てきなものを作っています。  https://github.com/aKuad/docs-gen",
        thumbnail_url: "",
        post_date: new Date("2026-01-29T13:30:01.000Z"),
        update_date: new Date("2026-01-29T13:53:49.000Z"),
      },
      {
        site_name: "Qiita",
        site_icon_url: "https://qiita.com/favicon.ico",
        title: "GitHub リポジトリの 'Deployments' に表示させるには？",
        url: "https://qiita.com/aKuad/items/9d1cb399b2846f61648d",
        author_name: "aKuad",
        author_url: "https://qiita.com/aKuad",
        author_icon_url: "https://avatars2.githubusercontent.com/u/53811809?v=4",
        description: "## GitHub リポジトリの 'Deployments' って？  これのことです。  ![GitHub Repositoy - Deployments](https://qiita-image-",
        thumbnail_url: "",
        post_date: new Date("2026-02-13T12:25:53.000Z"),
        update_date: new Date("2026-03-09T12:53:20.000Z"),
      }],
      fail_reasons: []
    };

    assertEquals(posts_actual, posts_expected);
  });


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
