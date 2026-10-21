## Gaji-Labo 社内アプリ デザインシステム

Gaji-Labo の社内アプリで使うデザインシステムです。トークン・コンポーネント・ルールと、それを人と AI が同じ品質で使うための仕組みをまとめています。

- カタログ: Storybook（`bun run storybook` → [http://localhost:6006](http://localhost:6006)。Cloudflare Workers にも配信）
- ルール・文脈: [docs/design/](./docs/design/)
- 実装の手順・検証: Skill [implement-ui](./.claude/skills/implement-ui/SKILL.md)
- AI の生成検証: [experiments/](./experiments/)

### 技術スタック

- UI: [shadcn/ui](https://ui.shadcn.com/), [Tailwind](https://tailwindcss.com/)
- カタログ: [Storybook](https://storybook.js.org/)
- 検証: ESLint（`design-system/*` ルール）、Storybook の a11y チェック

```bash
bun run storybook   # カタログ
bun run verify:ui   # lint → test → Storybook ビルド
```

## CT Schedule 🗓️

デザインシステムを使って作った最初のアプリです。CT の組み合わせを管理します。  
https://ct-schedule.vercel.app/

アーキテクチャ・DB・環境変数は [docs/apps/ct-schedule.md](./docs/apps/ct-schedule.md) を参照してください。

### 技術スタック

- FE: [Next.js](https://nextjs.org/) - App Router
- Auth: [Auth.js](https://authjs.dev/) - Slack OAuth
- DB: [neon](https://neon.com/) (Free plan)
- Hosting: [Vercel](https://vercel.com/home) (Free plan)
- Server Actions

### ローカル環境

```bash
bun dev
```

[http://localhost:3000](http://localhost:3000)

#### Slack 認証

Slack 認証は localhost では動かないため、https の URL を設定してください。

1. なんらかの方法で https の URL を発行する（[ngrok](https://ngrok.com/), [Next.js](https://nextjs.org/docs/app/api-reference/cli/next#using-https-during-development) など）
1. [Slack API](https://api.slack.com/apps/A09G83EC31C/oauth) の OAuth & Permissions > Redirect URLs に発行したURLを追加
1. .env.development.local の `AUTH_URL` を変更
