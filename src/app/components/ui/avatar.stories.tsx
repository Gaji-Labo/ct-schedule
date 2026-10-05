import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

// 外部 URL に依存させないため、画像はインライン SVG で用意する
const sampleImage = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#94a3b8"/><circle cx="20" cy="16" r="7" fill="#f8fafc"/><rect x="8" y="26" width="24" height="14" rx="7" fill="#f8fafc"/></svg>',
)}`;

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "丸いアイコン画像。画像が読み込めないときは `AvatarFallback`（頭文字など）を表示する。",
          "",
          "ユーザーを表示するときは、これを直接使わず `UserAvatar`（Domain）を使う。",
          "",
          "**size の選び方**: リスト行・カード内は `sm`、ヘッダー・メンバー一覧は `default`、強調したい場所は `lg`。",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
      table: { defaultValue: { summary: "default" } },
    },
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={sampleImage} alt="サンプルのアイコン" />
      <AvatarFallback>山</AvatarFallback>
    </Avatar>
  ),
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      {(["sm", "default", "lg"] as const).map((size) => (
        <Avatar {...args} size={size} key={size}>
          <AvatarImage src={sampleImage} alt={`${size} のアイコン`} />
          <AvatarFallback>山</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};

/** 画像が無い・読み込めないときは頭文字を表示する */
export const Fallback: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      {(["sm", "default", "lg"] as const).map((size) => (
        <Avatar {...args} size={size} key={size}>
          <AvatarImage src="" alt="" />
          <AvatarFallback>山</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};
