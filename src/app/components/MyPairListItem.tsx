import type { ReactNode } from "react";
import type { User } from "@/app/actions";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/src/lib/utils";

type Props = {
  /** CT の日付（例: 2026/10/26(月)） */
  date: string;
  /** その週の相手。お休みの週は null */
  partner: Pick<User, "slack_display_name" | "slack_image"> &
    Partial<Pick<User, "slack_user_id">> | null;
  /** 祝日の週なら祝日名。相手より優先して表示する */
  holidayName?: string;
  /** 直近の週（今週）なら true。枠線の色で目立たせる */
  current?: boolean;
  /** 行の右端に置く操作（ハドルを開始するボタンなど） */
  action?: ReactNode;
};

/**
 * マイページの「自分のペア」の1週分。日付と、その週の相手（お休み・祝日ならラベル）を表示する
 */
export const MyPairListItem = ({ date, partner, holidayName, current, action }: Props) => (
  <div
    className={cn(
      "flex items-center gap-4 rounded-md border p-3",
      current && "border-2 border-highlight-current",
    )}
  >
    <time dateTime={date} className="w-28 shrink-0 text-sm font-medium">
      {date}
    </time>
    <div className="flex min-w-0 flex-1 items-center gap-2">
      {holidayName ? (
        <Badge variant="rest">{holidayName}</Badge>
      ) : partner ? (
        <>
          <UserAvatar user={partner} size="sm" />
          <span className="truncate text-sm font-medium">{partner.slack_display_name}</span>
        </>
      ) : (
        <Badge variant="rest">お休み</Badge>
      )}
    </div>
    {action}
  </div>
);
