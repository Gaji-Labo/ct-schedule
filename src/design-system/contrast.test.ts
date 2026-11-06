import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { contrastRatio, parseTokens, resolveColor, type Theme } from "./contrast";

const tokens = parseTokens(readFileSync(new URL("../app/globals.css", import.meta.url), "utf8"));
const THEMES: Theme[] = ["light", "dark"];

/** [前景, 地, 基準]。文字は 4.5:1、部品の境界・意味を持つ枠やアイコンは 3:1（docs/design/rules.md「コントラスト」） */
const PAIRS: [string, string, number][] = [
  ["foreground", "background", 4.5],
  ["card-foreground", "card", 4.5],
  ["popover-foreground", "popover", 4.5],
  ["primary-foreground", "primary", 4.5],
  ["secondary-foreground", "secondary", 4.5],
  ["muted-foreground", "background", 4.5],
  ["muted-foreground", "muted", 4.5],
  ["accent-foreground", "accent", 4.5],
  ["destructive-foreground", "destructive", 4.5],
  ["success-foreground", "success", 4.5],
  ...(["info", "success", "warning", "destructive"] as const).flatMap(
    (k): [string, string, number][] => [
      [`feedback-${k}-foreground`, `feedback-${k}-subtle`, 4.5],
      [`feedback-${k}-icon`, `feedback-${k}-subtle`, 3],
    ],
  ),
  ["status-holiday-foreground", "status-holiday", 4.5],
  ["status-rest-foreground", "status-rest", 4.5],
  ["site-header-foreground", "site-header", 4.5],
  ...[1, 2, 3, 4, 5, 6, 7].map((i): [string, string, number] => [`avatar-${i}-foreground`, `avatar-${i}`, 4.5]),
  ["input", "background", 3],
  ["input", "muted", 3],
  ["highlight-current", "background", 3],
  ["ring", "background", 3],
];

/**
 * 基準を割っているが、直すまで残している組。直したら行を消す（消し忘れるとテストが落ちる）。
 * キーは「前景 / 地 / テーマ」
 */
const KNOWN: Record<string, string> = {
  "destructive-foreground / destructive / light":
    "削除ボタンの白い文字が赤 (red-500) の地で 3.6:1。--destructive を濃い赤にする",
  "status-rest-foreground / status-rest / light":
    "お休み・祝日名のラベルが灰色 (neutral-400) の地に白で 2.5:1。地を濃くするか、文字を濃い色にする",
  "status-holiday-foreground / status-holiday / light":
    "祝日の面 (neutral-100) の上の文字 (neutral-500) が 4.35:1。文字を neutral-550 以上にする",
  "muted-foreground / muted / light":
    "控えめな面 (neutral-100) の上の補足 (neutral-500) が 4.35:1。--muted-foreground を neutral-550 にする",
  "success-foreground / success / light":
    "緑 (green-500) の地に白で 2.28:1。今は文字を載せていない（MemberListItem の参加の点だけ）。文字を載せる前に地を濃くする",
  "input / muted / dark":
    "ダークの控えめな面 (neutral-800) の上の入力欄の枠 (neutral-550) が 2.48:1。rules.md は黒地 3.27:1 しか確かめていない",
};

describe("トークンのコントラスト", () => {
  for (const theme of THEMES) {
    for (const [fg, bg, min] of PAIRS) {
      const key = `${fg} / ${bg} / ${theme}`;
      test(`${key} が ${min}:1 以上`, () => {
        const ratio = contrastRatio(resolveColor(tokens[theme], fg), resolveColor(tokens[theme], bg));
        if (KNOWN[key]) {
          // 既知の違反がまだ残っていることを確かめる（直ったら KNOWN から消す）
          expect(ratio, `${key} は ${ratio.toFixed(2)}:1 で基準を満たした。KNOWN から消す`).toBeLessThan(min);
        } else {
          expect(ratio, `${key} は ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(min);
        }
      });
    }
  }

  test("KNOWN の組はすべて PAIRS にある", () => {
    const keys = new Set(THEMES.flatMap((t) => PAIRS.map(([fg, bg]) => `${fg} / ${bg} / ${t}`)));
    expect(Object.keys(KNOWN).filter((k) => !keys.has(k))).toEqual([]);
  });
});

describe("contrastRatio", () => {
  test("黒と白は 21:1、同じ色は 1:1", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#777777")).toBeCloseTo(1, 5);
  });

  test("rules.md に書いた input の値と一致する（白地 3.41:1）", () => {
    expect(contrastRatio(resolveColor(tokens.light, "input"), "#ffffff")).toBeCloseTo(3.41, 1);
  });
});

describe("resolveColor", () => {
  test("var() をたどって #rrggbb にする", () => {
    expect(resolveColor({ a: "var(--b)", b: "0 0% 100%" }, "a")).toBe("#ffffff");
  });

  test("色でない値は例外にする", () => {
    expect(() => resolveColor({ radius: "0.5rem" }, "radius")).toThrow();
  });
});
