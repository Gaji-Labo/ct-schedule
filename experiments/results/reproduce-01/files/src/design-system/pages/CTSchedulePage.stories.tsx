import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Users } from "lucide-react";
import type { User } from "@/app/actions";
import { CTScheduleCarousel } from "@/components/CTScheduleCarousel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createMember, createMembers, createSchedules } from "@/src/design-system/mocks/ct";
import {
  HeaderStandIn,
  PageError,
  PageFrame,
  PageLoading,
  storyHref,
} from "./PageStandIns";

const MEMBER_PAGE_HREF = storyHref("メンバー一覧");

type Props = {
  members: User[];
  /** ログイン中のユーザー。無ければ未ログイン */
  loginUser?: User;
  /** 表示する週の数 */
  weeks?: number;
};

/** 参加メンバーの人数。押すとメンバー一覧へ移動する（本物は next/link の Link で /member） */
const ParticipantCountLink = ({ count }: { count: number }) => (
  <a
    href={MEMBER_PAGE_HREF}
    target="_top"
    className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline underline-offset-4 hover:no-underline"
  >
    <Users aria-hidden className="size-4 text-muted-foreground" />
    参加メンバー {count}人
  </a>
);

const CTSchedulePage = ({ members, loginUser, weeks = 12 }: Props) => {
  const participants = members.filter((m) => m.participate);
  const schedules = createSchedules(members, weeks);

  return (
    <PageFrame>
      <div className="grid gap-2">
        <HeaderStandIn title="CT組み合わせ表" loginUser={loginUser} />
        <div>
          <ParticipantCountLink count={participants.length} />
        </div>
      </div>
      {schedules.length > 0 ? (
        <CTScheduleCarousel schedules={schedules} />
      ) : (
        <Alert variant="info">
          <Users />
          <AlertTitle>組み合わせを作れません</AlertTitle>
          <AlertDescription>
            CT に参加するメンバーが2人以上になると、組み合わせが表示されます。
          </AlertDescription>
        </Alert>
      )}
    </PageFrame>
  );
};

const meta = {
  title: "Pages/CT組み合わせ表",
  component: CTSchedulePage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "CT組み合わせ表。本番のパスは `/`（アプリのトップページ）。",
          "チームメンバーが週の初めに「今週の相手は誰か」を確かめ、ハドルを始めるために開く。Slack のリンクやブックマークから直接来ることが多い。",
          "",
          "**構成**: `SiteHeader` → ページタイトルとログイン（`Header`）→ 参加メンバーの人数（メンバー一覧へのリンク）→ 週ごとのカード（`CTScheduleCarousel`）。",
          "トップページなのでパンくずは付けない。",
          "",
          "※ ログインボタン・ユーザーメニューは Storybook で動かないため代用品（`PageStandIns.tsx`）を使っている。",
          "組み合わせは本番と同じロジックで、Storybook を開いた日以降の月曜から作る（祝日はモックの `mockHolidays`）。",
        ].join("\n"),
      },
    },
  },
  args: {
    members: createMembers(20),
  },
} satisfies Meta<typeof CTSchedulePage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 未ログイン・参加 20 人（偶数）。右上に Slack ログインボタン */
export const Default: Story = {};

/** ログイン中。右上はユーザーメニュー（アバター） */
export const LoggedIn: Story = {
  args: { loginUser: createMember(0) },
};

/** 参加人数が奇数。毎週1人が「お休み」になる */
export const OddMembers: Story = {
  args: { members: createMembers(7) },
};

/** 参加人数が少ない（2人）。カードが短い */
export const FewMembers: Story = {
  args: { members: createMembers(2) },
};

/** 長い表示名のメンバーが多いとき */
export const LongNames: Story = {
  args: {
    members: createMembers(10).map((m) => ({
      ...m,
      slack_display_name: `${m.slack_display_name}-design-unit-kobe`,
    })),
  },
};

/** 参加メンバーが1人以下で、組み合わせを作れない */
export const NoParticipants: Story = {
  args: { members: [createMember(0), createMember(1, { participate: false })] },
};

/** 読み込み中（本物は app/loading.tsx） */
export const Loading: Story = {
  render: () => <PageLoading />,
};

/** データの取得に失敗した */
export const LoadError: Story = {
  render: () => (
    <PageFrame>
      <HeaderStandIn title="CT組み合わせ表" />
      <PageError message="データベースに接続できませんでした。時間をおいて再読み込みしてください。" />
    </PageFrame>
  ),
};
