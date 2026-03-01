/**
 * Type definitions for passing data between `fetch_posts()` and `feed/*` `site/*` modules
 * @module
 */

/**
 * Explain a target of a feed
 */
export type FeedTarget = {
  type: "rss" | "atom"
  url: string
  headers?: HeadersInit
  timeout_ms?: number
};


/**
 * Explain a target of site
 */
export type SiteTarget = {
  site: "qiita"
  uid: string
  headers?: HeadersInit
  timeout_ms?: number
};


// deno-lint-ignore no-explicit-any
export function isFeedTarget(obj: any): obj is FeedTarget {
  return obj && typeof obj.type === "string" && typeof obj.url === "string";
}


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


/**
 * Data structure of a fail reason
 */
export type FailReason = {
  readonly target: FeedTarget
  readonly severity: "error" | "warning"
  readonly category: "FetchParamError" | "TimeoutError" | "HTTPError" | "ParseError" | "DataMissing"
  readonly detail: string
}


/**
 * Gather of `Post[]` and `FailReason[]` for `fetch_posts()` return
 */
export type FetchResult = {
  readonly posts: Post[]
  readonly fail_reasons: FailReason[]
}
