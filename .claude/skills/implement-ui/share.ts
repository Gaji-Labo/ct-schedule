/**
 * implement-ui のレポートを共有リポジトリに送る。
 *
 *   bun run report:share --dry-run            # 何を送るかだけ表示する (push しない)
 *   bun run report:share                      # レポートを送る (Skill implement-ui の 6)
 *   bun run report:share --review --dry-run   # 人の確認の結果 (review.json) を、何を送るかだけ表示する
 *   bun run report:share --review             # review.json を、最後に送ったレポートのフォルダに足す (Skill reflect-decisions)
 *   bun run report:pull                       # 共有リポジトリを手元に取ってきて最新にする (= share.ts --pull。ためたレポートを読む前に)
 *
 * 送るもの (reports/<日時>_<アプリ名>_<実行した人>/ に置く)
 * - report.json: AI が書いた自己申告 (推測と戻し先)。ためたものを戻すときはこれを読む
 * - report.html: report.json から作る見る用の HTML。行動ログと触ったファイルは載せない
 *   (行動ログにはツールの入力と結果がそのまま入り、.env を読めば秘密も載るため)
 * - meta.json: いつ・誰が・どのリポジトリのどのコミット (= どの版のルール)・どのモデルで作ったか、変えたファイル。
 *   report.json から数えられるもの (推測の件数など) は持たない
 * - review.json: 人が確認したあとの、推測ごとの判定と、AI が挙げずに人が指摘したこと (形は share-lib.ts の Review)
 *
 * 最後に送ったフォルダは .implement-ui/shared.json に控え、review.json はそこに足す。
 *
 * 共有リポジトリは、このリポジトリ直下の implement-ui-reports/ (git 管理外) に clone して使う。
 * まだなければ clone し、あれば main を最新にしてから書き込んで、main に直接 push する。
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, relative } from "node:path";
import { countGuesses, countVerdicts, validateReview, type Review } from "./share-lib";

// 名前を変えたらここと .gitignore、Skill implement-ui の「共有リポジトリに送る」を直す
const REPO = "Gaji-Labo/implement-ui-reports";
const CLONE_DIR = "implement-ui-reports";

const dryRun = process.argv.includes("--dry-run");
const reviewMode = process.argv.includes("--review");
const pullMode = process.argv.includes("--pull");
const root = realpathSync(process.cwd());
const localDir = join(root, ".implement-ui");
const reportJson = join(localDir, "report.json");
const reviewJson = join(localDir, "review.json");
const sharedJson = join(localDir, "shared.json");
const reportsRepo = join(root, CLONE_DIR);
const treeUrl = (dir: string) => `https://github.com/${REPO}/tree/main/reports/${dir}`;

function run(cmd: string, args: string[], cwd = root, allowFail = false): string {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8" });
  if (r.status !== 0 && !allowFail) {
    console.error(`失敗: ${cmd} ${args.join(" ")}\n${r.stderr || r.stdout}`);
    process.exit(1);
  }
  return r.status === 0 ? r.stdout.trim() : "";
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const sha256 = (file: string) => createHash("sha256").update(readFileSync(file)).digest("hex");

/** 共有リポジトリを clone する。あれば main に乗せて最新にする */
function prepareRepo() {
  const gitPath = join(reportsRepo, ".git");
  if (!existsSync(gitPath)) {
    run("git", ["clone", "--quiet", `https://github.com/${REPO}.git`, CLONE_DIR]);
    return;
  }
  run("git", ["checkout", "--quiet", "main"], reportsRepo);
  run("git", ["pull", "--rebase", "--quiet", "origin", "main"], reportsRepo);
}

/** dest の中を commit して main に push する。ほかの人と同時に push したときは取り込んでからやり直す */
function commitAndPush(dest: string, title: string) {
  run("git", ["add", relative(reportsRepo, dest)], reportsRepo);
  run("git", ["commit", "--quiet", "-m", title], reportsRepo);
  for (let i = 0; i < 3; i++) {
    if (spawnSync("git", ["push", "--quiet", "origin", "main"], { cwd: reportsRepo }).status === 0) return;
    run("git", ["pull", "--rebase", "--quiet", "origin", "main"], reportsRepo);
  }
  fail(`push できませんでした。${CLONE_DIR}/ で git push origin main を確かめてください (コミットは手元に残っています)。`);
}

if (pullMode) {
  prepareRepo();
  console.log(`${CLONE_DIR}/ を最新にしました (${run("git", ["log", "-1", "--format=%h %s"], reportsRepo)})`);
  process.exit(0);
}

if (!existsSync(reportJson)) fail(".implement-ui/report.json がありません。先に Skill の手順どおり report.json を書いてください。");
const self = JSON.parse(readFileSync(reportJson, "utf8"));
const guesses: { scope?: string }[] = self.guesses ?? [];

if (reviewMode) shareReview();
else shareReport();

