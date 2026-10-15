/**
 * Storybook の Foundations ページでトークンを一覧表示するための部品。
 * アプリ本体からは使わない。
 */
import {
  brandColors,
  breakpoints,
  elevation,
  fontFamilies,
  pageLayout,
  primitiveColors,
  radii,
  semanticColors,
  spacing,
  typography,
} from "@/src/design-system/tokens";

const Swatch = ({ name }: { name: string }) => (
  <div
    className="h-10 w-10 shrink-0 rounded-md border"
    style={{ backgroundColor: `hsl(var(--${name}))` }}
  />
);

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs">
    {children}
  </code>
);

export const SemanticColorTable = () => (
  <div className="flex flex-col gap-8">
    {semanticColors.map((group) => (
      <section key={group.title} className="flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-semibold">{group.title}</h3>
          <p className="text-sm text-muted-foreground">{group.description}</p>
        </div>
        <div className="flex flex-col divide-y rounded-lg border">
          {group.tokens.map((token) => (
            <div key={token.name} className="flex items-center gap-4 p-3">
              <Swatch name={token.name} />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{token.name}</span>
                  <Code>{token.tailwind}</Code>
                </div>
                <span className="text-sm text-muted-foreground">
                  {token.usage}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
);

export const PrimitivePalette = () => (
  <div className="flex flex-col gap-6">
    {primitiveColors.map((group) => (
      <section key={group.title} className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">{group.title}</h3>
        <div className="flex flex-wrap gap-3">
          {group.names.map((name) => (
            <div key={name} className="flex flex-col items-center gap-1">
              <Swatch name={name} />
              <span className="text-xs text-muted-foreground">{name}</span>
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
);

export const BrandPalette = () => (
  <div className="flex flex-col gap-8">
    {brandColors.map((group) => (
      <section key={group.title} className="flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-semibold">{group.title}</h3>
          <p className="text-sm text-muted-foreground">{group.description}</p>
        </div>
        <div className="flex flex-col divide-y rounded-lg border">
          {group.colors.map((color) => (
            <div key={color.name} className="flex items-center gap-4 p-3">
              <Swatch name={color.name} />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{color.name}</span>
                  <Code>{color.hex}</Code>
                </div>
                <span className="text-sm text-muted-foreground">{color.usage}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
);

export const FontFamilyList = () => (
  <div className="flex flex-col divide-y rounded-lg border">
    {fontFamilies.map((item) => (
      <div key={item.tailwind} className="flex flex-col gap-2 p-4">
        <span className={`text-2xl ${item.tailwind}`}>
          CT組み合わせ表 Aa 0123456789
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Code>{item.tailwind}</Code>
          <span className="text-xs text-muted-foreground">{item.usage}</span>
        </div>
        <span className="text-sm leading-relaxed text-muted-foreground">
          {item.fonts}
        </span>
      </div>
    ))}
  </div>
);

/** 行間の違いが見えるよう、文章の役割には2行以上になる見本を使う */
const sampleText = (tailwind: string) =>
  tailwind.includes("leading-relaxed")
    ? "毎週月曜に、チームの2人1組で CT（コミュニケーションタイム）を行います。組み合わせはラウンドロビンで自動的に作られ、毎週相手が変わります。参加人数が奇数の週は、1人がお休みになります。"
    : "CT組み合わせ表 2026/10/05";

export const TypographyList = () => (
  <div className="flex flex-col divide-y rounded-lg border">
    {typography.map((item) => (
      <div key={item.tailwind} className="flex flex-col gap-2 p-4">
        <span className={`max-w-prose ${item.tailwind}`}>
          {sampleText(item.tailwind)}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Code>{item.tailwind}</Code>
          <span className="text-xs text-muted-foreground">
            {item.usage}・行間 {item.lineHeight}
          </span>
        </div>
      </div>
    ))}
  </div>
);

export const SpacingList = () => (
  <div className="flex flex-col divide-y rounded-lg border">
    {spacing.map((item) => (
      <div key={item.tailwind} className="flex items-center gap-4 p-3">
        <div className="w-16 shrink-0 text-sm font-medium">
          {item.tailwind} <span className="text-muted-foreground">({item.px}px)</span>
        </div>
        <div className="h-4 shrink-0 bg-primary" style={{ width: item.px }} />
        <span className="text-sm text-muted-foreground">{item.usage}</span>
      </div>
    ))}
  </div>
);

export const RadiusList = () => (
  <div className="flex flex-wrap gap-6">
    {radii.map((item) => (
      <div key={item.tailwind} className="flex w-40 flex-col gap-2">
        <div className={`h-16 w-16 border-2 border-primary bg-muted ${item.tailwind}`} />
        <Code>{item.tailwind}</Code>
        <span className="text-xs text-muted-foreground">{item.usage}</span>
      </div>
    ))}
  </div>
);

export const PageLayoutTable = () => (
  <div className="flex flex-col divide-y rounded-lg border">
    {pageLayout.map((item) => (
      <div key={item.part} className="flex flex-col gap-1 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{item.part}</span>
          <Code>{item.tailwind}</Code>
          <span className="text-sm text-muted-foreground">{item.value}</span>
        </div>
        <span className="text-sm text-muted-foreground">{item.usage}</span>
      </div>
    ))}
  </div>
);

/** ページの骨組みの図。実寸ではなく、どこにどの間隔が入るかを示す */
export const PageSkeletonDiagram = () => (
  <div className="overflow-hidden rounded-lg border">
    <div className="bg-site-header px-4 py-2 text-xs text-site-header-foreground">
      SiteHeader（中身は max-w-7xl・左右余白は main と同じ）
    </div>
    <div className="bg-muted p-4">
      <div className="mx-auto grid max-w-xl gap-4 rounded-md border border-dashed bg-background p-4">
        <span className="text-xs text-muted-foreground">
          main: max-w-7xl・余白 px-4 py-8 / md:p-10・子要素の間 gap-10
        </span>
        <div className="grid gap-1 rounded-md border p-3">
          <span className="text-xs text-muted-foreground">PageHeader（パンくず → gap-2 → h1 と右端の操作）</span>
          <span className="text-xs">CT組み合わせ表 › メンバー一覧</span>
          <span className="text-lg font-semibold leading-snug">ページタイトル</span>
        </div>
        <div className="grid gap-2 rounded-md border p-3">
          <span className="text-xs text-muted-foreground">PageSection（中の要素の間 gap-4）</span>
          <div className="h-6 rounded-sm bg-muted" />
          <div className="h-6 rounded-sm bg-muted" />
        </div>
        <div className="grid gap-2 rounded-md border p-3">
          <span className="text-xs text-muted-foreground">PageSection</span>
          <div className="h-6 rounded-sm bg-muted" />
        </div>
      </div>
    </div>
  </div>
);

export const BreakpointList = () => (
  <div className="flex flex-col divide-y rounded-lg border">
    {breakpoints.map((item) => (
      <div key={item.name} className="flex items-center gap-4 p-3">
        <div className="w-24 shrink-0 text-sm font-medium">
          {item.name} <span className="text-muted-foreground">({item.px}px)</span>
        </div>
        <span className="text-sm text-muted-foreground">{item.usage}</span>
      </div>
    ))}
  </div>
);

export const ElevationList = () => (
  <div className="flex flex-wrap gap-6">
    {elevation.map((item) => (
      <div key={item.level} className="flex w-48 flex-col gap-2">
        <div
          className={`flex h-20 w-full items-center justify-center rounded-lg text-sm text-muted-foreground ${item.tailwind}`}
        >
          {item.level === 0 ? "面のみ" : `レベル ${item.level}`}
        </div>
        <span className="text-sm font-medium">
          {item.level}. {item.name}
        </span>
        <Code>{item.tailwind}</Code>
        <span className="text-xs text-muted-foreground">{item.usage}</span>
      </div>
    ))}
  </div>
);
