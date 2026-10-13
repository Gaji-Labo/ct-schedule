# デザインシステムの運用（手順・検証・フィードバック）

新しい画面・部品を作るときの進め方と、確かめ方、指摘を仕組みに戻す方法。

## 全体像

[デザインハーネス](https://design-harness.com/) の4層モデル（制約・文脈・検証・評価）に沿って、置き場所を分けている。

| 層 | このリポジトリでの実体 |
| --- | --- |
| 制約 | Semantic トークン (`src/app/globals.css`, `tailwind.config.ts`)、コンポーネント (`src/app/components/`)、[rules.md](./rules.md) |
| 文脈 | [principles.md](./principles.md)、[apps/](./apps/)、Storybook の Story |
| 検証 | ESLint の `design-system/*` ルール、Storybook の a11y チェック、本書の「検証」 |
| 評価 | 本書の「フィードバックの戻し先」 |

## 新しい画面を実装する手順

1. **文脈を確認する** — [principles.md](./principles.md) と [apps/](./apps/) の該当アプリを読み、画面の目的と、最初に目に入るべき情報を決める
2. **部品を選ぶ** — [rules.md](./rules.md)「コンポーネント」の表と Storybook から使う部品を決める。足りない部品があれば、画面の実装より先に部品（と Story）を作る
3. **組み立てる** — 色・余白・文字は [rules.md](./rules.md) の表から選ぶ
4. **Story を書く** — 画面またはその主要部品の Story を書き、次の状態を用意する
   - 通常 / データ0件 / 長い名前・多い件数 / 読み込み中・エラー（あれば）
   - CT 固有: 祝日の週、参加人数が奇数（お休みあり）、今週のカード
   - 状態の考え方は UI Stack（理想 / 空 / エラー / 部分的 / 読み込み中）に沿う。「通常」だけで終わらせない
5. **検証する** — 下の「検証」をすべて通す

## 検証

```bash
bun run lint          # design-system/* ルールを含む。新規コードはエラー0件・警告0件
bun test              # lint ルール自体のテストを含む
bun run storybook     # 表示確認 (http://localhost:6006)
```

Storybook で次を確認する。

- [ ] ライト・ダーク両方で表示が崩れない（ツールバーのテーマ切替）
- [ ] Accessibility パネルに違反が出ていない
- [ ] 長いテキストで文字があふれない・レイアウトが崩れない
- [ ] 必要な状態（0件、エラー、お休み、祝日など）が抜けていない

### 既知の違反

デザインシステム導入前のコードには違反が残っている。`eslint.config.mjs` で該当ファイルだけ警告扱いにしている。置き換えたらリストから外し、エラー扱いに戻す。

## フィードバックの戻し先

レビューの指摘や AI の生成ミスは、その場の修正で終わらせず、次に同じことが起きないよう仕組みへ戻す。

| 起きたこと | 戻し先 |
| --- | --- |
| 同じ見た目の指摘が繰り返される | [rules.md](./rules.md)「禁止事項」に追記。機械的に検出できるなら `eslint/design-system-plugin.mjs` にルールを追加 |
| 同じ任意値・独自 UI が複数箇所に出る | コンポーネントの variant か、新しいコンポーネント（＋Story）にする |
| 意味のある色が足りない | Semantic トークンを追加（3箇所を揃える） |
| 判断の前提が AI に伝わっていない | [principles.md](./principles.md)（社内アプリ共通）か [apps/](./apps/)（アプリ固有）に追記 |
| 部品の使い分けを間違える | その部品の Story の docs（`parameters.docs.description`）に使い分けを追記 |
| 部品の組み合わせ方・並べ方を間違える | その部品の「ガイドライン」ページ（`src/design-system/guidelines/`）に OK / NG を追記 |

## 参照

| 内容 | 場所 |
| --- | --- |
| トークン定義 | `src/app/globals.css`, `tailwind.config.ts` |
| トークンの用途一覧 | `src/design-system/tokens.ts` |
| コンポーネントと Story | `src/app/components/**`、`bun run storybook` |
| lint ルール | `eslint/design-system-plugin.mjs` |
| Gaji-Labo の文化 | [Culture Deck](https://speakerdeck.com/gaji/gaji-labo-culture-deck)、[Gaji-Labo スタイル](https://speakerdeck.com/gaji/gaji-labo-style) |
