import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { createMember } from "@/src/design-system/mocks/ct";
import { MemberGroup } from "./MemberGroup";

const participants = Array.from({ length: 4 }, (_, i) => createMember(i));
const nonParticipants = Array.from({ length: 2 }, (_, i) =>
  createMember(i + 4, { participate: false }),
);

const meta = {
  title: "Domain/MemberGroup",
  component: MemberGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "メンバー一覧ページの1グループ。「参加」「不参加」の2つに分けて並べる。",
          "",
          "- 見出しに人数を出す（`参加（20人）`）。CT組み合わせ表の「CTの参加者：○人」と同じ数になる",
          "- 0人のときは `emptyText` を出す（見出しは残す）",
          "- 用語: **メンバー** = Slack 連携で登録された社員全員、**参加者** = そのうち CT に参加している人（DESIGN.md）",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof MemberGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Participants: Story = {
  args: { label: "参加", members: participants, emptyText: "CTに参加しているメンバーはいません" },
};

export const NonParticipants: Story = {
  args: { label: "不参加", members: nonParticipants, emptyText: "不参加のメンバーはいません" },
};

/** 0人のとき */
export const Empty: Story = {
  args: { label: "不参加", members: [], emptyText: "不参加のメンバーはいません" },
};
