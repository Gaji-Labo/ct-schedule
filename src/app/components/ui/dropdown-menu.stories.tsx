import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LogOut, Pencil } from "lucide-react";
import { expect, fn, screen } from "storybook/test";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const meta = {
  title: "UI/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "ボタンから開くメニュー。ヘッダーのユーザーメニューのように、普段は隠しておきたい操作をまとめる。",
          "",
          "- 先頭に `DropdownMenuLabel` で「誰の・何のメニューか」を書き、`DropdownMenuSeparator` で区切る",
          "- 項目の文言は動詞で書く（編集、ログアウト）",
          "- 項目からダイアログを開くときは `onSelect` で `e.preventDefault()` してからダイアログを開く（`UserDropdown` 参照）",
          "- 右端に置くトリガーでは `DropdownMenuContent` に `align=\"end\"` を付ける",
        ].join("\n"),
      },
    },
  },
  args: { onOpenChange: fn() },
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">メニュー</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>山田 太郎</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Pencil />
          編集
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LogOut />
          ログアウト
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 開いた状態 */
export const Open: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "メニュー" }));
    await expect(await screen.findByRole("menu")).toBeInTheDocument();
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);
  },
};

/** ON / OFF を切り替える項目と、選べない項目 */
export const CheckboxAndDisabled: Story = {
  render: (args) => (
    <DropdownMenu {...args} defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">表示設定</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem checked>
          不参加のメンバーも表示
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={false}>
          祝日の週を隠す
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>CSV で書き出す（準備中）</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
