## CT Schedule 🗓️

CT の組み合わせを管理するリポジトリです。  
https://ct-schedule.vercel.app/

## 技術スタック

- FE: [Next.js](https://nextjs.org/) - App Router
- UI: [shadcn/ui](https://ui.shadcn.com/), [Tailwind](https://tailwindcss.com/)
- Auth: [Auth.js](https://authjs.dev/) - Slack OAuth
- DB: [neon](https://neon.com/) (Free plan)
- Hosting: [Vercel](https://vercel.com/home) (Free plan)
- Server Actions

## ローカル環境

```bash
bun dev
```

[http://localhost:3000](http://localhost:3000)

### Slack 認証

Slack 認証は localhost では動かないため、https の URL を設定してください。

1. なんらかの方法で https の URL を発行する（[ngrok](https://ngrok.com/), [Next.js](https://nextjs.org/docs/app/api-reference/cli/next#using-https-during-development) など）
1. [Slack API](https://api.slack.com/apps/A09G83EC31C/oauth) の OAuth & Permissions > Redirect URLs に発行したURLを追加
1. .env.development.local の `AUTH_URL` を変更
