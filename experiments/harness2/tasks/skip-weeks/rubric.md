# 採点基準（CT のお休み週）

要件ファイル `screens/skip-weeks.md` と `docs/design/` のルールから、デザイナーの意図を項目にした。各項目は pass / fail。見た目の項目はスクリーンショットで判定する。

1. 画面の Story が `src/design-system/drafts/` にあり、`title` が `Drafts/CTスケジュール/` の下。`Default` はログイン中で、数件（3〜6件）登録がある
2. 骨組みが `PageLayout` > `PageHeader`（パンくず → h1「CT のお休み週」、右端に「お休み週を追加」）> `PageSection`。`<main>` の余白・最大幅を画面で書いていない
3. 「お休み週を追加」は主要アクション（`Button` の default）で画面に1つだけ。削除は行ごとの控えめなボタン（ghost / outline のアイコンなど）で、`destructive` の色は確認ダイアログの実行ボタンだけに使っている
4. 削除は確認ダイアログを経由し、`DialogContent size="confirm"`、本文に対象の週の日付が入り、「キャンセル」と `variant="destructive"` の「削除」がある。確認ダイアログが開いた状態の Story（play 関数か open の状態）がある
5. 追加は入力ダイアログ（`DialogContent` 既定の幅）で、週は `Select`（自由入力ではない）、理由は `Label` + `Input`。理由が空のエラーが入力欄のそばに出る状態の Story がある
6. 一覧の行は、週・理由・登録した人の位置が行をまたいでそろっている。行は枠線か区切り線で区切り、影を付けていない
7. 0件の状態の Story があり、「登録されているお休み週はありません」と追加の導線がある。空の状態が destructive / warning のような「問題」に見える色になっていない
8. 未ログインの Story があり、追加・削除の操作が出ず、ログインすると設定できることが伝わる
9. 理由が40文字の行で、レイアウトが崩れない（375px でもはみ出さない）
10. 色・余白・文字は rules.md の範囲（パレット色・任意値・`shadow-*`・`tracking-tight`・見出しの `leading-none` が無い）。lint の design-system/* に違反が無い
11. 同じ情報を二重に出していない。要件に無い要素（説明文、件数表示など）を足していない、または足した理由が要件から説明できる
12. 画面の中だけの独自カード・独自ラベルを作っていない。足りない部品があれば、部品と Story を `src/app/components/` に先に作っている
