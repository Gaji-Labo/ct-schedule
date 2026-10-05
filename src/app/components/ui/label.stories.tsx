import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "フォーム部品の名前。`htmlFor` を対応する入力の `id` に合わせる（スクリーンリーダーが読み上げ、クリックで入力にフォーカスする）。",
          "",
          "入力欄が `disabled` のとき、`peer` で隣接していればラベルも薄くなる。",
        ].join("\n"),
      },
    },
  },
  args: { children: "名前" },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithInput: Story = {
  render: (args) => (
    <div className="grid w-80 gap-2">
      <Label {...args} htmlFor="name" />
      <Input id="name" />
    </div>
  ),
};

/** 入力が disabled のとき、後ろに置いた Label も薄くなる */
export const WithDisabledCheckbox: Story = {
  args: { children: "CTに参加する" },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="participate" disabled />
      <Label {...args} htmlFor="participate" />
    </div>
  ),
};
