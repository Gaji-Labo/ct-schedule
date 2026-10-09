/implement-ui 次の2画面の Story を作ってください。アプリ本体 (src/app の page.tsx) は作らなくてよいです。

- `src/design-system/pages/CTSchedulePage.stories.tsx` — CT組み合わせ表 (`/`)
  - ページタイトル、Slack ログインボタン
  - 参加メンバーの人数。押すとメンバー一覧へ移動する
  - 週ごとの CT 組み合わせカードを横に並べて見せる
- `src/design-system/pages/MemberPage.stories.tsx` — メンバー一覧 (`/member`)
  - CT組み合わせ表へ戻れる
  - ページタイトル、Slack ログインボタン（ログイン中は出さない）
  - メンバーごとにアバター・名前・参加状態
  - ログイン中だけ、各メンバーを削除できる

git の履歴と、このディレクトリの外のファイルは見ないでください。
