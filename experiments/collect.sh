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

# 再現の場合は正解との差分も残す (正解は pages/、生成物は Skill の手順どおり drafts/ にある)
if [ "$kind" = reproduce ]; then
  for name in CTSchedulePage MemberPage; do
    f="src/design-system/drafts/$name.stories.tsx"
    if [ -f "$f" ]; then
      diff -u "$repo/src/design-system/pages/$name.stories.tsx" "$f" >> "$out/answer.diff" || true
    else
      echo "### 生成されていない: $f" >> "$out/answer.diff"
    fi
  done
fi

# 生成された画面を、このリポジトリの Storybook で正解 (Apps/CTスケジュール/Pages/) と並べて見られるようにする。
# src/design-system/drafts/experiments/ は git 管理外 (記録は上の files/ と generated.patch に残る)
if [ -d src/design-system/drafts ]; then
  view="$repo/src/design-system/drafts/experiments/$kind-$run"
  rm -rf "$view" && mkdir -p "$view"
  find src/design-system/drafts -type f ! -name README.md -exec cp {} "$view/" \;
  # title と画面間リンクに回の名前を足して、正解や他の回と Story の ID がぶつからないようにする
  for f in "$view"/*.tsx; do
    [ -f "$f" ] || continue
    sed -i.bak -e "s|title: \"Drafts/|title: \"Drafts/$kind-$run/|" -e "s|/story/drafts-|/story/drafts-$kind-$run-|g" "$f" && rm "$f.bak"
  done
  echo "Storybook の「Drafts/$kind-$run」で見られます: $view"
  others=$(git diff --cached --name-only --diff-filter=A HEAD | grep -v '^src/design-system/drafts/' | grep -E '\.(tsx?|css)$' || true)
  [ -n "$others" ] && printf '注意: drafts/ の外にも新しいファイルがあります。Storybook で読み込めない Story があれば、これらを手で持ってきてください:\n%s\n' "$others"
fi

[ -f "$out/notes.md" ] || cp "$repo/experiments/results/_template.md" "$out/notes.md"

# 評価シート・推測リスト・戻し先の候補・行動ログを1枚の HTML にする (このサンドボックスで行われた全セッション分)
# notes.md を書き直したら、もう一度このスクリプトを実行すれば HTML に反映される
bun "$repo/.claude/skills/implement-ui/report.ts" --root "$src" --all-sessions --notes "$out/notes.md" --out "$out/report.html"
[ -f .implement-ui/report.json ] && cp .implement-ui/report.json "$out/report.json"
echo "集めました: $out"
