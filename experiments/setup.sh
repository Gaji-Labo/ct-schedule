#!/usr/bin/env bash
# 生成検証用のサンドボックスを作る。
#
#   experiments/setup.sh reproduce 01   # 既存2画面の再現（正解のページを隠す）
#   experiments/setup.sh add-page 01    # 新しい画面の追加（何も隠さない）
#
# 作業ツリーの「今の状態」(未コミットの変更も含む) を ~/ct-schedule-experiments/<種類>-<連番> に
# コピーし、git の履歴を持たない新しいリポジトリにする。履歴や他ブランチから正解を読めないようにするため。
set -euo pipefail

kind="${1:?種類を指定してください: reproduce | add-page}"
run="${2:?連番を指定してください: 例 01}"
case "$kind" in reproduce | add-page) ;; *) echo "種類は reproduce か add-page です" >&2; exit 1 ;; esac

repo="$(cd "$(dirname "$0")/.." && pwd)"
base="${CT_EXPERIMENTS_DIR:-$HOME/ct-schedule-experiments}"
dest="$base/$kind-$run"
[ -e "$dest" ] && { echo "すでにあります: $dest" >&2; exit 1; }
mkdir -p "$dest"

# 検証の材料 (experiments/) とビルド成果物・秘密情報は持ち込まない
rsync -a \
  --exclude .git --exclude node_modules --exclude storybook-static --exclude .next \
  --exclude '.env*' --exclude .vercel --exclude experiments \
  "$repo/" "$dest/"

if [ "$kind" = reproduce ]; then
  # 正解: Story の2画面。アプリ本体のページも同じ組み立てなので一緒に隠す
  rm "$dest/src/design-system/pages/CTSchedulePage.stories.tsx" \
     "$dest/src/design-system/pages/MemberPage.stories.tsx" \
     "$dest/src/app/page.tsx" \
     "$dest/src/app/member/page.tsx"
  rmdir "$dest/src/app/member"
fi

# 外を読ませないための設定。Read / Glob / Grep と、Bash の単純なファイル読み取り (cat など) を止める。
# Bash から python などで間接的に読むのは止められないので、行動ログ (report.html) でも確かめる
mkdir -p "$dest/.claude"
cat > "$dest/.claude/settings.local.json" <<JSON
{
  "permissions": {
    "deny": [
      "Read(/$repo/**)",
      "Read(~/.claude/projects/**)",
      "WebFetch",
      "WebSearch",
      "Bash(gh *)",
      "Bash(curl *)",
      "Bash(wget *)",
      "Bash(git clone *)",
      "Bash(git fetch *)"
    ]
  }
}
JSON

cd "$dest"
git init -q
git add -A
git -c user.name=experiment -c user.email=experiment@localhost commit -qm "実験の初期状態 ($kind-$run)"
bun install --silent

echo "サンドボックス: $dest"
echo "プロンプト:     $repo/experiments/prompts/$kind.md"
