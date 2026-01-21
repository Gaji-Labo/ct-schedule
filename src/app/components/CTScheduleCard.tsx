import { Badge } from "@/components/ui/badge";
import { CT } from "@/src/utils/member";

type Props = {
  schedule: CT;
  index: number;
};

export const CTScheduleCard = ({ schedule, index }: Props) => {
  return (
    <div
      className={`border rounded-lg p-4 shadow-sm flex-shrink-0 min-w-[300px] ${
        index === 0 && "border-2 border-gray-400"
      }`}
    >
      <h2 className="text-lg font-semibold mb-4 text-center">
        <time dateTime={schedule.date}>{schedule.date}</time>
      </h2>
      <div className="flex flex-col gap-2">
        {schedule.round.map((pair, pairIndex) => (
          <div
            key={pairIndex}
            className="flex items-center gap-2 p-3 bg-gray-50 rounded-md"
          >
            <span className="text-gray-400 text-xs">{pairIndex + 1}</span>
            <span className="font-medium text-sm">{pair[0].slack_display_name}</span>
            {pair[1] ? (
              <>
                <span className="text-gray-400 text-xs">×</span>
                <span className="font-medium text-sm">{pair[1].slack_display_name}</span>
              </>
            ) : (
              <Badge className="bg-gray-400 rounded-full shadow-none hover:bg-gray-400">
                お休み
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
