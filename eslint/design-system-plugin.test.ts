import { describe, expect, it, test } from "vitest";
import { RuleTester } from "eslint";
import typescriptParser from "@typescript-eslint/parser";
import plugin, {
  findArbitraryValues,
  findPaletteColors,
  toUtility,
} from "./design-system-plugin.mjs";

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: typescriptParser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

describe("toUtility", () => {
  test("variant・important・負号を外す", () => {
    expect(toUtility("hover:md:!-mt-2")).toBe("mt-2");
  });

  test("[] 内に : を含む variant を扱える", () => {
    expect(toUtility("data-[state=open]:bg-gray-100")).toBe("bg-gray-100");
    expect(toUtility("[&_svg]:size-4")).toBe("size-4");
  });
});

describe("findPaletteColors", () => {
  test("パレット色・black/white・不透明度付きを検出する", () => {
    expect(
      findPaletteColors("bg-gray-400 text-black border-x-red-500 bg-black/80"),
    ).toEqual(["bg-gray-400", "text-black", "border-x-red-500", "bg-black/80"]);
  });

  test("variant 付きも検出する", () => {
    expect(findPaletteColors("hover:bg-gray-400 dark:text-white")).toEqual([
      "hover:bg-gray-400",
      "dark:text-white",
    ]);
  });

  test("色の任意値を検出する", () => {
    expect(findPaletteColors("bg-[#fff] text-[rgb(0,0,0)]")).toEqual([
      "bg-[#fff]",
      "text-[rgb(0,0,0)]",
    ]);
  });

  test("Semantic トークンや色以外のユーティリティは検出しない", () => {
    expect(
      findPaletteColors(
        "bg-primary text-muted-foreground bg-status-rest border-highlight-current text-sm border-2 shadow-sm ring-1",
      ),
    ).toEqual([]);
  });
});

describe("findArbitraryValues", () => {
  test("サイズ・余白の任意値を検出する", () => {
    expect(findArbitraryValues("min-w-[300px] max-w-[425px] p-4")).toEqual([
      "min-w-[300px]",
      "max-w-[425px]",
    ]);
  });

  test("任意 variant と CSS 変数参照は検出しない", () => {
    expect(
      findArbitraryValues(
        "data-[state=open]:animate-in group-[.toast]:text-sm origin-[--radix-x] w-[var(--w)]",
      ),
    ).toEqual([]);
  });

  test("色の任意値は no-palette-color 側で扱うため検出しない", () => {
    expect(findArbitraryValues("bg-[#fff]")).toEqual([]);
  });
});

ruleTester.run("no-palette-color", plugin.rules["no-palette-color"], {
  valid: [
    { code: '<div className="bg-muted text-muted-foreground" />' },
    { code: 'cn("bg-status-rest", isCurrent && "border-highlight-current")' },
    // className 以外の文字列は対象外
    { code: 'const label = "bg-gray-400 という名前";' },
    { code: '<input placeholder="text-black" />' },
  ],
  invalid: [
    {
      code: '<div className="p-4 bg-gray-100" />',
      errors: [{ messageId: "paletteColor", data: { className: "bg-gray-100" } }],
    },
    {
      code: 'cn("rounded-lg", isHoliday && "bg-gray-100")',
      errors: [{ messageId: "paletteColor" }],
    },
    {
      code: 'cva("inline-flex", { variants: { v: { a: "bg-black/80" } } })',
      errors: [{ messageId: "paletteColor" }],
    },
    {
      code: "<div className={`${active ? \"bg-green-500\" : \"bg-gray-200\"} h-2 w-2`} />",
      errors: [{ messageId: "paletteColor" }, { messageId: "paletteColor" }],
    },
    {
      code: "<div className={`text-white ${size}`} />",
      errors: [{ messageId: "paletteColor" }],
    },
  ],
});

ruleTester.run("no-arbitrary-value", plugin.rules["no-arbitrary-value"], {
  valid: [
    { code: '<div className="min-w-72 max-w-md p-4" />' },
    { code: '<div className="data-[state=open]:animate-in" />' },
  ],
  invalid: [
    {
      code: '<div className="min-w-[300px]" />',
      errors: [{ messageId: "arbitraryValue", data: { className: "min-w-[300px]" } }],
    },
    {
      code: 'cn("sm:max-w-[425px]")',
      errors: [{ messageId: "arbitraryValue" }],
    },
  ],
});
