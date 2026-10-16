/**
 * ガイドラインの Good / Don't で使う「見本用の静的な絵」。
 * Dialog・DropdownMenu・Tooltip・toast は本物を開くとページの上に重なってしまうため、
 * 同じトークンで見た目だけを再現する。アプリ本体からは使わない。
 */
import { CircleCheck, CircleX, X } from "lucide-react";

export const MockDialog = ({
  title,
  description,
  footer,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  footer: React.ReactNode;
}) => (
  <div className="relative grid w-full max-w-sm gap-4 rounded-lg border bg-background p-6 shadow-lg">
    <X aria-hidden className="absolute right-4 top-4 size-4 opacity-70" />
    <div className="grid gap-1.5">
      <p className="text-lg font-semibold leading-none">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    <div className="flex justify-end gap-2">{footer}</div>
  </div>
);

export const MockMenu = ({
  label,
  items,
}: {
  label?: string;
  /** "---" は区切り線 */
  items: React.ReactNode[];
}) => (
  <div className="w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
    {label && <p className="px-2 py-1.5 text-sm font-semibold">{label}</p>}
    {label && <div className="-mx-1 my-1 h-px bg-muted" />}
    {items.map((item, i) =>
      item === "---" ? (
        <div key={i} className="-mx-1 my-1 h-px bg-muted" />
      ) : (
        <div
          key={i}
          className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm [&_svg]:size-4"
        >
          {item}
        </div>
      ),
    )}
  </div>
);

export const MockTooltip = ({
  trigger,
  content,
}: {
  trigger: React.ReactNode;
  content: React.ReactNode;
}) => (
  <div className="flex flex-col items-center gap-1">
    <span className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground">
      {content}
    </span>
    {trigger}
  </div>
);

const TOAST_STYLE = {
  default: "bg-background text-foreground",
  success:
    "border-feedback-success-border bg-feedback-success-subtle text-feedback-success-foreground",
  error:
    "border-feedback-destructive-border bg-feedback-destructive-subtle text-feedback-destructive-foreground",
} as const;

export const MockToast = ({
  kind = "default",
  title,
  description,
}: {
  kind?: "default" | "success" | "error";
  title: React.ReactNode;
  description?: React.ReactNode;
}) => (
  <div
    className={`flex w-full max-w-sm gap-2 rounded-lg border p-4 shadow-lg ${TOAST_STYLE[kind]}`}
  >
    {kind === "success" && (
      <CircleCheck
        aria-hidden
        className="mt-0.5 size-4 shrink-0 text-feedback-success-icon"
      />
    )}
    {kind === "error" && (
      <CircleX
        aria-hidden
        className="mt-0.5 size-4 shrink-0 text-feedback-destructive-icon"
      />
    )}
    <div className="grid gap-1">
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="text-sm">{description}</p>}
    </div>
  </div>
);
