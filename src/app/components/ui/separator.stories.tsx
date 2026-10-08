import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Separator } from "./separator";

/**
 * 元: shadcn-storybook-registry (radix/separator-story) を DESIGN.md に合わせて調整
 */
const meta = {
  title: "UI/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "内容のまとまりを区切る線。色は `border` トークン。`<hr>` や `border-b` を自作せず、この部品を使う。",
          "",
          "**orientation の選び方**: 縦に並ぶ要素の間は `horizontal`（既定）、横に並ぶ要素の間は `vertical`（親に高さが必要）。",
          "",
          "区切りすぎると「静かな UI」（デザイン原則）を損なう。まず余白で区切れないかを考える。",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      table: { defaultValue: { summary: "horizontal" } },
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 縦に並ぶ内容の区切り */
export const Horizontal: Story = {
  render: (args) => (
    <div className="w-80">
      <div className="grid gap-1">
        <h2 className="text-lg font-semibold">メンバー一覧</h2>
        <p className="text-sm text-muted-foreground">
          CTに参加するメンバーを管理します
        </p>
      </div>
      <Separator {...args} orientation="horizontal" className="my-4" />
      <p className="text-sm">参加中 8人 / 不参加 2人</p>
    </div>
  ),
};

/** 横に並ぶ内容の区切り。親に高さ（`h-5` など）を指定する */
export const Vertical: Story = {
  render: (args) => (
    <div className="flex h-5 items-center gap-4 text-sm">
      <span>CT組み合わせ表</span>
      <Separator {...args} orientation="vertical" />
      <span>メンバー一覧</span>
    </div>
  ),
};
