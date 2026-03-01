/**
 * Posts fetching tests from RSS feed
 */

import { serveDir } from "jsr:@std/http@1";
import { assertEquals } from "jsr:@std/assert@1";

import { sleep } from "../util.ts";

import { fetch_posts } from "../fetch_posts.ts";
import { FeedTarget, FetchResult } from "../types.ts";


Deno.test(async function test_rss(t) {
  /* Test HTTP server start */
  const test_server = Deno.serve(async request => {
    if(request.headers.get("no-icon-test") === "true" && new URL(request.url).pathname === "/favicon.ico")
      return new Response("Not Found", { status: 404, statusText: "Not Found" });

    const response_delay_ms = request.headers.get("late-response-test");
    if(response_delay_ms)
      await sleep(Number(response_delay_ms));

    return serveDir(request, { fsRoot: "./test_data/rss", urlRoot: "", quiet: true })
  });


  /**
   * - Can fetch and return posts data from specified URL
   */
  await t.step(async function rss_true() {
    const posts_general_actual   = await fetch_posts([{ type: "rss", url: "http://localhost:8000/true_general.xml" }]);
    const posts_webMaster_actual = await fetch_posts([{ type: "rss", url: "http://localhost:8000/true_webMaster.xml" }]);
    const date_at_webMaster_test = new Date();
    const posts_copyright_actual = await fetch_posts([{ type: "rss", url: "http://localhost:8000/true_copyright.xml" }]);
    const date_at_copyright_test = new Date();
    const posts_minimum_actual   = await fetch_posts([{ type: "rss", url: "http://localhost:8000/true_minimum.xml", headers: { "no-icon-test": "true" } }]);
    const date_at_minimum_test   = new Date();

    const posts_general_expected: FetchResult = {
      posts: [
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
      ],
      fail_reasons: []
    };

    const posts_webMaster_expected: FetchResult = {
      posts: [{
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
      }],
      fail_reasons: []
    };

    const posts_copyright_expected: FetchResult = {
      posts: [{
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
      }],
      fail_reasons: []
    };

    const posts_minimum_expected: FetchResult = {
      posts: [{
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
      }],
      fail_reasons: []
    };

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
    const invalid_url_target   : FeedTarget = { type: "rss", url: "non_url_string" };
    const timeout_target       : FeedTarget = { type: "rss", url: "http://localhost:8000/true_general.xml", timeout_ms: 100, headers: { "late-response-test": "500" } };
    const not_found_target     : FeedTarget = { type: "rss", url: "http://localhost:8000/non_existing_file" };
    const non_xml_target       : FeedTarget = { type: "rss", url: "http://localhost:8000/err_non_xml.xml" };
    const no_rss_target        : FeedTarget = { type: "rss", url: "http://localhost:8000/err_no_rss.xml" };
    const no_channel_target    : FeedTarget = { type: "rss", url: "http://localhost:8000/err_no_channel.xml" };
    const no_title_target      : FeedTarget = { type: "rss", url: "http://localhost:8000/err_no_title.xml" };
    const no_link_target       : FeedTarget = { type: "rss", url: "http://localhost:8000/err_no_link.xml" };
    const no_description_target: FeedTarget = { type: "rss", url: "http://localhost:8000/err_no_description.xml" };
    const no_items_target      : FeedTarget = { type: "rss", url: "http://localhost:8000/err_no_items.xml" };
    const empty_item_target    : FeedTarget = { type: "rss", url: "http://localhost:8000/err_empty_item.xml" };

    const invalid_url_actual    = fetch_posts([invalid_url_target]);
    const timeout_actual        = fetch_posts([timeout_target]);
    const not_found_actual      = fetch_posts([not_found_target]);
    const non_xml_actual        = fetch_posts([non_xml_target]);
    const no_rss_actual         = fetch_posts([no_rss_target]);
    const no_channel_actual     = fetch_posts([no_channel_target]);
    const no_title_actual       = fetch_posts([no_title_target]);
    const no_link_actual        = fetch_posts([no_link_target]);
    const no_description_actual = fetch_posts([no_description_target]);
    const no_items_actual       = fetch_posts([no_items_target]);
    const empty_item_actual     = fetch_posts([empty_item_target]);

    const invalid_url_expected   : FetchResult = { posts: [], fail_reasons: [{ target: invalid_url_target   , severity: "error"  , category: "FetchParamError", detail: "TypeError: Invalid URL: 'non_url_string'" }]};
    const timeout_expected       : FetchResult = { posts: [], fail_reasons: [{ target: timeout_target       , severity: "error"  , category: "TimeoutError"   , detail: "Request timeout" }]};
    const not_found_expected     : FetchResult = { posts: [], fail_reasons: [{ target: not_found_target     , severity: "error"  , category: "HTTPError"      , detail: "Not Found" }]};
    const non_xml_expected       : FetchResult = { posts: [], fail_reasons: [{ target: non_xml_target       , severity: "error"  , category: "ParseError"     , detail: "SyntaxError: Malformed XML document: empty document or no root node detected" }]};
    const no_rss_expected        : FetchResult = { posts: [], fail_reasons: [{ target: no_rss_target        , severity: "error"  , category: "DataMissing"    , detail: "<rss> tag required, but not found" }]};
    const no_channel_expected    : FetchResult = { posts: [], fail_reasons: [{ target: no_channel_target    , severity: "error"  , category: "DataMissing"    , detail: "<channel> tag required, but not found" }]};
    const no_title_expected      : FetchResult = { posts: [], fail_reasons: [{ target: no_title_target      , severity: "error"  , category: "DataMissing"    , detail: "At <channel> tag, <title> tag required, but not found" }]};
    const no_link_expected       : FetchResult = { posts: [], fail_reasons: [{ target: no_link_target       , severity: "error"  , category: "DataMissing"    , detail: "At <channel> tag, <link> tag required, but not found" }]};
    const no_description_expected: FetchResult = { posts: [], fail_reasons: [{ target: no_description_target, severity: "error"  , category: "DataMissing"    , detail: "At <channel> tag, <description> tag required, but not found" }]};
    const no_items_expected      : FetchResult = { posts: [], fail_reasons: [{ target: no_items_target      , severity: "warning", category: "DataMissing"    , detail: "No <item> tags found, no posts fetched" }]};
    const empty_item_expected    : FetchResult = { posts: [], fail_reasons: [{ target: empty_item_target    , severity: "error"  , category: "DataMissing"    , detail: "At an <item> tag index 0, <title> or <description> tag required, but not found" }]};

    assertEquals(await invalid_url_actual   , invalid_url_expected);
    assertEquals(await timeout_actual       , timeout_expected);
    assertEquals(await not_found_actual     , not_found_expected);
    assertEquals(await non_xml_actual       , non_xml_expected);
    assertEquals(await no_rss_actual        , no_rss_expected);
    assertEquals(await no_channel_actual    , no_channel_expected);
    assertEquals(await no_title_actual      , no_title_expected);
    assertEquals(await no_link_actual       , no_link_expected);
    assertEquals(await no_description_actual, no_description_expected);
    assertEquals(await no_items_actual      , no_items_expected);
    assertEquals(await empty_item_actual    , empty_item_expected);
  });


  /* Test HTTP server shutdown */
  await sleep(100); // Interval for fetch() completed before shutdown
  await test_server.shutdown();
});
