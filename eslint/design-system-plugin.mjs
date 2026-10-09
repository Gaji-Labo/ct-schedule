/**
 * デザインシステム準拠をチェックする ESLint ローカルプラグイン
 *
 * className 属性と cn() / clsx() / cva() / twMerge() の引数に書かれた Tailwind クラスを検査する。
 * エラーメッセージは AI・人間が「代わりに何を使うか」をその場で判断できるよう、
 * 参照ドキュメント (DESIGN.md) の該当箇所を必ず含める。
 * トークン名は変わる前提のため、メッセージに具体的なトークン名は書かない。
 */

const CLASS_HELPERS = new Set(["cn", "clsx", "cva", "twMerge", "twJoin"]);

const PALETTE =
  "black|white|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";

const COLOR_UTILITY =
  "bg|text|border(?:-[xytrblse])?|ring(?:-offset)?|fill|stroke|divide|outline|from|via|to|placeholder|decoration|shadow|accent|caret";

const PALETTE_CLASS = new RegExp(
  `^(?:${COLOR_UTILITY})-(?:${PALETTE})(?:-\\d{2,3})?(?:\\/\\d+)?$`,
);
const ARBITRARY_COLOR = /^[a-z-]+-\[(?:#|rgba?\(|hsla?\(|oklch\(|color:)/;
const ARBITRARY_VALUE = /^[a-z-]+-\[.+\]$/;
// CSS 変数の参照 (例: origin-[--radix-...], w-[var(--x)]) はトークン経由とみなして許可する
const CSS_VAR_VALUE = /^[a-z-]+-\[(?:--|var\()/;

/**
 * "hover:md:!-mt-2" → "mt-2" のように、variant・important・負号を外したユーティリティ本体を返す。
 * data-[state=open]: や [&_svg]: のように [] 内に ":" を含む variant も扱う。
 */
export function toUtility(className) {
  let depth = 0;
  let lastColon = -1;
  for (let i = 0; i < className.length; i++) {
    const ch = className[i];
    if (ch === "[") depth++;
    else if (ch === "]") depth--;
    else if (ch === ":" && depth === 0) lastColon = i;
  }
  return className.slice(lastColon + 1).replace(/^!/, "").replace(/^-/, "");
}

export function findPaletteColors(text) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .filter((cls) => {
      const utility = toUtility(cls);
      return PALETTE_CLASS.test(utility) || ARBITRARY_COLOR.test(utility);
    });
}

export function findArbitraryValues(text) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .filter((cls) => {
      const utility = toUtility(cls);
      return (
        ARBITRARY_VALUE.test(utility) &&
        !ARBITRARY_COLOR.test(utility) &&
        !CSS_VAR_VALUE.test(utility)
      );
    });
}

/** 文字列ノードが className 属性またはクラス結合ヘルパーの引数の中にあるか */
function isInClassContext(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (current.type === "JSXAttribute") {
      return current.name.name === "className" || current.name.name === "class";
    }
    if (
      current.type === "CallExpression" &&
      current.callee.type === "Identifier" &&
      CLASS_HELPERS.has(current.callee.name)
    ) {
      return true;
    }
  }
  return false;
}

function createClassRule(find, messageId) {
  return (context) => {
    const check = (node, text) => {
      if (typeof text !== "string" || !isInClassContext(node)) return;
      for (const className of find(text)) {
        context.report({ node, messageId, data: { className } });
      }
    };
    return {
      Literal: (node) => check(node, node.value),
      TemplateElement: (node) => check(node, node.value.cooked),
    };
  };
}

/** @type {import("eslint").Rule.RuleModule} */
const noPaletteColor = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Tailwind のパレット色 (gray-400, black など) や色の任意値を禁止し、Semantic トークンの使用を強制する",
    },
    schema: [],
    messages: {
      paletteColor:
        "`{{className}}` はパレット色の直書きです。DESIGN.md「色」の表から用途に合う Semantic トークンを選んで置き換えてください。該当するトークンが無ければ先にトークンを追加します。",
    },
  },
  create: createClassRule(findPaletteColors, "paletteColor"),
};

/** @type {import("eslint").Rule.RuleModule} */
const noArbitraryValue = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Tailwind の任意値 (p-[13px], max-w-[425px] など) を禁止し、既定スケールの使用を強制する",
    },
    schema: [],
    messages: {
      arbitraryValue:
        "`{{className}}` は任意値です。Tailwind の既定スケール (p-4, max-w-md など) を使ってください。同じ任意値が繰り返し必要なら、コンポーネントの variant かトークンとして追加します。参照: DESIGN.md「余白・サイズ」",
    },
  },
  create: createClassRule(findArbitraryValues, "arbitraryValue"),
};

const plugin = {
  meta: { name: "design-system" },
  rules: {
    "no-palette-color": noPaletteColor,
    "no-arbitrary-value": noArbitraryValue,
  },
};

export default plugin;
