/**
 * Posts fetching tests from note site
 */

import { serveFile } from "jsr:@std/http@1";
import { assertEquals } from "jsr:@std/assert@1";

import { sleep } from "../util.ts";

import { fetch_posts } from "../fetch_posts.ts";
import { SiteTarget, FetchResult } from "../types.ts";

Deno.test(async function test_note(t) {
  /* Test HTTP server start */
  const test_server = Deno.serve(async (request) => {
    const url = new URL(request.url);
    if (url.pathname === "/favicon.ico")
      return serveFile(request, "./test_data/qiita/favicon.ico");

    const response_delay_ms = request.headers.get("late-response-test");
    if (response_delay_ms)
      await sleep(Number(response_delay_ms));

    if (request.headers.get("500-error-test") === "true")
      return new Response("", { status: 500 });

    if (url.pathname === "/no-posts")
      return new Response(Deno.readTextFileSync("./test_data/note/err_no_posts.json"));

    if (url.pathname !== "/uid")
      return new Response(Deno.readTextFileSync("./test_data/note/err_uid_non_exists.json"), { status: 404 });

    const res_page = url.searchParams.get("page") === "2" ? "2" : "1";  // If no specified, select 1
    return await serveFile(request, `./test_data/note/true_items_page${res_page}.json`);
  });

  /**
   * - Can fetch and return posts data from specified user ID
   */
  await t.step(async function note_true() {
    const posts_actual = await fetch_posts([{ site_name: "note", uid: "uid" }], undefined, true);
    await fetch_posts([{ site_name: "note", uid: "aKuad" }]); // For make test coverage of branch 100%

    const posts_expected: FetchResult = {
      posts: [{
        site_name: "note",
        site_icon_url: "https://note.com/favicon.ico",
        title: "自己紹介 & 個人開発記 Note を始めたきっかけ",
        url: "https://note.com/akuad/n/n3e0b25bfafdd",
        author_name: "aKuad",
        author_url: "https://note.com/akuad",
        author_icon_url: "https://assets.st-note.com/production/uploads/images/185187420/profile_5f33ee3bcc9db14dcf4405cb9e7437f4.png?fit=bounds&format=jpeg&quality=85&width=330",
        description: "軽く自己紹介aKuad と申します。仕事では回路設計や組み込みプログラム開発なんかをしています。  プライベートでは Web アプリ開発を主にしています。何か発見したこととかあれば、技術記事書きもしています。  本 Note に書く内容ときっかけ表題にあるように、個人開発記を Note に残していきます。  開発したアプリはフリーで公開していて、これまでの作品はこちら。  [自分の Web ページ",
        thumbnail_url: "https://assets.st-note.com/production/uploads/images/186946493/rectangle_large_type_2_fb66cbc42b23e306ed49d8ea8016ac6a.png?fit=bounds&quality=85&width=1280",
        post_date: new Date("2025-04-28T14:36:32.000Z"),
        update_date: new Date("2025-04-28T14:36:32.000Z")
      },
      {
        site_name: "note",
        site_icon_url: "https://note.com/favicon.ico",
        title: "単発 #03 大人の夏の自由工作Ⅰ - インターホンtoメッセンジャーアプリ通知機",
        url: "https://note.com/akuad/n/na358a1ee1e93",
        author_name: "aKuad",
        author_url: "https://note.com/akuad",
        author_icon_url: "https://assets.st-note.com/production/uploads/images/185187420/profile_5f33ee3bcc9db14dcf4405cb9e7437f4.png?fit=bounds&format=jpeg&quality=85&width=330",
        description: "自室でインターホンが聞こえ辛い問題自宅でデスクトップなどを置いてある自室があるのですが、インターホンの音がその部屋で聞こえ辛いという問題が発覚しました。ヘッドホンで音を聞いていようものならなおのこと。  これでは配送の受け取りをしそびれて迷惑をかけてしまいます。さてどうしたものか･･･。  おきらくに IoT できる便利な時代そんなある日、昔買ったっきり放置していたマイコンのことをふと思い出しまし",
        thumbnail_url: "https://assets.st-note.com/production/uploads/images/306679544/rectangle_large_type_2_93dec6b48d3a05ffdd2407abad60502b.png?fit=bounds&quality=85&width=1280",
        post_date: new Date("2026-08-16T13:31:44.000Z"),
        update_date: new Date("2026-08-16T13:31:44.000Z"),
      },
      {
        site_name: "note",
        site_icon_url: "https://note.com/favicon.ico",
        title: "単発 #04 大人の夏の自由工作Ⅱ - ステージ返しスピーカースタンドの自作",
        url: "https://note.com/akuad/n/n2b524eca1009",
        author_name: "aKuad",
        author_url: "https://note.com/akuad",
        author_icon_url: "https://assets.st-note.com/production/uploads/images/185187420/profile_5f33ee3bcc9db14dcf4405cb9e7437f4.png?fit=bounds&format=jpeg&quality=85&width=330",
        description: "いつものソフト個人開発からは離れますが、作ったものを紹介・共有したかったので、普段とちょっと違う特殊回。  ステージ返しとはステージの演者に向けて鳴るスピーカーのことです。ステージ上にある、こんな感じのやつ。イベントやテレビとかで、一度や二度くらいは見かけたこともあるのでは。  客席に向けて鳴るスピーカーって、演者には意外と聞こえ辛いんですよね。そこでこの返しスピーカーによって、演者はタイミングや",
        thumbnail_url: "https://assets.st-note.com/production/uploads/images/306329188/rectangle_large_type_2_b3d6d12bb770dbb4cb72fbd7556d2527.png?fit=bounds&quality=85&width=1280",
        post_date: new Date("2026-08-23T13:17:58.000Z"),
        update_date: new Date("2026-08-23T13:17:58.000Z"),
      },
      {
        site_name: "note",
        site_icon_url: "https://note.com/favicon.ico",
        title: "DMX コントローラ WebApp #22 エンディアンの壁にぶつかるの巻",
        url: "https://note.com/akuad/n/nd6a685a789d5",
        author_name: "aKuad",
        author_url: "https://note.com/akuad",
        author_icon_url: "https://assets.st-note.com/production/uploads/images/185187420/profile_5f33ee3bcc9db14dcf4405cb9e7437f4.png?fit=bounds&format=jpeg&quality=85&width=330",
        description: "enum でアレコレするやつで問題発生#22 にて、C の enum と struct を応用して、ビット単位でやりくりするやつを紹介しました。早速これを実装して、とテストしていましたら･･･？  uint8_t test_input_max[3] = { 0b00100001, 0b11111111, DMX_VALUE_MAX };//                    lane_on b",
        thumbnail_url: "",
        post_date: new Date("2026-09-27T13:47:56.000Z"),
        update_date: new Date("2026-09-27T13:47:56.000Z"),
      }],
      fail_reasons: []
    };

    assertEquals(posts_actual, posts_expected);
  });

  /**
   * - When response reached timeout duration, returns "TimeoutError" fail reason
   * - When invalid header passed, returns "FetchParamError" fail reason
   * - When non exist ID specified, returns "DataMissing" fail reason
   * - When server error occurred, returns "HTTPError" fail reason
   */
  await t.step(async function note_err() {
    const timeout_target       : SiteTarget = { site_name: "note", uid: "uid", timeout_ms: 100, headers: { "late-response-test": "500" }};
    const invalid_header_target: SiteTarget = { site_name: "note", uid: "uid", headers: { "invalid header": "content" } };
    const uid_non_exists_target: SiteTarget = { site_name: "note", uid: "non-exist", };
    const server_error_target  : SiteTarget = { site_name: "note", uid: "uid", headers: { "500-error-test": "true" } };
    const no_posts_target      : SiteTarget = { site_name: "note", uid: "no-posts"};

    const timeout_actual        = fetch_posts([timeout_target]       , undefined, true);
    const invalid_header_actual = fetch_posts([invalid_header_target], undefined, true);
    const uid_non_exists_actual = fetch_posts([uid_non_exists_target], undefined, true);
    const server_error_actual   = fetch_posts([server_error_target]  , undefined, true);
    const no_posts_actual       = fetch_posts([no_posts_target]      , undefined, true);

    const timeout_expected       : FetchResult = { posts: [], fail_reasons: [{ target: timeout_target       , severity: "error"  , category: "TimeoutError"   , detail: "Request timeout" }]};
    const invalid_header_expected: FetchResult = { posts: [], fail_reasons: [{ target: invalid_header_target, severity: "error"  , category: "FetchParamError", detail: 'TypeError: Invalid header name: "invalid header"' }]};
    const uid_non_exists_expected: FetchResult = { posts: [], fail_reasons: [{ target: uid_non_exists_target, severity: "error"  , category: "HTTPError"      , detail: "リソースが見つかりません" }]};
    const server_error_expected  : FetchResult = { posts: [], fail_reasons: [{ target: server_error_target  , severity: "error"  , category: "HTTPError"      , detail: "Internal Server Error" }]};
    const no_posts_expected      : FetchResult = { posts: [], fail_reasons: [{ target: no_posts_target      , severity: "warning", category: "DataMissing"    , detail: "No posted" }]};

    assertEquals(await timeout_actual       , timeout_expected);
    assertEquals(await invalid_header_actual, invalid_header_expected);
    assertEquals(await uid_non_exists_actual, uid_non_exists_expected);
    assertEquals(await server_error_actual  , server_error_expected);
    assertEquals(await no_posts_actual      , no_posts_expected);
  });

  /* Test HTTP server shutdown */
  await sleep(100); // Interval for fetch() completed before shutdown
  await test_server.shutdown();
});
