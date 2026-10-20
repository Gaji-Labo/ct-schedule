# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gaji-Labo の社内アプリ向けデザインシステム。トークン・コンポーネント・ルール・Storybook と、AI が画面を実装するための手順（Skill）と検証の仕組みをまとめている。

このリポジトリには、デザインシステムを使って作った最初のアプリ **CT スケジュール**（チーム内で2人1組のコミュニケーションタイムを組み合わせるアプリ）も同居している。CT スケジュールはデザインシステムの成果物の1つという位置づけで、将来は別のリポジトリに分ける可能性がある。

| 触るもの | 読むもの |
| --- | --- |
| UI（画面・コンポーネント・スタイル・Story・トークン） | 下の「UI Implementation」 |
| CT スケジュールのアプリのコード（データ・認証・ペアリング・cron） | [docs/apps/ct-schedule.md](./docs/apps/ct-schedule.md) |

**注意**: CT スケジュールの `PROJECT_START_DATE`（`src/utils/member.ts`）は変更厳禁（ペアの整合性が崩れる）。

## UI Implementation

**UI（画面・コンポーネント・スタイル）を実装・変更する前に、`docs/design/` の該当ファイルを読むこと。**

画面を作る・直す依頼は、Skill の名前がなくても Skill `implement-ui` の手順から始める。要件の聞き取り（`screen-brief`）と、決めたことの書き戻し（`reflect-decisions`）は `implement-ui` の中から呼ぶ。

| 知りたいこと | ファイル |
| --- | --- |
| 色・余白・文字・使う部品・禁止事項 | [docs/design/rules.md](./docs/design/rules.md) |
| 画面の目的・見せ方の判断材料（社内アプリ共通の文脈と原則） | [docs/design/principles.md](./docs/design/principles.md) |
| アプリ固有の目的・画面・利用シーン・部品・Story で用意する状態 | [docs/design/apps/](./docs/design/apps/)（CT スケジュールは [ct-schedule.md](./docs/design/apps/ct-schedule.md)） |
| 画面ごとの要件（表示と操作・状態・文言・未決のこと） | `docs/design/apps/<アプリ名>/screens/`（アプリの md の「主な画面」からリンク）。ないときは Skill `screen-brief`（`/screen-brief`）で作る |
| 実装の手順・検証 | Skill `implement-ui`（[.claude/skills/implement-ui/SKILL.md](./.claude/skills/implement-ui/SKILL.md)、`/implement-ui`） |
| 確認で決めたことの戻し方 | Skill `reflect-decisions`（`/reflect-decisions`） |
| 仕組みの全体像・フィードバックの戻し先 | [docs/design/workflow.md](./docs/design/workflow.md) |
| 依頼から生成・戻すまでの流れ（案） | [docs/design/generation-flow.md](./docs/design/generation-flow.md) |

## Development Commands

```bash
# Storybook（デザインシステムのカタログ）
bun run storybook

# lint → test → Storybook ビルド（UI を変えたら通す）
bun run verify:ui

# Lint実行
bun run lint

# テスト実行（bun組み込みテストランナーを使用）
# ※ bun run test (vitest) はpath aliasエラーが出るため bun test を使う
bun test

# CT スケジュールの開発サーバー起動・ビルド
bun dev
bun run build
```

## Directory Structure

デザインシステムとアプリのファイルは、今は同じ `src/` の中に混ざっている。分けるときの目安として、どちらに属するかで分けて書く。

### デザインシステム

```
src/
├── app/
│   ├── globals.css             # デザイントークン (CSS 変数、ライト/ダーク)
│   └── components/
│       ├── ui/                 # shadcn/ui ベースの汎用部品。*.stories.tsx は Storybook の「UI/」
│       ├── SiteHeader.tsx / Header.tsx / GajiLaboLogo.tsx  # 社内アプリ共通のヘッダー・ロゴ (Storybook の「UI/」)
│       └── UserAvatar.tsx / UserDropdown.tsx               # Slack ユーザーの表示
├── design-system/              # Storybook にだけ載るもの (アプリ本体からは使わない)
│   ├── tokens.ts               # トークンの用途カタログ (Foundations と AI の参照元)
│   ├── foundations/            # Storybook の「Foundations/」: Introduction・Colors・Typography・Layout・Logo
│   ├── guidelines/             # 各部品の「ガイドライン」ページ (組み合わせ方の OK / NG)。UI/<部品> の下に出る
│   ├── pages/                  # Storybook の「Apps/<アプリ名>/Pages/」: 画面全体をモックデータで再現した Story (人が確定させた正式な画面)
│   ├── drafts/                 # Storybook の「Drafts/<アプリ名>/」: 確認待ちの画面。確定したら pages/ へ移す。main には残さない
│   │   └── experiments/        # 生成検証の結果を正解と並べて見るためのコピー (git 管理外)
│   └── mocks/                  # Story 用のモックデータ・代用品
├── lib/
│   └── utils.ts                # shadcn/ui utilities (cn関数など)
tailwind.config.ts              # トークンを Tailwind のクラスに対応づける
docs/design/                    # UI 実装のルール・文脈 (上の「UI Implementation」参照)
eslint/design-system-plugin.mjs # design-system/* lint ルール (+ テスト)
.storybook/                     # Storybook 設定。Story と MDX をまとめて1つの Storybook にする
wrangler.jsonc                  # Storybook の静的ビルドを Cloudflare Workers に配信する
.claude/skills/
├── implement-ui/               # Skill implement-ui (/implement-ui): UI 実装の手順・検証・報告
│   └── report.ts               # bun run report:ui。作業レポートを .implement-ui/report.html に出す (git 管理外)
├── screen-brief/               # Skill screen-brief (/screen-brief): 画面を作る前に要件を聞き取り、docs/design/apps/<アプリ名>/screens/ に書く (試作)
├── reflect-decisions/          # Skill reflect-decisions (/reflect-decisions): 確認で決めたことを、承認を取ってから要件ファイル・アプリの md・ルール資料に書き足す (試作)
└── worktree/                   # git worktree の操作
experiments/                    # AI の生成検証。今は CT スケジュールの画面を題材にしている
├── setup.sh / collect.sh       # 作業場所 (~/ct-schedule-experiments/<種類>-<連番>) の作成と結果の回収
├── prompts/                    # AI に渡す依頼文 (reproduce: 既存画面の再現 / add-page: 新しい画面)
└── results/                    # 回ごとの生成物・正解との差分・評価シート (notes.md)
```

### CT スケジュール（アプリ）

ディレクトリ構成・アーキテクチャ・DB・環境変数は [docs/apps/ct-schedule.md](./docs/apps/ct-schedule.md) にある。デザインシステム側にある CT 固有のものは次のとおり。

- `src/app/components/` のアプリ固有部品（`CTScheduleCard` / `CTScheduleCarousel` / `MemberListItem` など）。Storybook の「Apps/CTスケジュール/Components/」
- `src/design-system/pages/` の2画面（Storybook の「Apps/CTスケジュール/Pages/」）と `src/design-system/mocks/ct.ts`
- トークン `status-holiday` / `status-rest` / `highlight-current`（`globals.css` などに共通トークンと並べて定義している）
- [docs/design/apps/ct-schedule.md](./docs/design/apps/ct-schedule.md)

## Testing

- **Test Runner**: `bun test`（bun組み込みテストランナー）
  - `bun run test`（vitest）はpath alias（`@/src/...`）でエラーになるため使わない
- **Test Files**: `*.test.ts`形式
- デザインシステム側は lint ルールのテスト（`eslint/design-system-plugin.test.ts`）。CT スケジュール側は `src/utils/` のビジネスロジック
