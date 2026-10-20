---
name: implement-ui
description: 社内アプリの画面・コンポーネント・Story を実装・変更するときの手順と検証。新しい画面を作る、既存画面を作り直す、部品や Story を追加する、見た目を直すときに使う。「画面を作って」「ページを追加」「Story を書いて」「UI を直して」など。
---

# UI を実装する

画面・部品・Story を作るときの進め方。**何を守るか**（文脈・原則・色・余白・部品・禁止事項）は `docs/design/` にあり、このスキルは**どう進めて、どう確かめるか**だけを扱う。

依頼内容: $ARGUMENTS

## 0. 最初に読む

このリポジトリのデザインシステムは社内アプリ共通のもの。まず依頼文から、どのアプリの画面・部品を作るのか（対象アプリ）を特定する。アプリごとの文脈は `docs/design/apps/<アプリ名>.md` にある。依頼文から特定できなければ、推測として記録する（`scope: "app"`）。

1. `docs/design/` を読む。`principles.md`（文脈と原則）、`apps/<アプリ名>.md`（アプリ固有の文脈）、`rules.md`（色・余白・文字・部品・禁止事項）は全部
2. 使えそうな部品の Story と docs（`parameters.docs.description`）、ガイドライン（`src/design-system/guidelines/*.mdx`）を読む
3. 似た画面がすでにあれば、その画面の Story（`src/design-system/pages/`）と実装を読み、組み立て方をそろえる

### 画面の要件ファイルを確かめる（画面を作る・直すとき）

部品や Story だけを直すときは飛ばしてよい。

画面ごとの要件は `docs/design/apps/<アプリ名>/screens/<画面>.md`（要件ファイル）にある。アプリの md の「主な画面」からリンクされている。

- **ないとき**: 作り始めない。Skill `screen-brief`（`/screen-brief <画面>`）で要件ファイルを先に作るよう案内して止まる。依頼文に要件が詳しく書いてあれば、それを要件として進めてよいかを聞き、よいと言われたら進む
- **あるとき**: 読んで、次の3点をまとめて人に見せ、このまま作り始めてよいかを確かめる
  - 「未決のこと」の件数と中身（要件ファイルと、アプリの md の両方）
  - 依頼のうち、要件ファイルに書かれていないこと
  - 要件ファイルと依頼が食い違うところ

  足りない・食い違うと言われたら、`screen-brief` で足りない項目だけを聞くよう案内して止まる。依頼文で「確認せずに進めてよい」と言われているときは、まとめを最終報告に書くだけで止まらずに進む

要件ファイルを読んだら、ここから先はそれを依頼の中身として扱う。

## 1. 文脈を決める

コードを書く前に、次の3つを短く言葉にしてから進める（最終報告にも書く）。要件ファイルがあれば、「目的」「使う人と場面」「こうなると困ること」をもとに決める。

- この画面を**誰が・いつ・何のために**開くか
- **最初に目に入るべき情報**は何か
- **取り消せない操作**はあるか（あれば確認を挟む）

## 2. 部品を選ぶ

- `docs/design/rules.md`「コンポーネント」の表から選ぶ。表にない組み合わせをするときは、その部品のガイドラインの OK / NG に従う
- 足りない部品があれば、**画面より先に**部品と Story を作る（`src/app/components/`）。画面の中だけで使う独自カード・独自ラベルは作らない
  - 部品の Story の `title` は、どのアプリでも使える部品なら `UI/<部品名>`、そのアプリ専用なら `Apps/<アプリ名>/Components/<部品名>`（`<アプリ名>` は `docs/design/apps/<アプリ名>.md`「Storybook での名前」）。迷ったら「別の社内アプリでもそのまま使えるか」で決める

## 3. 組み立てる

- 骨組みは `PageLayout` / `PageHeader` / `PageSection` で作る（`docs/design/rules.md`「レイアウト」）。`<main>` の余白・最大幅・間隔を画面ごとに書かない
- 色・余白・角丸・文字・階層は `docs/design/rules.md` の表から選ぶ。任意値・パレット色は使わない

## 4. Story を書く

### 画面の Story

- 置き場所: `src/design-system/drafts/<画面名>Page.stories.tsx`。**`src/design-system/pages/` には書かない**（`pages/` は人が確定させた正式な画面。下の「Drafts から Pages に移す」を参照）
  - 既存の画面を作り直すときも、`drafts/` に同じ名前のファイルを新しく作る。`pages/` の元のファイルは変えない
  - 部品の props が変わって `pages/` の Story が型エラーになる、のような追従の修正だけは `pages/` を直接直してよい
