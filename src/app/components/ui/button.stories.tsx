import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Plus, Trash2 } from "lucide-react";
import { fn } from "storybook/test";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "ユーザーの操作を受け付けるボタン。`<button>` を自作せず、必ずこのコンポーネントを使う。",
          "",
          "**variant の選び方**",
          "- `default`: 画面の主要アクション（保存・追加など）。1画面・1ダイアログに1つが目安",
          "- `outline`: 主要アクションと並ぶ副次アクション（キャンセルなど）",
          "- `secondary`: 目立たせたくないが面として見せたいアクション",
          "- `ghost`: ツールバーやヘッダー内のアイコンボタン",
          "- `destructive`: 削除など取り消せない操作。確認ダイアログの実行ボタンに使う",
          "- `link`: 文中のテキストリンク風の操作",
          "",
          "**size の選び方**: 通常は `default`。表の行内など狭い場所は `sm`、アイコンのみは `icon`（`aria-label` 必須）。",
          "",
          "リンクとして使うときは `asChild` で `<a>` / `next/link` を包む。",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      description: "見た目の種類。用途に応じて選ぶ",
      table: { defaultValue: { summary: "default" } },
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
      description: "大きさ。`icon` はアイコンのみのボタン用",
      table: { defaultValue: { summary: "default" } },
    },
    asChild: {
      control: "boolean",
      description: "子要素 (`<a>` など) をボタンとして描画する",
    },
    disabled: { control: "boolean" },
    children: { control: "text" },
  },
  args: {
    children: "メンバーを追加",
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controls で variant / size を切り替えて確認できる */
export const Playground: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Button {...args} variant="default">default</Button>
      <Button {...args} variant="outline">outline</Button>
      <Button {...args} variant="secondary">secondary</Button>
      <Button {...args} variant="ghost">ghost</Button>
      <Button {...args} variant="destructive">destructive</Button>
      <Button {...args} variant="link">link</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Button {...args} size="sm">sm</Button>
      <Button {...args} size="default">default</Button>
      <Button {...args} size="lg">lg</Button>
      <Button {...args} size="icon" aria-label="追加">
        <Plus />
      </Button>
    </div>
  ),
};

/** アイコンは children に並べるだけでよい（サイズと間隔は Button 側で揃う） */
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Plus />
        メンバーを追加
      </>
    ),
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

/** 確認ダイアログのフッターでの典型的な組み合わせ */
export const DialogActions: Story = {
  render: (args) => (
    <div className="flex justify-end gap-2">
      <Button {...args} variant="outline">キャンセル</Button>
      <Button {...args} variant="destructive">
        <Trash2 />
        削除する
      </Button>
    </div>
  ),
};

export const AsLink: Story = {
  args: {
    asChild: true,
    variant: "outline",
    children: <a href="#">メンバー管理へ</a>,
  },
};
