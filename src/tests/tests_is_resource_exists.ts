/**
 * Test set of `is_resource_exists.ts` module
 */

import { assert, assertFalse } from "jsr:@std/assert@1";

import { is_resource_exists } from "../util/is_resource_exists.ts";


/**
 * Test set of `is_resource_exists.ts` module
 */
export async function tests_is_resource_exists(t: Deno.TestContext) {
  /**
   * - Can return true for existing online resource
   * - Can return false for non existing online resource
   */
  await t.step(async function is_resource_exists_true() {
    assert     (await is_resource_exists("http://localhost:8000/favicon.ico"));
    assertFalse(await is_resource_exists("http://localhost:8000/favicon.ico", { "no-icon-test": "true" }));
  });
};
