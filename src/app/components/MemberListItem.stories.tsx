import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createMember } from "@/src/design-system/mocks/ct";
import { MemberListItem } from "./MemberListItem";

const meta = {
  title: "Domain/MemberListItem",
  component: MemberListItem,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "メンバー一覧の1行。アバター・名前・参加状態（`bg-success` の点＋「参加」/ `bg-border` の点＋「不参加」）を表示する。",
          "",
          "右端の操作は `action` で渡す。アプリではログイン中だけ `DeleteMemberDialog`（削除ボタン）を渡している。",
          "行と行の間には `Separator` を置く。",
        ].join("\n"),
      },
    },
  },
  args: {
    member: createMember(0),
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MemberListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 参加中 */
export const Participating: Story = {};

/** 不参加 */
export const NotParticipating: Story = {
  args: { member: createMember(1, { participate: false }) },
};

/** ログイン中（右端に削除ボタン）。本物は DeleteMemberDialog で、押すと確認ダイアログが開く */
export const WithAction: Story = {
  args: {
    action: (
      <Button variant="ghost" size="icon" aria-label="yamada を削除">
        <Trash2 />
      </Button>
    ),
  },
};

/** 長い表示名 */
export const LongName: Story = {
  args: {
    member: createMember(2, {
      slack_display_name: "suzuki-ichiro-design-unit-kobe",
    }),
  },
};
