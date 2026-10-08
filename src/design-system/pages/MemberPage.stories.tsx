import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Trash2 } from "lucide-react";
import { Fragment } from "react";
import { MemberListItem } from "@/components/MemberListItem";
import { SiteHeader } from "@/components/SiteHeader";
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
import { Separator } from "@/components/ui/separator";
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
    <DialogContent className="sm:max-w-md">
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
  /** 参加者の人数 (このほかに不参加が1人いる) */
  participants: number;
  /** ログイン中なら各行の右端に削除ボタンが出る (アプリと同じ条件) */
  signedIn: boolean;
};

/**
 * メンバー一覧ページ（src/app/member/page.tsx）の見た目を、モックデータで再現したもの。
 * 一覧の行 (MemberListItem) は本物を使い、ログインボタンと削除ボタンだけ代用品にしている
 * (本物はサーバーアクションで DB に接続するため)。
 */
const MemberPage = ({ participants, signedIn }: PageProps) => {
  const members = createMembers(participants);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid max-w-7xl gap-10 p-10">
        <div className="grid gap-2">
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
          <div className="flex items-center justify-between gap-10">
            <h1 className="text-2xl font-bold">メンバー一覧</h1>
            {/* 本物は SigninWithSlackButton / UserDropdown */}
            {signedIn ? null : (
              <Button variant="outline">Sign in with Slack</Button>
            )}
          </div>
        </div>
        <section className="grid gap-3">
          {members.map((member) => (
            <Fragment key={member.id}>
              <MemberListItem
                member={member}
                action={
                  // 本物は DeleteMemberDialog (アプリではログイン中だけ表示)
                  signedIn && <DeleteMemberButton member={member} />
                }
              />
              <Separator />
            </Fragment>
          ))}
        </section>
      </main>
    </>
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
          "本番（https://ct-schedule.vercel.app/member）のメンバー一覧ページをモックデータで再現した画面。CT組み合わせ表の「現在のメンバー：○人」のリンク先。",
      },
    },
  },
  argTypes: {
    participants: { control: { type: "range", min: 0, max: 30, step: 1 } },
  },
  args: {
    participants: 20,
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
  args: { participants: 2 },
};
