/**
 * Git hook script tests of `assets/pre-push`
 */

import { assertEquals } from "jsr:@std/assert@1";

const REPO_ROOT = new URL("../../../", import.meta.url).pathname; // String ends with '/'


/** Gather of shell exit code and stderr */
interface ShellOutput {
  /** Exit code */
  code: number;
  /** stderr output */
  stderr: string;
}


/**
 * Run `assets/pre-push` with passed ref name
 *
 * @param ref_name Ref name (branch/tag name) to test
 * @returns Shellscript execution output
 */
async function pre_push_run(ref_name: string): Promise<ShellOutput> {
  const child = new Deno.Command("sh", {
    args: ["./assets/pre-push"], cwd: REPO_ROOT, stdin: "piped", stdout: "piped", stderr: "piped"
  }).spawn();

  const stdin = child.stdin.getWriter();
  await stdin.write(
    new TextEncoder().encode(
      // <local ref to test> <dummy local sha> <dummy remote ref> <dummy remote sha>
      `${ref_name} 0000000000000000000000000000000000000000 refs/remotes/origin/test 0000000000000000000000000000000000000000\n`
    )
  );
  await stdin.close();

  const result = await child.output();
  return {
    code  : result.code,
    stderr: new TextDecoder().decode(result.stderr)
  };
}


Deno.test(async function test_pre_push(t) {
  /**
   * - Can accept correct target words (feature, doc, infra, misc)
   * - Can accept correct action words (add, mod, fix, del)
   * - Can accept '/' nested desc field
   */
  await t.step(async function pre_push_branch_true() {
    const feature_add_promise = pre_push_run("refs/heads/feature/add/desc")
    const doc_mod_promise     = pre_push_run("refs/heads/doc/mod/desc");
    const infra_fix_promise   = pre_push_run("refs/heads/infra/fix/desc");
    const misc_del_promise    = pre_push_run("refs/heads/misc/del/desc");
    const nested_desc_promise = pre_push_run("refs/heads/feature/add/nested/desc/example");

    const feature_add_actual = await feature_add_promise;
    const doc_mod_actual     = await doc_mod_promise;
    const infra_fix_actual   = await infra_fix_promise;
    const misc_del_actual    = await misc_del_promise;
    const nested_desc_actual = await nested_desc_promise;

    assertEquals(feature_add_actual.code, 0, feature_add_actual.stderr);
    assertEquals(doc_mod_actual.code    , 0, doc_mod_actual.stderr);
    assertEquals(infra_fix_actual.code  , 0, infra_fix_actual.stderr);
    assertEquals(misc_del_actual.code   , 0, misc_del_actual.stderr);
    assertEquals(nested_desc_actual.code, 0, nested_desc_actual.stderr);
  });


  /**
   * - When push to main, return code 0b0001
   * - When no desc branch name, return code 0b0010
   * - When no action branch name, return code 0b0010
   * - When unknown (including extended word) target branch name, return code 0b0100
   * - When unknown (including extended word) action branch name, return code 0b1000
   * - When unknown target and action branch name, return code 0b1100
   */
  await t.step(async function pre_push_branch_err() {
    const main_branch_promise     = pre_push_run("refs/heads/main");
    const missing_desc_promise    = pre_push_run("refs/heads/feature/add");
    const missing_action_promise  = pre_push_run("refs/heads/feature");
    const unknown_target_promise  = pre_push_run("refs/heads/target/add/desc");
    const extended_target_promise = pre_push_run("refs/heads/feature-ext/add/desc");
    const unknown_action_promise  = pre_push_run("refs/heads/feature/act/desc");
    const extended_action_promise = pre_push_run("refs/heads/feature/add-ext/desc");
    const unknown_both_promise    = pre_push_run("refs/heads/target/act/desc");

    const main_branch_actual     = await main_branch_promise;
    const missing_desc_actual    = await missing_desc_promise;
    const missing_action_actual  = await missing_action_promise;
    const unknown_target_actual  = await unknown_target_promise;
    const extended_target_actual = await extended_target_promise;
    const unknown_action_actual  = await unknown_action_promise;
    const extended_action_actual = await extended_action_promise;
    const unknown_both_actual    = await unknown_both_promise;

    assertEquals(main_branch_actual.code    , 0b0001, main_branch_actual.stderr);
    assertEquals(missing_desc_actual.code   , 0b0010, missing_desc_actual.stderr);
    assertEquals(missing_action_actual.code , 0b0010, missing_action_actual.stderr);
    assertEquals(unknown_target_actual.code , 0b0100, unknown_target_actual.stderr);
    assertEquals(extended_target_actual.code, 0b0100, extended_target_actual.stderr);
    assertEquals(unknown_action_actual.code , 0b1000, unknown_action_actual.stderr);
    assertEquals(extended_action_actual.code, 0b1000, extended_action_actual.stderr);
    assertEquals(unknown_both_actual.code   , 0b1100, unknown_both_actual.stderr);
  });


  /**
   * - Can accept tag name and jsr.json version field matches
   */
  await t.step(async function pre_push_tag_true() {
    const ver_jsr_json = JSON.parse(Deno.readTextFileSync(`${REPO_ROOT}jsr.json`)).version;

    const matched_version_actual = await pre_push_run(`refs/tags/v${ver_jsr_json}`);
    assertEquals(matched_version_actual.code, 0, matched_version_actual.stderr);
  });


  /**
   * - When tag name and jsr.json version field mismatch, return code 0b00010000
   */
  await t.step(async function pre_push_tag_err() {
    const mismatch_version_actual = await pre_push_run(`refs/tags/v0.0.0`);
    assertEquals(mismatch_version_actual.code, 0b00010000, mismatch_version_actual.stderr);
  });
});
