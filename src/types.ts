/**
 * Type definitions for passing data between `fetch_posts()` and `feed/*` `site/*` modules
 * @module
 */

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
