import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen } from "storybook/test";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

const channels = ["u-yamada", "u-sato", "u-suzuki", "u-takahashi"];

const meta = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "決まった選択肢から1つを選ぶ入力。選択肢が 2〜3 個で常に見せたいときは、将来 RadioGroup の追加を検討する。",
          "",
          "- 未選択のときは `SelectValue` の `placeholder` で「何を選ぶか」を書く",
          "- フォームで送るときは `Select` に `name` を付ける",
          "- `Label` の `htmlFor` は `SelectTrigger` の `id` に合わせる",
        ].join("\n"),
      },
    },
  },
  args: { onValueChange: fn() },
  render: (args) => (
    <div className="grid w-80 gap-2">
      <Label htmlFor="channel">uチャンネル</Label>
      <Select {...args}>
        <SelectTrigger id="channel">
          <SelectValue placeholder="uチャンネルを選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {channels.map((channel) => (
              <SelectItem value={channel} key={channel}>
                {channel}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Placeholder: Story = {};

export const Selected: Story = {
  args: { defaultValue: "u-sato" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "u-sato" },
};

/** 開いた状態。選ぶと onValueChange が呼ばれる */
export const Open: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("combobox"));
    await userEvent.click(await screen.findByRole("option", { name: "u-suzuki" }));
    await expect(args.onValueChange).toHaveBeenCalledWith("u-suzuki");
  },
};

/** 選択肢が多いときは、グループ見出しと区切り線でまとめる */
export const Grouped: Story = {
  render: (args) => (
    <div className="w-80">
      <Select {...args} defaultOpen>
        <SelectTrigger aria-label="チャンネル">
          <SelectValue placeholder="チャンネルを選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>u チャンネル</SelectLabel>
            <SelectItem value="u-yamada">u-yamada</SelectItem>
            <SelectItem value="u-sato">u-sato</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>その他</SelectLabel>
            <SelectItem value="general">general</SelectItem>
            <SelectItem value="random" disabled>
              random（選べない）
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};
