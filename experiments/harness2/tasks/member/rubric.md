# 採点基準（メンバー一覧の再現）

正解（`src/design-system/pages/MemberPage.stories.tsx`）と要件ファイル `screens/member.md` から、満たすべき状態を項目にした。実装の書き方そのものは問わない。各項目は pass / fail。

1. 画面の Story が `src/design-system/drafts/` にあり、`title` が `Drafts/CTスケジュール/メンバー一覧`。`Default` はログイン中、参加20人・不参加15人程度
2. 骨組みが `PageLayout` > `PageHeader`（パンくず「CT組み合わせ表 › メンバー一覧」→ h1「メンバー一覧」）。パンくずのリンクは Storybook 内の CT組み合わせ表の Story へ `target="_top"` で移る
3. 「参加（○人）」「不参加（○人）」のまとまりは既存の `MemberGroup`（行は `MemberListItem`）を使っている。画面の中で行を組み直していない
4. 削除は行の右端の控えめなボタン（ghost のアイコンなど）から確認ダイアログを開く。ダイアログは `size="confirm"`、「メンバーを削除」「○○ を削除しますか？」「キャンセル」と `variant="destructive"` の「削除」
5. 未ログインの Story があり、削除ボタンが出ず、右上に Slack でログインするボタンがある。ログイン中は右上にログインボタンを出していない
6. 参加者0人・不参加0人の文言（「CTに参加しているメンバーはいません」「不参加のメンバーはいません」）が出る状態がある
7. 色・余白・文字は rules.md の範囲。lint の design-system/* に違反が無い。375px と 1280px で横にはみ出していない
8. 要件に無い要素（検索、件数の別表示、説明文など）を足していない
