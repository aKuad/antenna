/**
 * Posts fetching tests from Atom feed
 */

import { serveDir } from "jsr:@std/http@1";
import { assertEquals } from "jsr:@std/assert@1";

import { sleep } from "../util.ts";

import { fetch_posts } from "../fetch_posts.ts";
import { FeedTarget, FetchResult } from "../types.ts";


Deno.test(async function test_atom(t) {
  /* Test HTTP server start */
  const test_server = Deno.serve(async request => {
    if(request.headers.get("no-icon-test") === "true" && new URL(request.url).pathname === "/favicon.ico")
      return new Response("Not Found", { status: 404, statusText: "Not Found" });

    const response_delay_ms = request.headers.get("late-response-test");
    if(response_delay_ms)
      await sleep(Number(response_delay_ms));

    return serveDir(request, { fsRoot: "./test_data/atom", urlRoot: "", quiet: true });
  });


  /**
   * - Can fetch and return posts data from specified URL
   */
  await t.step(async function atom_true() {
    const posts_general_actual      = await fetch_posts([{ type: "atom", url: "http://localhost:8000/true_general.xml" }]);
    const posts_email_scheme_actual = await fetch_posts([{ type: "atom", url: "http://localhost:8000/true_email_scheme.xml" }]);
    const posts_minimum_actual      = await fetch_posts([{ type: "atom", url: "http://localhost:8000/true_minimum.xml", headers: { "no-icon-test": "true" } }]);

    const posts_general_expected: FetchResult = {
      posts: [
        {
          site_name: "localhost",
          site_icon_url: "http://localhost:8000/icon.ico",
          title: "Fully case entry",
          url: "http://example.com/entry",
          author_name: "Fully case entry author",
          author_url: "http://example.com/author/entry-author",
          author_icon_url: undefined,
          description: "Entry summary",
          thumbnail_url: "http://localhost:8000/logo.png",
          post_date: new Date("2025-11-01T00:00:00Z"),
          update_date: new Date("2025-11-01T00:01:00Z")
        },
        {
          site_name: "localhost",
          site_icon_url: "http://localhost:8000/icon.ico",
          title: "Minimum case entry",
          url: "http://example.com/",
          author_name: "General author",
          author_url: "http://example.com/author/general-author",
          author_icon_url: undefined,
          description: "General subtitle",
          thumbnail_url: "http://localhost:8000/logo.png",
          post_date: undefined,
          update_date: new Date("2025-11-01T01:00:00Z")
        }
      ],
      fail_reasons: []
    };

    const posts_email_scheme_expected: FetchResult = {
      posts: [
        {
          site_name: "localhost",
          site_icon_url: "http://localhost:8000/favicon.ico",
          title: "Author specified entry",
          url: "http://localhost:8000",
          author_name: "Entry author",
          author_url: "mailto:entry-author@example.com",
          author_icon_url: undefined,
          description: undefined,
          thumbnail_url: undefined,
          post_date: undefined,
          update_date: new Date("2025-11-01T20:01:00Z")
        },
        {
          site_name: "localhost",
          site_icon_url: "http://localhost:8000/favicon.ico",
          title: "Minimum case entry",
          url: "http://localhost:8000",
          author_name: "General author",
          author_url: "mailto:general-author@example.com",
          author_icon_url: undefined,
          description: undefined,
          thumbnail_url: undefined,
          post_date: undefined,
          update_date: new Date("2025-11-01T20:02:00Z")
        }
      ],
      fail_reasons: []
    };

    const posts_minimum_expected: FetchResult = {
      posts: [
        {
          site_name: "localhost",
          site_icon_url: undefined,
          title: "Minimum case entry",
          url: "http://localhost:8000",
          author_name: "localhost",
          author_url: undefined,
          author_icon_url: undefined,
          description: undefined,
          thumbnail_url: undefined,
          post_date: undefined,
          update_date: new Date("2025-11-01T10:01:00Z")
        }
      ],
      fail_reasons: []
    };

    assertEquals(posts_general_actual     , posts_general_expected);
    assertEquals(posts_email_scheme_actual, posts_email_scheme_expected);
    assertEquals(posts_minimum_actual     , posts_minimum_expected);
  });


  /**
   * - When invalid URL passed, returns empty array with error message logging
   * - When invalid file as atom fetched, returns empty array with error message logging
   */
  await t.step(async function atom_err() {
    const invalid_url_target: FeedTarget = { type: "atom", url: "non_url_string" };
    const timeout_target    : FeedTarget = { type: "atom", url: "http://localhost:8000/true_general.xml", timeout_ms: 100, headers: { "late-response-test": "500" } };
    const not_found_target  : FeedTarget = { type: "atom", url: "http://localhost:8000/non_existing_file" };
    const non_xml_target    : FeedTarget = { type: "atom", url: "http://localhost:8000/err_non_xml.xml" };
    const no_feed_target    : FeedTarget = { type: "atom", url: "http://localhost:8000/err_no_feed.xml" };
    const no_entries_target : FeedTarget = { type: "atom", url: "http://localhost:8000/err_no_entries.xml" };
    const no_title_target   : FeedTarget = { type: "atom", url: "http://localhost:8000/err_no_title.xml" };
    const no_updated_target : FeedTarget = { type: "atom", url: "http://localhost:8000/err_no_updated.xml" };

    const invalid_url_actual = fetch_posts([invalid_url_target]);
    const timeout_actual     = fetch_posts([timeout_target]);
    const not_found_actual   = fetch_posts([not_found_target]);
    const non_xml_actual     = fetch_posts([non_xml_target]);
    const no_feed_actual     = fetch_posts([no_feed_target]);
    const no_entries_actual  = fetch_posts([no_entries_target]);
    const no_title_actual    = fetch_posts([no_title_target]);
    const no_updated_actual  = fetch_posts([no_updated_target]);

    const invalid_url_expected: FetchResult = { posts: [], fail_reasons: [{ target: invalid_url_target, severity: "error"  , category: "FetchParamError", detail: "TypeError: Invalid URL: 'non_url_string'" }]};
    const timeout_expected    : FetchResult = { posts: [], fail_reasons: [{ target: timeout_target    , severity: "error"  , category: "TimeoutError"   , detail: "Request timeout" }]};
    const not_found_expected  : FetchResult = { posts: [], fail_reasons: [{ target: not_found_target  , severity: "error"  , category: "HTTPError"      , detail: "Not Found" }]};
    const non_xml_expected    : FetchResult = { posts: [], fail_reasons: [{ target: non_xml_target    , severity: "error"  , category: "ParseError"     , detail: "SyntaxError: Malformed XML document: empty document or no root node detected" }]};
    const no_feed_expected    : FetchResult = { posts: [], fail_reasons: [{ target: no_feed_target    , severity: "error"  , category: "DataMissing"    , detail: "<feed> tag required, but not found" }]};
    const no_entries_expected : FetchResult = { posts: [], fail_reasons: [{ target: no_entries_target , severity: "warning", category: "DataMissing"    , detail: "No <entry> tags found, no posts fetched" }]};
    const no_title_expected   : FetchResult = { posts: [], fail_reasons: [{ target: no_title_target   , severity: "error"  , category: "DataMissing"    , detail: "At an <entry> tag index 0, <title> tag required, but not found" }]};
    const no_updated_expected : FetchResult = { posts: [], fail_reasons: [{ target: no_updated_target , severity: "error"  , category: "DataMissing"    , detail: "At an <entry> tag index 0, <updated> tag required, but not found" }]};

    assertEquals(await invalid_url_actual, invalid_url_expected);
    assertEquals(await timeout_actual    , timeout_expected);
    assertEquals(await not_found_actual  , not_found_expected);
    assertEquals(await non_xml_actual    , non_xml_expected);
    assertEquals(await no_feed_actual    , no_feed_expected);
    assertEquals(await no_entries_actual , no_entries_expected);
    assertEquals(await no_title_actual   , no_title_expected);
    assertEquals(await no_updated_actual , no_updated_expected);
  });


  /* Test HTTP server shutdown */
  await sleep(100); // Interval for fetch() completed before shutdown
  await test_server.shutdown();
});
