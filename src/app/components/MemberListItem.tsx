import type { User } from "@/app/actions";
import { UserAvatar } from "@/components/UserAvatar";

type Props = {
  member: Pick<User, "slack_display_name" | "slack_image" | "participate"> &
    Partial<Pick<User, "slack_user_id">>;
  /** 行の右端に置く操作 (削除ボタンなど)。ログイン中だけ渡す */
  action?: React.ReactNode;
};

/**
 * メンバー一覧の1行。アバター・名前・参加状態を表示する
 */
export const MemberListItem = ({ member, action }: Props) => (
  <div className="flex items-center justify-between gap-3 px-3">
    <div className="flex items-center gap-2">
      <UserAvatar user={member} />
      <span className="font-semibold">{member.slack_display_name}</span>
      <div className="flex items-center gap-1 text-sm">
        <span
          aria-hidden
          className={`h-2 w-2 rounded-full ${member.participate ? "bg-success" : "bg-border"}`}
        />
        {member.participate ? "参加" : "不参加"}
      </div>
    </div>
    {action}
  </div>
);
