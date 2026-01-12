# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CTスケジュール管理アプリケーション - チーム内で2人1組のコミュニケーションタイム（CT）を定期的に作成・管理するWebアプリ。

## Development Commands

```bash
# 開発サーバー起動
bun dev

# ビルド
bun run build

# Lint実行
bun run lint

# テスト実行
bun run test

# 特定ファイルのテストのみ実行
bun run test src/utils/member.test.ts
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Auth**: Auth.js v5 (Slack OAuth)
- **Database**: Neon PostgreSQL (via @neondatabase/serverless)
- **UI**: shadcn/ui + Tailwind CSS
- **Test**: Vitest
- **Server Actions**: データ取得・更新はすべてServer Actions経由

### Directory Structure

```
src/
├── app/
│   ├── actions.ts              # Server Actions (DB操作の集約)
│   ├── components/
│   │   ├── ui/                 # shadcn/uiコンポーネント
│   │   ├── AddMemberFormDialog.tsx
│   │   ├── EditMemberForm.tsx
│   │   ├── DeleteMemberDialog.tsx
│   │   ├── CTScheduleCard.tsx
│   │   ├── SetupDataDialog.tsx
│   │   └── SigninWithSlackButton.tsx
│   ├── member/                 # メンバー管理ページ
│   ├── page.tsx                # トップページ（CTスケジュール表示）
│   ├── layout.tsx
│   └── api/auth/[...nextauth]/ # Auth.js API route
├── utils/
│   ├── member.ts               # ラウンドロビンアルゴリズム
│   ├── member.test.ts
│   ├── date.ts                 # 日付ユーティリティ
│   └── date.test.ts
├── lib/
│   └── utils.ts                # shadcn/ui utilities (cn関数など)
auth.ts                         # Auth.js設定（ルート直下）
```

### Key Architecture Patterns

#### 1. Server Actions Pattern
すべてのDB操作は`src/app/actions.ts`に集約。クライアントコンポーネントからは`use server`のServer Actionsを呼び出す。

```typescript
// actions.ts
"use server";
export async function getMember(): Promise<Member[]> {
  const data = await sql`SELECT * FROM public.member ORDER BY id ASC`;
  return data as Member[];
}

// Client Component
const members = await getMember();
```

#### 2. Database Connection
環境ごとにDB接続先を切り替え（`getDataBaseUrl()`関数）:
- **Development**: `DATABASE_URL_DEV`
- **Preview (Vercel)**: `DATABASE_URL`
- **Production (Vercel)**: `DATABASE_URL`

#### 3. Authentication Flow
Auth.js v5のSlack OAuthを使用。認証フロー:
1. Slackでログイン
2. `signIn` callback内でSlack APIからプロフィール取得（`SLACK_BOT_TOKEN`使用）
3. `upsertUserFromSlack()`でDBにユーザー情報を保存/更新
4. JWTに`slack_user_id`を格納してセッション管理
5. セッション情報は`auth()`で取得可能

#### 4. Round Robin Algorithm
`src/utils/member.ts`にラウンドロビン方式のペアリングロジック:

**重要なビジネスルール:**
- **PROJECT_START_DATE (2025-08-04)**: 固定基準日。ペアの整合性維持のため変更厳禁
- **スケジュール生成**: 今日以降の月曜日を5年分自動生成
- **ラウンドオフセット**: 基準日からの週数を計算し、ラウンドを循環させる

```typescript
// ラウンドロビンの流れ
generateRoundRobinPairs(members)  // 参加メンバーから全ラウンド生成
  → generateCTSchedules(rounds)    // 月曜日リストと組み合わせ
```

**アルゴリズムの特徴:**
- `generateRoundRobinPairs()`: 参加メンバーから重複のないペア組み合わせを生成
- 奇数人数の場合は`null`を追加して「お休み」枠を作成
- `generateCTSchedules()`: 基準日からのオフセットで適切なラウンドを割り当て

#### 5. UI/UX Patterns

**Dialog管理:**
```typescript
const [open, setOpen] = useState(false);

// Dialogを閉じる時に入力クリア
onOpenChange={(open) => {
  if (!open) setName("");
  setOpen(open);
}}
```

**Form送信パターン:**
```typescript
const handleSubmit = async (formData: FormData) => {
  try {
    await serverAction(formData);
    setOpen(false);          // Dialogを閉じる
    toast.success("成功");   // トースト表示
    router.refresh();        // データ再取得
  } catch (error) {
    toast.error("失敗");
    console.error(error);
  }
};
```

## Testing

- **Test Framework**: Vitest
- **Test Files**: `*.test.ts`形式
- **Coverage**: `src/utils/`のビジネスロジックに対してユニットテスト実装済み
- **Focus**: ラウンドロビンアルゴリズム、日付ユーティリティ

## Environment Variables

### Required
```
# Slack OAuth
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_BOT_TOKEN=           # ユーザープロフィール取得用

# Auth.js
AUTH_SECRET=
AUTH_URL=                  # localhost以外（ngrok等）で動作確認する場合に設定

# Database
DATABASE_URL=              # Production/Preview用
DATABASE_URL_DEV=          # Development用
```

### Local Development with Slack Auth
Slack認証はlocalhostでは動作しないため、開発時は以下の手順:
1. ngrokでhttps URLを発行
2. Slack API OAuth設定（https://api.slack.com/apps/A09G83EC31C/oauth）にリダイレクトURLを追加
3. `.env.development.local`の`AUTH_URL`を更新

## Database Schema

### users table
Slack認証ユーザー情報（ログインユーザーの管理）
- `slack_user_id` (PK): Slack User ID
- `slack_email`, `slack_display_name`, `slack_image`: Slackプロフィール情報
- `employee_number`: 社員番号（任意、初回ログイン時に設定）
- `participate`: CT参加フラグ（ログインユーザーがCTに参加するか）
- `created_at`, `updated_at`, `deleted_at`

### member table(usersテーブルに移行後削除予定)
CTペアリング対象メンバー（Slackユーザーとは独立した管理）
- `id` (PK): メンバーID
- `name`: メンバー名
- `participate`: 参加フラグ（CTペアリングに含めるか）

**重要**: `users`テーブルと`member`テーブルは独立。ログインせずともメンバー追加可能。

## Common Patterns

### Adding a New Server Action
1. `src/app/actions.ts`に関数を追加
2. 関数の先頭に`"use server"`は不要（ファイルレベルで宣言済み）
3. 型を定義（`User`, `Member`など）
4. クライアントコンポーネントから直接import & 呼び出し

```typescript
// actions.ts
export async function getSomething(): Promise<Something[]> {
  const data = await sql`SELECT * FROM table`;
  return data as Something[];
}

// Component
"use client";
import { getSomething } from "@/app/actions";

const data = await getSomething();
```

### Adding a New UI Component
1. `src/app/components/`にファイル作成
2. Server Actionsを使う場合は`"use client"`ディレクティブ必須
3. shadcn/uiコンポーネントは`@/components/ui/`から import
4. Dialog使用時は`useState`でopen状態管理、閉じる時に入力クリア
5. Form送信後は`toast`表示 + `router.refresh()`

### Working with Dates
- **基準日**: `PROJECT_START_DATE`は変更厳禁（ペアの整合性が崩れる）
- **月曜日リスト**: `mondays`配列（5年分の月曜日）
- **今日以降フィルタ**: `filterFromToday(mondays)`で取得
- **日付フォーマット**: `date-fns`を使用、ロケールは`ja`
