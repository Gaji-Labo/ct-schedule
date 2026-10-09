/**
 * implement-ui の作業レポート (HTML) を作る。
 *
 *   bun run report:ui                  # 今のディレクトリの最新セッションだけ
 *   bun run report:ui --all-sessions   # このディレクトリで行われた全セッション (実験の回収用)
 *   bun run report:ui --out <path>     # 出力先 (既定: .implement-ui/report.html)
 *
 * 材料は2つ。
 * - 推測リストなどの自己申告: AI が Skill の最後に書く .implement-ui/report.json
 * - 行動ログ: Claude Code が自動で残すセッション記録 ~/.claude/projects/<cwd を変換した名前>/*.jsonl
 *   (AI の自己申告ではなく実際のツール呼び出しなので、外を読んでいないかの確認に使える)
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";

// ---------- 引数 ----------
const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const option = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const root = realpathSync(option("--root") ?? process.cwd());
const outPath = resolve(option("--out") ?? join(root, ".implement-ui/report.html"));
const reportJsonPath = join(root, ".implement-ui/report.json");
// 評価シート (人や別の AI が、正解との比較・目視の結果を書いた Markdown)。実験の回収時に渡す
const notesPath = option("--notes");
const HOME = homedir();

// ---------- 自己申告 (report.json) ----------
type Guess = {
  topic: string;
  decision: string;
  reason?: string;
  basis?: string;
  /** どこに・何が書いてあれば迷わなかったか (= 戻し先) */
  fix?: { where?: string; what?: string };
  /** 旧形式。fix.what として表示する */
  missing_rule?: string;
};
type SelfReport = {
  request?: string;
  context?: { who?: string; purpose?: string; first_seen?: string; irreversible?: string };
  components_used?: string[];
  new_components?: { name: string; reason?: string }[];
  stories?: { file?: string; name: string; state: string }[];
  verification?: { item: string; result: "pass" | "fail" | "unchecked"; note?: string }[];
  guesses?: Guess[];
};
const self: SelfReport | null = existsSync(reportJsonPath)
  ? JSON.parse(readFileSync(reportJsonPath, "utf8"))
  : null;

// ---------- 行動ログ (セッション記録) ----------
const projectDir = join(HOME, ".claude/projects", root.replace(/[^a-zA-Z0-9]/g, "-"));
const sessionFiles = existsSync(projectDir)
  ? readdirSync(projectDir)
      .filter((f) => f.endsWith(".jsonl"))
      .map((f) => join(projectDir, f))
      .sort((a, b) => statSync(a).mtimeMs - statSync(b).mtimeMs)
  : [];
const targetSessions = flag("--all-sessions") ? sessionFiles : sessionFiles.slice(-1);

type Flag = { level: "danger" | "warn"; label: string };
type Event = {
  time: string;
  agent: string; // "main" or サブエージェント名
  kind: "user" | "assistant" | "tool";
  tool?: string;
  summary: string;
  input?: string;
  output?: string;
  isError?: boolean;
  flags: Flag[];
  paths: string[]; // 読んだ・書いたパス (絶対パス)
  access?: "read" | "write";
};

const SYSTEM_PREFIXES = ["/dev/", "/usr/", "/bin/", "/sbin/", "/opt/", "/etc/", "/tmp/", "/private/tmp/", "/private/var/folders/", "/var/folders/", "/System/", "/Library/", join(HOME, ".local"), join(HOME, ".bun")];
const isInside = (p: string) => p === root || p.startsWith(root + "/");
const isOwnSession = (p: string) => p.startsWith(projectDir + "/");
const isSystem = (p: string) => isOwnSession(p) || SYSTEM_PREFIXES.some((s) => p === s.replace(/\/$/, "") || p.startsWith(s.endsWith("/") ? s : s + "/"));
const absolutize = (p: string, cwd: string) => {
  const expanded = p.replace(/^~(?=\/|$)/, HOME).replace(/^\$HOME(?=\/|$)/, HOME);
  const abs = isAbsolute(expanded) ? expanded : resolve(cwd || root, expanded);
  try {
    return realpathSync(abs);
  } catch {
    return abs;
  }
};

