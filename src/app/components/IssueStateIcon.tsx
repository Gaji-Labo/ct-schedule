import { CircleCheck, CircleDot, CircleSlash } from "lucide-react";
import { cn } from "@/src/lib/utils";

/** Issue の状態。クローズは「完了」と「対応しない」の2種類 */
export type IssueState = "open" | "completed" | "not_planned";

export const ISSUE_STATE_LABEL: Record<IssueState, string> = {
  open: "オープン",
  completed: "クローズ（完了）",
  not_planned: "クローズ（対応しない）",
};

/**
 * 色は状態を伝える feedback-* のアイコン色を使う。形も変えるので、色が分からなくても区別できる。
 * - オープン: 進行中 → success（緑・○に点）
 * - 完了: 終わった → info（青・○にチェック）
 * - 対応しない: 色の意味を持たせない → muted（灰・○に斜線）
 */
const ICONS = {
  open: { Icon: CircleDot, className: "text-feedback-success-icon" },
  completed: { Icon: CircleCheck, className: "text-feedback-info-icon" },
  not_planned: { Icon: CircleSlash, className: "text-muted-foreground" },
} as const;

type Props = {
  state: IssueState;
  className?: string;
};

/** Issue の状態を示すアイコン。読み上げでは「オープン」などの文言になる */
export const IssueStateIcon = ({ state, className }: Props) => {
  const { Icon, className: color } = ICONS[state];
  return (
    <span className={cn("inline-flex shrink-0", className)}>
      <Icon aria-hidden className={cn("size-4", color)} />
      <span className="sr-only">{ISSUE_STATE_LABEL[state]}</span>
    </span>
  );
};
