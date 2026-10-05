import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";
import { Spinner } from "./spinner";

const meta = {
  title: "UI/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "読み込み中の表示。`role=\"status\"` を持つので、スクリーンリーダーにも伝わる。",
          "",
          "- ページ全体の読み込み: `size-8` で画面中央に置く（`app/loading.tsx`）",
          "- ボタンの送信中: Button の中に既定サイズで置き、Button を `disabled` にする",
          "",
          "色は親のテキスト色（`currentColor`）を引き継ぐ。",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Spinner {...args} />
      <Spinner {...args} className="size-6" />
      <Spinner {...args} className="size-8" />
    </div>
  ),
};

/** 送信中のボタン */
export const InButton: Story = {
  render: (args) => (
    <Button disabled>
      <Spinner {...args} />
      保存中
    </Button>
  ),
};

export const MutedColor: Story = {
  render: (args) => (
    <div className="text-muted-foreground">
      <Spinner {...args} className="size-6" />
    </div>
  ),
};
