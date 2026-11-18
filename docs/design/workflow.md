# デザインシステムの運用（仕組みの全体像・フィードバック）

ルール・文脈・検証の置き場所の全体像と、指摘を仕組みに戻す方法。実装の手順と検証は Skill `implement-ui` にある。

## 全体像

[デザインハーネス](https://design-harness.com/) の4層モデル（制約・文脈・検証・評価）に沿って、置き場所を分けている。

| 層 | このリポジトリでの実体 |
| --- | --- |
| 制約 | Semantic トークン (`src/app/globals.css`, `tailwind.config.ts`, `src/design-system/tokens.ts`)、コンポーネント (`src/app/components/`)、Storybook のルール（Foundations の MDX、ガイドライン、Story の docs。索引は [rules.md](./rules.md)） |
| 文脈 | [principles.md](./principles.md)、[apps/](./apps/)、Storybook の Story |
| 検証 | ESLint の `design-system/*` ルール、トークンのコントラストのテスト（`contrast.test.ts`）、全 Story の play 関数と a11y チェック（`bun run test:stories`）、Skill `implement-ui` の検証手順 |
| 評価 | 本書の「フィードバックの戻し先」 |

## どこに何を書くか

ルールの本文（正本）は1か所にだけ書き、ほかの場所にはリンクと要約だけを置く。色・余白・文字・部品のルールの正本は Storybook のドキュメントで、`docs/design/rules.md` はその索引。

| 種類 | 例 | 正本の置き場所 |
| --- | --- | --- |
| トークンの値と用途 | Semantic カラー、タイポグラフィの組み合わせ、余白・角丸・階層 | `src/design-system/tokens.ts`（Foundations の MDX はこれを表示する） |
| 社内アプリ共通のルール（部品をまたぐもの） | Semantic トークンだけを使う、コントラスト基準、ページの骨組み、影の付け方 | `src/design-system/foundations/*.mdx`（Storybook: Foundations） |
| 1つの部品の使い分け | variant・size の選び方 | 部品の Story の `parameters.docs.description` |
| 1つの部品の組み合わせ方・並べ方 | OK / NG、ダイアログの幅 | `src/design-system/guidelines/<部品名>.mdx`（各部品の「ガイドライン」） |
| ルールの索引 | どのルールがどこにあるか、禁止事項と lint の対応 | [rules.md](./rules.md)。本文は書かない |
| 社内アプリ共通の文脈と原則 | 静かな UI、振る舞いの原則 | [principles.md](./principles.md) |
| アプリの事実 | 何のアプリか、誰がどんな場面で使うか | `docs/design/apps/<アプリ名>.md` |
| 画面の一覧 | 画面の名前・パス・目的 | アプリの md の「主な画面」。要件ファイルへリンクする |
| 画面の要件 | 目的、使う人と場面、開き方と移動先、表示と操作（エリアごと）、状態で変わること、こうなると困ること、決まっている文言、未決のこと | `docs/design/apps/<アプリ名>/screens/<画面>.md` |
| 未決のこと | 何週先まで表示するか（画面）、メンバーの並び順の決まり（アプリ全体） | その画面だけのことは要件ファイル、アプリ全体のことはアプリの md の「未決のこと」。決まったら該当する見出しに書き、未決の行を消す |
| アプリ固有の原則・色・部品 | 「今週がすぐわかる」、`status-holiday`、`CTScheduleCard` | アプリの md。最初は空で、生成を重ねて育つ |
| 進め方・検証・報告 | 読む順番、用意する状態、推測の記録 | Skill `implement-ui`。壁打ちは Skill `screen-brief`、戻すのは Skill `reflect-decisions` |
| その回の依頼 | 作る画面 | 一言で伝える。ファイルには残さない |
| 検証用の依頼文 | reproduce、add-page | `experiments/prompts/`（条件をそろえるために固定する） |

依頼に書きたくなったことがあれば、まず上のどこに置くかを考える。

## 実装の進め方と検証

画面・部品・Story を作るときの手順、用意する状態、検証の方法は Skill [`.claude/skills/implement-ui/SKILL.md`](../../.claude/skills/implement-ui/SKILL.md) にまとめている。Claude Code では `/implement-ui <やりたいこと>` で呼び出せる。`docs/design/` と Storybook は「何を守るか」、Skill は「どう進めて、どう確かめるか」を扱う。

画面を作る前の要件の聞き取りは Skill `screen-brief`、確認で決めたことを戻すのは Skill `reflect-decisions`（どちらも試作）。どちらも `implement-ui` の中から必要なときに呼ばれる。

## フィードバックの戻し先

レビューの指摘や AI の生成ミスは、その場の修正で終わらせず、次に同じことが起きないよう仕組みへ戻す。

戻す前に、**プロダクト固有の検討材料**か、**デザインシステムに貯めるもの**かを分ける。迷ったら「別の社内アプリで同じ種類の画面を作っても、同じ答えになるか」で決める。同じ答えになるならデザインシステム（Foundations の MDX・ガイドライン・Story の docs・共通部品・Skill）、ならないならプロダクト固有（`apps/<アプリ名>.md`・その部品と Story）に戻す。Skill `implement-ui` の report.json では `scope`（`app` / `system`）として記録される。

| 起きたこと | 戻し先 |
| --- | --- |
| 同じ見た目の指摘が繰り返される | 該当する Foundations の MDX（`src/design-system/foundations/`）に追記し、部品をまたぐ禁止事項なら [rules.md](./rules.md)「禁止事項」の索引にも1行足す。機械的に検出できるなら `eslint/design-system-plugin.mjs` にルールを追加 |
| 同じ任意値・独自 UI が複数箇所に出る | コンポーネントの variant か、新しいコンポーネント（＋Story）にする |
| 意味のある色が足りない | Semantic トークンを追加（3箇所を揃える。Foundations/Colors「使い方のルール」） |
| 判断の前提が AI に伝わっていない | [principles.md](./principles.md)（社内アプリ共通）か [apps/](./apps/)（アプリ固有）に追記 |
| その画面だけの事実（文言・状態・挙動）が AI に伝わっていない | 画面の要件ファイル（`apps/<アプリ名>/screens/<画面>.md`）に追記。Skill `reflect-decisions` で承認を取ってから書く |
| 部品の使い分けを間違える | その部品の Story の docs（`parameters.docs.description`）に使い分けを追記 |
| 手順の抜け・用意する状態や検証の漏れ | Skill `implement-ui`（`.claude/skills/implement-ui/SKILL.md`）に追記 |
| 部品の組み合わせ方・並べ方を間違える | その部品の「ガイドライン」ページ（`src/design-system/guidelines/`）に OK / NG を追記 |
| ルールはあるのに見つけられなかった | [rules.md](./rules.md) の索引（部品の表・禁止事項）に、そのルールへのリンクを足す |

新しい部品・ガイドライン・Foundations のページを足したときは、[rules.md](./rules.md) の索引にも行を足す。

## 参照

| 内容 | 場所 |
| --- | --- |
| トークン定義 | `src/app/globals.css`, `tailwind.config.ts` |
| トークンの用途一覧 | `src/design-system/tokens.ts` |
| 色・文字・レイアウト・階層のルール | `src/design-system/foundations/*.mdx` |
| 部品のガイドライン | `src/design-system/guidelines/*.mdx` |
| フォントの読み込み | `src/lib/fonts.ts` |
| ページの骨組み | `src/app/components/PageLayout.tsx` |
| コンポーネントと Story | `src/app/components/**`、`bun run storybook` |
| lint ルール | `eslint/design-system-plugin.mjs` |
| Gaji-Labo の文化 | [Culture Deck](https://speakerdeck.com/gaji/gaji-labo-culture-deck)、[Gaji-Labo スタイル](https://speakerdeck.com/gaji/gaji-labo-style) |
