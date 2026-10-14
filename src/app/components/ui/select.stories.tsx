import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
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

/**
 * 元: shadcn-storybook-registry (radix/select-story) を docs/design/rules.md に合わせて調整
 */
const meta = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "決まった選択肢から1つを選ぶ入力。`<select>` を自作せず、この部品を使う。",
          "",
          "**使い方**",
          "- `Label` と組み合わせる（`grid gap-2`）",
          "- 何を選ぶかがわかる placeholder を `SelectValue` に入れる（例: 「通知先を選択」）",
          "- 選択肢が多いときは `SelectGroup` + `SelectLabel` で分類し、`SelectSeparator` で区切る",
          "",
          "**使い分け**: 選択肢が2つでオン・オフの意味なら `Checkbox`、メニュー操作なら `DropdownMenu`。",
        ].join("\n"),
      },
    },
  },
  args: {
    onValueChange: fn(),
  },
  render: (args) => (
    <div className="grid w-80 gap-2">
      <Label htmlFor="notifyChannel">通知先</Label>
      <Select {...args}>
        <SelectTrigger id="notifyChannel">
          <SelectValue placeholder="通知先を選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="general">#general</SelectItem>
            <SelectItem value="random">#random</SelectItem>
            <SelectItem value="design">#design</SelectItem>
            <SelectItem value="dev">#dev</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 初期値がある状態（編集フォームなど） */
export const WithDefaultValue: Story = {
  args: { defaultValue: "u-yamada" },
};

/** 操作できない状態 */
export const Disabled: Story = {
  args: { disabled: true },
};

/** 選択肢をグループに分ける例。選べない項目は `disabled` にする */
export const WithGroups: Story = {
  render: (args) => (
    <div className="grid w-80 gap-2">
      <Label htmlFor="assignee">担当者</Label>
      <Select {...args}>
        <SelectTrigger id="assignee">
          <SelectValue placeholder="担当者を選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>在席</SelectLabel>
            <SelectItem value="yamada">山田</SelectItem>
            <SelectItem value="sato">佐藤</SelectItem>
            <SelectItem value="suzuki">鈴木</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>休暇中</SelectLabel>
            <SelectItem value="tanaka" disabled>
              田中
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const ShouldSelectOption: Story = {
  name: "選択肢を選ぶと表示が切り替わる",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, step }) => {
    const body = within(canvasElement.ownerDocument.body);
    const select = await body.findByRole("combobox");

    await step("開いて選択する", async () => {
      await userEvent.click(select);
      await userEvent.click(await body.findByRole("option", { name: "u-suzuki" }));
      await expect(select).toHaveTextContent("u-suzuki");
      // 閉じるアニメーションが終わるまで待つ（開いている間は他の要素が操作できない）
      await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
      await waitFor(() => expect(select).not.toHaveStyle({ pointerEvents: "none" }));
    });

    await step("選択した項目にチェックが付いている", async () => {
      await userEvent.click(select);
      await expect(
        await body.findByRole("option", { name: "u-suzuki" }),
      ).toHaveAttribute("data-state", "checked");
    });
  },
};
