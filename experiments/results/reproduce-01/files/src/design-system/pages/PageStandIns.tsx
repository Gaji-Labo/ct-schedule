/**
 * 画面の Story で使う代用品と、ページの骨組み。
 *
 * Slack 認証・サーバーアクションにつながる部品は Storybook で動かないので、
 * 見た目が同じものをここに置く。本物はそれぞれのコメントに書いたコンポーネント。
 */
import type { User } from "@/app/actions";
import { SiteHeader } from "@/components/SiteHeader";
import { UserAvatar } from "@/components/UserAvatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { Toaster } from "@/components/ui/sonner";
import { CircleAlert, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/** Storybook 内で別の画面の Story へ移動するリンク先 */
export const storyHref = (pageName: string) =>
  `/?path=/story/pages-${pageName}--default`;

/**
 * 「Sign in with Slack」ボタンの代用品。本物は SigninWithSlackButton（サーバーアクションで signIn する）。
 * 本物はパレット色の直書きが残っている（既知の違反）ため、見た目は Button の outline で揃えている。
 */
export const SigninWithSlackButtonStandIn = () => (
  <Button variant="outline">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 122.8 122.8"
      aria-hidden
    >
      <path
        d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z"
        fill="#e01e5a"
      />
      <path
        d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z"
        fill="#36c5f0"
      />
      <path
        d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z"
        fill="#2eb67d"
      />
      <path
        d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z"
        fill="#ecb22e"
      />
    </svg>
    Sign in with Slack
  </Button>
);

/**
 * ログイン中のユーザーメニューの代用品。本物は UserDropdown（編集はサーバーアクション、ログアウトは next-auth）。
 * 「編集」のダイアログは省いている。
 */
export const UserDropdownStandIn = ({ user }: { user: User }) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      aria-label={`${user.slack_display_name} のメニュー`}
      className="rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <UserAvatar user={user} />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>{user.slack_display_name}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>編集</DropdownMenuItem>
      <DropdownMenuItem>ログアウト</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

/**
 * ページタイトルとログイン状態の行。本物は Header（Slack の uチャンネル一覧を取得する async コンポーネント）。
 * loginUser を渡すとユーザーメニュー、渡さないとログインボタンを出す。
 */
export const HeaderStandIn = ({
  title,
  loginUser,
}: {
  title: string;
  loginUser?: User;
}) => (
  <div className="flex items-center justify-between gap-10">
    <h1 className="text-2xl font-bold">{title}</h1>
    {loginUser ? (
      <UserDropdownStandIn user={loginUser} />
    ) : (
      <SigninWithSlackButtonStandIn />
    )}
  </div>
);

/**
 * メンバー削除ボタンと確認ダイアログの代用品。本物は DeleteMemberDialog（deleteUser を呼ぶ）。
 * 「削除」を押すとダイアログを閉じて完了の toast を出す（実際には消えない）。
 */
export const DeleteMemberDialogStandIn = ({ member }: { member: User }) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <form
          className="grid gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
            toast.success(`${member.slack_display_name} を削除しました`);
          }}
        >
          <DialogHeader>
            <DialogTitle>メンバーを削除</DialogTitle>
          </DialogHeader>
          <p className="text-sm">
            {member.slack_display_name} を削除しますか？
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">キャンセル</Button>
            </DialogClose>
            <Button type="submit" variant="destructive">
              削除
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/** SiteHeader → main の骨組み。main の幅と左右の余白は SiteHeader の中身（max-w-7xl px-10）に揃える */
export const PageFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background text-foreground">
    <SiteHeader />
    <main className="mx-auto grid max-w-7xl gap-8 px-10 py-10">
      {children}
    </main>
    {/* 本物は layout.tsx に置いている */}
    <Toaster position="top-center" />
  </div>
);

/** 読み込み中。本物は app/loading.tsx（画面中央に Spinner） */
export const PageLoading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <Spinner className="size-8" />
  </div>
);

/** 取得に失敗したとき。本物は app/error.tsx（エラーメッセージとリトライ） */
export const PageError = ({ message }: { message: string }) => (
  <div className="grid gap-4">
    <Alert variant="destructive">
      <CircleAlert />
      <AlertTitle>データを読み込めませんでした</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
    <div>
      <Button variant="outline">再読み込み</Button>
    </div>
  </div>
);