function flagPath(p: string, flags: Flag[]) {
  if (!isInside(p) && !isSystem(p)) flags.push({ level: "danger", label: `外: ${p}` });
}

function analyzeTool(name: string, input: Record<string, unknown>, cwd: string) {
  const flags: Flag[] = [];
  const paths: string[] = [];
  let access: Event["access"];
  let summary = "";
  const str = (k: string) => (typeof input[k] === "string" ? (input[k] as string) : undefined);

  const filePath = str("file_path") ?? str("notebook_path");
  if (filePath) {
    const p = absolutize(filePath, cwd);
    paths.push(p);
    flagPath(p, flags);
    access = ["Read"].includes(name) ? "read" : "write";
    summary = isInside(p) ? relative(root, p) || "." : p;
  }
  if (name === "Glob" || name === "Grep") {
    const p = absolutize(str("path") ?? ".", cwd);
    paths.push(p);
    flagPath(p, flags);
    access = "read";
    summary = `${str("pattern") ?? ""}  (${isInside(p) ? relative(root, p) || "." : p})`;
  }
  if (name === "Bash") {
    const cmd = str("command") ?? "";
    summary = str("description") ? `${str("description")} — ${cmd}` : cmd;
    // 絶対パス・~ ・../ で始まるトークンを拾って、外を指していないか見る
    // トークンの先頭 (行頭・空白・引用符・= の直後) にあるものだけを見る。src/app のような相対パスの途中の / は拾わない
    const tokens = cmd.match(/(?<=^|[\s'"=(])(?:(?:~|\$HOME)?\/[^\s'"`;|&<>()]+|(?:\.\.\/)+[^\s'"`;|&<>()]*|\.\.(?=[\s;&|)]|$))/gm) ?? [];
    for (const t of tokens) {
      if (/^\/\//.test(t) || /^\/(?:path|story|docs)\//.test(t)) continue; // URL 断片
      if (/^\/[^/]+$/.test(t) && !existsSync(t)) continue; // /implement-ui のようなコマンド名
      const p = absolutize(t, cwd);
      if (!isInside(p) && !isSystem(p)) flags.push({ level: "danger", label: `外: ${t}` });
    }
    if (/\bgit\s+(log|show|reflog|cat-file|checkout|switch|restore\s+--source|diff\s+\S*\.\.|blame|stash\s+show|remote|fetch|pull|clone)\b/.test(cmd))
      flags.push({ level: "warn", label: "git の履歴・他ブランチ" });
    if (/\b(curl|wget|gh)\b|github\.com/.test(cmd)) flags.push({ level: "warn", label: "ネットワーク" });
  }
  if (name === "WebFetch" || name === "WebSearch") {
    summary = str("url") ?? str("query") ?? "";
    flags.push({ level: "warn", label: "ネットワーク" });
  }
  if (name === "Skill") summary = `/${str("skill") ?? ""} ${str("args") ?? ""}`;
  if (name === "Agent" || name === "Task") summary = str("description") ?? "";
  if (!summary) summary = JSON.stringify(input).slice(0, 160);
  return { flags, paths, access, summary };
}

const textOf = (content: unknown): string => {
  if (typeof content === "string") return content;
  if (Array.isArray(content))
    return content
      .map((c) => (c?.type === "text" ? c.text : c?.type === "image" ? "[画像]" : c?.type === "tool_reference" ? `[${c.tool_name}]` : ""))
      .join("\n");
  return "";
};

function parseTranscript(file: string, agent: string): Event[] {
  const events: Event[] = [];
  const byId = new Map<string, Event>();
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (!line.trim()) continue;
    let r: any;
    try {
      r = JSON.parse(line);
    } catch {
      continue;
    }
    const content = r.message?.content;
    const time = r.timestamp ?? "";
    if (r.type === "assistant" && Array.isArray(content)) {
      for (const c of content) {
        if (c.type === "tool_use") {
          const a = analyzeTool(c.name, c.input ?? {}, r.cwd ?? root);
          const ev: Event = { time, agent, kind: "tool", tool: c.name, input: JSON.stringify(c.input, null, 2), ...a };
          byId.set(c.id, ev);
          events.push(ev);
        } else if (c.type === "text" && c.text?.trim()) {
          events.push({ time, agent, kind: "assistant", summary: c.text.trim(), flags: [], paths: [] });
        }
      }
    }
    if (r.type === "user") {
      if (Array.isArray(content) && content.some((c: any) => c.type === "tool_result")) {
        for (const c of content) {
          const ev = byId.get(c.tool_use_id);
          if (ev && c.type === "tool_result") {
            ev.output = textOf(c.content);
            ev.isError = !!c.is_error;
          }
        }
      } else if (!r.isMeta) {
        const text = textOf(content)
          .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "")
          .trim();
        if (text) events.push({ time, agent, kind: "user", summary: text, flags: [], paths: [] });
      }
    }
  }
  return events;
}

const events: Event[] = [];
for (const s of targetSessions) {
  events.push(...parseTranscript(s, "main"));
  const subDir = join(dirname(s), basename(s, ".jsonl"), "subagents");
  if (existsSync(subDir))
    for (const f of readdirSync(subDir).filter((f) => f.endsWith(".jsonl")))
      events.push(...parseTranscript(join(subDir, f), f.replace(/^agent-|\.jsonl$/g, "")));
}
events.sort((a, b) => a.time.localeCompare(b.time));

// ---------- 集計 ----------
const tools = events.filter((e) => e.kind === "tool");
const flagged = tools.filter((e) => e.flags.length);
const dangerCount = flagged.filter((e) => e.flags.some((f) => f.level === "danger")).length;
const fileMap = new Map<string, { read: number; write: number }>();
for (const e of tools)
  for (const p of e.paths) {
    const m = fileMap.get(p) ?? { read: 0, write: 0 };
    m[e.access === "write" ? "write" : "read"]++;
    fileMap.set(p, m);
  }
const files = [...fileMap.entries()].sort(([a], [b]) => Number(isInside(a)) - Number(isInside(b)) || a.localeCompare(b));

// ---------- HTML ----------
const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const clip = (s = "", n = 4000) => (s.length > n ? s.slice(0, n) + `\n… (${s.length - n} 文字省略)` : s);
const fmtTime = (t: string) => (t ? new Date(t).toLocaleTimeString("ja-JP", { hour12: false }) : "");
const rel = (p: string) => (isInside(p) ? relative(root, p) || "." : p);

/** インラインの Markdown (コード・太字・リンク) */
const inline = (t: string) =>
  esc(t)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

const guesses = self?.guesses ?? [];
const fixOf = (g: Guess) => ({ where: g.fix?.where, what: g.fix?.what ?? g.missing_rule });
const guessRows = guesses.length
  ? guesses
      .map(
        (g, i) => `<article class="card">
  <header><span class="num">${i + 1}</span><h3>${esc(g.topic)}</h3>${g.basis ? `<span class="chip">${esc(g.basis)}</span>` : ""}</header>
  <dl>
    <dt>決めたこと</dt><dd>${esc(g.decision)}</dd>
    ${g.reason ? `<dt>理由</dt><dd>${esc(g.reason)}</dd>` : ""}
  </dl>
  ${fixOf(g).where || fixOf(g).what ? `<div class="fix"><h4>戻し先 — これが書いてあれば迷わなかった</h4><dl>
    <dt>どこに</dt><dd>${fixOf(g).where ? inline(fixOf(g).where!) : '<span class="empty">未記入</span>'}</dd>
    <dt>何を</dt><dd>${fixOf(g).what ? inline(fixOf(g).what!) : '<span class="empty">未記入</span>'}</dd>
  </dl></div>` : '<p class="meta">戻し先なし（ルールを足さなくてよい推測）</p>'}
</article>`,
      )
      .join("\n")
  : `<p class="empty">${self ? "推測したことは報告されていません。" : "AI が <code>.implement-ui/report.json</code> を書いていません（Skill の手順 6 が実行されていない）。"}</p>`;

const verifyRows = (self?.verification ?? [])
  .map((v) => `<tr><td>${esc(v.item)}</td><td><span class="res res-${esc(v.result)}">${{ pass: "通過", fail: "失敗", unchecked: "未確認" }[v.result] ?? esc(v.result)}</span></td><td>${esc(v.note)}</td></tr>`)
  .join("");

/** 評価シート用の小さな Markdown 変換 (見出し・表・箇条書き・段落) */
function markdown(md: string): string {
  const out: string[] = [];
  const lines = md.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h = line.match(/^(#{1,4})\s+(.*)/);
    if (h) {
      const level = Math.min(h[1].length + 1, 4);
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
    } else if (/^\|/.test(line)) {
      const rows: string[][] = [];
      for (; i < lines.length && /^\|/.test(lines[i]); i++)
        if (!/^\|[\s:|-]+\|$/.test(lines[i])) rows.push(lines[i].replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
      i--;
      const [head, ...body] = rows;
      out.push(`<table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
    } else if (/^\s*- /.test(line)) {
      const items: string[] = [];
      for (; i < lines.length && /^\s*- /.test(lines[i]); i++) items.push(`<li>${inline(lines[i].replace(/^\s*- /, ""))}</li>`);
      i--;
      out.push(`<ul>${items.join("")}</ul>`);
    } else if (line.trim()) {
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  return out.join("\n");
}
const notesHtml = notesPath && existsSync(notesPath) ? markdown(readFileSync(notesPath, "utf8")) : "";

const summaryBlock = self
  ? `<div class="grid2">
  <section class="panel"><h3>決めた文脈</h3><dl>
    <dt>誰が・いつ</dt><dd>${esc(self.context?.who)}</dd>
    <dt>何のために</dt><dd>${esc(self.context?.purpose)}</dd>
    <dt>最初に目に入るもの</dt><dd>${esc(self.context?.first_seen)}</dd>
    <dt>取り消せない操作</dt><dd>${esc(self.context?.irreversible)}</dd></dl></section>
  <section class="panel"><h3>部品と Story</h3><dl>
    <dt>使った部品</dt><dd>${(self.components_used ?? []).map((c) => `<code>${esc(c)}</code>`).join(" ")}</dd>
    <dt>新しく作った部品・トークン</dt><dd>${(self.new_components ?? []).map((c) => `<code>${esc(c.name)}</code> ${esc(c.reason)}`).join("<br>") || "なし"}</dd>
    <dt>Story の状態</dt><dd><ul>${(self.stories ?? []).map((s) => `<li><code>${esc(s.name)}</code> ${esc(s.state)}</li>`).join("")}</ul></dd></dl></section>
</div>
${verifyRows ? `<section class="panel"><h3>検証</h3><table><thead><tr><th>項目</th><th>結果</th><th>メモ</th></tr></thead><tbody>${verifyRows}</tbody></table></section>` : ""}`
  : "";

const eventRows = events
  .map((e) => {
    const level = e.flags.some((f) => f.level === "danger") ? "danger" : e.flags.length ? "warn" : "";
    const cats = [e.kind, e.tool && ["Read", "Glob", "Grep"].includes(e.tool) ? "read" : "", e.access === "write" ? "write" : "", e.tool === "Bash" ? "bash" : "", level ? "flagged" : ""].join(" ");
    const who = e.kind === "user" ? "ユーザー" : e.kind === "assistant" ? "Claude" : e.tool;
    const flagsHtml = e.flags.map((f) => `<span class="flag flag-${f.level}">${esc(f.label)}</span>`).join("");
    const detail =
      e.kind === "tool"
        ? `<details><summary>${esc(e.summary.split("\n")[0].slice(0, 200))}</summary><div class="io"><h4>入力</h4><pre>${esc(clip(e.input, 3000))}</pre><h4>結果${e.isError ? "（エラー）" : ""}</h4><pre>${esc(clip(e.output ?? "", 4000))}</pre></div></details>`
        : `<div class="msg">${esc(clip(e.summary, 1500))}</div>`;
    return `<li class="ev ${cats} ${level}" data-cats="${cats}"><time>${esc(fmtTime(e.time))}</time><span class="who who-${e.kind}">${esc(who)}</span>${e.agent !== "main" ? `<span class="chip">sub:${esc(e.agent)}</span>` : ""}<div class="body">${flagsHtml}${detail}</div></li>`;
  })
  .join("\n");

const fileRows = files
  .map(([p, m]) => `<tr class="${isInside(p) ? "" : isSystem(p) ? "" : "out"}"><td><code>${esc(rel(p))}</code></td><td>${isInside(p) ? "内" : isSystem(p) ? "システム" : "<b>外</b>"}</td><td>${m.read || ""}</td><td>${m.write || ""}</td></tr>`)
  .join("");

const verdict =
  targetSessions.length === 0
    ? `<div class="verdict warn">セッション記録が見つかりません（<code>${esc(projectDir)}</code>）</div>`
    : dangerCount
      ? `<div class="verdict danger">作業ディレクトリの外へのアクセスが <b>${dangerCount} 件</b> あります。「行動ログ」の「要確認だけ」で確かめてください。</div>`
      : flagged.length
        ? `<div class="verdict warn">外へのアクセスはありません。履歴・ネットワークの利用が ${flagged.length} 件あるので中身を確認してください。</div>`
        : `<div class="verdict ok">作業ディレクトリの外へのアクセス、git 履歴・ネットワークの利用はありませんでした。</div>`;

const html = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>implement-ui レポート</title>
<style>
:root{--bg:#fafafa;--fg:#18181b;--muted:#71717a;--panel:#fff;--border:#e4e4e7;--code:#f4f4f5;--danger:#b91c1c;--danger-bg:#fef2f2;--warn:#a16207;--warn-bg:#fefce8;--ok:#15803d;--ok-bg:#f0fdf4;--accent:#2563eb}
@media (prefers-color-scheme:dark){:root{--bg:#09090b;--fg:#fafafa;--muted:#a1a1aa;--panel:#18181b;--border:#27272a;--code:#27272a;--danger:#fca5a5;--danger-bg:#450a0a;--warn:#fde047;--warn-bg:#422006;--ok:#86efac;--ok-bg:#052e16;--accent:#60a5fa}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.6 system-ui,-apple-system,"Hiragino Sans",sans-serif}
main{max-width:1100px;margin:0 auto;padding:24px 16px 64px}h1{font-size:22px;margin:0 0 4px}h2{font-size:17px;margin:32px 0 12px}h3{font-size:15px;margin:0}
.meta{color:var(--muted);font-size:12px}code{background:var(--code);padding:1px 5px;border-radius:4px;font-size:12px}
.verdict{padding:12px 16px;border-radius:8px;margin:16px 0;border:1px solid}.verdict.ok{background:var(--ok-bg);color:var(--ok)}.verdict.warn{background:var(--warn-bg);color:var(--warn)}.verdict.danger{background:var(--danger-bg);color:var(--danger)}
.stats{display:flex;gap:12px;flex-wrap:wrap}.stat{background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:8px 14px}.stat b{font-size:20px;display:block}
nav.tabs{display:flex;gap:4px;border-bottom:1px solid var(--border);margin-top:24px;position:sticky;top:0;background:var(--bg);z-index:1;overflow-x:auto}
nav.tabs button{border:0;background:none;color:var(--muted);padding:10px 14px;font:inherit;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap}nav.tabs button[aria-selected=true]{color:var(--fg);border-color:var(--accent);font-weight:600}
.tab{display:none}.tab.on{display:block}
.card,.panel{background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:14px 16px;margin-bottom:12px}
.card header{display:flex;align-items:center;gap:8px;margin-bottom:8px}.num{background:var(--accent);color:#fff;border-radius:999px;width:22px;height:22px;display:inline-grid;place-items:center;font-size:12px;flex:none}
dl{margin:0;display:grid;grid-template-columns:max-content 1fr;gap:4px 12px}dt{color:var(--muted);font-size:12px;padding-top:2px}dd{margin:0}dd ul{margin:0;padding-left:18px}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px}
.chip{font-size:11px;border:1px solid var(--border);border-radius:999px;padding:0 8px;color:var(--muted);white-space:nowrap}
table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--border);vertical-align:top}tr.out td{background:var(--danger-bg);color:var(--danger)}
.res{font-size:12px;border-radius:4px;padding:1px 6px}.res-pass{background:var(--ok-bg);color:var(--ok)}.res-fail{background:var(--danger-bg);color:var(--danger)}.res-unchecked{background:var(--warn-bg);color:var(--warn)}
.filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}.filters button{font:inherit;font-size:12px;border:1px solid var(--border);background:var(--panel);color:var(--fg);border-radius:999px;padding:3px 12px;cursor:pointer}.filters button[aria-pressed=true]{background:var(--fg);color:var(--bg)}
ol.log{list-style:none;padding:0;margin:0}.ev{display:grid;grid-template-columns:64px 88px 1fr;gap:8px;padding:6px 8px;border-bottom:1px solid var(--border);align-items:start}
.ev.danger{background:var(--danger-bg)}.ev.warn{background:var(--warn-bg)}.ev time{color:var(--muted);font-size:12px;font-variant-numeric:tabular-nums}
.who{font-size:12px;font-weight:600;overflow-wrap:anywhere}.who-user{color:var(--accent)}.who-assistant{color:var(--muted)}
.body{min-width:0}.msg{white-space:pre-wrap;font-size:13px;max-height:8em;overflow:auto}.ev.user .msg{font-weight:500}
details summary{cursor:pointer;overflow-wrap:anywhere;font-family:ui-monospace,monospace;font-size:12px}.io h4{font-size:11px;color:var(--muted);margin:8px 0 2px}
pre{background:var(--code);padding:8px;border-radius:6px;overflow:auto;max-height:320px;font-size:12px;margin:0;white-space:pre-wrap;overflow-wrap:anywhere}
.flag{display:inline-block;font-size:11px;font-weight:600;border-radius:4px;padding:0 6px;margin:0 4px 4px 0}.flag-danger{background:var(--danger);color:var(--bg)}.flag-warn{background:var(--warn);color:var(--bg)}
.empty{color:var(--muted)}
.fix{margin-top:12px;padding:10px 12px;border-radius:6px;background:var(--code)}.fix h4{margin:0 0 6px;font-size:12px;color:var(--accent)}
.notes h2{font-size:17px;margin:28px 0 10px}.notes h3{font-size:15px;margin:20px 0 8px}.notes table{background:var(--panel);border:1px solid var(--border);border-radius:8px;margin:8px 0 16px}.notes ul{padding-left:20px}.notes a{color:var(--accent)}
@media (max-width:640px){.ev{grid-template-columns:1fr}dl{grid-template-columns:1fr}}
</style></head><body><main>
<h1>implement-ui レポート</h1>
<div class="meta">${esc(root)} ・ 作成 ${esc(new Date().toLocaleString("ja-JP"))} ・ セッション ${targetSessions.length} 件</div>
${self?.request ? `<p><b>依頼:</b> ${esc(self.request)}</p>` : ""}
${verdict}
<div class="stats">
  <div class="stat"><b>${guesses.length}</b>推測したこと</div>
  <div class="stat"><b>${tools.length}</b>ツール呼び出し</div>
  <div class="stat"><b>${dangerCount}</b>外へのアクセス</div>
  <div class="stat"><b>${flagged.length - dangerCount}</b>履歴・ネットワーク</div>
  <div class="stat"><b>${files.length}</b>触ったパス</div>
</div>
<nav class="tabs" role="tablist">
  ${notesHtml ? '<button role="tab" aria-selected="true" data-tab="eval">評価</button>' : ""}
  <button role="tab" aria-selected="${notesHtml ? "false" : "true"}" data-tab="guess">推測と戻し先 (${guesses.length})</button>
  <button role="tab" aria-selected="false" data-tab="log">行動ログ</button>
  <button role="tab" aria-selected="false" data-tab="files">触ったファイル</button>
  <button role="tab" aria-selected="false" data-tab="summary">作業のまとめ</button>
</nav>
${notesHtml ? `<section class="tab on" id="eval"><p class="meta">評価シート（<code>${esc(basename(notesPath!))}</code>）。正解との比較や目視など、生成した AI 以外が確かめた結果。</p><div class="notes">${notesHtml}</div></section>` : ""}
<section class="tab${notesHtml ? "" : " on"}" id="guess"><h2>推測で決めたことと戻し先</h2><p class="meta">DESIGN.md・Story・ガイドラインに書かれておらず、AI が推測で決めたこと。それぞれに「どこに・何が書いてあれば迷わなかったか」（DESIGN.md「フィードバックの戻し先」に沿った直す候補）を付けている。</p>${guessRows}</section>
<section class="tab" id="log"><h2>行動ログ</h2><p class="meta">Claude Code のセッション記録から作成（AI の自己申告ではない）。行を開くと入力と結果が見られる。</p>
<div class="filters" role="group">
  <button aria-pressed="true" data-f="all">すべて</button><button aria-pressed="false" data-f="flagged">要確認だけ (${flagged.length})</button>
  <button aria-pressed="false" data-f="tool">ツールだけ</button><button aria-pressed="false" data-f="read">読む</button><button aria-pressed="false" data-f="write">書く</button><button aria-pressed="false" data-f="bash">Bash</button><button aria-pressed="false" data-f="user">会話</button>
</div><ol class="log">${eventRows}</ol></section>
<section class="tab" id="files"><h2>触ったファイル</h2><p class="meta">Read / Edit / Write / Glob / Grep の対象。外のパスを上にまとめている。Bash 経由のアクセスは「行動ログ」の要確認で見る。</p>
<table><thead><tr><th>パス</th><th>場所</th><th>読む</th><th>書く</th></tr></thead><tbody>${fileRows}</tbody></table></section>
<section class="tab" id="summary"><h2>作業のまとめ（AI の自己申告）</h2>${summaryBlock || '<p class="empty">report.json がありません。</p>'}</section>
</main>
<script>
document.querySelectorAll("nav.tabs button").forEach(b=>b.onclick=()=>{document.querySelectorAll("nav.tabs button").forEach(x=>x.setAttribute("aria-selected",x===b));document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("on",t.id===b.dataset.tab))});
document.querySelectorAll(".filters button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filters button").forEach(x=>x.setAttribute("aria-pressed",x===b));const f=b.dataset.f;document.querySelectorAll(".ev").forEach(e=>e.hidden=f!=="all"&&!e.dataset.cats.split(" ").includes(f))});
</script></body></html>`;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, html);
console.log(`レポート: ${outPath}`);
console.log(`推測 ${guesses.length} 件 / ツール ${tools.length} 回 / 外へのアクセス ${dangerCount} 件 / 履歴・ネットワーク ${flagged.length - dangerCount} 件`);
