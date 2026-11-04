/**
 * ビルド済みの Storybook（storybook-static/）の全 Story に axe を当て、WCAG 2.2 AA の違反を数える。
 * ライト・ダークの両方で調べる。違反があれば終了コード 1。
 *
 *   bun run check:a11y                      # storybook-static/ を調べる（先に storybook build が要る）
 *   bun run check:a11y <dir>                # 別のビルドを調べる
 *   bun run check:a11y --json <file>        # 結果を JSON にも書き出す（採点など機械で読むとき）
 *
 * Storybook の Accessibility パネル（@storybook/addon-a11y）と同じ axe-core を使う。
 * パネルは人が開いた Story しか見ないので、部品・画面のどれかが基準を割ったら機械的に気づけるようにする。
 * 直すまで残す違反は a11y-known.ts に理由つきで書く。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Result } from "axe-core";
import { KNOWN_VIOLATIONS, type KnownViolation } from "./a11y-known";

/** WCAG 2.2 AA までの規則だけを見る（best-practice の規則は数えない） */
export const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
export const THEMES = ["light", "dark"] as const;
type Theme = (typeof THEMES)[number];

export type Violation = {
  storyId: string;
  title: string;
  theme: Theme;
  rule: string;
  impact: string | null;
  help: string;
  /** 要素ごとの説明（コントラスト比など）。axe の failureSummary の要点 */
  targets: { selector: string; detail: string }[];
};

type IndexEntry = { id: string; title: string; name: string; type: string };

/** index.json から Story（docs ではないもの）を取り出す */
export function storiesFromIndex(index: { entries: Record<string, IndexEntry> }): IndexEntry[] {
  return Object.values(index.entries).filter((e) => e.type === "story");
}

/** axe の結果を、Story・テーマ・規則ごとの違反に直す */
export function toViolations(
  story: Pick<IndexEntry, "id" | "title">,
  theme: Theme,
  results: Pick<Result, "id" | "impact" | "help" | "nodes">[],
): Violation[] {
  return results.map((r) => ({
    storyId: story.id,
    title: story.title,
    theme,
    rule: r.id,
    impact: r.impact ?? null,
    help: r.help,
    targets: r.nodes.map((n) => ({
      selector: n.target.join(" "),
      detail: (n.failureSummary ?? "").split("\n").slice(1).join(" ").trim(),
    })),
  }));
}

/** Story ID は「タイトル--名前」。known.stories はタイトル部分（`ui-badge` など）の前方一致で書く */
export function isKnown(v: Violation, known: KnownViolation[]): boolean {
  return known.some(
    (k) =>
      k.rule === v.rule &&
      (!k.themes || k.themes.includes(v.theme)) &&
      k.stories.some((prefix) => v.storyId.startsWith(prefix)),
  );
}

/** 既知の違反と新しい違反に分け、既知のリストのうち、もう起きていない行も返す */
export function classify(violations: Violation[], known: KnownViolation[]) {
  const fresh = violations.filter((v) => !isKnown(v, known));
  const stale = known.filter((k) => !violations.some((v) => isKnown(v, [k])));
  return { fresh, known: violations.filter((v) => isKnown(v, known)), stale };
}

export type Summary = {
  ok: boolean;
  stories: number;
  themes: readonly Theme[];
  /** 新しい違反。直す対象 */
  violations: Violation[];
  /** a11y-known.ts で残している違反の件数 */
  knownCount: number;
  /** a11y-known.ts のうち、もう起きていない行 */
  stale: KnownViolation[];
  /** 描画に失敗した Story（`[theme] storyId`） */
  renderErrors: string[];
};

/** 終了コードと JSON の元になる結果。新しい違反・描画エラー・消し忘れのどれかがあれば ok=false */
export function summarize(
  stories: number,
  violations: Violation[],
  renderErrors: string[],
  known: KnownViolation[],
): Summary {
  const c = classify(violations, known);
  return {
    ok: c.fresh.length === 0 && renderErrors.length === 0 && c.stale.length === 0,
    stories,
    themes: THEMES,
    violations: c.fresh,
    knownCount: c.known.length,
    stale: c.stale,
    renderErrors,
  };
}

/** `[dir] [--json file]` を読む */
export function parseArgs(argv: string[]): { dir: string; json?: string } {
  const i = argv.indexOf("--json");
  const json = i >= 0 ? argv[i + 1] : undefined;
  if (i >= 0 && !json) throw new Error("--json の後に書き出すファイルを指定する");
  const rest = i >= 0 ? [...argv.slice(0, i), ...argv.slice(i + 2)] : argv;
  return { dir: rest[0] ?? "storybook-static", json };
}

