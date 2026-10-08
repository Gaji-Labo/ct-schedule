import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./input";
import { Label } from "./label";

/**
 * 元: shadcn-storybook-registry (radix/label-story) を DESIGN.md に合わせて調整
 */
const meta = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "フォーム部品の名前を示すラベル。文字は `text-sm font-medium`（DESIGN.md「本文・ラベル」）。",
          "",
          "**使い方**: `htmlFor` に入力欄の `id` を指定して結びつける。",
          "入力欄と縦に並べるときは `grid gap-2` で包む。",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    children: { control: "text" },
  },
  args: {
    children: "名前",
    htmlFor: "displayName",
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 入力欄と組み合わせた基本形 */
export const WithInput: Story = {
  render: (args) => (
    <div className="grid w-80 gap-2">
      <Label {...args} />
      <Input id="displayName" defaultValue="山田" />
    </div>
  ),
};

/** 入力欄が無効のときは、ラベルも自動で薄くなる（`peer-disabled`） */
export const Disabled: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Input id="employeeNumber" disabled className="peer w-40" defaultValue="1234" />
      <Label {...args} htmlFor="employeeNumber">
        社員番号
      </Label>
    </div>
  ),
};