- `title: "Drafts/<アプリ名>/<画面名（日本語）>"`、`parameters.layout: "fullscreen"`
- `parameters.docs.description.component` に、何の画面か・本番のどのパスか・どこから来るかを書く
- モックデータは `src/design-system/mocks/` のアプリ用ファイル（`docs/design/apps/<アプリ名>.md` に書いてある）を使う。足りなければそこに足す
- DB・Slack・サーバーアクションにつながる部品は Storybook で動かないので、**見た目が同じ代用品**を作り、コメントで「本物は ○○」と書く
  - 置き場所は、その画面の Story ファイルの中。2画面以上で同じ代用品が必要になったときだけ `src/design-system/mocks/` に切り出し、使う側の Story からはそこを import する
  - 代用品は本物と同じ部品・variant で組む（パレット色の直書きなど、本物に残っている既知の違反は写さない）
- 画面間のリンクは `href="/?path=/story/<Story の ID>"` と `target="_top"` で Storybook 内を移動させる。ID は `title` を小文字にして `/` と空白を `-` に変え、`--default` を付けたもの。リンク先も今回 `drafts/` に作るなら `drafts-<アプリ名>-<画面名>--default`、すでに `pages/` にあるなら `apps-<アプリ名>-pages-<画面名>--default`（例: `apps-ctスケジュール-pages-メンバー一覧--default`）

### Drafts から Pages に移す

`drafts/` の画面は「確認待ち」。人が Storybook（手元か、PR の Cloudflare プレビュー）で見て、問題ないと確定させてから `pages/` に移す。**移すのは人に指示されたときだけ**で、作業の流れの中で勝手に移さない。

指示されたら次のように移す。

1. `git mv src/design-system/drafts/<画面名>Page.stories.tsx src/design-system/pages/`（作り直しなら `pages/` の元のファイルを置き換える）
2. `title` を `Drafts/<アプリ名>/…` から `Apps/<アプリ名>/Pages/…` に、画面間リンクの `drafts-<アプリ名>-` を `apps-<アプリ名>-pages-` に変える
3. `drafts/` に Story 以外のファイル（代用品など）を置いていたら、Story の中か `src/design-system/mocks/` に移し、その画面の分は `drafts/` に残さない
4. `bun run verify:ui` を通す

`drafts/` に Story を残したまま `main` にマージしない（CI で止まる）。

### 用意する状態

「通常」だけで終わらせない。UI Stack（理想 / 空 / エラー / 部分的 / 読み込み中）に沿って、画面にありうる状態を Story にする。

- 通常 / データ0件 / 長い名前・多い件数 / 読み込み中・エラー（あれば）
- ログイン中 / 未ログイン で表示が変わるなら両方
- アプリ固有の状態: `docs/design/apps/<アプリ名>.md`「Story で用意する状態」

各 Story には、どんな状態かを1行の JSDoc コメントで書く。

### Default にする状態

`Default` は、**本番で主な利用者がいちばんよく目にする状態**にする。

- データは本番に近い件数にする（件数は `docs/design/apps/<アプリ名>.md`「Story で用意する状態」）
- ログインで表示が変わる画面は、主な利用者がログインして使うならログイン中を `Default` にし、未ログインは別の Story（`SignedOut`）にする
- 誰が・どの状態で使うかは `docs/design/apps/<アプリ名>.md`「ユーザーと利用シーン」から決める。書かれておらず判断できなければ推測として記録する（`scope: "app"`）
- `Default` の JSDoc には、どの状態か（例: 「ログイン中。各行の右端に削除ボタンがある」）を書く

## 5. 検証する

```bash
bun run verify:ui   # lint（design-system/* ルール）→ test → Storybook ビルド（MDX のドキュメントも含む）
```

- 新規・変更したコードは **lint のエラー0件・警告0件**
- `eslint.config.mjs` の「既知の違反」リストに入っているファイルは警告扱いになっている。置き換えたらリストから外してエラー扱いに戻す

Storybook（`bun run storybook`、http://localhost:6006）で次を確かめる。`verify:ui` が通っても、見た目の崩れ（横へのはみ出しなど）は検出されない。

- [ ] **横にはみ出していない**。作った・変えた画面の Story をそれぞれ `iframe.html?id=<story-id>&viewMode=story` で開き、幅 375px と 1280px の両方で次の JS が `false` を返すことを確かめる

  ```js
  document.documentElement.scrollWidth > window.innerWidth
  ```

  `true` なら、どの要素がはみ出しているかを探して直す（例: カルーセルなど横に送る部品を grid の子に直接置くと、中身の幅でページごと広がる）
- [ ] ライト・ダーク両方で崩れない（ツールバーのテーマ切替）
- [ ] Accessibility パネルに違反がない
- [ ] 長いテキストであふれない・レイアウトが崩れない
- [ ] 必要な状態（0件・エラー・アプリ固有の状態）が抜けていない

