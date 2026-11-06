/**
 * globals.css のトークンを読み、組み合わせのコントラスト比を計算する（docs/design/rules.md「コントラスト」）。
 * contrast.test.ts が、文字と地・部品の境界と地の組を、ライト・ダークの両方で確かめる。
 */

export type Theme = "light" | "dark";
export type Tokens = Record<string, string>;

/** `:root { ... }` と `.dark { ... }` の中の `--name: value;` を取り出す。ダークはライトを上書きしたもの */
export function parseTokens(css: string): Record<Theme, Tokens> {
  const block = (selector: string) => {
    const start = css.indexOf(`${selector} {`);
    if (start < 0) throw new Error(`${selector} が見つからない`);
    const body = css.slice(start, css.indexOf("}", start));
    const tokens: Tokens = {};
    for (const m of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) tokens[m[1]] = m[2].trim();
    return tokens;
  };
  const light = block(":root");
  return { light, dark: { ...light, ...block(".dark") } };
}

/** `var(--x)` をたどって `H S% L%` まで解決し、#rrggbb にする */
export function resolveColor(tokens: Tokens, name: string): string {
  let value = tokens[name];
  for (let i = 0; value?.startsWith("var("); i++) {
    if (i > 10) throw new Error(`--${name} の参照が循環している`);
    value = tokens[value.slice(6, -1)];
  }
  const m = value?.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!m) throw new Error(`--${name} を色として読めない: ${value}`);
  return hslToHex(Number(m[1]), Number(m[2]) / 100, Number(m[3]) / 100);
}

function hslToHex(h: number, s: number, l: number): string {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return `#${[0, 8, 4].map((n) => Math.round(f(n) * 255).toString(16).padStart(2, "0")).join("")}`;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG のコントラスト比（1〜21） */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
