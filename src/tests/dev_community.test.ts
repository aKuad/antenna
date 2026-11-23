/**
 * Posts fetching tests from DEV Community
 */

import { serveFile } from "jsr:@std/http@1";
import { assertEquals } from "jsr:@std/assert@1";
import { delay } from "jsr:@std/async@1/delay";

import { fetch_posts } from "../fetch_posts.ts";
import { FetchResult, SiteTarget } from "../types.ts";


Deno.test(async function test_dev_community(t) {
  /* Test HTTP server start */
  const test_server = Deno.serve(async request => {
    const url = new URL(request.url);
    if(url.pathname === "/favicon.ico")
      return serveFile(request, "./test_data/zenn/favicon.ico");

    const response_delay_ms = request.headers.get("late-response-test");
    if(response_delay_ms)
      await delay(Number(response_delay_ms));

    if(request.headers.get("rate-limit-exceeded-test") === "true")
      return new Response(Deno.readTextFileSync("./test_data/dev_community/err_rate_limit_exceeded.json"), { status: 429 });

    if(request.headers.get("500-error-test") === "true")
      return new Response("", { status: 500 });

    if(url.searchParams.get("username") !== "uid")
      return await serveFile(request, "./test_data/dev_community/err_uid_non_exist.json");

    const res_page = url.searchParams.get("page") === "2" ? "2" : "1";  // If no specified, select 1
    return await serveFile(request, `./test_data/dev_community/true_items_page${res_page}.json`);
  });


  /**
   * - Can fetch and map articles from a specified user
   */
  await t.step(async function dev_community_true() {
    const posts_actual = await fetch_posts([{ site_name: "dev_community", uid: "uid" }], undefined, true);
    await fetch_posts([{ site_name: "dev_community", uid: "aKuad" }]); // For make test coverage of branch 100%

    const posts_expected: FetchResult = {
      posts: [{
      site_name: "DEV Community",
      site_icon_url: "https://dev.to/favicon.ico",
      title: "PlatformIO on GitHub Actions with cache accelerate",
      url: "https://dev.to/akuad/platformio-on-github-actions-with-cache-accelerate-4cm9",
      author_name: "aKuad",
      author_url: "https://dev.to/akuad",
      author_icon_url: "https://media2.dev.to/dynamic/image/width=640,height=640,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1258090%2Fb2174e7c-3162-41a5-880a-208e454617eb.png",
      description: "Sample on official doc available   Official documentation suggests example workflow of using...",
      thumbnail_url: "",
      post_date: new Date("2025-12-30T13:56:50Z"),
      update_date: new Date("2025-12-30T13:56:50Z")
      },
      {
        site_name: "DEV Community",
        site_icon_url: "https://dev.to/favicon.ico",
        title: "Alternative of 'for' in Python",
        url: "https://dev.to/akuad/alternative-of-for-in-python-3537",
        author_name: "aKuad",
        author_url: "https://dev.to/akuad",
        author_icon_url: "https://media2.dev.to/dynamic/image/width=640,height=640,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1258090%2Fb2174e7c-3162-41a5-880a-208e454617eb.png",
        description: "JavaScript version:         Alternative of 'for' in JavaScript                                       ...",
        thumbnail_url: "",
        post_date: new Date("2025-06-28T02:38:26Z"),
        update_date: new Date("2026-09-26T01:40:52Z")
      },
      {
        site_name: "DEV Community",
        site_icon_url: "https://dev.to/favicon.ico",
        title: "3 (+1) ways of Deploy to Deno Deploy",
        url: "https://dev.to/akuad/3-1-ways-for-deploy-to-deno-deploy-4gi6",
        author_name: "aKuad",
        author_url: "https://dev.to/akuad",
        author_icon_url: "https://media2.dev.to/dynamic/image/width=640,height=640,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1258090%2Fb2174e7c-3162-41a5-880a-208e454617eb.png",
        description: "Note: These UI images are for Deno Deploy Classic, and already it sunsetted.            What is Deno...",
        thumbnail_url: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fiaiknip2uss2i0clml36.webp",
        post_date: new Date("2025-07-04T14:01:51Z"),
        update_date: new Date("2026-11-23T13:41:58Z")
      },
      {
        site_name: "DEV Community",
        site_icon_url: "https://dev.to/favicon.ico",
        title: "GitHub Pages official supported Jekyll themes screenshot",
        url: "https://dev.to/akuad/github-pages-official-supported-jekyll-themes-screenshot-4c2o",
        author_name: "aKuad",
        author_url: "https://dev.to/akuad",
        author_icon_url: "https://media2.dev.to/dynamic/image/width=640,height=640,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1258090%2Fb2174e7c-3162-41a5-880a-208e454617eb.png",
        description: "About   (No detail of GitHub Pages deployment here.)  GitHub Pages official supported themes...",
        thumbnail_url: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fab6qw23zpc5mk86n8eww.webp",
        post_date: new Date("2025-09-27T03:35:11Z"),
        update_date: new Date("2026-11-23T13:42:39Z")
      }],
      fail_reasons: []
    };

    assertEquals(posts_actual, posts_expected);
  });


  /**
   * - When response reached timeout duration, returns "TimeoutError" fail reason
   * - When invalid header passed, returns "FetchParamError" fail reason
   * - When non-existent ID specified, returns "DataMissing" fail reason
   * - When rate limit exceeded, returns "HTTPError" fail reason
   * - When server error occurred, returns "HTTPError" fail reason
   */
  await t.step(async function dev_community_err() {
    const timeout_target       : SiteTarget = { site_name: "dev_community", uid: "uid", timeout_ms: 100, headers: { "late-response-test": "500" } };
    const invalid_header_target: SiteTarget = { site_name: "dev_community", uid: "uid", headers: { "invalid header": "content" } };
    const uid_non_exists_target: SiteTarget = { site_name: "dev_community", uid: "non-exist" };
    const rate_limit_target    : SiteTarget = { site_name: "dev_community", uid: "uid", headers: { "rate-limit-exceeded-test": "true" } };
    const server_error_target  : SiteTarget = { site_name: "dev_community", uid: "uid", headers: { "500-error-test": "true" } };

    const timeout_actual        = await fetch_posts([timeout_target], undefined, true);
    const invalid_header_actual = await fetch_posts([invalid_header_target], undefined, true);
    const uid_non_exists_actual = await fetch_posts([uid_non_exists_target], undefined, true);
    const rate_limit_actual     = await fetch_posts([rate_limit_target], undefined, true);
    const server_error_actual   = await fetch_posts([server_error_target], undefined, true);

    const timeout_expected       : FetchResult = { posts: [], fail_reasons: [{ target: timeout_target       , severity: "error"  , category: "TimeoutError"   , detail: "Request timeout" }]};
    const invalid_header_expected: FetchResult = { posts: [], fail_reasons: [{ target: invalid_header_target, severity: "error"  , category: "FetchParamError", detail: 'TypeError: Invalid header name: "invalid header"' }]};
    const uid_non_exists_expected: FetchResult = { posts: [], fail_reasons: [{ target: uid_non_exists_target, severity: "warning", category: "DataMissing"    , detail: "User ID non exist or no posted" }]};
    const rate_limit_expected    : FetchResult = { posts: [], fail_reasons: [{ target: rate_limit_target    , severity: "error"  , category: "HTTPError"      , detail: "Too Many Requests" }]};
    const server_error_expected  : FetchResult = { posts: [], fail_reasons: [{ target: server_error_target  , severity: "error"  , category: "HTTPError"      , detail: "Internal Server Error" }]};

    assertEquals(timeout_actual       , timeout_expected);
    assertEquals(invalid_header_actual, invalid_header_expected);
    assertEquals(uid_non_exists_actual, uid_non_exists_expected);
    assertEquals(rate_limit_actual    , rate_limit_expected);
    assertEquals(server_error_actual  , server_error_expected);
  });


  /* Test HTTP server shutdown */
  await delay(100); // Interval for fetch() completed before shutdown
  await test_server.shutdown();
});
