import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AVATAR_COLORS, Avatar, AvatarFallback, AvatarImage } from "./avatar";

/**
 * 元: shadcn-storybook-registry (radix/avatar-story) を DESIGN.md に合わせて調整
 */
const meta = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "ユーザーの画像を丸く表示する部品。画像が読み込めないときは `AvatarFallback`（頭文字）を出す。",
          "",
          "**使い分け**: 画面でユーザーを表示するときは、この部品を直接使わず `UserAvatar`（`src/app/components/UserAvatar.tsx`）を使う。",
          "`UserAvatar` が Slack の画像・代替テキスト・頭文字のフォールバックをまとめて扱う。",
          "",
          "**size の選び方**: 通常は `default`（40px）。リスト行など狭い場所は `sm`（32px）、プロフィールなど目立たせる場所は `lg`（48px）。",
          "",
          "`AvatarImage` には必ず `alt` を付ける（例: `○○のアイコン`）。",
          "",
          "**背景色**: `AvatarFallback` に `colorSeed`（ユーザー ID など）を渡すと、ブランドカラー（Foundations/Colors の Avatar）から1色が自動で選ばれる。",
          "見た目はランダムだが、同じ人は常に同じ色になる。`UserAvatar` は Slack のユーザー ID を渡している。`colorSeed` が無いときは `bg-muted`。",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
      description: "大きさ",
      table: { defaultValue: { summary: "default" } },
    },
  },
  args: {
    size: "default",
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="" alt="山田のアイコン" />
      <AvatarFallback colorSeed="U0001">山</AvatarFallback>
    </Avatar>
  ),
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 画像が無い・読み込めないときは頭文字を表示する */
export const Fallback: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      {(["sm", "default", "lg"] as const).map((size) => (
        <Avatar {...args} key={size} size={size}>
          <AvatarImage src="" alt={`${size} サイズのアイコン`} />
          <AvatarFallback colorSeed="U0001">山</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};

/** CT の組み合わせ表示のように、名前と並べて使う例 */
export const WithName: Story = {
  render: (args) => (
    <div className="flex items-center gap-2 rounded-md bg-muted p-3">
      <Avatar {...args} size="sm">
        <AvatarImage src="" alt="山田のアイコン" />
        <AvatarFallback colorSeed="U0001">山</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">山田</span>
    </div>
  ),
};

/** 背景色の全パターン（avatar-1〜7）。濃い背景には白文字が付く */
export const Colors: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {AVATAR_COLORS.map((color, i) => (
        <Avatar {...args} key={color}>
          <AvatarFallback className={color}>{i + 1}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};

const NAMES = ["山田", "佐藤", "鈴木", "田中", "高橋", "伊藤", "渡辺", "中村", "小林", "加藤", "吉田", "山口"];

/** ユーザーごとの色の散らばり方。同じ ID なら何度表示しても同じ色 */
export const ManyUsers: Story = {
  render: (args) => (
    <div className="flex max-w-md flex-wrap items-center gap-2">
      {NAMES.map((name, i) => (
        <Avatar {...args} key={name}>
          <AvatarImage src="" alt={`${name}のアイコン`} />
          <AvatarFallback colorSeed={`U${String(i + 1).padStart(4, "0")}`}>
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};

/** colorSeed を渡さないときは従来どおり bg-muted */
export const WithoutSeed: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>山</AvatarFallback>
    </Avatar>
  ),
};
