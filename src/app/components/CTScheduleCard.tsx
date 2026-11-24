import { User } from "@/app/actions";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/src/lib/utils";
import { CT } from "@/src/utils/member";
import { Headphones, Moon } from "lucide-react";

const CTScheduleItem = ({ user }: { user: User }) => (
  <div className="flex items-center gap-2 min-w-0">
    <UserAvatar user={user} size="sm" />
    <span className="font-medium text-sm truncate">
      {user.slack_display_name}
    </span>
  </div>
);

type Props = {
  schedule: CT;
  index: number;
};

export const CTScheduleCard = ({ schedule, index }: Props) => {
  return (
    <div
      className={cn(
        "border rounded-lg p-4 flex-shrink-0 min-w-[300px]",
        index === 0 && "border-2 border-highlight-current",
        schedule.isHoliday && "bg-gray-100",
      )}
    >
      <h2 className="text-lg font-semibold leading-snug mb-4 text-center">
        <time dateTime={schedule.date}>{schedule.date}</time>
      </h2>
      {schedule.isHoliday && (
        <Badge className="grid text-center bg-gray-400 rounded-full hover:bg-gray-400">
          {schedule.holidayName}
        </Badge>
      )}
      {/*
        行をまたいで列の幅をそろえるため、一覧を5列の grid にし、各行は subgrid でその列を共有する。
        列の幅は全行でいちばん長い内容に合うので、2人目のアイコンの位置が行ごとにずれず、
        カードの幅もこれまでどおり中身で決まる（番号 / 1人目 / × / 2人目 / ハドル）
      */}
      <div
        className="grid gap-y-2"
        style={{ gridTemplateColumns: "repeat(5, auto)" }}
      >
        {schedule.round?.map((pair, pairIndex) => (
          <div
            key={pairIndex}
            className={cn(
              "col-span-5 grid grid-cols-subgrid items-center gap-x-2 p-3 rounded-md",
              // 奇数行だけ面を付けて、組み合わせの区切りをわかりやすくする。
              // お休みの週のカードは背景が muted と同じ明るさなので、奇数行は background にして差を残す
              schedule.isHoliday ? "odd:bg-background" : "odd:bg-muted",
            )}
          >
            <span className="text-right tabular-nums text-muted-foreground text-xs">
              {pairIndex + 1}
            </span>
            <CTScheduleItem user={pair[0]} />
            {pair[1] ? (
              <>
                <span className="text-center text-muted-foreground text-xs">
                  ×
                </span>
                <CTScheduleItem user={pair[1]} />
                {pair[1].slack_u_channel_id && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={`https://app.slack.com/huddle/${process.env.SLACK_WORKSPACE_ID}/${pair[1].slack_u_channel_id}`}
                        className="p-2 rounded-md border pointer justify-self-end"
                      >
                        <Headphones className="w-4 h-4 text-muted-foreground" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>ハドルを開始</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </>
            ) : (
              <>
                {/* × の列は空けて、2人目のアバターと同じ位置・同じ大きさの円に「お休み」を置く */}
                <span />
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-status-rest text-status-rest-foreground">
                    {/* 輪郭の線を足すと三日月の先がなまるので、塗りだけで描いてシャープにする */}
                    <Moon
                      className="h-5 w-5 fill-current"
                      strokeWidth={0}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="text-sm font-bold">お休み</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
