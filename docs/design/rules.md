# UI 実装のルール（社内アプリ共通）

色・余白・文字・使う部品・禁止事項。UI を実装・変更するときはこの範囲から選ぶ。違反の一部は `bun run lint` の `design-system/*` ルールで検出される。

## 色

**Semantic トークンだけを使う。** 一覧と用途は `src/design-system/tokens.ts`（Storybook: Foundations/Colors）にある。

| 用途 | 使うトークン |
| --- | --- |
| 本文 / 補足テキスト | `text-foreground` / `text-muted-foreground` |
| 控えめな面（リスト行など） | `bg-muted` |
| 枠線（カード・リスト・区切り線） | `border`（既定で `border-border`） |
| 部品の境界（入力欄・セレクト・outline ボタン） | `border-input` |
| 主要アクション / 副次アクション | `Button` の `variant="default"` / `"outline"` |
| 削除・エラー | `destructive` 系、`Button variant="destructive"` |
| 成功・参加中 | `bg-success` |
| メッセージの色（Alert・toast・Badge の状態色） | `feedback-{info,success,warning,destructive}-{subtle,foreground,border,icon}`。部品の variant 経由で使い、直接クラスを書かない |
| ページ最上部の帯（SiteHeader） | `bg-site-header text-site-header-foreground`（黒地に白。ライト・ダーク共通） |
| アバターの背景（画像が無いとき） | `AvatarFallback` に `colorSeed`（ユーザー ID）を渡す。`avatar-1`〜`7` から自動で1色選ばれる。`UserAvatar` は対応済み。クラスを直接書かない |

アプリ固有の色（例: CT スケジュールの祝日・お休み）は `docs/design/apps/<アプリ名>.md` に書く。

トークンを追加するときは `globals.css`（ライト・ダーク両方）、`tailwind.config.ts`、`tokens.ts` の3箇所を揃える。

**ブランドカラー（Gaji-Labo）**: `--gaji-main-*`（Main・5色）と `--gaji-accent-*`（Accent・3色）を Primitive として定義している。出典は Figma「Gaji-Labo Styles」の Gaji-Labo Colors（Main は Web Site、Accent は Blog）。一覧と Web サイト・ブログでの用途は Storybook の Foundations/Colors「Brand (Gaji-Labo)」にある。Primitive なのでコンポーネントから直接使わず、使うときは用途に合う Semantic トークンを追加し、その参照先にする（例: `avatar-*`）。

## コントラスト

WCAG 2.2 AA を守る。トークンを追加・変更するときは、ライト・ダーク両方の背景（`background` と、その上に置く `muted` など）に対して比率を計算して確かめる。

| 対象 | 基準 | 該当するトークン |
| --- | --- | --- |
| 本文・ラベルなどの文字 | 4.5:1 以上（18px 以上の太字・24px 以上は 3:1 以上） | `foreground`、`muted-foreground`、各 `*-foreground` |
| **部品の境界**（枠が無いと入力できる場所・部品の範囲がわからないもの） | **3:1 以上**（WCAG 1.4.11） | `input`（白地 3.41:1・muted 地 3.13:1 / 黒地 3.27:1。濃くなりすぎないよう、3:1 を少し上回る中間色 `neutral-450` / `neutral-550` を使う） |
| 色や枠だけで意味を伝えるもの | 3:1 以上（WCAG 1.4.11） | `highlight-current`（白地 4.74:1 / 黒地 4.18:1）、フォーカスリング `ring` |
| 飾りの区切り（無くても情報が失われないもの） | 基準なし。ただし面の区切りが見える濃さにする | `border`（白地 1.48:1 / 黒地 1.91:1） |

- 枠線の色を選ぶときは「枠が無いと何かがわからなくなるか」で判断する。わからなくなるなら `border-input` か 3:1 以上の色、ならないなら `border`
- 状態の色（Alert・toast・Badge の `feedback-*-border`）は、背景色・アイコン・文言でも意味を伝えているので枠線は飾り扱い。色だけで状態を伝えない

## レイアウト

**ページの骨組みは `PageLayout`・`PageHeader`・`PageSection`（`src/app/components/PageLayout.tsx`）で組み立てる。** `<main>` の余白・最大幅・セクションの間隔を画面ごとに書かない（Storybook: Foundations/Layout、Patterns/PageLayout）。

| 項目 | 値 | 実装 |
| --- | --- | --- |
| 最大幅 | 1280px（`max-w-7xl`）、中央寄せ | `PageLayout` の `<main>`。SiteHeader の中身も同じ幅 |
| ページ余白 | スマホ: 左右 16px・上下 32px（`px-4 py-8`）／ `md` 以上: 40px（`md:p-10`） | `PageLayout` の `<main>`。SiteHeader の左右余白も揃える |
| セクション同士の間隔 | 40px（`gap-10`） | `PageLayout`（PageHeader と PageSection、PageSection 同士） |
| セクション内の間隔 | 16px（`gap-4`） | `PageSection` |
| パンくずとページタイトルの間 | 8px（`gap-2`） | `PageHeader` |

