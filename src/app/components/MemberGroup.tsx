import { Fragment, type ReactNode } from "react";
import type { User } from "@/app/actions";
import { MemberListItem } from "@/components/MemberListItem";
import { PageSection } from "@/components/PageLayout";
import { Separator } from "@/components/ui/separator";

type Props = {
  /** 見出し。人数は自動で付く（例: 「参加」→「参加（20人）」） */
  label: string;
  members: User[];
  /** 0人のときに出す文言 */
  emptyText: string;
  /** 行の右端に置く操作（削除ボタンなど）。ログイン中だけ渡す */
  renderAction?: (member: User) => ReactNode;
};

/**
 * メンバー一覧の1グループ（参加 / 不参加）。見出しに人数を出し、MemberListItem を区切り線つきで並べる。
 * 見出しの人数が、CT組み合わせ表の「CTの参加者：○人」と一致するようにするための部品。
 */
export const MemberGroup = ({ label, members, emptyText, renderAction }: Props) => (
  <PageSection title={`${label}（${members.length}人）`}>
    {members.length === 0 ? (
      <p className="text-sm leading-relaxed text-muted-foreground">{emptyText}</p>
    ) : (
      <div className="grid gap-3">
        {members.map((member) => (
          <Fragment key={member.id}>
            <MemberListItem member={member} action={renderAction?.(member)} />
            <Separator />
          </Fragment>
        ))}
      </div>
    )}
  </PageSection>
);
