# reproduce-01

- 日付: 2026-10-09
- モデル / 実行方法: Claude Code 2.1.288（Opus 5.5、effort medium、auto mode）。ターミナルで対話
- プロンプト: `experiments/prompts/reproduce.md`（変更なし）
- 途中で人が口を出したか: なし（ブラウザ操作の許可は出していない）

## 結果

| 観点 | 評価 | メモ |
| --- | --- | --- |
| 部品の選び方 | ○ | SiteHeader・CTScheduleCarousel・MemberListItem・Breadcrumb・Separator・Dialog など、正解と同じ部品を選んだ。独自 UI はなし |
| ページの骨組み | △ | 見出し行（`flex items-center justify-between gap-10` + `text-2xl font-bold`）とメンバー一覧の構成は正解とほぼ同じ。ただし `main` を `grid gap-8` にし、その中にカルーセルを直接置いたため、**CT組み合わせ表でページ全体が横に 4389px まではみ出す**（正解は `main` を grid にせず、カルーセルを `div` で包んでいる） |
| 色・余白・文字 | ○ | トークンとタイポグラフィの表どおり。任意値 `sm:max-w-[425px]` を `sm:max-w-md` に自分で置き換えた |
| `bun run verify:ui` | ○ | 新規ファイルの lint 警告は0件。test・Storybook ビルドも通過 |
| 用意した状態 | ○ | 正解（CT 4状態、メンバー 3状態）より多い。空・読み込み中・エラー・長い名前・全員不参加まで用意した |
| 振る舞いの原則 | ○ | 削除は確認ダイアログを挟み、完了を toast で知らせる。組み合わせが作れないときは Alert で理由を出す |
| 最初に目に入るべき情報 | △ | 人数リンクを小さく控えめにした判断はよい。横にはみ出す不具合のため、今週のカードが最初に見えない |
| 正解との違い | | 人数の文言（正解「現在のメンバー：N人」、生成「参加メンバー N人」＋アイコン）、`main` の間隔（正解 gap-10 / mt-10、生成 gap-8）、Default の状態（メンバー一覧の正解はログイン中、生成は未ログイン）。代用品を `PageStandIns.tsx` に切り出して2画面で共有した（正解は各 Story 内） |

## 行動ログで確かめたこと

- 外へのアクセスは0件
- 隠してある `src/app/page.tsx` と `src/app/member/page.tsx` を読みに行った（消してあったので読めていない）。正解を隠したのは必要だった
- 「ネットワーク」の1件は、作った Storybook を `localhost` で確かめようとしたもの。権限で止まった

## AI が迷った・書かれていなかったと報告したこと（抜粋。全15件は report.html）

- ページ本体（`main`）の標準の余白とセクション間隔
- 画面ごとの空状態・エラー状態の文言と部品
- 画面 Story の Default をどの状態にするか
- 複数の画面 Story で共有する代用品の置き場所
- 外部ブランドロゴ（Slack）の色を禁止事項の例外とするか

## 戻し先

`docs/design/workflow.md`「フィードバックの戻し先」の分け方で整理した。この回の report.json には `scope` がまだ無いため、評価時に人が分けている。番号は report.html の推測の番号。

### プロダクト固有の検討材料（`app`）

プロダクトの持ち主に確かめ、`docs/design/apps/ct-schedule.md` やその部品・Story に戻す。

| 起きたこと | 直す場所 | 直したか |
| --- | --- | --- |
| 参加人数の文言・位置・数える対象が決まっていない（#4、CT組み合わせ表） | `docs/design/apps/ct-schedule.md` に、文言と「参加しているメンバーだけ数えるか」を書く | 未 |
| 組み合わせを作れないとき（参加2人未満）の文言がない（#6、CT組み合わせ表） | `docs/design/apps/ct-schedule.md` に空状態の文言を書く | 未 |
| メンバー0人のときの文言がない（#7、メンバー一覧） | `docs/design/apps/ct-schedule.md` に空状態の文言を書く | 未 |
| メンバーの並び順が決まっていない（#15、メンバー一覧） | `docs/design/apps/ct-schedule.md` に並び順（参加している人が先か、ID 順か）を書く | 未 |
| ログイン中に右上へ何を出すかが書かれていない（#3、共通ヘッダー） | `docs/design/apps/ct-schedule.md` か `Header` の Story の docs に書く | 未 |
| Slack ログインボタンの Semantic トークン版の見た目がない（#1） | `SigninWithSlackButton` を Semantic トークンで直し、既知の違反から外す | 未 |
| ユーザーメニューのボタンに読み上げ用ラベルがない（#13） | `UserDropdown` のトリガーに `aria-label` を付ける | 未 |

### デザインシステムに貯めるもの（`system`）

`docs/design/rules.md`・ガイドライン・共通部品・Skill `implement-ui` に戻す。

| 起きたこと | 直す場所 | 直したか |
| --- | --- | --- |
| grid の中にカルーセルを置いて横にはみ出した | Carousel のガイドライン（`src/design-system/guidelines/`）に NG 例を追加。ページの骨組みを部品（例: `PageLayout`）にする案も検討 | 未 |
| `main` の余白・間隔が画面ごとに推測になる（#5） | `docs/design/rules.md`「余白・サイズ」にページの骨組みの値を書く（ブレイクポイント、余白、用途別の最大幅、縦の間隔） | 未 |
| 空・エラー状態の**型**がない（#6〜#8。文言は上の `app` に分けた） | `docs/design/rules.md` か Alert のガイドラインに、ページ単位の空・エラー状態の型を書く | 未 |
| 確認ダイアログの標準の幅が決まっていない（#12） | Dialog のガイドラインに標準の幅を書く | 未 |
| 外部ブランドのロゴの色を禁止事項の例外とするか決まっていない（#2） | `docs/design/rules.md`「禁止事項」に例外として書くか決める | 未 |
| 目で見る確認をしないまま「通過」とした | Skill `implement-ui` の検証で、ブラウザで見られないときは横スクロールの有無を JS や Story のテストで確かめる手順を足す | 済（「5. 検証する」に横はみ出しの確認と、確かめられないときは unchecked にするルールを追加） |
| Default の状態が決まっていない（#10） | Skill `implement-ui` の「画面の Story」に書く | 済（「Default にする状態」を追加） |
| 複数の画面 Story で共有する代用品の置き場所が決まっていない（#14） | Skill `implement-ui` の「画面の Story」に書く | 済（原則 Story 内、2画面以上で使うときは `src/design-system/mocks/`） |
