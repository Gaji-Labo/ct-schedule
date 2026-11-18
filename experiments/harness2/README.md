# Harness² でハーネスを改善する

[Harness²](https://github.com/google-research/harness2)（google-research/harness2）の改善ループを、「要件ファイルから、デザイナーの意図どおりの画面を Storybook に作る」題材で回す仕組み。`experiments/setup.sh` の生成検証が「人が1回ずつ回して評価する」のに対し、こちらは **AI に何度も作らせ、軌跡を比べてハーネス（指示書と Skill）の直し方を AI に提案させる**。

効いた直し方は、人が読んで `CLAUDE.md`・Skill `implement-ui`・`docs/design/` に書き写す。生成されたハーネスをそのまま置き換えない。

## 仕組み

| 役割 | 使うもの | 何をするか |
| --- | --- | --- |
| 実行側（rollout） | `codex exec`（ChatGPT ログイン） | 依頼文（`tasks/<id>/task.md`）どおりに画面の Story を作る。Harness² の実行側は OpenCode / Codex だけなので codex を使う |
| 改善側 | `claude -p`（Claude Code のログイン） | 軌跡を読んでハーネスの編集を提案・試行・合成し、教訓（`EXPERIENCE.md`）を残す |
| 採点 | eslint・tsc・Storybook ビルド・Playwright・`claude -p` | 改善側には見せない。人がハーネスを比べるためのもの |

- **ハーネス**（改善の対象）: このリポジトリの `CLAUDE.md` と `.claude/skills/{implement-ui,screen-brief,reflect-decisions}` を、codex 向けに `AGENTS.md` と `.agents/skills/` へ写したもの（`ctds/adapter.py` の `build_base_harness`）。`docs/design/` と部品・Story は**固定の資料**で、改善側は書き換えない
- **ワークスペース**: rollout ごとに、起点のコミットを `git archive` で書き出した履歴なしのリポジトリ（`setup.sh` と同じ考え方）。リポジトリの CLAUDE.md / Skill を外して検証するハーネスだけを置き、`tasks/<id>/setup/` の要件ファイルを重ね、`meta.json` の `hide`（再現タスクの正解）を消す。`node_modules` は本体のチェックアウトのものをつなぐ
- **起点**: 既定は `feature/screen-brief-skill`（`CTDS_BASE_COMMIT` で変えられる）。基底ハーネスはそのコミットの CLAUDE.md と Skill から作る

## タスク（サンプル要件）

Issue の代わりに、要件ファイルと採点基準を用意した。

| id | 種類 | 確かめること |
| --- | --- | --- |
| `mypage` | 新しい画面 | 一覧とフォームが同居する画面。今週の行の目立たせ方、行のそろい、フォームのエラー・保存中・結果の状態 |
| `skip-weeks` | 新しい画面 | 管理画面。主要アクションと削除の色の使い分け、確認ダイアログ・入力ダイアログ、空の状態 |
| `schedule-v2` | 作り直し | CT組み合わせ表の改訂版の要件。reproduce-02 で人が指摘したこと（重複した「予定」、自分の行のずれ、カルーセルの送り方、最初の画面に入る量）を採点基準にした |
| `member` | 再現 | メンバー一覧。基底でも高得点になりやすい。改善で後退していないかを見る |

各タスクは次のファイルでできている。

| ファイル | 内容 | 改善側から |
| --- | --- | --- |
| `task.md` | 依頼文。デザイナーが言いそうな一言 ＋ 要件ファイルの場所 ＋ 質問できない環境での進め方 | 見える |
| `setup/` | ワークスペースに重ねるファイル（要件ファイル `docs/design/apps/ct-schedule/screens/*.md`） | 見える |
| `meta.json` | `domain`（同じ domain のタスクで教訓のライブラリを共有する）、`hide`（隠す正解）、`base_commit`（省略時は既定の起点） | 隠す |
| `rubric.md` | デザイナーの意図を pass / fail の項目にした採点基準 | 隠す |

採点基準は叩き台。**デザイナーに見てもらい、意図とずれている項目を直してから**改善の結果を信じること。

## 前提

- harness2 の clone と venv（既定 `~/Work/30_tsukulink/harness2`。`H2_HOME` で変える）。`harness2/core/proposer.py` に「Vertex を使わず手元の Claude Code で動かす」パッチが当たっていること（TSUKULINK の検証で当てたもの）と、venv に `playwright` が入っていること（`uv pip install --python .venv/bin/python playwright`）
- codex（既定は harness2 側の private install。`CTDS_CODEX_BIN`）と、実験用の codex home（`~/ct-schedule-experiments/harness2/codex_home/` に `~/.codex/auth.json` のコピーと `config.toml`）
- 本体のチェックアウトで `bun install` 済み

結果は `~/ct-schedule-experiments/harness2/`（`CTDS_RUNS`）に出る。リポジトリには入れない。

## 回し方

```bash
# 前提の確認（!! が出なければよい）
experiments/harness2/h2 run --task mypage,skip-weeks,schedule-v2,member --dry-run

# 基底ハーネスで1回だけ作らせて、足場と採点を確かめる
experiments/harness2/h2 smoke --task mypage
experiments/harness2/h2 judge --task mypage --ns smoke

# 改善ループ（K=1 parallel: 基底・汎用の編集・domain の編集・合成の4ハーネスを試す）＋採点
experiments/harness2/h2 run --task mypage,skip-weeks,schedule-v2,member --k 1 --mode parallel --tag r1 --judge
```

- 改善ループは Claude Code のセッションの中からは起動できないことがある（`claude` を子プロセスで起動するため）。そのときはターミナルで実行する
- 同じコマンドで再開できる。終わった rollout は再利用される
- 実行側のモデルは既定で `gpt-6.1-sol`（`CTDS_SOLVER_MODEL` / `CTDS_SOLVER_EFFORT` で変えられる）。`gpt-6-astra` は数 rollout でワークスペースの利用上限に達した。モデルを変えたら、ハーネス同士を同じ条件で比べるため `--tag` も変える
- codex の利用上限（spend cap）に当たった rollout は済みにせず、エラーで止まる。上限が戻ってから同じコマンドを実行すれば、その rollout からやり直す
- それ以外の理由で失敗した rollout は「終わった」扱いで再利用される。やり直すときは、`<runs>/executions/ctds-cx-agg1-<tag>/<task>/<label>` と、タスクごとやり直すなら `<runs>/ctds-cx-agg1-<tag>/<task>` を別の場所へ移してから同じコマンドを実行する
- 目安: 1 rollout（codex）3〜5分、1タスク4 rollout ＋ 改善側の呼び出し4回（計 $5〜6）で25〜30分。実測は `reports/` の中間レポート
- タスクは `domain` ごとにまとめて順に回る。前のタスクの教訓が次のタスクの改善に届く

## 結果の読み方

1. `<runs>/ctds-cx-agg1-<tag>/<task>/summary.json` の `modes.agg.fell_back` が空か。空でなければ改善は起きていない（`<runs>/audit/*.meta.json` の `error`）
2. `<runs>/ctds-cx-agg1-<tag>/<task>/judge.md`: ラベルごとの lint・tsc・Storybook・はみ出し・ルーブリックの合格数と、項目別の ○ / ×。`base1` と採用されたハーネス（通常 `agg1`）を比べる
3. スクリーンショット: `<runs>/executions/ctds-cx-agg1-<tag>/<task>/<label>/shots/`。採点の判定が見た目と合っているかを自分の目で確かめる
4. 採用されたハーネスの差分: `diff -u <runs>/ctds-cx-agg1-<tag>/<task>/harnesses/base/AGENTS.md <runs>/ctds-cx-agg1-<tag>/<task>/harnesses/agg1/AGENTS.md`（Skill も同様）
5. 教訓: `<runs>/library/k1-<tag>/agg/ct-schedule/harnesses/<task>/EXPERIENCE.md` の cue / lesson / evidence。evidence が実際の軌跡（`codex_session.jsonl`）の行動を指しているものだけを採る

## 戻し方

教訓は、`docs/design/workflow.md`「フィードバックの戻し先」に沿って人が書き写す。

| 教訓の種類 | 戻し先 |
| --- | --- |
| 進め方・確かめ方（見直す工程、検証の項目） | Skill `implement-ui` |
| どのアプリでも同じになる見せ方の判断 | `docs/design/rules.md`・`principles.md`・ガイドライン |
| このアプリ固有のこと | `docs/design/apps/ct-schedule.md`・要件ファイル |

PR には、根拠（タスク id、タグ、採用ラベル、`codex_session.jsonl` の該当箇所）と、基底 vs 採用の採点差を書く。戻したあと、起点を新しいコミットにしてもう一度回し、基底の点が上がったかを見る。