**ブラウザを操作できず、上の項目を自分で確かめられなかったときは「通過」と書かない。** report.json の `verification` では `result: "unchecked"` にし、最終報告で「人が確かめる必要がある項目」として挙げる。lint・test・ビルドが通ったことは、見た目を確かめたことの代わりにならない。

## 6. 報告する

### 推測したことを記録する

作業中、`docs/design/`・Story・ガイドラインに**書かれていなかったので推測で決めたこと**は、その場で控えておく。小さなことも含める（余白の値、部品の選択、文言、並び順、状態の切り分けなど）。

戻し先がある（ルールが書いてあれば迷わなかった）ものは、控えるときに次のどちらかに分ける（`scope`）。既存の実装に合わせただけで戻し先が無いものは `scope` も `fix` も省く。迷ったら「**別の社内アプリで同じ種類の画面を作っても、同じ答えになるか**」で決める。

| `scope` | 何か | 例 | 戻し先 |
| --- | --- | --- | --- |
| `app`（プロダクト固有の検討材料） | このアプリの仕様・文言・データの扱いで答えが変わるもの。多くはプロダクトの持ち主が決める | 人数の数え方、空状態の文言、メンバーの並び順、このアプリ専用の部品の見た目 | `docs/design/apps/<アプリ名>.md`、その部品と Story |
| `system`（デザインシステムに貯めるもの） | どのアプリでも同じ判断になるもの | ページの骨組みの余白、空・エラー状態の型、ダイアログの幅、禁止事項の例外、画面 Story の書き方 | `docs/design/rules.md`、`principles.md`、ガイドライン、共通部品、この Skill |

1つの推測に両方が混ざるときは、2件に分けて書く。例: 空状態なら「Alert を置き再読み込みボタンを付ける」という**型**は `system`、「組み合わせを作れません」という**文言**は `app`。

### report.json を書いて HTML にする

最後に `.implement-ui/report.json` を次の形で書き、`bun run report:ui` を実行する。`.implement-ui/report.html` ができる（推測リスト、セッション記録から作る行動ログ、触ったファイル、作業のまとめ）。

```json
{
  "request": "依頼内容の要約",
  "context": { "who": "誰が・いつ開くか", "purpose": "何のためか", "first_seen": "最初に目に入るべき情報", "irreversible": "取り消せない操作 (なければ「なし」)" },
  "components_used": ["SiteHeader", "Button"],
  "new_components": [{ "name": "新しく作った部品・トークン", "reason": "作った理由" }],
  "stories": [{ "file": "src/design-system/drafts/XxxPage.stories.tsx", "name": "Default", "state": "どんな状態か" }],
  "verification": [{ "item": "bun run verify:ui", "result": "pass | fail | unchecked", "note": "" }],
  "guesses": [
    {
      "topic": "何について",
      "decision": "どう決めたか",
      "reason": "なぜそうしたか",
      "basis": "既存コードから類推 | 一般的な慣習 | 依頼文から解釈 | 根拠なし",
      "scope": "app | system",
      "fix": {
        "where": "どこに書いてあれば迷わなかったか (例: docs/design/rules.md「余白・サイズ」、src/design-system/guidelines/Carousel.mdx、Skill implement-ui「画面の Story」)",
        "what": "何が書いてあれば迷わなかったか (足すルール・値・OK/NG 例をそのまま書ける形で)"
      }
    }
  ]
}
```

`scope` は上の表で決め、`fix.where` は `scope` の戻し先から選ぶ（`app` なのに `rules.md` を指す、のようにずれていたら分け方を見直す）。`fix` は `docs/design/workflow.md`「フィードバックの戻し先」の表に沿って書く。`where` はファイル名と見出しまで具体的に、`what` はそのまま追記できる文にする。推測ではなく作業中につまずいたこと（エラー、やり直し）も、ルールを直せば防げたなら `guesses` に入れる。

要件ファイルやアプリの md の「未決のこと」にある項目は、推測で決めて `guesses` に入れる（`scope: "app"`、`fix.where` はその「未決のこと」がある要件ファイルかアプリの md）。

`guesses` が空になることはほぼない。迷わなかったと思っても、書かれていないことを自分で決めた箇所がないか見直す。

### 最終報告

チャットには次を短く書き、詳細は HTML を見るよう案内する。

- 要件ファイルを確かめたときのまとめ（未決、要件ファイルにないこと、食い違うところ）
- 1 で決めた文脈
- 作った・変えたファイル
- 検証の結果（通ったもの・確かめられなかったもの）
- 推測したことの件数（`app` / `system` 別）と、特に人に確かめてほしいもの。`app` はプロダクトの持ち主、`system` はデザインシステムの担当に確かめる
- `.implement-ui/report.html` の場所
- 作った画面は `drafts/` にあり、確認して確定したら `pages/` に移す必要があること
