# DESIGN.md

CTスケジュールの UI を実装するときのルールと判断材料。人も AI エージェントも、新しい画面・コンポーネントを作る前にこのファイルを読む。

> **ステータス: 叩き台 (土台整備中)**
> 構造とルールの置き場所を先に用意した段階。「(仮)」と付いた項目はチームでの合意前の仮置き。

この文書は [デザインハーネス](https://design-harness.com/) の4層モデル（制約・文脈・検証・評価）に沿って構成している。

| 層 | このリポジトリでの実体 |
| --- | --- |
| 制約 | Semantic トークン (`src/app/globals.css`, `tailwind.config.ts`)、コンポーネント (`src/app/components/`)、本書の「禁止事項」 |
| 文脈 | 本書の「プロダクト文脈」「デザイン原則」、Storybook の Story |
| 検証 | ESLint の `design-system/*` ルール、Storybook の a11y チェック |
| 評価 | 本書の「フィードバックの戻し先」 |

---

## 1. プロダクト文脈

### 何のアプリか

チーム内で2人1組の CT（コミュニケーションタイム）を毎週組み合わせ、一覧で見せるアプリ。

- CT は毎週月曜に実施する。組み合わせはラウンドロビンで自動生成され、毎週相手が変わる
- 参加人数が奇数の週は、1人が「お休み」になる
- 祝日の週は、カードに祝日名を表示する
- Slack でログインし、相手との Slack ハドルをワンクリックで始められる

### 主な画面

| 画面 | パス | 目的 |
| --- | --- | --- |
| CT組み合わせ表 | `/` | 今週以降の組み合わせを週ごとのカードで横に並べて見せる |
| メンバー一覧 | `/member` | 参加メンバーと参加・不参加の状態を見せる、削除する |

### ユーザーと利用シーン (仮)

- チームメンバーが「今週の相手は誰か」を確かめるために、週の初めに開く
- 滞在時間は短い。目的は「相手を知る → ハドルを始める」で終わる
- 管理操作（メンバー追加・削除、初期設定）はたまにしか行わない

## 2. デザイン原則 (仮)

1. **今週がすぐわかる** — 最初に目に入るのは「今週の組み合わせ」。過去や遠い未来の情報は控えめにする
2. **静かな UI** — 基調は neutral。色は状態（祝日・お休み・参加中・危険な操作）を伝えるときだけ使う
3. **部品の組み合わせで作る** — 画面ごとの独自スタイルを作らない。足りなければ部品やトークンを増やしてから使う

---

## 3. 制約

### 色

**Semantic トークンだけを使う。** 一覧と用途は `src/design-system/tokens.ts`（Storybook: Foundations/Colors）にある。

| 用途 | 使うトークン |
| --- | --- |
| 本文 / 補足テキスト | `text-foreground` / `text-muted-foreground` |
| 控えめな面（リスト行など） | `bg-muted` |
| 枠線 | `border`（既定で `border-border`）、入力欄は `border-input` |
| 主要アクション / 副次アクション | `Button` の `variant="default"` / `"outline"` |
| 削除・エラー | `destructive` 系、`Button variant="destructive"` |
| 成功・参加中 | `bg-success` |
| 祝日の週のカード背景 | `bg-status-holiday` |
| 「お休み」「祝日名」ラベル | `bg-status-rest text-status-rest-foreground` |
| 今週の強調枠 | `border-highlight-current` |
| ページ最上部の帯（SiteHeader） | `bg-site-header text-site-header-foreground`（黒地に白。ライト・ダーク共通） |
| アバターの背景（画像が無いとき） | `AvatarFallback` に `colorSeed`（ユーザー ID）を渡す。`avatar-1`〜`7` から自動で1色選ばれる。`UserAvatar` は対応済み。クラスを直接書かない |

トークンを追加するときは `globals.css`（ライト・ダーク両方）、`tailwind.config.ts`、`tokens.ts` の3箇所を揃える。

**ブランドカラー（Gaji-Labo）**: `--gaji-main-*`（Main・5色）と `--gaji-accent-*`（Accent・3色）を Primitive として定義している。出典は Figma「Gaji-Labo Styles」の Gaji-Labo Colors（Main は Web Site、Accent は Blog）。一覧と Web サイト・ブログでの用途は Storybook の Foundations/Colors「Brand (Gaji-Labo)」にある。Primitive なのでコンポーネントから直接使わず、使うときは用途に合う Semantic トークンを追加し、その参照先にする（例: `avatar-*`）。

### 余白・サイズ

- Tailwind の既定スケール（4px グリッド）を使う。よく使う値は `src/design-system/tokens.ts` の `spacing` を参照
- 角丸は `rounded-md`（ボタン・入力欄・リスト行）、`rounded-lg`（カード・ダイアログ）、`rounded-full`（アバター・ラベル）

### タイポグラフィ

| 用途 | クラス |
| --- | --- |
| ページタイトル (h1) | `text-2xl font-bold` |
| セクション・カード見出し (h2) | `text-lg font-semibold` |
| 本文・ラベル | `text-sm font-medium` |
| 補足説明 | `text-sm text-muted-foreground` |
| 番号・バッジ・注釈 | `text-xs` |

### コンポーネント

使えるコンポーネントは `src/app/components/ui/`（shadcn/ui ベース）にある。Storybook に Story があるものは、docs の「使い分け」に従う。

| やりたいこと | 使うもの |
| --- | --- |
| ボタン・リンク風の操作 | `Button`（リンクは `asChild` で `<a>` / `Link` を包む） |
| 確認・入力のモーダル | `Dialog` |
| メニュー | `DropdownMenu` |
| 今いるページの位置（2階層目以降） | `Breadcrumb`（ページタイトルのすぐ上。今いるページは `BreadcrumbPage`） |
| フォーム | `Label` + `Input` / `Select` / `Checkbox` |
| 状態ラベル | `Badge` |
| ユーザー表示 | `UserAvatar` |
| メンバー一覧の1行 | `MemberListItem`（アバター・名前・参加状態。右端の操作は `action` で渡す） |
| 補足説明のポップアップ | `Tooltip` |
| 区切り線 | `Separator` |
| 読み込み中 | `Spinner` |
| 操作結果の通知 | `toast`（sonner） |
| 横に送って見せる（カード列など） | `Carousel`。CT の週カードは `CTScheduleCarousel`（初期表示は「次の週」だけ、進めると「前の週」が出る） |
| ページ最上部の帯（左上にロゴ） | `SiteHeader`（中に `GajiLaboLogo`）。ページタイトルとログインは、その下の `Header` |
| Gaji-Labo のロゴ | `GajiLaboLogo`（色は親の文字色。高さを `h-*` で指定） |

### 禁止事項

| 禁止 | 代わりに | lint での検出 |
| --- | --- | --- |
| パレット色の直書き（`bg-gray-100`, `text-black`, `bg-white` など） | Semantic トークン | `design-system/no-palette-color` |
| 色の任意値（`bg-[#e5e5e5]`）、`style` での色指定 | Semantic トークン | `design-system/no-palette-color`（`style` は対象外） |
| 任意値（`p-[13px]`, `max-w-[425px]`） | 既定スケール。繰り返すなら variant / トークンを追加する | `design-system/no-arbitrary-value` |
| `<button>` や `<input>` の自作スタイリング | `Button` / `Input` | — |
| `className` で variant の見た目を上書き（`<Button className="bg-red-500">`） | 適切な `variant` を選ぶ。無ければ variant を追加する | 色の部分は検出される |
| 画面ごとの独自カードや独自ラベル | 既存部品の組み合わせ。足りなければ部品を追加する | — |

---

## 4. 新しい画面を実装する手順

1. **文脈を確認する** — 本書の「プロダクト文脈」と「デザイン原則」を読み、画面の目的と、最初に目に入るべき情報を決める
2. **部品を選ぶ** — 「コンポーネント」の表と Storybook から使う部品を決める。足りない部品があれば、画面の実装より先に部品（と Story）を作る
3. **組み立てる** — 色・余白・文字は「制約」の表から選ぶ
4. **Story を書く** — 画面またはその主要部品の Story を書き、次の状態を用意する
   - 通常 / データ0件 / 長い名前・多い件数 / 読み込み中・エラー（あれば）
   - CT 固有: 祝日の週、参加人数が奇数（お休みあり）、今週のカード
5. **検証する** — 下の「検証」をすべて通す

## 5. 検証

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

## 6. フィードバックの戻し先

レビューの指摘や AI の生成ミスは、その場の修正で終わらせず、次に同じことが起きないよう仕組みへ戻す。

| 起きたこと | 戻し先 |
| --- | --- |
| 同じ見た目の指摘が繰り返される | 本書の「禁止事項」に追記。機械的に検出できるなら `eslint/design-system-plugin.mjs` にルールを追加 |
| 同じ任意値・独自 UI が複数箇所に出る | コンポーネントの variant か、新しいコンポーネント（＋Story）にする |
| 意味のある色が足りない | Semantic トークンを追加（3箇所を揃える） |
| 判断の前提が AI に伝わっていない | 本書の「プロダクト文脈」「デザイン原則」に追記 |
| 部品の使い分けを間違える | その部品の Story の docs（`parameters.docs.description`）に使い分けを追記 |

## 参照

| 内容 | 場所 |
| --- | --- |
| トークン定義 | `src/app/globals.css`, `tailwind.config.ts` |
| トークンの用途一覧 | `src/design-system/tokens.ts` |
| コンポーネントと Story | `src/app/components/**`、`bun run storybook` |
| lint ルール | `eslint/design-system-plugin.mjs` |
