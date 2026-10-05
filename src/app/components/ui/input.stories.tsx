import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "1行のテキスト入力。`<input>` を自作せず、必ずこのコンポーネントを使う。",
          "",
          "フォームでは `Label` と縦に並べ、`grid gap-2` で包む（`SetupDataDialog` と同じ組み方）。",
          "幅は親要素に合わせて伸びる（`w-full`）ので、幅を決めたいときは親で指定する。",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "number", "email", "password"],
    },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: { placeholder: "山田 太郎" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** フォームでの基本形 */
export const WithLabel: Story = {
  render: (args) => (
    <div className="grid gap-2">
      <Label htmlFor="displayName">名前</Label>
      <Input id="displayName" {...args} />
    </div>
  ),
};

export const Number: Story = {
  render: (args) => (
    <div className="grid gap-2">
      <Label htmlFor="employeeNumber">社員番号</Label>
      <Input id="employeeNumber" {...args} type="number" placeholder="1001" />
    </div>
  ),
};

export const Filled: Story = {
  args: { defaultValue: "山田 太郎" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "変更できない値" },
};

/** 長い値は入力欄の中でスクロールし、幅は広がらない */
export const LongValue: Story = {
  args: {
    defaultValue: "寿限無寿限無五劫の擦り切れ海砂利水魚の水行末雲来末風来末",
  },
};