function format(v: Violation): string {
  const nodes = v.targets.slice(0, 3).map((t) => `    ${t.selector}\n      ${t.detail}`);
  const more = v.targets.length > 3 ? [`    ほか ${v.targets.length - 3} 要素`] : [];
  return [`  [${v.theme}] ${v.storyId}  ${v.rule}（${v.impact ?? "-"}）${v.help}`, ...nodes, ...more].join("\n");
}

async function main({ dir, json }: { dir: string; json?: string }): Promise<number> {
  const { chromium } = await import("playwright");
  const index = JSON.parse(readFileSync(join(dir, "index.json"), "utf8"));
  const stories = storiesFromIndex(index);
  const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

  const server = Bun.serve({
    port: 0,
    fetch(req) {
      const path = decodeURIComponent(new URL(req.url).pathname);
      const file = Bun.file(join(dir, path === "/" ? "index.html" : path));
      return file.size ? new Response(file) : new Response("not found", { status: 404 });
    },
  });
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });

  const violations: Violation[] = [];
  const renderErrors: string[] = [];
  const jobs = stories.flatMap((s) => THEMES.map((theme) => ({ story: s, theme })));
  let next = 0;
  // Story はそれぞれ独立なので、ページを4枚使って並べて調べる
  const worker = async () => {
    const page = await context.newPage();
    while (next < jobs.length) {
      const { story, theme } = jobs[next++];
      const globals = theme === "dark" ? "&globals=theme:dark" : "";
      await page.goto(`${server.url}iframe.html?id=${story.id}&viewMode=story${globals}`, {
        waitUntil: "networkidle",
      });
      // play 関数（ダイアログを開くなど）が終わるのを待つ
      await page.waitForTimeout(300);
      // 開くときのフェードなどが終わってから測る。途中の半透明な色で測ると、コントラストの結果が回ごとに変わる。
      // Spinner のような無限に回るものは待たない。終わらないものがあっても 2 秒で打ち切る
      await page.evaluate(() =>
        Promise.race([
          Promise.all(
            document
              .getAnimations()
              .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
              .map((a) => a.finished.catch(() => undefined)),
          ),
          new Promise((r) => setTimeout(r, 2000)),
        ]),
      );
      if (await page.locator("body.sb-show-errordisplay").count()) {
        renderErrors.push(`[${theme}] ${story.id}`);
        continue;
      }
      await page.addScriptTag({ content: axeSource });
      // Storybook の Accessibility パネル（addon-a11y）も、Story を開くと同じページで axe を走らせる。
      // 重なると「Axe is already running」で失敗するので、終わるのを待って測り直す
      const results = await page.evaluate(async (tags) => {
        for (let i = 0; ; i++) {
          try {
            // @ts-expect-error axe は addScriptTag で読み込んだグローバル
            const r = await window.axe.run(document, { runOnly: { type: "tag", values: tags } });
            return r.violations;
          } catch (e) {
            if (i >= 50 || !String(e).includes("already running")) throw e;
            await new Promise((resolve) => setTimeout(resolve, 200));
          }
        }
      }, WCAG_TAGS);
      violations.push(...toViolations(story, theme, results));
    }
    await page.close();
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  await browser.close();
  server.stop();

  const summary = summarize(stories.length, violations, renderErrors, KNOWN_VIOLATIONS);
  if (json) writeFileSync(json, `${JSON.stringify(summary, null, 2)}\n`);

  console.log(`${stories.length} Story × ${THEMES.length} テーマを調べた（WCAG 2.2 AA）`);
  if (renderErrors.length) {
    console.log(`\n描画エラー（${renderErrors.length}件）:\n  ${renderErrors.join("\n  ")}`);
  }
  if (summary.knownCount) {
    console.log(`\n既知の違反（a11y-known.ts。直したら行を消す）: ${summary.knownCount}件`);
  }
  if (summary.stale.length) {
    console.log(`\na11y-known.ts のうち、もう起きていないもの（行を消す）:`);
    for (const k of summary.stale) console.log(`  ${k.rule}: ${k.stories.join(", ")}`);
  }
  if (summary.violations.length) {
    console.log(`\n違反（${summary.violations.length}件）:`);
    for (const v of summary.violations) console.log(format(v));
  } else {
    console.log("\n新しい違反はありません");
  }
  return summary.ok ? 0 : 1;
}

if (import.meta.main) {
  const args = parseArgs(process.argv.slice(2));
  process.exit(await main({ dir: resolve(args.dir), json: args.json && resolve(args.json) }));
}
