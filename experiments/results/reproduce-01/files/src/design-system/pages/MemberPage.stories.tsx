import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Fragment } from "react";
import type { User } from "@/app/actions";
import { MemberListItem } from "@/components/MemberListItem";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { createMember, createMembers } from "@/src/design-system/mocks/ct";
import {
  DeleteMemberDialogStandIn,
  HeaderStandIn,
  PageError,
  PageFrame,
  PageLoading,
  storyHref,
} from "./PageStandIns";

const TOP_PAGE_HREF = storyHref("ct組み合わせ表");

/** パンくず。本物は BreadcrumbLink asChild で next/link の Link（/）を包む */
const MemberBreadcrumb = () => (
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href={TOP_PAGE_HREF} target="_top">
          CT組み合わせ表
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>メンバー一覧</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
);

type Props = {
  members: User[];
  /** ログイン中のユーザー。無ければ未ログイン */
  loginUser?: User;
};

const MemberPage = ({ members, loginUser }: Props) => (
  <PageFrame>
    <div className="grid gap-2">
      <MemberBreadcrumb />
      <HeaderStandIn title="メンバー一覧" loginUser={loginUser} />
    </div>
    {members.length > 0 ? (
      <div className="grid gap-3">
        {members.map((member, index) => (
          <Fragment key={member.slack_user_id}>
            {index > 0 && <Separator />}
            <MemberListItem
              member={member}
              action={
                loginUser ? <DeleteMemberDialogStandIn member={member} /> : undefined
              }
            />
          </Fragment>
        ))}
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">
        メンバーがいません。Slack でログインすると、メンバーとして追加されます。
      </p>
    )}
  </PageFrame>
);

const meta = {
  title: "Pages/メンバー一覧",
  component: MemberPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "メンバー一覧。本番のパスは `/member`。",
          "CT組み合わせ表の「参加メンバー ○人」から来る。参加メンバーと参加・不参加の状態を確かめ、ログイン中は不要になったメンバーを削除する。",
          "",
          "**構成**: `SiteHeader` → パンくず（CT組み合わせ表へ戻る）→ ページタイトルとログイン（`Header`）→ メンバーの行（`MemberListItem`、行の間に `Separator`）。",
          "",
          "**ログイン状態による違い**",
          "- 未ログイン: 右上に Slack ログインボタン。行に操作は出さない",
          "- ログイン中: 右上はユーザーメニュー（ログインボタンは出さない）。各行の右端に削除ボタンを出し、押すと確認ダイアログを挟む",
          "",
          "※ ログインボタン・ユーザーメニュー・削除ダイアログは Storybook で動かないため代用品（`PageStandIns.tsx`）を使っている。",
        ].join("\n"),
      },
    },
  },
  args: {
    members: createMembers(8),
  },
} satisfies Meta<typeof MemberPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 未ログイン。参加 8 人と不参加 1 人。削除ボタンは出ない */
export const Default: Story = {};

/** ログイン中。各行に削除ボタンが出る（押すと確認ダイアログ） */
export const LoggedIn: Story = {
  args: { loginUser: createMember(0) },
};

/** メンバーが多く、長い表示名が混ざるとき（ログイン中） */
export const ManyMembersWithLongNames: Story = {
  args: {
    loginUser: createMember(0),
    members: createMembers(22).map((m, i) =>
      i % 5 === 1
        ? { ...m, slack_display_name: `${m.slack_display_name}-design-unit-kobe-office` }
        : m,
    ),
  },
};

/** 全員が不参加 */
export const AllNotParticipating: Story = {
  args: {
    members: createMembers(4).map((m) => ({ ...m, participate: false })),
  },
};

/** メンバーが0人 */
export const Empty: Story = {
  args: { members: [] },
};

/** 読み込み中（本物は app/loading.tsx） */
export const Loading: Story = {
  render: () => <PageLoading />,
};

/** データの取得に失敗した */
export const LoadError: Story = {
  render: () => (
    <PageFrame>
      <div className="grid gap-2">
        <MemberBreadcrumb />
        <HeaderStandIn title="メンバー一覧" />
      </div>
      <PageError message="データベースに接続できませんでした。時間をおいて再読み込みしてください。" />
    </PageFrame>
  ),
};
