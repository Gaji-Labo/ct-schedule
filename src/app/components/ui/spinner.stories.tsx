import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./badge";
import { Button } from "./button";
import { Spinner } from "./spinner";

/**
 * 元: shadcn-storybook-registry (radix/spinner-story) を DESIGN.md に合わせて調整
 * (元の Story が使う Item / Empty / InputGroup はこのリポジトリに無いため、既存部品の例に置き換えた)
 */
const meta = {
  title: "UI/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "処理中であることを示すインジケーター。色は親の文字色を引き継ぐ。",
          "",
          "**使い方**",
          "- ボタンの送信中: `Button` を `disabled` にし、`Spinner` と「保存中…」のような文言を並べる",
          "- 一覧の読み込み中: 領域の中央に `Spinner` と `text-sm text-muted-foreground` の説明を置く",
          "- 短い処理（1秒未満）では出さない。ちらつきの原因になる",
          "",
          "既定の大きさは `size-4`（16px）。読み上げ用に `aria-label` を付けている。",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 送信中のボタン。押せないよう `disabled` にする */
export const WithButton: Story = {
  render: (args) => (
    <Button disabled>
      <Spinner {...args} />
      保存中…
    </Button>
  ),
};

/** バッジの中で使う例 */
export const WithBadge: Story = {
  render: (args) => (
    <Badge variant="secondary" className="gap-1">
      <Spinner {...args} />
      同期中
    </Badge>
  ),
};

/** 一覧などの読み込み中 */
export const Loading: Story = {
  render: (args) => (
    <div className="flex w-80 flex-col items-center gap-2 rounded-lg border p-8">
      <Spinner {...args} />
      <p className="text-sm text-muted-foreground">組み合わせを読み込んでいます</p>
    </div>
  ),
};
