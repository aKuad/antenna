/**
 * All tests entry point
 *
 * It gathers all tests for manage test HTTP server up and shutdown
 */

import { serveDir } from "jsr:@std/http@1";

import { tests_fetch_posts } from "./fetch_posts.ts";
import { tests_atom } from "./atom.ts";
import { tests_rss } from "./rss.ts";


Deno.test(async function tests(t) {
  const test_server = Deno.serve(request => serveDir(request, { fsRoot: "./test_data", urlRoot: "", quiet: true }));

  await tests_fetch_posts(t);

  await tests_atom(t);
  await tests_rss(t);

  await test_server.shutdown();
});
