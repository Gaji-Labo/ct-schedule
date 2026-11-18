import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Headphones } from "lucide-react";
import { MyPairListItem } from "./MyPairListItem";
import { Button } from "@/components/ui/button";
import { createMember } from "@/src/design-system/mocks/ct";

const meta = {
  title: "Apps/CTスケジュール/Components/MyPairListItem",
  component: MyPairListItem,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "マイページの「自分のペア」の1週分。日付と、その週の相手を表示する。",
          "",
          "- 祝日の週は祝日名、お休みの週は「お休み」のラベルを相手の代わりに出す（Badge `variant=\"rest\"`）",
          "- 直近の週は `current` で枠線を `highlight-current` にする（CTScheduleCard の今週と同じ）",
          "- 右端の操作（ハドルを開始など）は `action` で渡す",
        ].join("\n"),
      },
    },
  },
  args: {
    date: "2026/10/26(月)",
    partner: createMember(1),
  },
} satisfies Meta<typeof MyPairListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 相手がいる週。右端にハドルを開始するボタン */
export const Default: Story = {
  args: {
    action: (
      <Button variant="outline" size="icon" aria-label="ハドルを開始">
        <Headphones />
      </Button>
    ),
  },
};

/** 直近の週（枠線で目立たせる） */
export const Current: Story = {
  args: { ...Default.args, current: true },
};

/** お休みの週（参加人数が奇数） */
export const Rest: Story = {
  args: { partner: null },
};

/** 祝日の週 */
export const Holiday: Story = {
  args: { partner: null, holidayName: "勤労感謝の日" },
};

/** 相手の名前が長い */
export const LongName: Story = {
  args: {
    ...Default.args,
    partner: createMember(1, {
      slack_display_name: "とても長い表示名のメンバー（デザイン部・フロントエンドチーム兼務）",
    }),
  },
};
