#!/usr/bin/env bash
# サンドボックスで生成されたものを experiments/results/<種類>-<連番>/ に集める。
#
#   experiments/collect.sh reproduce 01
set -euo pipefail

kind="${1:?種類を指定してください: reproduce | add-page}"
run="${2:?連番を指定してください: 例 01}"
repo="$(cd "$(dirname "$0")/.." && pwd)"
src="${CT_EXPERIMENTS_DIR:-$HOME/ct-schedule-experiments}/$kind-$run"
out="$repo/experiments/results/$kind-$run"
mkdir -p "$out/files"

cd "$src"
git add -A
# 初期状態からの差分 (生成されたもの全部)
git diff --cached --binary HEAD > "$out/generated.patch"
git diff --cached --name-only --diff-filter=AM HEAD | while read -r f; do
  mkdir -p "$out/files/$(dirname "$f")"
  cp "$f" "$out/files/$f"
done

# 再現の場合は正解との差分も残す
if [ "$kind" = reproduce ]; then
  for f in src/design-system/pages/CTSchedulePage.stories.tsx src/design-system/pages/MemberPage.stories.tsx; do
    if [ -f "$f" ]; then
      diff -u "$repo/$f" "$f" >> "$out/answer.diff" || true
    else
      echo "### 生成されていない: $f" >> "$out/answer.diff"
    fi
  done
fi

# 推測リストと行動ログの HTML (このサンドボックスで行われた全セッション分を作り直す)
bun .claude/skills/implement-ui/report.ts --all-sessions --out "$out/report.html"
[ -f .implement-ui/report.json ] && cp .implement-ui/report.json "$out/report.json"

[ -f "$out/notes.md" ] || cp "$repo/experiments/results/_template.md" "$out/notes.md"
echo "集めました: $out"
