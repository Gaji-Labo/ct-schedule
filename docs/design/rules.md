# UI 実装のルール（社内アプリ共通）の索引

色・余白・文字・使う部品・禁止事項を、どこで見ればよいかの索引。**ルールの本文（正本）は Storybook のドキュメント**にあり、このファイルには要約とリンクだけを置く。ルールを足す・直すときは、リンク先の MDX や Story を書き換える（このファイルには書かない）。

違反の一部は `bun run lint` の `design-system/*` ルールで検出される。

## 読み方

- 下の「場所」はリポジトリ内のファイルと、Storybook のサイドバーでの名前を並べている。AI はファイルを、人は Storybook（`bun run storybook`）を開く
- Foundations の MDX にある一覧表（色・文字・余白・角丸・階層など）は、`src/design-system/tokens.ts` のデータから表示している。値と用途を確かめるときは `tokens.ts` も読む
- 判断の理由（静かな UI、部品の組み合わせで作る など）は [principles.md](./principles.md) にある

| 種類 | 置き場所 |
| --- | --- |
| 色・文字・レイアウト・階層のルール | `src/design-system/foundations/*.mdx`（Storybook: Foundations） |
| トークンの値と用途の一覧 | `src/design-system/tokens.ts` |
| 1つの部品の variant・size の使い分け | 部品の Story の `parameters.docs.description`（Storybook: 各部品の「Docs」） |
| 1つの部品の組み合わせ方・並べ方（OK / NG） | `src/design-system/guidelines/<部品名>.mdx`（Storybook: 各部品の「ガイドライン」） |
| アプリ固有の色・部品 | [apps/&lt;アプリ名&gt;.md](./apps/) |

## 色

Semantic トークンだけを使う。パレット色・色の任意値は使わない。トークンを足すときは3か所を揃え、コントラストを確かめる。

- 場所: `src/design-system/foundations/Colors.mdx`（Foundations/Colors）の「使い方のルール」「Semantic」「Brand (Gaji-Labo)」、`src/design-system/tokens.ts` の `semanticColors`

## コントラスト

WCAG 2.2 AA。文字は 4.5:1、部品の境界と色だけで意味を伝えるものは 3:1。

- 場所: `src/design-system/foundations/Colors.mdx`（Foundations/Colors）の「コントラスト」、`src/design-system/contrast.test.ts`

## レイアウト

ページは `PageLayout` > `PageHeader` + `PageSection` で組む。`<main>` の余白・最大幅・間隔を画面ごとに書かない。PC 基準、主な切り替え点は `md`。

- 場所: `src/design-system/foundations/Layout.mdx`（Foundations/Layout）の「ページの骨組み」「ブレイクポイント」、`src/app/components/PageLayout.stories.tsx`（Patterns/PageLayout）

## 余白・サイズ

Tailwind の既定スケール（4px グリッド）を使う。任意値は使わない。角丸は用途で選ぶ。

- 場所: `src/design-system/foundations/Layout.mdx`（Foundations/Layout）の「Spacing」「Radius」、`tokens.ts` の `spacing`・`radii`

## 階層表現（Elevation & Depth）

階層は枠線で表し、影は浮く要素にだけ付ける（部品に組み込み済み）。

- 場所: `src/design-system/foundations/Elevation.mdx`（Foundations/Elevation）、`tokens.ts` の `elevation`

## タイポグラフィ

フォントは `font-sans`（既定）。サイズと行間は決まった組み合わせから選ぶ。見出しに `leading-none`、字間を詰める `tracking-*` は使わない。

- 場所: `src/design-system/foundations/Typography.mdx`（Foundations/Typography）、`tokens.ts` の `typography`・`fontFamilies`

## コンポーネント

使えるコンポーネントは `src/app/components/ui/`（shadcn/ui ベース）と、社内アプリ共通の `SiteHeader`・`PageLayout` など。やりたいことから部品を選び、使い分けと OK / NG はリンク先で確かめる。

