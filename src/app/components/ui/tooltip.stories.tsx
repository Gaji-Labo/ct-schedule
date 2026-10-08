import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Headphones } from "lucide-react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

/**
 * 元: shadcn-storybook-registry (radix/tooltip-story) を DESIGN.md に合わせて調整
 */
const meta = {
  title: "UI/Tooltip",
  component: TooltipContent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "ホバー・フォーカス時に短い補足を出すポップアップ。",
          "",
          "**使い方**",
          "- アイコンだけのボタンに、何をするボタンかを示すために使う（例: ハドルを開始）",
          "- トリガーは `Button` などフォーカスできる要素にし、`TooltipTrigger asChild` で包む",
          "- 文言は短く1行で。操作に必須の情報は Tooltip に入れない（タッチ端末では見えない）",
          "",
          "`TooltipProvider` はアプリ全体（`layout.tsx`）と Storybook の preview で包んでいるため、個別に書かない。",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    side: {
      control: "radio",
      options: ["top", "bottom", "left", "right"],
      table: { defaultValue: { summary: "top" } },
    },
    children: { control: "text" },
  },
  args: {
    side: "top",
    children: "ハドルを開始",
  },
  render: (args) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" aria-label="ハドルを開始">
          <Headphones />
        </Button>
      </TooltipTrigger>
      <TooltipContent {...args} />
    </Tooltip>
  ),
} satisfies Meta<typeof TooltipContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 上に余白が無いときは下に出す */
export const Bottom: Story = {
  args: { side: "bottom" },
};

export const Left: Story = {
  args: { side: "left" },
};

export const Right: Story = {
  args: { side: "right" },
};

export const ShouldShowOnHover: Story = {
  name: "ホバーで表示され、Esc で消える",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, step }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await body.findByRole("button", { name: "ハドルを開始" });

    await step("ホバーする", async () => {
      await userEvent.hover(trigger);
      await waitFor(() =>
        expect(
          canvasElement.ownerDocument.body.querySelector(
            "[data-radix-popper-content-wrapper]",
          ),
        ).toBeVisible(),
      );
    });

    await step("Esc で閉じる", async () => {
      await userEvent.keyboard("{Escape}");
      await waitFor(() =>
        expect(
          canvasElement.ownerDocument.body.querySelector(
            "[data-radix-popper-content-wrapper]",
          ),
        ).toBeNull(),
      );
    });
  },
};
