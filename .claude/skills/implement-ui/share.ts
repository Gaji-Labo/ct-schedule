/**
 * implement-ui のレポートを共有リポジトリに送る。
 *
 *   bun run report:share --dry-run   # 何を送るかだけ表示する (push しない)
 *   bun run report:share             # 送る
 *
 * 送るもの (reports/<日時>_<アプリ名>_<実行した人>/ に置く)
 * - report.json: AI が書いた自己申告 (推測と戻し先)。ためたものを戻すときはこれを読む
 * - report.html: report.json から作る見る用の HTML。行動ログと触ったファイルは載せない
 *   (行動ログにはツールの入力と結果がそのまま入り、.env を読めば秘密も載るため)
 * - meta.json: いつ・誰が・どのリポジトリのどのコミット (= どの版のルール) で作ったか
 *
 * 共有リポジトリは手元に clone して使い回す (既定: ~/.cache/implement-ui-reports)。
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, relative } from "node:path";

// 名前を変えたらここと Skill implement-ui の「共有リポジトリに送る」を直す
const REPO = process.env.IMPLEMENT_UI_REPORTS_REPO ?? "Gaji-Labo/implement-ui-reports";
const CACHE = process.env.IMPLEMENT_UI_REPORTS_DIR ?? join(homedir(), ".cache/implement-ui-reports");

const dryRun = process.argv.includes("--dry-run");
const root = realpathSync(process.cwd());
const reportJson = join(root, ".implement-ui/report.json");

function run(cmd: string, args: string[], cwd = root, allowFail = false): string {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8" });
  if (r.status !== 0 && !allowFail) {
    console.error(`失敗: ${cmd} ${args.join(" ")}\n${r.stderr || r.stdout}`);
    process.exit(1);
  }
  return r.status === 0 ? r.stdout.trim() : "";
}

if (!existsSync(reportJson)) {
  console.error(".implement-ui/report.json がありません。先に Skill の手順どおり report.json を書いてください。");
  process.exit(1);
}
const self = JSON.parse(readFileSync(reportJson, "utf8"));
const guesses: { scope?: string }[] = self.guesses ?? [];

// ---------- meta ----------
const login = run("gh", ["api", "user", "-q", ".login"], root, true) || run("git", ["config", "user.name"], root, true) || "unknown";
const sourceRepo = run("git", ["remote", "get-url", "origin"], root, true).replace(/^https:\/\/github\.com\/|^git@github\.com:|\.git$/g, "");
const branch = run("git", ["branch", "--show-current"], root, true);
const commit = run("git", ["rev-parse", "HEAD"], root, true);
const dirty = run("git", ["status", "--porcelain"], root, true) !== "";

// 最新のセッション記録から、生成に使ったモデルを拾う
function latestModel(): string | undefined {
  const dir = join(homedir(), ".claude/projects", root.replace(/[^a-zA-Z0-9]/g, "-"));
  if (!existsSync(dir)) return;
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".jsonl"))
    .map((f) => join(dir, f))
    .sort((a, b) => statSync(a).mtimeMs - statSync(b).mtimeMs);
  const last = files.at(-1);
  if (!last) return;
  let model: string | undefined;
  for (const line of readFileSync(last, "utf8").split("\n")) {
    const m = line.match(/"model":"([^"]+)"/);
    if (m && m[1] !== "<synthetic>") model = m[1];
  }
  return model;
}

const now = new Date();
const pad = (n: number) => String(n).padStart(2, "0");
const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
const safe = (s: string) => s.replace(/[\s/\\:*?"<>|]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
const dirName = `${stamp}_${safe(self.app ?? "app未記入")}_${safe(login)}`;
const meta = {
  created_at: now.toISOString(),
  author: login,
  app: self.app ?? null,
  request: self.request ?? null,
  source: { repo: sourceRepo, branch, commit, uncommitted_changes: dirty },
  model: latestModel() ?? null,
  guesses: {
    total: guesses.length,
    app: guesses.filter((g) => g.scope === "app").length,
    system: guesses.filter((g) => g.scope === "system").length,
  },
};

console.log(`送り先: https://github.com/${REPO}/tree/main/reports/${dirName}`);
console.log(`依頼: ${meta.request ?? "(なし)"}`);
console.log(`アプリ: ${meta.app ?? "(未記入)"} / 作成: ${login} / ${sourceRepo} ${branch} ${commit.slice(0, 7)}${dirty ? " (未コミットの変更あり)" : ""}`);
console.log(`推測 ${meta.guesses.total} 件 (app ${meta.guesses.app} / system ${meta.guesses.system})`);
console.log("送るファイル: report.json / report.html (行動ログなし) / meta.json");
if (dryRun) {
  console.log("\n--dry-run なので送っていません。");
  process.exit(0);
}

// ---------- 共有リポジトリを用意 ----------
if (!existsSync(join(CACHE, ".git"))) {
  mkdirSync(CACHE, { recursive: true });
  run("gh", ["repo", "clone", REPO, CACHE]);
}
run("git", ["pull", "--rebase", "--quiet"], CACHE, true);

const dest = join(CACHE, "reports", dirName);
mkdirSync(dest, { recursive: true });
copyFileSync(reportJson, join(dest, "report.json"));
writeFileSync(join(dest, "meta.json"), JSON.stringify(meta, null, 2) + "\n");
run("bun", [join(root, ".claude/skills/implement-ui/report.ts"), "--no-log", "--out", join(dest, "report.html")]);

// ---------- commit と push ----------
run("git", ["add", relative(CACHE, dest)], CACHE);
const title = `${meta.app ?? "app未記入"}: ${(meta.request ?? "").split("\n")[0].slice(0, 60)}`;
run("git", ["commit", "--quiet", "-m", title], CACHE);
// ほかの人と同時に push したときは取り込んでからやり直す
for (let i = 0; i < 3; i++) {
  if (spawnSync("git", ["push", "--quiet"], { cwd: CACHE }).status === 0) {
    console.log(`\n送りました: https://github.com/${REPO}/tree/main/reports/${dirName}`);
    process.exit(0);
  }
  run("git", ["pull", "--rebase", "--quiet"], CACHE);
}
console.error(`push できませんでした。${CACHE} で git push を確かめてください。`);
process.exit(1);
