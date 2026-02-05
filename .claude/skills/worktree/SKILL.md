---
name: worktree-manager
description: git worktree を wtp コマンドで対話的に操作する。worktree の作成、削除、移動、一覧表示に対応。「worktree 作りたい」「ブランチ切り替えたい」「worktree 消したい」などの操作をサポート。
---

# wtp - Git Worktree Manager

wtp コマンドを使って git worktree を対話的に操作するスキル。

## 基本ワークフロー

1. `wtp list` で現在の worktree 一覧を取得
2. AskUserQuestion で操作を選択（作成/削除/移動）
3. 選択に応じてコマンドを実行

## wtp list の出力形式

```
PATH BRANCH                    STATUS  HEAD
---- ------                    ------  ----
@*   parent/TSUK-16202-message managed 75a8b18c
     feature/auth              managed abc1234d
     fix/bug-123               managed def5678e
```

- `@*`: メイン worktree（現在地）
- `@`: メイン worktree
- その他: 追加された worktree

## 操作別ワークフロー

### 作成 (add)

1. AskUserQuestion でブランチの種類を確認:
   - 新規ブランチを作成
   - 既存のリモートブランチから作成
2. ブランチ名を聞く
3. コマンド実行:

   ```bash
   # 新規ブランチ
   wtp add -b <branch-name>

   # 既存ブランチ
   wtp add <branch-name>
   ```

### 削除 (remove)

1. `wtp list` を実行して worktree 一覧を取得
2. 出力から BRANCH 列を抽出（`@*` のメインは除外）
3. AskUserQuestion で削除対象を選択肢として提示:
   ```
   例: feature/auth, fix/bug-123 などを選択肢に
   ```
4. AskUserQuestion でブランチも一緒に削除するか確認
5. コマンド実行:

   ```bash
   # worktree のみ削除
   wtp remove --force <branch-name>

   # worktree とブランチを削除
   wtp remove --force <branch-name> --with-branch
   ```

## コマンドリファレンス

| 操作          | コマンド                            | 説明                      |
| ------------- | ----------------------------------- | ------------------------- |
| 一覧          | `wtp list`                          | 全 worktree を表示        |
| 作成(新規)    | `wtp add -b <branch>`               | 新規ブランチで作成        |
| 作成(既存)    | `wtp add <branch>`                  | 既存ブランチで作成        |
| 削除          | `wtp remove <branch>`               | worktree を削除           |
| 削除+ブランチ | `wtp remove <branch> --with-branch` | worktree とブランチを削除 |