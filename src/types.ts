/**
 * Type definitions for passing data between `fetch_posts()` and `feed/*` `site/*` modules
 * @module
 */

/**
 * Explain a target of a feed
 */
export type Feed = {
  type: "rss" | "atom"
  url: string
  headers?: HeadersInit
};


/**
 * Data structure of a post
 */
export type Post = {
  readonly site_name: string
  readonly site_icon_url?: string
  readonly title: string
  readonly url: string
  readonly author_name: string
  readonly author_url?: string
  readonly author_icon_url?: string
  readonly description?: string
  readonly thumbnail_url?: string
  readonly post_date?: Date
  readonly update_date: Date
};
