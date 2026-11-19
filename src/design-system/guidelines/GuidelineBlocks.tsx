/**
 * Storybook の「ガイドライン」ページで、OK / NG を示すための部品。
 * アプリ本体からは使わない。
 *
 * - UsageRules: 推奨される使い方 (OK) と、やりがちな NG をテキストで並べる
 * - DoDont: 実際の部品を並べて、Good / Don't を見比べる
 *
 * 色 (success / destructive) はアイコンだけに使い、意味は「OK」「NG」などの文字で伝える
 * (色だけに頼らない・薄い色の文字にしない)
 */
import { CircleCheck, CircleX } from "lucide-react";

type UsageRulesProps = {
  ok: React.ReactNode[];
  ng: React.ReactNode[];
};

export const UsageRules = ({ ok, ng }: UsageRulesProps) => (
  <section className="sb-unstyled my-6 overflow-hidden rounded-lg border">
    <div className="border-b bg-muted px-4 py-3">
      <h3 className="text-sm font-semibold">使用法</h3>
      <p className="text-xs text-muted-foreground">
        推奨される使い方と、やりがちな NG パターン
      </p>
    </div>
    <div className="grid md:grid-cols-2">
      <div className="p-4 md:border-r">
        <p className="mb-2 flex items-center gap-1 text-sm font-semibold">
          <CircleCheck aria-hidden className="size-4 text-success" />
          OK
        </p>
        <ul className="grid gap-2">
          {ok.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span aria-hidden className="text-success">
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t p-4 md:border-t-0">
        <p className="mb-2 flex items-center gap-1 text-sm font-semibold">
          <CircleX aria-hidden className="size-4 text-destructive" />
          NG
        </p>
        <ul className="grid gap-2">
          {ng.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span aria-hidden className="text-destructive">
                ✕
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

type Example = {
  /** 実際の部品を並べた見本 */
  example: React.ReactNode;
  /** なぜ Good / Don't なのか */
  caption: React.ReactNode;
};

type DoDontProps = {
  title: React.ReactNode;
  /** 右上の補足 (一言で言うと何の話か) */
  note?: React.ReactNode;
  good: Example;
  dont: Example;
};

export const DoDont = ({ title, note, good, dont }: DoDontProps) => (
  <section className="sb-unstyled my-6 overflow-hidden rounded-lg border">
    <div className="flex items-center justify-between gap-4 border-b bg-muted px-4 py-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {note && <span className="text-xs text-muted-foreground">{note}</span>}
    </div>
    <div className="grid md:grid-cols-2">
      <DoDontCell kind="good" {...good} />
      <DoDontCell kind="dont" {...dont} />
    </div>
  </section>
);

const DoDontCell = ({
  kind,
  example,
  caption,
}: Example & { kind: "good" | "dont" }) => (
  <div
    className={
      kind === "good"
        ? "flex flex-col gap-3 p-4 md:border-r"
        : "flex flex-col gap-3 border-t p-4 md:border-t-0"
    }
  >
    <p
      className="flex items-center gap-1 text-sm font-semibold"
    >
      {kind === "good" ? (
        <CircleCheck aria-hidden className="size-4 text-success" />
      ) : (
        <CircleX aria-hidden className="size-4 text-destructive" />
      )}
      {kind === "good" ? "Good" : "Don't"}
    </p>
    <div className="flex min-h-20 items-center rounded-md bg-background p-4">
      {example}
    </div>
    <p className="text-sm text-muted-foreground">{caption}</p>
  </div>
);
