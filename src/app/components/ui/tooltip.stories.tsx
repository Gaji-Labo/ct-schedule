import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Headphones } from "lucide-react";
import { expect, screen } from "storybook/test";
import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "ホバー・フォーカスで出る短い補足説明。アイコンのみのボタンに「何をするか」を添える用途が主。",
          "",
          "- 中身は1行の短い文にする。操作を置かない（ホバーが外れると消えるため）",
          "- タッチ端末では出ないので、操作に必須の情報はここに置かない",
          "- アイコンボタンには Tooltip とは別に `aria-label` も付ける",
          "- `TooltipProvider` はアプリの layout（と Storybook の preview）で包んでいる",
        ].join("\n"),
      },
    },
  },
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" aria-label="ハドルを開始">
          <Headphones />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>ハドルを開始</p>
      </TooltipContent>
    </Tooltip>
  ),
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ボタンにホバーすると表示される */
export const Default: Story = {};

/** 表示された状態 */
export const Open: Story = {
  args: { open: true },
};

/** キーボードでフォーカスしても表示される */
export const OnFocus: Story = {
  play: async ({ userEvent }) => {
    await userEvent.tab();
    await expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "ハドルを開始",
    );
  },
};
