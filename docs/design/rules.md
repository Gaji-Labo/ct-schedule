# UI 実装のルール（社内アプリ共通）

色・余白・文字・使う部品・禁止事項。UI を実装・変更するときはこの範囲から選ぶ。違反の一部は `bun run lint` の `design-system/*` ルールで検出される。

## 色

**Semantic トークンだけを使う。** 一覧と用途は `src/design-system/tokens.ts`（Storybook: Foundations/Colors）にある。

| 用途 | 使うトークン |
| --- | --- |
| 本文 / 補足テキスト | `text-foreground` / `text-muted-foreground` |
| 控えめな面（リスト行など） | `bg-muted` |
| 枠線 | `border`（既定で `border-border`）、入力欄は `border-input` |
| 主要アクション / 副次アクション | `Button` の `variant="default"` / `"outline"` |
| 削除・エラー | `destructive` 系、`Button variant="destructive"` |
| 成功・参加中 | `bg-success` |
| メッセージの色（Alert・toast・Badge の状態色） | `feedback-{info,success,warning,destructive}-{subtle,foreground,border,icon}`。部品の variant 経由で使い、直接クラスを書かない |
| ページ最上部の帯（SiteHeader） | `bg-site-header text-site-header-foreground`（黒地に白。ライト・ダーク共通） |
| アバターの背景（画像が無いとき） | `AvatarFallback` に `colorSeed`（ユーザー ID）を渡す。`avatar-1`〜`7` から自動で1色選ばれる。`UserAvatar` は対応済み。クラスを直接書かない |

アプリ固有の色（例: CT スケジュールの祝日・お休み）は `docs/design/apps/<アプリ名>.md` に書く。

トークンを追加するときは `globals.css`（ライト・ダーク両方）、`tailwind.config.ts`、`tokens.ts` の3箇所を揃える。

**ブランドカラー（Gaji-Labo）**: `--gaji-main-*`（Main・5色）と `--gaji-accent-*`（Accent・3色）を Primitive として定義している。出典は Figma「Gaji-Labo Styles」の Gaji-Labo Colors（Main は Web Site、Accent は Blog）。一覧と Web サイト・ブログでの用途は Storybook の Foundations/Colors「Brand (Gaji-Labo)」にある。Primitive なのでコンポーネントから直接使わず、使うときは用途に合う Semantic トークンを追加し、その参照先にする（例: `avatar-*`）。

## 余白・サイズ

- Tailwind の既定スケール（4px グリッド）を使う。よく使う値は `src/design-system/tokens.ts` の `spacing` を参照
- 角丸は `rounded-md`（ボタン・入力欄・リスト行）、`rounded-lg`（カード・ダイアログ）、`rounded-full`（アバター・ラベル）

## タイポグラフィ

| 用途 | クラス |
| --- | --- |
| ページタイトル (h1) | `text-2xl font-bold` |
| セクション・カード見出し (h2) | `text-lg font-semibold` |
| 本文・ラベル | `text-sm font-medium` |
| 補足説明 | `text-sm text-muted-foreground` |
| 番号・バッジ・注釈 | `text-xs` |

## コンポーネント

使えるコンポーネントは `src/app/components/ui/`（shadcn/ui ベース）にある。Storybook に Story があるものは、docs の「使い分け」に従う。

組み合わせ方・並べ方の OK / NG は、Storybook の各コンポーネントの「ガイドライン」ページにまとめる（例: UI/Button › ガイドライン）。部品と Good / Don't の見本は `src/design-system/guidelines/GuidelineBlocks.tsx` を使う。

| やりたいこと | 使うもの |
| --- | --- |
| ボタン・リンク風の操作 | `Button`（リンクは `asChild` で `<a>` / `Link` を包む） |
| 確認・入力のモーダル | `Dialog` |
| メニュー | `DropdownMenu` |
| 今いるページの位置（2階層目以降） | `Breadcrumb`（ページタイトルのすぐ上。今いるページは `BreadcrumbPage`） |
| フォーム | `Label` + `Input` / `Select` / `Checkbox` |
| 状態ラベル | `Badge` |
| ユーザー表示 | `UserAvatar` |
| 補足説明のポップアップ | `Tooltip` |
| 区切り線 | `Separator` |
| 読み込み中 | `Spinner` |
| 操作結果の通知 | `toast`（sonner） |
| ページ内に残すお知らせ・注意・エラー | `Alert`（`info` / `success` / `warning` / `destructive`。色の意味を持たせないときは `default`） |
| 横に送って見せる（カード列など） | `Carousel` |
| ページ最上部の帯（左上にロゴ） | `SiteHeader`（中に `GajiLaboLogo`）。ページタイトルとログインは、その下の `Header` |
| Gaji-Labo のロゴ | `GajiLaboLogo`（色は親の文字色。高さを `h-*` で指定） |

アプリ固有の部品（例: CT スケジュールの週カード）は `docs/design/apps/<アプリ名>.md` に書く。

## 禁止事項

| 禁止 | 代わりに | lint での検出 |
| --- | --- | --- |
| パレット色の直書き（`bg-gray-100`, `text-black`, `bg-white` など） | Semantic トークン | `design-system/no-palette-color` |
| 色の任意値（`bg-[#e5e5e5]`）、`style` での色指定 | Semantic トークン | `design-system/no-palette-color`（`style` は対象外） |
| 任意値（`p-[13px]`, `max-w-[425px]`） | 既定スケール。繰り返すなら variant / トークンを追加する | `design-system/no-arbitrary-value` |
| `<button>` や `<input>` の自作スタイリング | `Button` / `Input` | — |
| `className` で variant の見た目を上書き（`<Button className="bg-red-500">`） | 適切な `variant` を選ぶ。無ければ variant を追加する | 色の部分は検出される |
| 画面ごとの独自カードや独自ラベル | 既存部品の組み合わせ。足りなければ部品を追加する | — |
