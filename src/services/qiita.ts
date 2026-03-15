/**
 * Qiita article fetching
 * @module
 */

import { SiteTarget, FetchResult } from "../types.ts";


/**
 * Qiita articles fetching
 *
 * @param user_id User ID of Qiita to fetch
 * @param general_timeout_ms Limit duration of fetching in milliseconds
 * @param connect_test_server DO NOT SET TRUE EXCEPT FOR TEST - Switch api url to localhost
 * @returns Fetched posts and/or error info
 */
export async function fetch_qiita(target: SiteTarget, general_timeout_ms?: number, connect_test_server: boolean = false): Promise<FetchResult> {
  // Variables and objects
  const timeout_ms = target.timeout_ms || general_timeout_ms;
  const signal = timeout_ms ? AbortSignal.timeout(timeout_ms) : undefined;
  const base_url = connect_test_server ? "http://localhost:8000" : "https://qiita.com/api/v2/items";
  const url = new URL(base_url);
  url.searchParams.append("per_page", "100");
  url.searchParams.append("query", `user:${target.uid}`);


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
    const articles = await res.json();
    //// 400 HTTP error
    if(typeof articles.message === "string") {
      return {
        posts: [],
        fail_reasons: [{
          target, severity: "error",
          category: "HTTPError",
          detail: articles.message
        }]
      };
    }
    //// Succeeded
    if(articles instanceof Array) {
      articles.forEach(article => {
        fetch_result.posts.push({
          site_name: "Qiita",
          site_icon_url: "https://qiita.com/favicon.ico",
          title: article.title,
          url: article.url,
          author_name: article.user.id,
          author_url: `https://qiita.com/${ article.user.id }`,
          author_icon_url: article.user.profile_image_url,
          description: article.body.replaceAll('\n', ' ').slice(0, 100),
          thumbnail_url: "",
          post_date: new Date(article.created_at),
          update_date: new Date(article.updated_at)
        });
      });
    }


    // Is last page
    if(Number(res.headers.get("total-count")) <= current_page * 100)
      //                     it fetches 100 items per a fetch ~~~~~
      break;
    current_page++;
  }

  if(fetch_result.posts.length === 0)
    fetch_result.fail_reasons.push({ target, severity: "warning", category: "DataMissing", detail: "User ID non exist or no posted" });

  return fetch_result;
}
