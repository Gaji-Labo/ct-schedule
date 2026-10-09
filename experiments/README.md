# 生成検証

DESIGN.md・Skill `implement-ui`・Storybook がそろった状態で、AI がどれだけデザインルールに沿った画面を作れるかを確かめる。

| 種類 | 確かめること | 隠すもの | 比べる相手 |
| --- | --- | --- | --- |
| `reproduce` | 既存の2画面を、どれだけ本物に近く作り直せるか | `src/design-system/pages/` の2画面の Story と、`src/app/page.tsx`・`src/app/member/page.tsx`（同じ組み立てなので） | 隠した2つの Story |
| `add-page` | 新しい画面を足したとき、どれだけルールに沿うか | なし（既存画面を参考にできる状態が実際の使い方に近い） | DESIGN.md と `results/_template.md` の観点 |

## 進め方

```bash
experiments/setup.sh reproduce 01
```

1. 上のコマンドで `~/ct-schedule-experiments/reproduce-01` にサンドボックスを作る。今の作業ツリー（未コミットの変更も含む）をコピーし、git の履歴を持たない新しいリポジトリにするので、履歴や他ブランチから正解を読まれない。`experiments/` も持ち込まない
2. サンドボックスで新しく `claude` を起動し、`prompts/<種類>.md` の中身をそのまま貼る。途中で口を出したら notes に書く
3. Storybook で見る: サンドボックスで `bun run storybook`
4. 結果を集める: `experiments/collect.sh reproduce 01`。`results/reproduce-01/` に次ができる
   - `report.html` — 推測リスト（AI の自己申告）と行動ログ（セッション記録から機械的に作る）。外へのアクセス・git 履歴・ネットワークの利用は赤・黄で示す
   - `files/`、`generated.patch` — 生成物
   - `answer.diff` — 正解との差分（reproduce のみ）
   - `notes.md` — 評価シート
5. `notes.md` を埋め、見つかった問題を DESIGN.md「フィードバックの戻し先」に沿って直す。直したら連番を上げてもう一度回す

同じ条件で2〜3回回すと、たまたまの出来と、毎回起きる問題を分けられる。

## 注意

- Skill `implement-ui` の「画面の Story」の書き方（置き場所・`title`・リンクの形）は既存の2画面から書き起こしている。`reproduce` ではその分だけ正解に近づきやすい
- サンドボックスには `.claude/settings.local.json` で読み取り禁止の設定を入れている（このリポジトリ・セッション記録の Read、WebFetch、`gh` / `curl` など）。Read・Glob・Grep と、Bash の `cat` のような単純な読み取りは止まるが、Bash から python などで間接的に読むのは止められない。最後は `report.html` の行動ログで確かめる
- `~/ct-schedule-experiments/` のほかの回のサンドボックスは禁止していない。前の回の生成物を読んでいないかも行動ログで見る
