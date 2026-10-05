import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Separator } from "./separator";

const meta = {
  title: "UI/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "内容の区切り線。色は `border` トークン。",
          "",
          "リストの行間を区切る用途（メンバー一覧など）に使う。区切りたいだけなら余白（`gap`）で足りないかを先に考える。",
          "既定は装飾扱い（`decorative`）で、スクリーンリーダーには読まれない。",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: (args) => (
    <div className="grid w-80 gap-3 text-sm">
      <span>山田 太郎</span>
      <Separator {...args} />
      <span>佐藤 花子</span>
      <Separator {...args} />
      <span>鈴木 一郎</span>
    </div>
  ),
};

/** 横並びの要素を区切る。親に高さが必要 */
export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div className="flex h-5 items-center gap-3 text-sm">
      <span>編集</span>
      <Separator {...args} />
      <span>ログアウト</span>
    </div>
  ),
};
