/**
 * note articles fetching
 *
 * Note: note API specification is unofficial
 *
 * @module
 */

import { FetchResult, SiteTarget } from "../types.ts";

/**
 * note articles fetching
 *
 * @param target Target note creator to fetch
 * @param general_timeout_ms Limit duration of fetching in milliseconds
 * @param connect_test_server DO NOT SET TRUE EXCEPT FOR TEST - Switch api url to localhost
 * @returns Fetched posts and/or fail reason
 */
export async function fetch_note(target: SiteTarget, general_timeout_ms?: number, connect_test_server: boolean = false): Promise<FetchResult> {
  // Variables and objects
  const timeout_ms = target.timeout_ms || general_timeout_ms;
  const signal = timeout_ms ? AbortSignal.timeout(timeout_ms) : undefined;
  const base_url = connect_test_server ? `http://localhost:8000/${target.uid}` : `https://note.com/api/v2/creators/${target.uid}/contents`;
  const url = new URL(base_url);
  url.searchParams.set("kind", "note");


  // Fetching loop
  const fetch_result: FetchResult = { posts: [], fail_reasons: [] };
  let current_page = 1;
  while(1) {
    // Fetch setting and execution
    url.searchParams.delete("page");
    url.searchParams.set("page", current_page.toString());
    const res = await fetch(url.href, { headers: target.headers, signal }).catch((err: Error) => err);


    // Fetch error detection
    //// fetch() exception
    if(res instanceof Error) {
      const is_timeout_error = res.name === "TimeoutError";
      return {
        posts: [],
        fail_reasons: [{
          target,
          severity: "error",
          category: is_timeout_error ? "TimeoutError" : "FetchParamError",
          detail: is_timeout_error ? "Request timeout" : `${res}`
        }]
      };
    }
    //// 500 HTTP error
    if(Math.floor(res.status / 100) === 5) {
      await res.bytes();
      return {
        posts: [],
        fail_reasons: [{
          target,
          severity: "error",
          category: "HTTPError",
          detail: res.statusText
        }]
      };
    }


    // Data extraction
    const res_json = await res.json();
    const contents = res_json.data?.contents;
    //// 400 HTTP error
    if(!res.ok) {
      return {
        posts: [],
        fail_reasons: [{
          target,
          severity: "error",
          category: "HTTPError",
          detail: res_json.data
        }]
      };
    }
    //// Succeeded
    if((contents instanceof Array)) {
      contents.forEach((content) => {
        fetch_result.posts.push({
          site_name: "note",
          site_icon_url: "https://note.com/favicon.ico",
          title: content.name,
          url: content.noteUrl,
          author_name: content.user.nickname,
          author_url: `https://note.com/${content.user.urlname}`,
          author_icon_url: content.user.userProfileImagePath,
          description: content.body.replaceAll(/\n+/g, "  ").slice(0, 200),
          thumbnail_url: content.eyecatch || content.thumbnailExternalUrl || "",
          post_date: new Date(content.publishAt),
          update_date: new Date(content.publishAt)
        });
      });
    }

    // Is last page
    if(res_json.data.isLastPage !== false)
      break;
    current_page++;
  }

  if(fetch_result.posts.length === 0)
    fetch_result.fail_reasons.push({
      target,
      severity: "warning",
      category: "DataMissing",
      detail: "No posted",
    });

  return fetch_result;
}
