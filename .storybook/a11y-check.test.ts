import { describe, expect, test } from "vitest";
import {
  classify,
  isKnown,
  parseArgs,
  storiesFromIndex,
  summarize,
  toViolations,
  type Violation,
} from "./a11y-check";
import type { KnownViolation } from "./a11y-known";

const violation = (over: Partial<Violation> = {}): Violation => ({
  storyId: "ui-button--variants",
  title: "UI/Button",
  theme: "light",
  rule: "color-contrast",
  impact: "serious",
  help: "",
  targets: [],
  ...over,
});

const known = (over: Partial<KnownViolation> = {}): KnownViolation => ({
  rule: "color-contrast",
  stories: ["ui-button"],
  reason: "",
  ...over,
});

describe("storiesFromIndex", () => {
  test("docs を除き、Story だけを返す", () => {
    const index = {
      entries: {
        a: { id: "ui-button--default", title: "UI/Button", name: "Default", type: "story" },
        b: { id: "ui-button--docs", title: "UI/Button", name: "Docs", type: "docs" },
      },
    };
    expect(storiesFromIndex(index).map((s) => s.id)).toEqual(["ui-button--default"]);
  });
});

describe("toViolations", () => {
  test("axe の結果を、要素ごとのセレクタと説明つきの違反にする", () => {
    const [v] = toViolations({ id: "ui-badge--default", title: "UI/Badge" }, "dark", [
      {
        id: "color-contrast",
        impact: "serious",
        help: "contrast",
        nodes: [
          {
            target: [".badge"],
            failureSummary: "Fix any of the following:\n  Element has insufficient color contrast of 2.5",
          },
        ],
      },
    ] as never);
    expect(v).toMatchObject({ storyId: "ui-badge--default", theme: "dark", rule: "color-contrast" });
    expect(v.targets).toEqual([{ selector: ".badge", detail: "Element has insufficient color contrast of 2.5" }]);
  });
});

describe("isKnown", () => {
  test("規則が同じで、Story ID が前方一致すれば既知", () => {
    expect(isKnown(violation(), [known()])).toBe(true);
  });

  test("規則が違えば既知ではない", () => {
    expect(isKnown(violation({ rule: "link-name" }), [known()])).toBe(false);
  });

  test("Story ID が前方一致しなければ既知ではない", () => {
    expect(isKnown(violation({ storyId: "ui-badge--default" }), [known()])).toBe(false);
  });

  test("themes を書いたときは、そのテーマだけを既知にする", () => {
    const k = known({ themes: ["light"] });
    expect(isKnown(violation({ theme: "light" }), [k])).toBe(true);
    expect(isKnown(violation({ theme: "dark" }), [k])).toBe(false);
  });
});

describe("classify", () => {
  test("既知の違反と新しい違反に分ける", () => {
    const fresh = violation({ storyId: "ui-badge--default" });
    const result = classify([violation(), fresh], [known()]);
    expect(result.fresh).toEqual([fresh]);
    expect(result.known).toHaveLength(1);
  });

  test("もう起きていない既知の違反を stale として返す（直したら行を消すため）", () => {
    const gone = known({ rule: "link-name" });
    expect(classify([violation()], [known(), gone]).stale).toEqual([gone]);
  });
});

describe("summarize", () => {
  test("新しい違反だけを violations に入れ、既知は件数にする", () => {
    const fresh = violation({ storyId: "drafts-ct-mypage--default" });
    const s = summarize(10, [violation(), fresh], [], [known()]);
    expect(s).toMatchObject({ ok: false, stories: 10, violations: [fresh], knownCount: 1, stale: [] });
  });

  test("違反がすべて既知なら ok", () => {
    expect(summarize(10, [violation()], [], [known()]).ok).toBe(true);
  });

  test("描画エラーがあれば ok ではない", () => {
    expect(summarize(10, [], ["[light] ui-button--default"], []).ok).toBe(false);
  });

  test("既知のリストの消し忘れがあれば ok ではない", () => {
    expect(summarize(10, [], [], [known()]).ok).toBe(false);
  });
});

describe("parseArgs", () => {
  test("引数がなければ storybook-static を調べる", () => {
    expect(parseArgs([])).toEqual({ dir: "storybook-static", json: undefined });
  });

  test("ディレクトリと --json を順不同で読む", () => {
    expect(parseArgs(["--json", "out.json", "build"])).toEqual({ dir: "build", json: "out.json" });
    expect(parseArgs(["build", "--json", "out.json"])).toEqual({ dir: "build", json: "out.json" });
  });

  test("--json の後にファイルがなければ止める", () => {
    expect(() => parseArgs(["--json"])).toThrow();
  });
});
