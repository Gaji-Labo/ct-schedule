import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./badge";

/**
 * 元: shadcn-storybook-registry (radix/badge-story) を docs/design/rules.md に合わせて調整
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
          "- `default`: 目立たせたい状態（新着など）",
          "- `secondary`: 控えめな補足情報",
          "- `destructive`: エラー・要対応の状態",
          "- `outline`: 面を持たせず、文字と枠だけで示したいとき",
          "- `info` / `success` / `warning`: 状態の色付きパターン（Alert・toast と同じ `feedback-*` トークン）。例: 有効 = `success`、未設定 = `warning`",
          "",
          "**アプリ固有の状態ラベル**",
          "既存の variant に合う色が無いときは、className で色を上書きせず、Badge に variant を追加してから使う（className での上書きは禁止事項）。",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "info", "success", "warning"],
      description: "見た目の種類。用途に応じて選ぶ",
      table: { defaultValue: { summary: "default" } },
    },
    children: { control: "text", description: "ラベルの文言（短く）" },
  },
  args: {
    variant: "default",
    children: "新着",
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
  args: { variant: "secondary", children: "下書き" },
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
  args: { variant: "secondary", children: "承認待ち（差し戻しあり）" },
};

/** 状態の色付きパターン（Alert・toast と同じ色） */
export const StatusColors: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge {...args} variant="info">お知らせ</Badge>
      <Badge {...args} variant="success">有効</Badge>
      <Badge {...args} variant="warning">未設定</Badge>
      <Badge {...args} variant="destructive">エラー</Badge>
    </div>
  ),
};
