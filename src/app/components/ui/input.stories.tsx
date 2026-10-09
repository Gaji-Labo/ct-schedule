import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Search } from "lucide-react";
import { expect, userEvent } from "storybook/test";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

/**
 * 元: shadcn-storybook-registry (radix/input-story) を DESIGN.md に合わせて調整
 */
const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "1行のテキスト入力欄。`<input>` を自作せず、この部品を使う。",
          "",
          "**使い方**",
          "- 必ず `Label` を付ける（`grid gap-2` で縦に並べる）。placeholder をラベルの代わりにしない",
          "- 補足説明は入力欄の下に `text-sm text-muted-foreground` で置く",
          "- 幅は親要素に合わせて広がる（`w-full`）。幅を決めたいときは親側で指定する",
          "",
          "**使い分け**: 決まった選択肢から選ぶ場合は `Select`、オン・オフは `Checkbox`。",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "number", "email", "search"],
    },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
  args: {
    type: "text",
    placeholder: "例: 山田",
    disabled: false,
  },
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

export const Default: Story = {};

/** 操作できない状態 */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: "山田" },
};

/** ラベルと組み合わせた基本形 */
export const WithLabel: Story = {
  render: (args) => (
    <div className="grid gap-2">
      <Label htmlFor="displayName">名前</Label>
      <Input {...args} id="displayName" />
    </div>
  ),
};

/** 入力欄の下に補足説明を置く */
export const WithHelperText: Story = {
  render: (args) => (
    <div className="grid gap-2">
      <Label htmlFor="employeeNumber">社員番号</Label>
      <Input {...args} id="employeeNumber" type="number" placeholder="例: 1234" />
      <p className="text-sm text-muted-foreground">
        組み合わせの並び順に使います。
      </p>
    </div>
  ),
};

/** ボタンと横に並べる例 */
export const WithButton: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Input {...args} type="search" placeholder="メンバーを検索" aria-label="メンバーを検索" />
      <Button variant="outline" size="icon" aria-label="検索">
        <Search />
      </Button>
    </div>
  ),
};

export const ShouldEnterText: Story = {
  name: "入力した文字が入力欄に表示される",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvas, step }) => {
    const input = await canvas.findByPlaceholderText(/山田/);
    await step("入力欄に文字を入力する", async () => {
      await userEvent.click(input);
      await userEvent.type(input, "佐藤");
    });
    await expect(input).toHaveValue("佐藤");
  },
};
