/**
 * DEV Community article fetching
 *
 * @module
 */

import { FetchResult, SiteTarget } from "../types.ts";


/**
 * DEV Community articles fetching
 *
 * @param target Target DEV Community user to fetch
 * @param general_timeout_ms Limit duration of fetching in milliseconds
 * @param connect_test_server DO NOT SET TRUE EXCEPT FOR TEST - Switch API URL to localhost
 * @returns Fetched posts and/or fail reason
 */
export async function fetch_dev_community(target: SiteTarget, general_timeout_ms?: number, connect_test_server: boolean = false): Promise<FetchResult> {
  // Variables and objects
  const timeout_ms = target.timeout_ms || general_timeout_ms;
  const signal = timeout_ms ? AbortSignal.timeout(timeout_ms) : undefined;
  const base_url = connect_test_server ? "http://localhost:8000/" : "https://dev.to/api/articles";
  const url = new URL(base_url);
  url.searchParams.set("username", target.uid);
  url.searchParams.set("per_page", "100");  // Actual API limit seems more high, but it for avoid too heavy access at once request


  // Fetching loop
  const fetch_result: FetchResult = { posts: [], fail_reasons: [] };
  let current_page = 1;
  while(1) {
    // Fetch setting and execution
    url.searchParams.delete("page");
    url.searchParams.set("page", current_page.toString());
    let headers;
    try {
      headers = new Headers(target.headers);
      if(!headers.has("user-agent"))
        headers.set("user-agent", "antenna"); // DEV Community (Forem) API requires user-agent header
    } catch(_) {
      // When passed header is invalid, pass through to later 'fetch() exception' process
      headers = target.headers;
    }
    const res = await fetch(url.href, { headers, signal }).catch((err: Error) => err);


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
        fail_reasons: [{ target, severity: "error", category: "HTTPError", detail: res.statusText }]
      };
    }


    // Data extraction
    const articles = await res.json();
    //// 400 HTTP error
    if(!res.ok) {
      return {
        posts: [],
        fail_reasons: [{ target, severity: "error", category: "HTTPError", detail: articles.error }]
      };
    }
    //// Succeeded
    if(articles instanceof Array) {
      articles.forEach(article => {
        fetch_result.posts.push({
          site_name: "DEV Community",
          site_icon_url: "https://dev.to/favicon.ico",
          title: article.title,
          url: `https://dev.to${article.path}`,
          author_name: article.user.name,
          author_url: `https://dev.to/${article.user.username}`,
          author_icon_url: article.user.profile_image,
          description: article.description,
          thumbnail_url: article.cover_image || "",
          post_date: new Date(article.published_at),
          update_date: new Date(article.edited_at || article.published_at)
        });
      });
    }


    // Move to page 2 when test - for pagination test
    const skip_last_page_check = connect_test_server && current_page == 1;

    const is_last_page = !(articles instanceof Array) || articles.length < 100;

    if(!skip_last_page_check && is_last_page)
      break;

    current_page++;
  }

  if(fetch_result.posts.length === 0)
    fetch_result.fail_reasons.push({ target, severity: "warning", category: "DataMissing", detail: "User ID non exist or no posted" });

  return fetch_result;
}
