import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

/**
 * 元: shadcn-storybook-registry (radix/checkbox-story) を DESIGN.md に合わせて調整
 */
const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "オン・オフを切り替える入力。`<input type=\"checkbox\">` を自作せず、この部品を使う。",
          "",
          "**使い方**: 必ず `Label` と並べ、`id` と `htmlFor` で結びつける（ラベルをクリックしても切り替わるようにする）。",
          "チェックボックスとラベルの間隔は `gap-2`。",
          "",
          "**使い分け**: 複数の中から1つだけ選ぶ場合は `Select` を使う。",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    disabled: { control: "boolean" },
    defaultChecked: { control: "boolean" },
  },
  args: {
    id: "participate",
    disabled: false,
    onCheckedChange: fn(),
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} />
      <Label htmlFor={args.id}>CTに参加する</Label>
    </div>
  ),
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: { id: "participate-checked", defaultChecked: true },
};

/** 操作できない状態。ラベルも薄くなる（Label 側の `peer-disabled`） */
export const Disabled: Story = {
  args: { id: "participate-disabled", disabled: true },
};

export const ShouldToggleCheck: Story = {
  name: "クリックでオン・オフが切り替わる",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = await canvas.findByRole("checkbox");
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await userEvent.click(checkbox, { delay: 100 });
    await expect(checkbox).not.toBeChecked();
  },
};
