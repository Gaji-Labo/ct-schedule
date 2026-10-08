/**
 * Storybook の Foundations ページでトークンを一覧表示するための部品。
 * アプリ本体からは使わない。
 */
import {
  brandColors,
  primitiveColors,
  radii,
  semanticColors,
  shadows,
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

export const TypographyList = () => (
  <div className="flex flex-col divide-y rounded-lg border">
    {typography.map((item) => (
      <div key={item.tailwind} className="flex flex-col gap-1 p-4">
        <span className={item.tailwind}>CTスケジュール 2026/10/05</span>
        <div className="flex flex-wrap items-center gap-2">
          <Code>{item.tailwind}</Code>
          <span className="text-xs text-muted-foreground">{item.usage}</span>
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

export const ShadowList = () => (
  <div className="flex flex-wrap gap-6">
    {shadows.map((item) => (
      <div key={item.tailwind} className="flex w-40 flex-col gap-2">
        <div className={`h-16 w-full rounded-lg border bg-card ${item.tailwind}`} />
        <Code>{item.tailwind}</Code>
        <span className="text-xs text-muted-foreground">{item.usage}</span>
      </div>
    ))}
  </div>
);
