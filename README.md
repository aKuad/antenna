# antenna

[![JSR](https://jsr.io/badges/@akuad/antenna)](https://jsr.io/@akuad/antenna)

Posts update collector library

## Usage

```js
import { fetch_posts } from "jsr@akuad/antenna@v0";

const posts = await fetch_posts([
  { type: "atom", url: "https://qiita.com/aKuad/feed" },
  { type: "rss" , url: "https://note.com/akuad/rss" }
]);

console.log(posts);
```

Output example:

```ts
[
  // ...
  {
    site_name: "note.com",
    site_icon_url: "https://note.com/favicon.ico",
    title: "DMX コントローラ WebApp #14 タブ機能実装でちょっと CSS 芸",
    url: "https://note.com/akuad/n/nca2fe53aec8b",
    author_name: "aKuad",
    author_url: undefined,
    author_icon_url: undefined,
    description: `<h2 name="b324aa8e-78df-4771-8662-750b4f9f6fc8" id="b324aa8e-78df-4771-8662-750b4f9f6fc8">表示したり、非表示にしたり</h2><p name="60f08652-3697-4f1c-9300-4abe36da3f41" id="60f08652-3697-4f1c-9300-4abe36da3f41">前回の記事で紹介しました、フェーダーの表示範囲切り替えタブ。</p><br/><a href='https://note.com/akuad/n/nca2fe53aec8b'>続きをみる</a>`,
    thumbnail_url: undefined,
    post_date: 2025-12-05T14:03:06.000Z,
    update_date: 2025-12-05T14:03:06.000Z
  },
  {
    site_name: "qiita.com",
    site_icon_url: "https://qiita.com/favicon.ico",
    title: "Issue/PR の Projects 登録時に Status 自動設定は Actions 無しで可能だった",
    url: "https://qiita.com/aKuad/items/f5335d775fbac385b785",
    author_name: "aKuad",
    author_url: undefined,
    author_icon_url: undefined,
    description: "Issue/PR の Projects 登録時のこと\n" +
      "Issue や PR を、リストやボードの形で並べられて、タスク管理の可視化などに使える GitHub Projects。\n" +
      "Issue/PR を Projects に登録時、初期値は NoStatus。\n" +
      "\n" +
      "これを毎回 ...",
    thumbnail_url: undefined,
    post_date: 2025-12-05T22:06:39.000Z,
    update_date: 2025-12-05T22:06:39.000Z
  }
]
```

## Using libraries

[@libs/xml](https://jsr.io/@libs/xml) - Copyright (c) 2024 Simon Lecoq

## License

antenna - [CC0-1.0](./LICENSE)

@libs/xml - [MIT license](https://github.com/lowlighter/libs/blob/main/LICENSE)
