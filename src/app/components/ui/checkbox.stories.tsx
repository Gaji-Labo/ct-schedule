import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "ON / OFF を切り替える入力。必ず `Label` と組み合わせ、`id` と `htmlFor` を対応させる（ラベルのクリックでも切り替わる）。",
          "",
          "フォームで送るときは `name` を付ける。チェック時は `\"on\"` が送られる。",
        ].join("\n"),
      },
    },
  },
  args: { onCheckedChange: fn() },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="participate" {...args} />
      <Label htmlFor="participate">CTに参加する</Label>
    </div>
  ),
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
};

/** ラベルをクリックしてもチェックが切り替わる */
export const ToggleByLabel: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByText("CTに参加する"));
    await expect(canvas.getByRole("checkbox")).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
  },
};
