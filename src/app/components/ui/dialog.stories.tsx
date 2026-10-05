import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Trash2 } from "lucide-react";
import { expect, screen, waitFor } from "storybook/test";
import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "UI/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "画面の上に重ねるモーダル。確認（削除など）と、短い入力フォームに使う。",
          "",
          "**組み立て方**",
          "- `DialogHeader` に `DialogTitle`（必須）と、必要なら `DialogDescription` を置く",
          "- `DialogFooter` は右から「主要アクション → キャンセル」の順になるよう、キャンセルを先に書く",
          "- 取り消せない操作の実行ボタンは `variant=\"destructive\"`、キャンセルは `variant=\"outline\"` を `DialogClose` で包む",
          "- フォームにするときは `DialogContent` 直下を `<form className=\"grid gap-5\">` にする",
          "- 閉じたときに入力をクリアする（CLAUDE.md「Dialog 管理」）",
          "",
          "開閉状態は `useState` で持ち、送信成功時に閉じてから `toast` を出す。",
        ].join("\n"),
      },
    },
  },
  args: { defaultOpen: true },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 削除の確認 */
export const Confirm: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="山田 太郎 を削除">
          <Trash2 />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>メンバーを削除</DialogTitle>
          <DialogDescription>山田 太郎 を削除しますか？</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">キャンセル</Button>
          </DialogClose>
          <Button variant="destructive">削除</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/** 入力フォーム */
export const Form: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button>プロフィール編集</Button>
      </DialogTrigger>
      <DialogContent>
        <form className="grid gap-5" onSubmit={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>プロフィール編集</DialogTitle>
            <DialogDescription>
              CT表に表示される名前を変更できます
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="displayName">名前</Label>
            <Input id="displayName" defaultValue="山田 太郎" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">キャンセル</Button>
            </DialogClose>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  ),
};

/** トリガーを押して開き、キャンセルで閉じる */
export const OpenAndClose: Story = {
  args: { defaultOpen: false },
  render: Confirm.render,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "山田 太郎 を削除" }),
    );
    const dialog = await screen.findByRole("dialog");
    await expect(dialog).toHaveTextContent("山田 太郎 を削除しますか？");
    await userEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    // 閉じるアニメーション中も DOM に残るため、要素が消えるかではなく状態で判定する
    await waitFor(() =>
      expect(dialog).toHaveAttribute("data-state", "closed"),
    );
  },
};
