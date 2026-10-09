import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LogOut, Pencil } from "lucide-react";
import { expect, userEvent, within } from "storybook/test";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

/**
 * 元: shadcn-storybook-registry (radix/dropdown-menu-story) を DESIGN.md に合わせて調整
 */
const meta = {
  title: "UI/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "ボタンを押すと開くメニュー。ヘッダーのユーザーメニューなど、普段は隠しておいてよい操作をまとめる。",
          "",
          "**使い方**",
          "- トリガーは `DropdownMenuTrigger asChild` で `Button`（アイコンのみなら `aria-label` 必須）やアバターを包む",
          "- 見出しは `DropdownMenuLabel`、まとまりの区切りは `DropdownMenuSeparator`",
          "- 項目にアイコンを付けるときは文言の前に置く（大きさ・間隔は部品側で揃う）",
          "- 画面右端のトリガーは `DropdownMenuContent align=\"end\"` にする",
          "",
          "**使い分け**: フォームの値を選ぶなら `Select`。画面の主要な操作はメニューに隠さず `Button` で見せる。",
        ].join("\n"),
      },
    },
  },
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="ユーザーメニュー">
          <Avatar size="sm">
            <AvatarImage src="" alt="山田のアイコン" />
            <AvatarFallback>山</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>山田</DropdownMenuLabel>
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

/** ヘッダーのユーザーメニュー（アプリでの使い方） */
export const UserMenu: Story = {};

/** 開いた状態（表示確認用） */
export const Opened: Story = {
  args: { defaultOpen: true },
};

/** 表示の切り替えなど、オン・オフを持つ項目 */
export const WithCheckboxes: Story = {
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">表示</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        <DropdownMenuLabel>表示する情報</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked>祝日名</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>不参加のメンバー</DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** 並び順など、1つだけ選ぶ項目 */
export const WithRadioItems: Story = {
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">並び順</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        <DropdownMenuLabel>並び順</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value="employeeNumber">
          <DropdownMenuRadioItem value="employeeNumber">社員番号順</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="name">名前順</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const ShouldOpenMenu: Story = {
  name: "トリガーを押すとメニューが開く",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, step }) => {
    const body = within(canvasElement.ownerDocument.body);

    await step("メニューを開く", async () => {
      await userEvent.click(await body.findByRole("button", { name: "ユーザーメニュー" }));
      await expect(await body.findByRole("menu")).toBeInTheDocument();
    });

    await expect(await body.findAllByRole("menuitem")).toHaveLength(2);
  },
};
