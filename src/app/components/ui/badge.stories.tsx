import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "短い状態ラベル。操作はできない（クリックさせたいときは `Button` を使う）。",
          "",
          "**variant の選び方**",
          "- `default`: 目立たせたい状態",
          "- `secondary`: 控えめな状態・補足情報",
          "- `outline`: 背景を塗りたくない場所での分類ラベル",
          "- `destructive`: エラー・危険な状態",
          "",
          "「お休み」「祝日名」は `bg-status-rest text-status-rest-foreground` のトークンを使う（DESIGN.md「色」）。",
          "専用の variant はまだ無いため、`CTScheduleCard` の置き換え時に variant 追加を検討する。",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "destructive"],
      table: { defaultValue: { summary: "default" } },
    },
    children: { control: "text" },
  },
  args: { children: "参加中" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge {...args} variant="default">default</Badge>
      <Badge {...args} variant="secondary">secondary</Badge>
      <Badge {...args} variant="outline">outline</Badge>
      <Badge {...args} variant="destructive">destructive</Badge>
    </div>
  ),
};

/** CT 固有の状態ラベル。色は Semantic トークンで指定する */
export const StatusRest: Story = {
  args: {
    children: "お休み",
    className:
      "rounded-full border-transparent bg-status-rest text-status-rest-foreground shadow-none hover:bg-status-rest",
  },
};
