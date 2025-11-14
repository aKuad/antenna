/**
 * `fetch_posts()` corner case test
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


  await test_server.shutdown();
});