// ---------- レポートを送る ----------
function shareReport() {
  const login = run("gh", ["api", "user", "-q", ".login"], root, true) || run("git", ["config", "user.name"], root, true) || "unknown";
  const sourceRepo = run("git", ["remote", "get-url", "origin"], root, true).replace(/^https:\/\/github\.com\/|^git@github\.com:|\.git$/g, "");
  const branch = run("git", ["branch", "--show-current"], root, true);
  const commit = run("git", ["rev-parse", "HEAD"], root, true);
  // 変えたファイル (未コミット・新規)。Skill の手順では draft の Story はコミットしないので、ここで何を作ったかを残す
  // run() は前後の空白を削り、1行目の先頭 (" M" の空白) が欠けるので、ここでは使わない
  const changedFiles = (spawnSync("git", ["status", "--porcelain", "--untracked-files=all"], { cwd: root, encoding: "utf8" }).stdout ?? "")
    .split("\n")
    .filter(Boolean)
    .map((l) => ({ status: l.slice(0, 2).trim(), path: l.slice(3).replace(/^"|"$/g, "") }));
  const dirty = changedFiles.length > 0;

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  const safe = (s: string) => s.replace(/[\s/\\:*?"<>|]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
  const suffix = `${safe(self.app ?? "app未記入")}_${safe(login)}`;
  const dirName = `${stamp}_${suffix}`;
  const meta = {
    created_at: now.toISOString(),
    author: login,
    app: self.app ?? null,
    request: self.request ?? null,
    source: { repo: sourceRepo, branch, commit, uncommitted_changes: dirty },
    changed_files: changedFiles,
    model: latestModel() ?? null,
  };
  const counts = countGuesses(guesses);

  // フォルダ名の日時は送った時点で決まるので、dry-run では伏せる
  console.log(dryRun ? `送り先: ${REPO} の reports/<送った日時>_${suffix}/` : `送り先: ${treeUrl(dirName)}`);
  console.log(`依頼: ${meta.request ?? "(なし)"}`);
  console.log(`アプリ: ${meta.app ?? "(未記入)"} / 作成: ${login} / ${sourceRepo} ${branch} ${commit.slice(0, 7)}${dirty ? " (未コミットの変更あり)" : ""}`);
  console.log(`推測 ${counts.total} 件 (app ${counts.app} / system ${counts.system})`);
  console.log(`変えたファイル: ${changedFiles.length ? changedFiles.map((f) => f.path).join(", ") : "なし"}`);
  console.log("送るファイル: report.json / report.html (行動ログなし) / meta.json");
  if (dryRun) {
    console.log("\n--dry-run なので送っていません。");
    process.exit(0);
  }

  prepareRepo();
  const dest = join(reportsRepo, "reports", dirName);
  mkdirSync(dest, { recursive: true });
  copyFileSync(reportJson, join(dest, "report.json"));
  writeFileSync(join(dest, "meta.json"), JSON.stringify(meta, null, 2) + "\n");
  run("bun", [join(root, ".claude/skills/implement-ui/report.ts"), "--no-log", "--out", join(dest, "report.html")]);
  commitAndPush(dest, `${meta.app ?? "app未記入"}: ${(meta.request ?? "").split("\n")[0].slice(0, 60)}`);

  // review.json をあとで同じフォルダに足すために控える。report.json のハッシュで、送ったあとに書き換わっていないかを見る
  writeFileSync(sharedJson, JSON.stringify({ dir: dirName, report_sha256: sha256(reportJson) }, null, 2) + "\n");
  console.log(`\n送りました: ${treeUrl(dirName)}`);
}

// ---------- 人の確認の結果 (review.json) を送る ----------
function shareReview() {
  if (!existsSync(reviewJson)) fail(".implement-ui/review.json がありません。先に Skill reflect-decisions の手順どおり review.json を書いてください。");
  if (!existsSync(sharedJson)) fail("レポートをまだ送っていません (.implement-ui/shared.json がありません)。先に bun run report:share でレポートを送ってください。");
  const shared: { dir: string; report_sha256: string } = JSON.parse(readFileSync(sharedJson, "utf8"));
  if (shared.report_sha256 !== sha256(reportJson)) {
    fail("report.json が、送ったあとに書き換わっています。review.json の index がずれるので、先に bun run report:share で送り直してください。");
  }
  const review: unknown = JSON.parse(readFileSync(reviewJson, "utf8"));
  const errors = validateReview(review, guesses.length);
  if (errors.length) fail(`review.json の形が正しくありません:\n- ${errors.join("\n- ")}`);
  const counts = countVerdicts(review as Review);

  console.log(`送り先: ${treeUrl(shared.dir)}/review.json`);
  console.log(`推測 ${guesses.length} 件: そのまま採る ${counts.accepted} / 直して採る ${counts.corrected} / 保留 ${counts.held}`);
  console.log(`AI が挙げずに人が指摘したこと: ${counts.missed} 件`);
  if (dryRun) {
    console.log("\n--dry-run なので送っていません。");
    process.exit(0);
  }

  prepareRepo();
  const dest = join(reportsRepo, "reports", shared.dir);
  if (!existsSync(join(dest, "report.json"))) fail(`共有リポジトリに reports/${shared.dir} がありません。レポートを送り直してください。`);
  copyFileSync(reviewJson, join(dest, "review.json"));
  if (run("git", ["status", "--porcelain", relative(reportsRepo, dest)], reportsRepo) === "") {
    console.log("\n送った review.json と同じ内容なので、送りませんでした。");
    return;
  }
  commitAndPush(dest, `review: ${shared.dir}`);
  console.log(`\n送りました: ${treeUrl(shared.dir)}/review.json`);
}

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
