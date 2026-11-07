/**
 * Git hook script tests of `assets/commit-msg`
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
 * Run `assets/commit-msg` with passed commit message
 *
 * @param commit_mes Commit message to test
 * @param as_merge_commit Whether the message is for a merge commit
 * @returns Shellscript execution output
 */
async function commit_msg_run(commit_mes: string, as_merge_commit: boolean): Promise<ShellOutput> {
  const temp_dir = await Deno.makeTempDir();
  const message_file_name = as_merge_commit ? "MERGE_MSG" : "COMMIT_EDITMSG";
  const message_file_path = `${temp_dir}/${message_file_name}`;

  try {
    await Deno.writeTextFile(message_file_path, commit_mes);

    const child = new Deno.Command("sh", {
      args: ["./assets/commit-msg", message_file_path], cwd: REPO_ROOT, stdout: "piped", stderr: "piped"
    }).spawn();

    const result = await child.output();
    return {
      code  : result.code,
      stderr: new TextDecoder().decode(result.stderr)
    };
  } finally {
    await Deno.remove(temp_dir, { recursive: true });
  }
}


Deno.test(async function test_commit_msg(t) {
  /**
   * - Can accept all supported prefixes (Add, Mod, Fix, Del)
   * - Can ignore comment and blank lines before the subject
   * - Can skip prefix verification for merge commits
   */
  await t.step(async function commit_msg_true() {
    const valid_sign_off = "Signed-off-by: Test User <test@example.com>\n";

    const prefix_add_promise         = commit_msg_run("Add: mes\n\n" + valid_sign_off, false);
    const prefix_mod_promise         = commit_msg_run("Mod: mes\n\n" + valid_sign_off, false);
    const prefix_fix_promise         = commit_msg_run("Fix: mes\n\n" + valid_sign_off, false);
    const prefix_del_promise         = commit_msg_run("Del: mes\n\n" + valid_sign_off, false);
    const lines_filter_promise       = commit_msg_run("# comment\n\nAdd: message after comments\n\n" + valid_sign_off, false);
    const no_prefix_on_merge_promise = commit_msg_run("mes\n\n" + valid_sign_off, true);

    const prefix_add_actual         = await prefix_add_promise;
    const prefix_mod_actual         = await prefix_mod_promise;
    const prefix_fix_actual         = await prefix_fix_promise;
    const prefix_del_actual         = await prefix_del_promise;
    const lines_filter_actual       = await lines_filter_promise;
    const no_prefix_on_merge_actual = await no_prefix_on_merge_promise;

    assertEquals(prefix_add_actual.code        , 0, prefix_add_actual.stderr);
    assertEquals(prefix_mod_actual.code        , 0, prefix_mod_actual.stderr);
    assertEquals(prefix_fix_actual.code        , 0, prefix_fix_actual.stderr);
    assertEquals(prefix_del_actual.code        , 0, prefix_del_actual.stderr);
    assertEquals(lines_filter_actual.code      , 0, lines_filter_actual.stderr);
    assertEquals(no_prefix_on_merge_actual.code, 0, no_prefix_on_merge_actual.stderr);
  });


  /**
   * - When no prefix, return code 0b01
   * - When unknown prefix, return code 0b01
   * - When invalid prefix format, return code 0b01
   */
  await t.step(async function commit_msg_err_prefix() {
    const valid_sign_off = "Signed-off-by: Test User <test@example.com>\n";

    const no_prefix_promise        = commit_msg_run("mes\n\n"       + valid_sign_off, false);
    const unknown_prefix_promise   = commit_msg_run("act: mes\n\n"  + valid_sign_off, false);
    const lowercase_prefix_promise = commit_msg_run("add: mes\n\n"  + valid_sign_off, false);
    const no_spacing_promise       = commit_msg_run("Add:mes\n\n"   + valid_sign_off, false);
    const only_prefix_promise      = commit_msg_run("Add:\n\n"      + valid_sign_off, false);
    const multiple_spaces_promise  = commit_msg_run("Add:  mes\n\n" + valid_sign_off, false);
    const tab_spacing_promise      = commit_msg_run("Add:\tmes\n\n" + valid_sign_off, false);

    const no_prefix_actual        = await no_prefix_promise;
    const unknown_prefix_actual   = await unknown_prefix_promise;
    const lowercase_prefix_actual = await lowercase_prefix_promise;
    const no_spacing_actual       = await no_spacing_promise;
    const only_prefix_actual      = await only_prefix_promise;
    const multiple_spaces_actual  = await multiple_spaces_promise;
    const tab_spacing_actual      = await tab_spacing_promise;

    assertEquals(no_prefix_actual.code       , 0b01, no_prefix_actual.stderr);
    assertEquals(unknown_prefix_actual.code  , 0b01, unknown_prefix_actual.stderr);
    assertEquals(lowercase_prefix_actual.code, 0b01, lowercase_prefix_actual.stderr);
    assertEquals(no_spacing_actual.code      , 0b01, no_spacing_actual.stderr);
    assertEquals(only_prefix_actual.code     , 0b01, only_prefix_actual.stderr);
    assertEquals(multiple_spaces_actual.code , 0b01, multiple_spaces_actual.stderr);
    assertEquals(tab_spacing_actual.code     , 0b01, tab_spacing_actual.stderr);
  });


  /**
   * - When no sign-off, return code 0b10
   * - When incorrect sign-off format, return code 0b10
   * - Can keep sign-off checking even if for merge commit
   */
  await t.step(async function commit_msg_err_signoff() {
    const no_signoff_promise           = commit_msg_run("Add: mes\n", false);
    const empty_signoff_promise        = commit_msg_run("Add: mes\n\nSigned-off-by:\n", false);
    const no_email_promise             = commit_msg_run("Add: mes\n\nSigned-off-by: Test User\n", false);
    const no_close_bracket_promise     = commit_msg_run("Add: mes\n\nSigned-off-by: Test User <test@example.com\n", false);
    const invalid_email_at_promise     = commit_msg_run("Add: mes\n\nSigned-off-by: Test User <test-example.com>\n", false);
    const invalid_email_domain_promise = commit_msg_run("Add: mes\n\nSigned-off-by: Test User <test@example>\n", false);
    const commented_signoff_promise    = commit_msg_run("Add: mes\n\n# Signed-off-by: Test User <test@example.com>\n", false);
    const no_signoff_at_merge_promise  = commit_msg_run("mes\n\nSigned-off-by:\n", true);

    const no_signoff_actual           = await no_signoff_promise;
    const empty_signoff_actual        = await empty_signoff_promise;
    const no_email_actual             = await no_email_promise;
    const no_close_bracket_actual     = await no_close_bracket_promise;
    const invalid_email_at_actual     = await invalid_email_at_promise;
    const invalid_email_domain_actual = await invalid_email_domain_promise;
    const commented_signoff_actual    = await commented_signoff_promise;
    const no_signoff_at_merge_actual  = await no_signoff_at_merge_promise;

    assertEquals(no_signoff_actual.code          , 0b10, no_signoff_actual.stderr);
    assertEquals(empty_signoff_actual.code       , 0b10, empty_signoff_actual.stderr);
    assertEquals(no_email_actual.code            , 0b10, no_email_actual.stderr);
    assertEquals(no_close_bracket_actual.code    , 0b10, no_close_bracket_actual.stderr);
    assertEquals(invalid_email_at_actual.code    , 0b10, invalid_email_at_actual.stderr);
    assertEquals(invalid_email_domain_actual.code, 0b10, invalid_email_domain_actual.stderr);
    assertEquals(commented_signoff_actual.code   , 0b10, commented_signoff_actual.stderr);
    assertEquals(no_signoff_at_merge_actual.code , 0b10, no_signoff_at_merge_actual.stderr);
  });


  /**
   * - When both of prefix and sign-off are missing (invalid), return code 0b11
   */
  await t.step(async function commit_msg_err_multiple() {
    const no_pref_no_sign_promise = commit_msg_run("mes\n", false);

    const no_pref_no_sign_actual = await no_pref_no_sign_promise;

    assertEquals(no_pref_no_sign_actual.code, 0b11, no_pref_no_sign_actual.stderr);
  });
});
