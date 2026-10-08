import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./badge";

/**
 * 元: shadcn-storybook-registry (radix/badge-story) を DESIGN.md に合わせて調整
 */
const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "状態や分類を短く示すラベル。クリックできる要素には使わない（操作は `Button`）。",
          "",
          "**variant の選び方**",
          "- `default`: 目立たせたい状態（新着・今週など）",
          "- `secondary`: 控えめな補足情報",
          "- `destructive`: エラー・要対応の状態",
          "- `outline`: 面を持たせず、文字と枠だけで示したいとき",
          "",
          "**CT 固有のラベル（お休み・祝日名）について**",
          "DESIGN.md では `bg-status-rest text-status-rest-foreground` + `rounded-full` を使うことになっているが、",
          "現状は対応する variant が無く、`CTScheduleCard` で className 上書きしている（既知の違反）。",
          "className での上書きは禁止事項のため、`status` 系の variant を Badge に追加してから使う。",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
      description: "見た目の種類。用途に応じて選ぶ",
      table: { defaultValue: { summary: "default" } },
    },
    children: { control: "text", description: "ラベルの文言（短く）" },
  },
  args: {
    variant: "default",
    children: "今週",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controls で variant を切り替えて確認できる */
export const Playground: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge {...args} variant="default">default</Badge>
      <Badge {...args} variant="secondary">secondary</Badge>
      <Badge {...args} variant="destructive">destructive</Badge>
      <Badge {...args} variant="outline">outline</Badge>
    </div>
  ),
};

/** 控えめな補足情報。リスト行の中などで使う */
export const Secondary: Story = {
  args: { variant: "secondary", children: "不参加" },
};

/** エラーや要対応の状態 */
export const Destructive: Story = {
  args: { variant: "destructive", children: "未設定" },
};

/** 面を持たせたくないときの控えめな表示 */
export const Outline: Story = {
  args: { variant: "outline", children: "管理者" },
};

/** ラベルは短く保つ。長い文言でも折り返さず1行に収まるか確認する */
export const LongText: Story = {
  args: { variant: "secondary", children: "スポーツの日（振替休日）" },
};
