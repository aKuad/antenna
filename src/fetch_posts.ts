/**
 * Correct posts from specified feeds
 * @module
 */

import { FeedTarget, FetchResult, Post, FailReason } from "./types.ts";
import { fetch_atom } from "./services/atom.ts";
import { fetch_rss } from "./services/rss.ts";


/**
 * Posts fetching from specified services
 *
 * @param targets Targets to fetch posts
 * @param general_timeout_ms Limit duration of all fetching in milliseconds (Individual option overwrites it when both are specified)
 * @returns Fetched posts
 */
export async function fetch_posts(targets: Array<FeedTarget>, general_timeout_ms?: number): Promise<FetchResult> {
  const fetch_results_promises = targets.map(target => {
    switch(target.type) {
      case "atom":
        return fetch_atom(target, general_timeout_ms);

      case "rss":
        return fetch_rss(target, general_timeout_ms);

      default:
        return Promise.resolve<FetchResult>({
          posts: [],
          fail_reasons: [{ target, severity: "error", category: "FetchParamError", detail: `Unsupported type - ${target.type}` }]
        });
    }
  });

  const fetch_results = await Promise.all(fetch_results_promises);
  const posts       : Post[]       = [];
  const fail_reasons: FailReason[] = [];

  fetch_results.forEach(fetch_result => {
    posts.push(...fetch_result.posts);
    fail_reasons.push(...fetch_result.fail_reasons);
  });

  posts.sort((a, b) => a.update_date.getTime() - b.update_date.getTime());
  return { posts, fail_reasons };
}
