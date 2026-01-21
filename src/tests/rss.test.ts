/**
 * Posts fetching tests from RSS feed
 */

import { serveDir } from "jsr:@std/http@1";
import { assertEquals } from "jsr:@std/assert@1";

import { sleep } from "../util/sleep.ts";

import { fetch_posts } from "../fetch_posts.ts";
import { Post } from "../types.ts";


Deno.test(async function test_rss(t) {
  /* Test HTTP server start */
  const test_server = Deno.serve(async request => {
    if(request.headers.get("no-icon-test") === "true" && new URL(request.url).pathname === "/favicon.ico")
      return new Response("Not Found", { status: 404, statusText: "Not Found" });

    const response_delay_ms = request.headers.get("late-response-test");
    if(response_delay_ms)
      await new Promise(resolve => setTimeout(resolve, Number(response_delay_ms)));

    return serveDir(request, { fsRoot: "./test_data", urlRoot: "", quiet: true })
  });


  /**
   * - Can fetch and return posts data from specified URL
   */
  await t.step(async function rss_true() {
    const posts_general_actual   = await fetch_posts([{ type: "rss", url: "http://localhost:8000/rss/true_general.xml" }]);
    const posts_webMaster_actual = await fetch_posts([{ type: "rss", url: "http://localhost:8000/rss/true_webMaster.xml" }]);
    const date_at_webMaster_test = new Date();
    const posts_copyright_actual = await fetch_posts([{ type: "rss", url: "http://localhost:8000/rss/true_copyright.xml" }]);
    const date_at_copyright_test = new Date();
    const posts_minimum_actual   = await fetch_posts([{ type: "rss", url: "http://localhost:8000/rss/true_minimum.xml", headers: { "no-icon-test": "true" } }]);
    const date_at_minimum_test   = new Date();

    const posts_general_expected: Post[] = [
      {
        site_name: "localhost",
        site_icon_url: "http://localhost:8000/favicon.ico",
        title: "Fully case item - title",
        url: "http://example.com/articles/item1",
        author_name: "Item author",
        author_url: "mailto:item-author@example.com",
        author_icon_url: undefined,
        description: "Fully case item - description",
        thumbnail_url: "http://example.com/item-enclosure.png",
        post_date: new Date("Thu, 04 Dec 2025 01:00:00 GMT"),
        update_date: new Date("Thu, 04 Dec 2025 01:00:00 GMT")
      },
      {
        site_name: "localhost",
        site_icon_url: "http://localhost:8000/favicon.ico",
        title: "Non image enclosure item - title",
        url: "http://example.com/articles",
        author_name: "Managing Editor",
        author_url: "mailto:managing-editor@example.com",
        author_icon_url: undefined,
        description: "General description",
        thumbnail_url: "http://example.com/channel-image.png",
        post_date: new Date("Thu, 04 Dec 2025 12:00:00 GMT"),
        update_date: new Date("Thu, 04 Dec 2025 12:00:00 GMT")
      },
      {
        site_name: "localhost",
        site_icon_url: "http://localhost:8000/favicon.ico",
        title: "Minimum case item - title",
        url: "http://example.com/articles",
        author_name: "Managing Editor",
        author_url: "mailto:managing-editor@example.com",
        author_icon_url: undefined,
        description: "General description",
        thumbnail_url: "http://example.com/channel-image.png",
        post_date: new Date("Thu, 04 Dec 2025 12:00:00 GMT"),
        update_date: new Date("Thu, 04 Dec 2025 12:00:00 GMT")
      },
      {
        site_name: "localhost",
        site_icon_url: "http://localhost:8000/favicon.ico",
        title: "General title",
        url: "http://example.com/articles",
        author_name: "Managing Editor",
        author_url: "mailto:managing-editor@example.com",
        author_icon_url: undefined,
        description: "Minimum case item - description",
        thumbnail_url: "http://example.com/channel-image.png",
        post_date: new Date("Thu, 04 Dec 2025 12:00:00 GMT"),
        update_date: new Date("Thu, 04 Dec 2025 12:00:00 GMT")
      }
    ];

    const posts_webMaster_expected = [
      {
        site_name: "localhost",
        site_icon_url: "http://localhost:8000/favicon.ico",
        title: "webMaster test case item - title",
        url: "http://example.com/articles",
        author_name: "Web Master",
        author_url: "mailto:web-master@example.com",
        author_icon_url: undefined,
        description: "General description",
        thumbnail_url: undefined,
        post_date: undefined,
        update_date: date_at_webMaster_test
      }
    ];

    const posts_copyright_expected = [
      {
        site_name: "localhost",
        site_icon_url: "http://localhost:8000/favicon.ico",
        title: "copyright test case item - title",
        url: "http://example.com/articles",
        author_name: "Copyright 2025, aKuad",
        author_url: undefined,
        author_icon_url: undefined,
        description: "General description",
        thumbnail_url: undefined,
        post_date: undefined,
        update_date: date_at_copyright_test
      }
    ];

    const posts_minimum_expected: Post[] = [
      {
        site_name: "localhost",
        site_icon_url: undefined,
        title: "Minimum case item - title",
        url: "http://example.com/articles",
        author_name: "localhost",
        author_url: undefined,
        author_icon_url: undefined,
        description: "General description",
        thumbnail_url: undefined,
        post_date: undefined,
        update_date: date_at_minimum_test
      }
    ];

    assertEquals(posts_general_actual,   posts_general_expected);
    assertEquals(posts_webMaster_actual, posts_webMaster_expected);
    assertEquals(posts_copyright_actual, posts_copyright_expected);
    assertEquals(posts_minimum_actual,   posts_minimum_expected);
  });


  /**
   * - When invalid URL passed, returns empty array with error message logging
   * - When invalid file as RSS fetched, returns empty array with error message logging
   */
  await t.step(async function rss_err() {
    const posts_invalid_url    = fetch_posts([{ type: "rss", url: "non_url_string" }]);
    const posts_timeout        = fetch_posts([{ type: "rss", url: "http://localhost:8000/rss/true_general.xml", timeout_ms: 100, headers: { "late-response-test": "500" } }]);
    const posts_not_found      = fetch_posts([{ type: "rss", url: "http://localhost:8000/rss/non_existing_file" }]);
    const posts_non_xml        = fetch_posts([{ type: "rss", url: "http://localhost:8000/rss/err_non_xml.xml" }]);
    const posts_no_rss         = fetch_posts([{ type: "rss", url: "http://localhost:8000/rss/err_no_rss.xml" }]);
    const posts_no_channel     = fetch_posts([{ type: "rss", url: "http://localhost:8000/rss/err_no_channel.xml" }]);
    const posts_no_title       = fetch_posts([{ type: "rss", url: "http://localhost:8000/rss/err_no_title.xml" }]);
    const posts_no_link        = fetch_posts([{ type: "rss", url: "http://localhost:8000/rss/err_no_link.xml" }]);
    const posts_no_description = fetch_posts([{ type: "rss", url: "http://localhost:8000/rss/err_no_description.xml" }]);
    const posts_no_items       = fetch_posts([{ type: "rss", url: "http://localhost:8000/rss/err_no_items.xml" }]);
    const posts_empty_item     = fetch_posts([{ type: "rss", url: "http://localhost:8000/rss/err_empty_item.xml" }]);
    assertEquals(await posts_invalid_url    , []);
    assertEquals(await posts_timeout        , []);
    assertEquals(await posts_not_found      , []);
    assertEquals(await posts_non_xml        , []);
    assertEquals(await posts_no_rss         , []);
    assertEquals(await posts_no_channel     , []);
    assertEquals(await posts_no_title       , []);
    assertEquals(await posts_no_link        , []);
    assertEquals(await posts_no_description , []);
    assertEquals(await posts_no_items       , []);
    assertEquals(await posts_empty_item     , []);
  });


  /* Test HTTP server shutdown */
  await sleep(100); // Interval for fetch() completed before shutdown
  await test_server.shutdown();
});
