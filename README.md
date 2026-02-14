# antenna

[![JSR](https://jsr.io/badges/@akuad/antenna)](https://jsr.io/@akuad/antenna)

Posts update collector library

## Usage

```ts
import { fetch_posts } from "jsr:@akuad/antenna@1";

const fetch_result = await fetch_posts([
  { type: "atom", url: "https://github.com/akuad", headers: { "accept": "application/atom+xml" }, timeout_ms: 20000 },
  { type: "rss" , url: "https://openai.com/news/rss.xml" }
], 10000);

console.log(fetch_result.posts);

// To see failed fetching
console.log(fetch_result.fail_reasons);
```

Output example of `.posts`:

```ts
[
  // ...
  {
    site_name: "openai.com",
    site_icon_url: "https://openai.com/favicon.ico",
    title: "Introducing OpenAI Academy for News Organizations",
    url: "https://openai.com/index/openai-academy-for-news-organizations",
    author_name: "openai.com",
    author_url: undefined,
    author_icon_url: undefined,
    description: "OpenAI is launching the OpenAI Academy for News Organizations, a new learning hub built with the American Journalism Project and The Lenfest Institute to help newsrooms use AI effectively. The Academy offers training, practical use cases, and responsible-use guidance to support journalists, editors, and publishers as they adopt AI in their reporting and operations.",
    thumbnail_url: undefined,
    post_date: 2025-12-17T06:00:00.000Z,
    update_date: 2025-12-17T06:00:00.000Z
  },
  {
    site_name: "github.com",
    site_icon_url: "https://github.com/favicon.ico",
    title: "aKuad pushed zenn-articles",
    url: "https://github.com/aKuad/zenn-articles/compare/3df9544a8e...05f8f92f8d",
    author_name: "aKuad",
    author_url: "https://github.com/aKuad",
    author_icon_url: undefined,
    description: '<div class="repo-push js-feed-item-view"><div class="body">\n' +
      // Too long output here by github.com
      "</div></div>",
    thumbnail_url: undefined,
    post_date: 2025-12-17T13:15:42.000Z,
    update_date: 2025-12-17T13:15:42.000Z
  },
  // ...
]
```

## Options ans supported services

### General options

- `headers?: HeadersInit`
  - Additional HTTP headers on data fetch
- `timeout_ms?: number`
  - Limit duration of fetching

Timeout also can be specified at `fetch_posts([targets], timeout_ms)`. When both are specified, individual specified value will be accepted.

### Services

- [Atom feed](https://www.rfc-editor.org/rfc/rfc4287)
  - `{ type: "atom", url: string }`
- [RSS feed](https://www.rssboard.org/rss-specification)
  - `{ type: "rss", url: string }`

## Using libraries

[@libs/xml](https://jsr.io/@libs/xml) - Copyright (c) 2024 Simon Lecoq

## License

antenna - [CC0-1.0](./LICENSE)

@libs/xml - [MIT license](https://github.com/lowlighter/libs/blob/main/LICENSE)
