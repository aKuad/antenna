/**
 * Correct posts from specified feeds
 * @module
 */

import { Feed } from "./types.ts";
import { fetch_atom } from "./feed/atom.ts";

import { Post } from "./types.ts";


/**
 * Posts fetching from specified services
 *
 * @param targets Targets to fetch posts
 * @returns Fetched posts
 */
export async function fetch_posts(targets: Array<Feed>): Promise<Post[]> {
  const all_posts_promises = targets.map(target => {
    switch(target.type) {
      case "atom":
        return fetch_atom(target.url);

      default:
        console.error(`Unsupported type - ${target.type}`);
        return Promise.resolve([]);
    }
  });

  const all_posts = (await Promise.all(all_posts_promises)).flat();
  all_posts.sort((a, b) => a.update_date.getTime() - b.update_date.getTime());
  return all_posts;
}
