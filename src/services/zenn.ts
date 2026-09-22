/**
 * Zenn article fetching
 *
 * Note: Zenn API specification is unofficial
 *
 * @module
 */

import { SiteTarget, FetchResult } from "../types.ts";


/**
 * Zenn articles fetching
 *
 * @param user_id User ID of Zenn to fetch
 * @param general_timeout_ms Limit duration of fetching in milliseconds
 * @param connect_test_server DO NOT SET TRUE EXCEPT FOR TEST - Switch api url to localhost
 * @returns Fetched posts and/or fail reason
 */
export async function fetch_zenn(target: SiteTarget, general_timeout_ms?: number, connect_test_server: boolean = false): Promise<FetchResult> {
  // Variables and objects
  const timeout_ms = target.timeout_ms || general_timeout_ms;
  const signal = timeout_ms ? AbortSignal.timeout(timeout_ms) : undefined;
  const base_url = connect_test_server ? "http://localhost:8000" : "https://zenn.dev/api/articles";
  const url = new URL(base_url);
  url.searchParams.append("count", "48"); // Maximum fetching count at once is 48
  url.searchParams.append("username", `${target.uid}`);


  // Fetching loop
  const fetch_result: FetchResult = { posts: [], fail_reasons: [] };
  let current_page = 1;
  while(1) {
    // Fetch setting and execution
    url.searchParams.delete("page");
    url.searchParams.append("page", current_page.toString());
    const res = await fetch(url.href, { headers: target.headers, signal }).catch((err: Error) => err);


    // Fetch error detection
    //// fetch() exception
    if(res instanceof Error) {
      const is_timeout_error = res.name === "TimeoutError";
      return {
        posts: [],
        fail_reasons: [{
          target, severity: "error",
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
        fail_reasons: [{ target, severity: "error", category: "HTTPError", detail: `${res.statusText}` }]
      };
    }


    // Data extraction
    const res_json = await res.json();
    const articles = res_json.articles;
    //// 400 HTTP error
    // No 400 error case on current specification
    //// Succeeded
    if(articles instanceof Array) {
      articles.forEach(article => {
        fetch_result.posts.push({
          site_name: "Zenn",
          site_icon_url: "https://zenn.dev/favicon.ico",
          title: article.title,
          url: `https://zenn.dev${article.path}`,
          author_name: article.user.name,
          author_url: `https://zenn.dev/${article.user.username}`,
          author_icon_url: article.user.avatar_small_url,
          description: "",
          thumbnail_url: "",
          post_date: new Date(article.published_at),
          update_date: new Date(article.body_updated_at)
        });
      });
    }


    // Is last page
    if(res_json.next_page === null)
      break;
    current_page++;
  }

  if(fetch_result.posts.length === 0)
    fetch_result.fail_reasons.push({ target, severity: "warning", category: "DataMissing", detail: "User ID non exist or no posted" });

  return fetch_result;
}
