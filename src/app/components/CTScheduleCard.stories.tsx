import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { createMember, createMembers, createSchedules } from "@/src/design-system/mocks/ct";
import { repoUrl } from "@/src/design-system/repo";
import type { CT } from "@/src/utils/member";
import { CTScheduleCard } from "./CTScheduleCard";

const regularWeek = createSchedules(createMembers(6), 12).find((s) => !s.isHoliday) as CT;
const oddWeek = createSchedules(createMembers(5), 12).find((s) => !s.isHoliday) as CT;

const meta = {
  title: "Apps/CTスケジュール/Components/CTScheduleCard",
  component: CTScheduleCard,
  tags: ["autodocs"],
  parameters: {
    // 直すまで残す a11y の違反（CTScheduleCard を使う Story で同じものを止めている）。直したらこの a11y を消す
    // - color-contrast: パレット色の直書き（eslint.config.mjs の既知の違反）。お休み・祝日名のラベル (bg-gray-400 に白) と日付 (text-gray-400) が 2.4:1。
    //   トークン (status-holiday / status-rest) に置き換えて直す
    // - link-name: ハドルのリンクがアイコンだけで、読み上げる名前が無い。aria-label（「○○ とハドルを開始」など）を付けて直す
    a11y: {
      config: {
        rules: [
          { id: "color-contrast", enabled: false },
          { id: "link-name", enabled: false },
        ],
      },
    },
    docs: {
      description: {
        component: [
          "CT組み合わせ表の1週分のカード。日付・ペアの一覧・ハドル開始ボタンを表示する。",
          "",
          "**状態**",
          "- `index=0`: 今週（直近）のカード。強調枠で示す",
          "- 祝日の週: 組み合わせは無く、祝日名のラベルだけを出す",
          "- 参加人数が奇数: 1人が「お休み」になる",
          "",
          `※ 現状はパレット色（gray-*）の直書きが残っている（[eslint.config.mjs](${repoUrl("eslint.config.mjs")}) の既知の違反リスト）。`,
          "Semantic トークン（`border-highlight-current` / `bg-status-holiday` / `bg-status-rest` など）への置き換え前後を、この Story で確認する。",
        ].join("\n"),
      },
    },
  },
  args: {
    schedule: regularWeek,
    index: 1,
  },
} satisfies Meta<typeof CTScheduleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 通常の週 */
export const Default: Story = {};

/** 今週のカード（強調枠） */
export const CurrentWeek: Story = {
  args: { index: 0 },
};

/** 祝日の週 */
export const Holiday: Story = {
  args: {
    schedule: { date: "2026/10/12(月)", round: null, isHoliday: true, holidayName: "スポーツの日" },
  },
};

/** 参加人数が奇数で「お休み」がいる週 */
export const WithRest: Story = {
  args: { schedule: oddWeek },
};

/** 長い表示名でもレイアウトが崩れないか */
export const LongNames: Story = {
  args: {
    schedule: {
      date: "2026/10/19(月)",
      isHoliday: false,
      round: [
        [
          createMember(0, { slack_display_name: "yamada-taro-design-unit" }),
          createMember(1, { slack_display_name: "sato-hanako-engineering" }),
        ],
        [createMember(2), createMember(3)],
      ],
    },
  },
};

/** ハドル用の uチャンネルが未設定のメンバー（ボタンが出ない） */
export const WithoutHuddle: Story = {
  args: {
    schedule: {
      date: "2026/10/19(月)",
      isHoliday: false,
      round: [
        [createMember(0), createMember(1, { slack_u_channel_id: undefined })],
        [createMember(2), createMember(3)],
      ],
    },
  },
};
