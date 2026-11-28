# drafts（確認待ちの画面）

AI（Skill `implement-ui`）や人が作った画面の Story を、正式な画面（`../pages/`）にする前に置く場所。Storybook では「Drafts/<アプリ名>/」に出る。

- ここの Story には `tags: ["!manifest"]` を付けて、部品のマニフェスト（`/manifests/components.json`）に載せない。`pages/` に移したあとも付けたままにする
- 人が Storybook（手元か、PR の Cloudflare プレビュー）で見て、問題ないと確定させたら `../pages/` に移す。手順は `.claude/skills/implement-ui/SKILL.md`「Drafts から Pages に移す」
- `main` にマージする前に、ここの Story は `pages/` に移すか消す（`.github/workflows/drafts.yaml` が止める）
