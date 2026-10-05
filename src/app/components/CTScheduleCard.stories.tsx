import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  createRound,
  createUsers,
  ctSchedule,
  ctScheduleWithRest,
  holidayCtSchedule,
  longNameUser,
  users,
} from "@/src/stories/fixtures";
import { CTScheduleCard } from "./CTScheduleCard";

const meta = {
  title: "Domain/CTScheduleCard",
  component: CTScheduleCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "1週間分の CT の組み合わせを表すカード。トップページで週ごとに横に並べる。",
          "",
          "- `index === 0`（先頭 = 今週）のカードは枠線を強調する",
          "- 祝日の週は組み合わせの代わりに祝日名を出す",
          "- 参加人数が奇数の週は、1人が「お休み」になる",
          "- 相手に u チャンネルが設定されていれば、ハドル開始ボタンを出す",
          "",
          "※ 色はデザインシステム導入前の実装のまま（パレット色の直書きが残っている）。置き換え時はこの Story で見た目を確かめる。",
        ].join("\n"),
      },
    },
  },
  args: { schedule: ctSchedule, index: 1 },
} satisfies Meta<typeof CTScheduleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 今週のカード。枠線を強調する */
export const CurrentWeek: Story = {
  args: { index: 0 },
};

/** 参加人数が奇数。1人が「お休み」になる */
export const WithRest: Story = {
  args: { schedule: ctScheduleWithRest },
};

/** 祝日の週 */
export const Holiday: Story = {
  args: { schedule: holidayCtSchedule },
};

/** 今週が祝日 */
export const CurrentWeekHoliday: Story = {
  args: { schedule: holidayCtSchedule, index: 0 },
};

/** 相手に u チャンネルが無いと、ハドル開始ボタンを出さない */
export const WithoutHuddle: Story = {
  args: {
    schedule: {
      ...ctSchedule,
      round: ctSchedule.round!.map(([a, b]) => [
        a,
        b && { ...b, slack_u_channel_id: undefined },
      ]),
    },
  },
};

/** 長い名前。カードが横に伸びる */
export const LongName: Story = {
  args: {
    schedule: {
      ...ctSchedule,
      round: [[longNameUser, users[1]], ...ctSchedule.round!.slice(1)],
    },
  },
};

/** 参加者が多い週。カードが縦に伸びる */
export const ManyPairs: Story = {
  args: {
    schedule: {
      ...ctSchedule,
      round: createRound(createUsers(20)),
    },
  },
};

/** トップページと同じく横に並べたとき */
export const Row: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="overflow-x-auto">
      <div className="flex max-w-max gap-4 pb-4">
        {[ctSchedule, holidayCtSchedule, ctScheduleWithRest].map(
          (schedule, index) => (
            <CTScheduleCard
              schedule={schedule}
              index={index}
              key={schedule.date}
            />
          ),
        )}
      </div>
    </div>
  ),
};
