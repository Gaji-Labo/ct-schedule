import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Trash2 } from "lucide-react";
import { MemberGroup } from "@/components/MemberGroup";
import { PageHeader, PageLayout } from "@/components/PageLayout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createMembers } from "@/src/design-system/mocks/ct";
import type { User } from "@/app/actions";

/**
 * 削除ボタンの代用品。見た目と確認ダイアログは本物 (DeleteMemberDialog) と同じで、
 * 「削除」を押してもデータは消えない (ダイアログが閉じるだけ)。
 */
const DeleteMemberButton = ({ member }: { member: User }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`${member.slack_display_name} を削除`}
      >
        <Trash2 />
      </Button>
    </DialogTrigger>
    <DialogContent size="confirm">
      <div className="grid gap-5">
        <DialogHeader>
          <DialogTitle>メンバーを削除</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            {member.slack_display_name} を削除しますか？
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">キャンセル</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive">削除</Button>
          </DialogClose>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
);

type PageProps = {
  /** 参加者の人数 */
  participants: number;
  /** 不参加の人数 (メンバー = 参加者 + 不参加 = 社員全員) */
  nonParticipants: number;
  /** ログイン中なら各行の右端に削除ボタンが出る (アプリと同じ条件) */
  signedIn: boolean;
};

/**
 * メンバー一覧ページ（src/app/member/page.tsx）の見た目を、モックデータで再現したもの。
 * 一覧の行 (MemberListItem) は本物を使い、ログインボタンと削除ボタンだけ代用品にしている
 * (本物はサーバーアクションで DB に接続するため)。
 */
const MemberPage = ({ participants, nonParticipants, signedIn }: PageProps) => {
  const members = createMembers(participants, nonParticipants);
  const renderAction = signedIn
    ? // 本物は DeleteMemberDialog (アプリではログイン中だけ表示)
      (member: User) => <DeleteMemberButton member={member} />
    : undefined;

  return (
    <PageLayout>
      <PageHeader
        title="メンバー一覧"
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                {/* Storybook 内では「Pages/CT組み合わせ表」へ移動する (本物は next/link で / へ) */}
                <BreadcrumbLink
                  href="/?path=/story/pages-ct組み合わせ表--default"
                  target="_top"
                >
                  CT組み合わせ表
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>メンバー一覧</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
        // 本物は SigninWithSlackButton / UserDropdown
        actions={signedIn ? null : <Button variant="outline">Sign in with Slack</Button>}
      />
      <MemberGroup
        label="参加"
        members={members.filter((member) => member.participate)}
        emptyText="CTに参加しているメンバーはいません"
        renderAction={renderAction}
      />
      <MemberGroup
        label="不参加"
        members={members.filter((member) => !member.participate)}
        emptyText="不参加のメンバーはいません"
        renderAction={renderAction}
      />
    </PageLayout>
  );
};

const meta = {
  title: "Pages/メンバー一覧",
  component: MemberPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "本番（https://ct-schedule.vercel.app/member）のメンバー一覧ページをモックデータで再現した画面。CT組み合わせ表の「メンバー一覧を見る」のリンク先。Slack 連携で登録された社員全員を「参加」「不参加」に分けて並べる。見出しの「参加（○人）」は CT組み合わせ表の「CTの参加者：○人」と同じ数。",
      },
    },
  },
  argTypes: {
    participants: { control: { type: "range", min: 0, max: 30, step: 1 } },
    nonParticipants: { control: { type: "range", min: 0, max: 30, step: 1 } },
  },
  args: {
    participants: 20,
    nonParticipants: 15,
    signedIn: true,
  },
} satisfies Meta<typeof MemberPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ログイン中。各行の右端に削除ボタンがあり、押すと確認ダイアログが開く */
export const Default: Story = {};

/** ログインしていない状態（削除ボタンは出ない） */
export const SignedOut: Story = {
  args: { signedIn: false },
};

/** メンバーが少ない */
export const FewMembers: Story = {
  args: { participants: 2, nonParticipants: 1 },
};

/** 全員が参加している（不参加は0人） */
export const AllParticipating: Story = {
  args: { nonParticipants: 0 },
};
