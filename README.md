# antenna

[![JSR](https://jsr.io/badges/@akuad/antenna)](https://jsr.io/@akuad/antenna)

![antenna logo](./assets/logo.svg)

Posts update collector library

## Usage

```ts
import { fetch_posts } from "jsr:@akuad/antenna@1";

const fetch_result = await fetch_posts([
  { site_name: "qiita", uid: "aKuad" },
  { feed_type: "atom" , url: "https://github.com/akuad", headers: { "accept": "application/atom+xml" }, timeout_ms: 20000 }
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
    site_name: "Qiita",
    site_icon_url: "https://qiita.com/favicon.ico",
    title: "GitHub リポジトリの 'Deployments' に表示させるには？",
    url: "https://qiita.com/aKuad/items/9d1cb399b2846f61648d",
    author_name: "aKuad",
    author_url: "https://qiita.com/aKuad",
    author_icon_url: "https://avatars2.githubusercontent.com/u/53811809?v=4",
    description: "## GitHub リポジトリの 'Deployments' って？  これのことです。  ![GitHub Repositoy - Deployments](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/540894/b6bf4b50-29af-4b68-be1a-18a27fb7d633.png)  :::note wa",
    thumbnail_url: "",
    post_date: 2026-02-13T12:25:53.000Z,
    update_date: 2026-03-09T12:53:20.000Z
  },
  {
    site_name: "github.com",
    site_icon_url: "https://github.com/favicon.ico",
    title: "aKuad pushed antenna",
    url: "https://github.com/aKuad/antenna/compare/f9247fb0f5...075fb8a2a4",
    author_name: "aKuad",
    author_url: "https://github.com/aKuad",
    author_icon_url: undefined,
    description: '<div class="repo-push js-feed-item-view"><div class="body">\n' +
      // Too long output here by github.com
      "</div></div>",
    thumbnail_url: undefined,
    post_date: 2026-03-09T13:14:16.000Z,
    update_date: 2026-03-09T13:14:16.000Z
  },
  // ...
]
```

## General options

- `headers?: HeadersInit`
  - Additional HTTP headers on data fetch
- `timeout_ms?: number`
  - Limit duration of fetching

Timeout also can be specified at `fetch_posts([targets], timeout_ms)`. When both are specified, individual specified value will be accepted.

## Supported services

- [Atom feed](https://www.rfc-editor.org/rfc/rfc4287)
  - `{ feed_type: "atom", url: string }`
- [Qiita](https://qiita.com)
  - `{ site_name: "qiita", uid: string }`
- [RSS feed](https://www.rssboard.org/rss-specification)
  - `{ feed_type: "rss", url: string }`

## Migration from v0.x.x to v1.x.x

Return structure of `fetch_posts()` modified. Put `.posts` to get same result (post data).

v0.x.x:

```ts
const posts = await fetch_posts([ /* ... */ ]);
console.log(posts);
```

v1.x.x:

```ts
const fetch_result = await fetch_posts([ /* ... */ ]);
console.log(fetch_result.posts);
```

## Using libraries

[@libs/xml](https://jsr.io/@libs/xml) - Copyright (c) 2024 Simon Lecoq

## License

antenna - [Creative Commons Zero v1.0](./LICENSE)

@libs/xml - [MIT License](./LICENSE-libs-xml)
