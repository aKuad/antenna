/**
 * Correct posts from specified feeds
 * @module
 */

import { red } from "jsr:@std/fmt@1/colors";

import { Feed, Post } from "./types.ts";
import { fetch_atom } from "./services/atom.ts";
import { fetch_rss } from "./services/rss.ts";


/**
 * Posts fetching from specified services
 *
 * @param targets Targets to fetch posts
 * @param timeout_ms Limit duration of fetching in milliseconds
 * @returns Fetched posts
 */
export async function fetch_posts(targets: Array<Feed>, timeout_ms?: number): Promise<Post[]> {
  const all_posts_promises = targets.map(target => {
    switch(target.type) {
      case "atom":
        return fetch_atom(target.url, target.headers, target.timeout_ms || timeout_ms);

      case "rss":
        return fetch_rss(target.url, target.headers, target.timeout_ms || timeout_ms);

      default:
        console.error(red(`Unsupported type - ${target.type}`));
        return Promise.resolve([]);
    }
  });

  const all_posts = (await Promise.all(all_posts_promises)).flat();
  all_posts.sort((a, b) => a.update_date.getTime() - b.update_date.getTime());
  return all_posts;
}
