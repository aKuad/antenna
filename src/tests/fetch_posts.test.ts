/**
 * Posts fetching tests via `fetch_posts()` for all [sub]modules
 */

import { serveDir } from "jsr:@std/http@1";
import { assertEquals } from "jsr:@std/assert@1";

import { fetch_posts } from "../fetch_posts.ts";


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
