# デザインシステムの運用（仕組みの全体像・フィードバック）

ルール・文脈・検証の置き場所の全体像と、指摘を仕組みに戻す方法。実装の手順と検証は Skill `implement-ui` にある。

## 全体像

[デザインハーネス](https://design-harness.com/) の4層モデル（制約・文脈・検証・評価）に沿って、置き場所を分けている。

| 層 | このリポジトリでの実体 |
| --- | --- |
| 制約 | Semantic トークン (`src/app/globals.css`, `tailwind.config.ts`)、コンポーネント (`src/app/components/`)、[rules.md](./rules.md) |
| 文脈 | [principles.md](./principles.md)、[apps/](./apps/)、Storybook の Story |
| 検証 | ESLint の `design-system/*` ルール、Storybook の a11y チェック、Skill `implement-ui` の検証手順 |
| 評価 | 本書の「フィードバックの戻し先」 |

## 実装の進め方と検証

画面・部品・Story を作るときの手順、用意する状態、検証の方法は Skill [`.claude/skills/implement-ui/SKILL.md`](../../.claude/skills/implement-ui/SKILL.md) にまとめている。Claude Code では `/implement-ui <やりたいこと>` で呼び出せる。`docs/design/` は「何を守るか」、Skill は「どう進めて、どう確かめるか」を扱う。

## フィードバックの戻し先

レビューの指摘や AI の生成ミスは、その場の修正で終わらせず、次に同じことが起きないよう仕組みへ戻す。

戻す前に、**プロダクト固有の検討材料**か、**デザインシステムに貯めるもの**かを分ける。迷ったら「別の社内アプリで同じ種類の画面を作っても、同じ答えになるか」で決める。同じ答えになるならデザインシステム（`rules.md`・ガイドライン・共通部品・Skill）、ならないならプロダクト固有（`apps/<アプリ名>.md`・その部品と Story）に戻す。Skill `implement-ui` の report.json では `scope`（`app` / `system`）として記録される。

| 起きたこと | 戻し先 |
| --- | --- |
| 同じ見た目の指摘が繰り返される | [rules.md](./rules.md)「禁止事項」に追記。機械的に検出できるなら `eslint/design-system-plugin.mjs` にルールを追加 |
| 同じ任意値・独自 UI が複数箇所に出る | コンポーネントの variant か、新しいコンポーネント（＋Story）にする |
| 意味のある色が足りない | Semantic トークンを追加（3箇所を揃える） |
| 判断の前提が AI に伝わっていない | [principles.md](./principles.md)（社内アプリ共通）か [apps/](./apps/)（アプリ固有）に追記 |
| 部品の使い分けを間違える | その部品の Story の docs（`parameters.docs.description`）に使い分けを追記 |
| 手順の抜け・用意する状態や検証の漏れ | Skill `implement-ui`（`.claude/skills/implement-ui/SKILL.md`）に追記 |
| 部品の組み合わせ方・並べ方を間違える | その部品の「ガイドライン」ページ（`src/design-system/guidelines/`）に OK / NG を追記 |

## 参照

| 内容 | 場所 |
| --- | --- |
| トークン定義 | `src/app/globals.css`, `tailwind.config.ts` |
| トークンの用途一覧 | `src/design-system/tokens.ts` |
| コンポーネントと Story | `src/app/components/**`、`bun run storybook` |
| lint ルール | `eslint/design-system-plugin.mjs` |
| Gaji-Labo の文化 | [Culture Deck](https://speakerdeck.com/gaji/gaji-labo-culture-deck)、[Gaji-Labo スタイル](https://speakerdeck.com/gaji/gaji-labo-style) |
