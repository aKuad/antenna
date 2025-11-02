/**
 * Posts fetching tests via `fetch_posts()` for all [sub]modules
 */

import { serveDir } from "jsr:@std/http@1";
import { assertEquals } from "jsr:@std/assert@1";

import { fetch_posts } from "../fetch_posts.ts";
import { Post } from "../types.ts";


Deno.test(async function tests(t) {
  const test_server = Deno.serve(request => serveDir(request, { fsRoot: "./test_data", urlRoot: "", quiet: true }));


  /**
   * - When unsupported target specified, returns empty array
   */
  await t.step(async function unsupported_target() {
    // deno-lint-ignore no-explicit-any
    const target: any = { type: "unsupported-target-name", url: "http://localhost:8000/atom/true_general.xml"};
    const posts = await fetch_posts([target]);
    assertEquals(posts, []);
  });


  /**
   * - Can fetch and return posts data from specified URL
   */
  await t.step(async function feed_atom_true() {
    const posts_general_actual      = await fetch_posts([{ type: "atom", url: "http://localhost:8000/atom/true_general.xml" }]);
    const posts_email_scheme_actual = await fetch_posts([{ type: "atom", url: "http://localhost:8000/atom/true_email_scheme.xml" }]);
    const posts_minimum_actual      = await fetch_posts([{ type: "atom", url: "http://localhost:8000/atom/true_minimum.xml" }]);

    const posts_general_expected: Post[] = [
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
    ];

    const posts_email_scheme_expected: Post[] = [
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
    ];

    const posts_minimum_expected: Post[] = [
      {
        site_name: "localhost",
        site_icon_url: "http://localhost:8000/favicon.ico",
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
    ];

    assertEquals(posts_general_actual     , posts_general_expected);
    assertEquals(posts_email_scheme_actual, posts_email_scheme_expected);
    assertEquals(posts_minimum_actual     , posts_minimum_expected);
  });


  /**
   * - When invalid URL passed, returns empty array with error message logging
   * - When invalid file as atom fetched, returns empty array with error message logging
   */
  await t.step(async function feed_atom_err() {
    const posts_invalid_url = fetch_posts([{ type: "atom", url: "non_url_string" }]);
    const posts_not_found   = fetch_posts([{ type: "atom", url: "http://localhost:8000/atom/non_existing_file" }]);
    const posts_non_xml     = fetch_posts([{ type: "atom", url: "http://localhost:8000/atom/err_non_xml.xml" }]);
    const posts_no_feed     = fetch_posts([{ type: "atom", url: "http://localhost:8000/atom/err_no_feed.xml" }]);
    const posts_no_entries  = fetch_posts([{ type: "atom", url: "http://localhost:8000/atom/err_no_entries.xml" }]);
    const posts_no_title    = fetch_posts([{ type: "atom", url: "http://localhost:8000/atom/err_no_title.xml" }]);
    const posts_no_updated  = fetch_posts([{ type: "atom", url: "http://localhost:8000/atom/err_no_updated.xml" }]);
    assertEquals(await posts_invalid_url, []);
    assertEquals(await posts_not_found  , []);
    assertEquals(await posts_non_xml    , []);
    assertEquals(await posts_no_feed    , []);
    assertEquals(await posts_no_entries , []);
    assertEquals(await posts_no_title   , []);
    assertEquals(await posts_no_updated , []);
  });


  await test_server.shutdown();
});