| やりたいこと | 使うもの | 場所 |
| --- | --- | --- |
| ボタン・リンク風の操作 | `Button` | `ui/button.stories.tsx`、`guidelines/Button.mdx`（UI/Button） |
| ページの骨組み | `PageLayout` > `PageHeader` + `PageSection`。ログイン状態つきの見出しは `Header` | `PageLayout.stories.tsx`（Patterns/PageLayout） |
| 確認・入力のモーダル | `Dialog` | `ui/dialog.stories.tsx`、`guidelines/Dialog.mdx`（UI/Dialog） |
| メニュー | `DropdownMenu` | `ui/dropdown-menu.stories.tsx`、`guidelines/DropdownMenu.mdx`（UI/DropdownMenu） |
| 今いるページの位置（2階層目以降） | `Breadcrumb` | `ui/breadcrumb.stories.tsx`、`guidelines/Breadcrumb.mdx`（UI/Breadcrumb） |
| フォーム | `Label` + `Input` / `Select` / `Checkbox` | 各部品の Story と `guidelines/`（UI/Label・Input・Select・Checkbox） |
| 状態ラベル | `Badge` | `ui/badge.stories.tsx`、`guidelines/Badge.mdx`（UI/Badge） |
| ユーザー表示 | `UserAvatar`（中身は `Avatar`） | `ui/avatar.stories.tsx`（UI/Avatar） |
| 補足説明のポップアップ | `Tooltip` | `ui/tooltip.stories.tsx`、`guidelines/Tooltip.mdx`（UI/Tooltip） |
| 区切り線 | `Separator` | `ui/separator.stories.tsx`（UI/Separator） |
| 読み込み中 | `Spinner` | `ui/spinner.stories.tsx`（UI/Spinner） |
| 操作結果の通知 | `toast`（sonner） | `ui/sonner.stories.tsx`、`guidelines/Sonner.mdx`（UI/Sonner） |
| ページ内に残すお知らせ・注意・エラー | `Alert` | `ui/alert.stories.tsx`、`guidelines/Alert.mdx`（UI/Alert） |
| 横に送って見せる（カード列など） | `Carousel` | `ui/carousel.stories.tsx`（UI/Carousel） |
| ページ最上部の帯（左上にロゴ） | `SiteHeader` | `SiteHeader.stories.tsx`（UI/SiteHeader） |
| Gaji-Labo のロゴ | `GajiLaboLogo` | `src/design-system/foundations/Logo.stories.tsx`（Foundations/Logo） |

- `ui/` と `PageLayout.stories.tsx`・`SiteHeader.stories.tsx` は `src/app/components/` の下、`guidelines/` は `src/design-system/guidelines/` の下
- アプリ固有の部品（例: CT スケジュールの週カード）は [apps/&lt;アプリ名&gt;.md](./apps/) にある

## 禁止事項

部品をまたぐ禁止事項の一覧。理由と代わりのやり方は「説明している場所」にある。

| 禁止 | 説明している場所 | lint での検出 |
| --- | --- | --- |
| パレット色の直書き（`bg-gray-100`, `text-black`, `bg-white` など）、色の任意値（`bg-[#e5e5e5]`）、`style` での色指定 | Foundations/Colors「使い方のルール」 | `design-system/no-palette-color`（`style` は対象外） |
| 任意値（`p-[13px]`, `max-w-[425px]`, `leading-[1.8]`） | Foundations/Layout「Spacing」 | `design-system/no-arbitrary-value` |
| 画面ごとに `<main>` の余白・最大幅・間隔を書く | Foundations/Layout「ページの骨組み」 | — |
| `DialogContent` の幅を `className` で決める（`sm:max-w-md` など） | UI/Dialog「ガイドライン」 | — |
| カード・ボタン・入力欄などの面に影を付ける（`shadow-sm`, `shadow`） | Foundations/Elevation | — |
| 見出しの `leading-none`、字間を詰める `tracking-tight` | Foundations/Typography「サイズと行間」 | — |
| `<button>` や `<input>` の自作スタイリング | UI/Button・UI/Input の「Docs」 | — |
| `className` で variant の見た目を上書き（`<Button className="bg-red-500">`） | Foundations/Introduction「基本ルール」、UI/Button「ガイドライン」 | 色の部分は検出される |
| 画面ごとの独自カードや独自ラベル | Foundations/Introduction「基本ルール」 | — |
