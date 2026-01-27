/**
 * Utility functions tests
 */

import { serveDir } from "jsr:@std/http@1";
import { assertEquals, assert, assertFalse } from "jsr:@std/assert@1";

import { is_resource_exists, sleep, to_absolute_when_relative } from "../util.ts";


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
   * - It checked manually
   */
  // await t.step(async function sleep_true() {
  //   await sleep(1000);
  // });


  /**
   * - Can return full URL when path only passed
   * - Can return original input when full URL passed
   *
   * Note: No error cases of this test
   */
  await t.step(function to_absolute_when_relative_true() {
    const input_path_only_actual = to_absolute_when_relative("/path-only-input"                    , "http://localhost:8000/any-path");
    const input_full_url_actual  = to_absolute_when_relative("http://localhost:8000/full-url-input", "http://localhost:8000/any-path");

    assertEquals(input_path_only_actual, "http://localhost:8000/path-only-input");
    assertEquals(input_full_url_actual , "http://localhost:8000/full-url-input");
  });


  /* Test HTTP server shutdown */
  await sleep(100); // Interval for fetch() completed before shutdown
  await test_server.shutdown();
});
