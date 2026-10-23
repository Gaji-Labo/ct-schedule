import { User } from "@/app/actions";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { MyPair } from "@/src/utils/member";
import { Headphones } from "lucide-react";

const HuddleLink = ({ partner }: { partner: User }) =>
  partner.slack_u_channel_id ? (
    <a
      href={`https://app.slack.com/huddle/${process.env.SLACK_WORKSPACE_ID}/${partner.slack_u_channel_id}`}
      className="flex items-center gap-2 px-3 py-2 rounded-md border text-sm ml-auto"
    >
      <Headphones className="w-4 h-4 text-gray-500" />
      ハドルを開始
    </a>
  ) : null;

const PairStatus = ({ pair }: { pair: MyPair }) => {
  if (pair.isHoliday) {
    return (
      <Badge className="bg-gray-400 rounded-full shadow-none hover:bg-gray-400">
        {pair.holidayName ?? "祝日"}
      </Badge>
    );
  }
  if (!pair.partner) {
    return (
      <Badge className="bg-gray-400 rounded-full shadow-none hover:bg-gray-400">
        お休み
      </Badge>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <UserAvatar user={pair.partner} size="sm" />
      <span className="font-medium text-sm">
        {pair.partner.slack_display_name}
      </span>
    </div>
  );
};

type Props = {
  pairs: MyPair[];
};

export const MyPairList = ({ pairs }: Props) => {
  if (pairs.length === 0) {
    return <p className="text-gray-500">CTに参加していません</p>;
  }

  const [current, ...upcoming] = pairs;

  return (
    <div className="grid gap-6">
      <div className="border-2 border-gray-400 rounded-lg p-6 shadow-sm grid gap-4">
        <time dateTime={current.date} className="text-lg font-semibold">
          {current.date}
        </time>
        {current.partner ? (
          <div className="flex items-center gap-3">
            <UserAvatar user={current.partner} size="lg" />
            <span className="text-xl font-bold">
              {current.partner.slack_display_name}
            </span>
            <HuddleLink partner={current.partner} />
          </div>
        ) : (
          <PairStatus pair={current} />
        )}
      </div>
      {upcoming.length > 0 && (
        <ul className="grid gap-2">
          {upcoming.map((pair) => (
            <li
              key={pair.date}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-md"
            >
              <time dateTime={pair.date} className="text-sm text-gray-500 w-28">
                {pair.date}
              </time>
              <PairStatus pair={pair} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
