import { GitPullRequest, MessageSquare } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { IssueLabel, type IssueLabelData } from "@/components/IssueLabel";
import { IssueStateIcon, type IssueState } from "@/components/IssueStateIcon";
import { UserAvatar } from "@/components/UserAvatar";

export type IssueUser = {
  slack_user_id: string;
  slack_display_name: string;
  slack_image: string;
};

export type Issue = {
  number: number;
  title: string;
  state: IssueState;
  labels: IssueLabelData[];
  /** 作成者のユーザー名 */
  author: string;
  createdAt: Date;
  /** クローズの Issue だけ */
  closedBy?: string;
  closedAt?: Date;
  comments: number;
  /** 紐づくプルリクエストの数 */
  linkedPullRequests: number;
  assignees: IssueUser[];
};

const dateFormat = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** 2026/11/03 の形 */
export const formatDate = (date: Date) => dateFormat.format(date);

/** 題名の `...` で囲んだところをコードとして出す（コマンド名など） */
const renderTitle = (title: string): ReactNode =>
  title.split(/(`[^`]+`)/).map((part, i) =>
    part.startsWith("`") && part.endsWith("`") && part.length > 2 ? (
      <code key={i} className="rounded-md bg-muted px-1 font-mono text-xs">
        {part.slice(1, -1)}
      </code>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );

type Props = {
  issue: Issue;
  /** Issue の詳細の URL */
  href: string;
  /** 絞り込んだ一覧の URL を作る（例: `label:bug` → `/issues?q=...`） */
  filterHref: (qualifier: string) => string;
};

/** 値に空白を含むときは "" で囲む（label:"good first issue"） */
const qualifier = (key: string, value: string) =>
  `${key}:${/\s/.test(value) ? `"${value}"` : value}`;

/**
 * Issue 一覧の1行。
 * 左から 状態アイコン → 題名・ラベル（1行目）と番号・作成者・日時（2行目）→ 右端にプルリクエスト数・担当者・コメント数。
 * 題名だけを詳細へのリンクにし、作成者とラベルはそれぞれ絞り込みのリンクにする（行全体をリンクにしない）。
 * プルリクエスト・担当者・コメントは、無いときは出さない。
 */
export const IssueListItem = ({ issue, href, filterHref }: Props) => {
  const closed = issue.state !== "open";
  const authorLink = (name: string) => (
    <a href={filterHref(qualifier("author", name))} className="font-medium hover:underline">
      {name}
    </a>
  );

  const hasMeta = issue.linkedPullRequests > 0 || issue.assignees.length > 0 || issue.comments > 0;
  const meta = (
    <>
      {issue.linkedPullRequests > 0 && (
        <span className="flex items-center gap-1 pt-0.5">
          <GitPullRequest aria-hidden className="size-4" />
          <span className="sr-only">紐づくプルリクエスト</span>
          {issue.linkedPullRequests}
        </span>
      )}
      {issue.assignees.length > 0 && (
        <div className="flex -space-x-2">
          <span className="sr-only">
            担当者: {issue.assignees.map((user) => user.slack_display_name).join("、")}
          </span>
          {issue.assignees.slice(0, 3).map((user) => (
            <span key={user.slack_user_id} aria-hidden className="rounded-full ring-2 ring-background">
              <UserAvatar user={user} size="sm" />
            </span>
          ))}
          {issue.assignees.length > 3 && (
            <span aria-hidden className="pl-3 pt-1.5">
              +{issue.assignees.length - 3}
            </span>
          )}
        </div>
      )}
      {issue.comments > 0 && (
        <span className="flex items-center gap-1 pt-0.5">
          <MessageSquare aria-hidden className="size-4" />
          <span className="sr-only">コメント</span>
          {issue.comments}
        </span>
      )}
    </>
  );

  return (
    <div className="flex gap-3 px-4 py-3">
      <IssueStateIcon state={issue.state} className="pt-0.5" />
      <div className="grid min-w-0 flex-1 grid-cols-1 gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <a
            href={href}
            className="min-w-0 break-words text-sm font-semibold leading-relaxed hover:underline"
          >
            {renderTitle(issue.title)}
          </a>
          {issue.labels.map((label) => (
            <IssueLabel key={label.name} label={label} href={filterHref(qualifier("label", label.name))} />
          ))}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          #{issue.number} · {authorLink(issue.author)} が {formatDate(issue.createdAt)} に作成
          {closed && issue.closedBy && issue.closedAt && (
            <>
              {" "}· {issue.closedBy} が {formatDate(issue.closedAt)} に閉じた
            </>
          )}
        </p>
        {hasMeta && (
          <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground md:hidden">{meta}</div>
        )}
      </div>
      {/* md 以上は行の右端、スマホ幅では題名が細くならないよう2行目の下に出す */}
      <div className="hidden shrink-0 items-start gap-4 text-xs text-muted-foreground md:flex">{meta}</div>
    </div>
  );
};