- ページは「`PageHeader`（パンくず → h1 と右端の操作）→ `PageSection` を並べる」の形にする
- **ブレイクポイント**は Tailwind の既定（`sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280px）。社内アプリなので PC を基準に作り、`md` 未満は崩れずに使えることだけを確かめる。主な切り替え点は `md`。独自のブレイクポイントは作らない

## 余白・サイズ

- Tailwind の既定スケール（4px グリッド）を使う。よく使う値は `src/design-system/tokens.ts` の `spacing` を参照
- 角丸は `rounded-md`（ボタン・入力欄・リスト行）、`rounded-lg`（カード・ダイアログ）、`rounded-full`（アバター・ラベル）

## 階層表現（Elevation & Depth）

**階層は枠線で表し、影は「画面から浮いて、ほかの要素に重なるもの」にだけ付ける。** [principles.md](./principles.md) の「静かな UI」に合わせ、面の区切りを影で立体的に見せない。ダークモードでは影がほとんど見えないため、どの階層でも枠線を付け、影は補助として使う（Storybook: Foundations/Elevation）。

| 階層 | 対象 | 表し方 |
| --- | --- | --- |
| 0 | ページの面 | `bg-background` |
| 1 | カード・リスト・入力欄・ボタン・バッジ | `border` のみ（影なし） |
| 2 | ドロップダウン・セレクトの選択肢・toast・カードに重なるカルーセルの前後ボタン | `border` ＋ `shadow-md` |
| 3 | ダイアログ | `border` ＋ `shadow-lg` ＋ 背景を暗くするオーバーレイ |

- 影は `shadow-md` と `shadow-lg` の2段階だけ。どちらも部品に組み込み済みなので、画面側で `shadow-*` を書かない
- 1つだけ目立たせたいとき（今週のカードなど）は、影ではなく枠線の色や太さで表す

## タイポグラフィ

**フォント**: 欧文・数字は Geist、和文は Noto Sans JP（`src/lib/fonts.ts` で読み込み、`font-sans` にまとめている）。和文を Web フォントにするのは OS による見た目の差をなくすため。読み込めないときはヒラギノ角ゴ → Yu Gothic UI → メイリオに落ちる。`font-sans` は既定なので、コンポーネントで `font-*` を指定しない（等幅が要るときだけ `font-mono`）。

| 用途 | クラス | 行間 |
| --- | --- | --- |
| ページタイトル (h1) | `text-2xl font-bold leading-snug` | 1.375 |
| セクション・カード・ダイアログの見出し (h2) | `text-lg font-semibold leading-snug` | 1.375 |
| 本文（2行以上になりうる文章） | `text-sm leading-relaxed` | 1.625 |
| 補足説明 | `text-sm text-muted-foreground leading-relaxed` | 1.625 |
| ラベル・ユーザー名など1行で終わるもの | `text-sm font-medium` | 既定（20px） |
| 番号・バッジ・注釈 | `text-xs` | 既定（16px） |

- 行間は和文が詰まって見えないよう、見出しは `leading-snug`、文章は `leading-relaxed` にする。見出しに `leading-none` を使わない（2行になると行が重なる）
- 字間は詰めない（`tracking-tight` などを使わない）

## コンポーネント

使えるコンポーネントは `src/app/components/ui/`（shadcn/ui ベース）にある。Storybook に Story があるものは、docs の「使い分け」に従う。

組み合わせ方・並べ方の OK / NG は、Storybook の各コンポーネントの「ガイドライン」ページにまとめる（例: UI/Button › ガイドライン）。部品と Good / Don't の見本は `src/design-system/guidelines/GuidelineBlocks.tsx` を使う。

| やりたいこと | 使うもの |
| --- | --- |
| ボタン・リンク風の操作 | `Button`（リンクは `asChild` で `<a>` / `Link` を包む） |
| ページの骨組み（余白・最大幅・セクション） | `PageLayout` > `PageHeader` + `PageSection`。ログイン状態つきの見出しは `Header`（中で `PageHeader` を使う） |
| 確認・入力のモーダル | `Dialog`。幅は `DialogContent` の `size` で選ぶ: 確認ダイアログ（本文とボタン2つ）は `size="confirm"`（448px）、入力フォームは既定（512px） |
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
| 任意値（`p-[13px]`, `max-w-[425px]`, `leading-[1.8]`） | 既定スケール。繰り返すなら variant / トークンを追加する | `design-system/no-arbitrary-value` |
| 画面ごとに `<main>` の余白・最大幅・間隔を書く | `PageLayout` / `PageHeader` / `PageSection` | — |
| `DialogContent` の幅を `className` で決める（`sm:max-w-md` など） | `size="confirm"` / 既定 | — |
| カード・ボタン・入力欄などの面に影を付ける（`shadow-sm`, `shadow`） | `border`。影は浮く要素だけで、部品に組み込み済み | — |
| 見出しの `leading-none`、字間を詰める `tracking-tight` | 「タイポグラフィ」の表のクラス | — |
| `<button>` や `<input>` の自作スタイリング | `Button` / `Input` | — |
| `className` で variant の見た目を上書き（`<Button className="bg-red-500">`） | 適切な `variant` を選ぶ。無ければ variant を追加する | 色の部分は検出される |
| 画面ごとの独自カードや独自ラベル | 既存部品の組み合わせ。足りなければ部品を追加する | — |
