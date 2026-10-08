import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Trash2 } from "lucide-react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
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

/**
 * 元: shadcn-storybook-registry (radix/dialog-story) を DESIGN.md に合わせて調整
 */
const meta = {
  title: "UI/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "画面の上に重ねて、確認や入力を求めるモーダル。",
          "",
          "**使い分け**",
          "- 削除など取り消せない操作の確認 → 実行ボタンは `Button variant=\"destructive\"`",
          "- 短いフォーム（メンバー追加・プロフィール編集など）→ 実行ボタンは `Button variant=\"default\"`",
          "- 結果を知らせるだけなら Dialog ではなく `toast` を使う",
          "",
          "**構成のルール**",
          "- `DialogHeader` に `DialogTitle`（必須）と、必要なら `DialogDescription`",
          "- `DialogFooter` は右寄せで「キャンセル（`outline`）→ 実行」の順。キャンセルは `DialogClose asChild` で `Button` を包む",
          "- トリガーも `DialogTrigger asChild` で `Button` を包む（素の `<button>` にしない）",
          "- 幅は既定（`max-w-lg`）を使う。`sm:max-w-[425px]` のような任意値は使わない",
        ].join("\n"),
      },
    },
  },
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Trash2 />
          メンバーを削除
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>メンバーを削除</DialogTitle>
          <DialogDescription>
            山田 を削除しますか？この操作は取り消せません。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">キャンセル</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive">削除</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 削除の確認。取り消せない操作は必ず確認を挟む */
export const Confirm: Story = {};

/** 短いフォームを載せる例（プロフィール編集） */
export const WithForm: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button>プロフィールを編集</Button>
      </DialogTrigger>
      <DialogContent>
        <form className="grid gap-6" onSubmit={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>プロフィール編集</DialogTitle>
            <DialogDescription>CT の組み合わせ表に表示される情報です。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName">名前</Label>
              <Input id="displayName" defaultValue="山田" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="employeeNumber">社員番号</Label>
              <Input id="employeeNumber" type="number" defaultValue="1234" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="participate" defaultChecked />
              <Label htmlFor="participate">CTに参加する</Label>
            </div>
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

/** 開いた状態（表示確認用） */
export const Opened: Story = {
  args: { defaultOpen: true },
};

export const ShouldCloseWithCancel: Story = {
  name: "キャンセルで閉じる",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, step }) => {
    const body = within(canvasElement.ownerDocument.body);

    await step("開く", async () => {
      await userEvent.click(await body.findByRole("button", { name: "メンバーを削除" }));
      await expect(await body.findByRole("dialog")).toHaveAttribute("data-state", "open");
    });

    await step("キャンセルで閉じる", async () => {
      await userEvent.click(await body.findByRole("button", { name: "キャンセル" }));
      await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    });
  },
};

export const ShouldCloseWithCross: Story = {
  name: "右上の × で閉じる",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, step }) => {
    const body = within(canvasElement.ownerDocument.body);

    await step("開く", async () => {
      await userEvent.click(await body.findByRole("button", { name: "メンバーを削除" }));
      await expect(await body.findByRole("dialog")).toBeInTheDocument();
    });

    await step("× で閉じる", async () => {
      await userEvent.click(await body.findByRole("button", { name: /close/i }));
      await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    });
  },
};
