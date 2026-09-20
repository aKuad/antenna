/**
 * Utility functions tests
 */

import { serveDir } from "jsr:@std/http@1";
import { assert, assertFalse } from "jsr:@std/assert@1";

import { is_resource_exists, isFeedTarget, sleep } from "../util.ts";


Deno.test(async function test_util(t) {
  /* Test HTTP server start */
  const test_server = Deno.serve(request => serveDir(request, { fsRoot: "./test_data/atom", urlRoot: "", quiet: true }));


  /**
   * - Can return true for existing online resource
   * - Can return false for non existing online resource
   *
   * Note: No error cases of this test
   */
  await t.step(async function is_resource_exists_true() {
    assert     (await is_resource_exists("http://localhost:8000/favicon.ico"));
    assertFalse(await is_resource_exists("http://localhost:8000/non-exist-path"));
  });


  /**
   * - Can return true for `FeedTarget` type
   * - Can return false for non `FeedTarget` type
   *
   * Note: No error cases of this test
   */
  await t.step(function isFeedTarget_true() {
    assert     (isFeedTarget({ feed_type: "atom", url: "http://localhost:8000/atom/true_general.xml" }));
    assertFalse(isFeedTarget({ site_name: "qiita", uid: "uid" }));
  });


  /**
   * - It checked manually
   */
  // await t.step(async function sleep_true() {
  //   await sleep(1000);
  // });


  /* Test HTTP server shutdown */
  await sleep(100); // Interval for fetch() completed before shutdown
  await test_server.shutdown();
});
