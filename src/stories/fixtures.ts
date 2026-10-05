/**
 * Story 用のダミーデータ
 *
 * 名前は架空のもの。画像は外部 URL に依存させず、AvatarFallback（頭文字）で表示する。
 */
import type { User } from "@/app/actions";
import type { SlackChannelResponse } from "@/src/lib/slack";
import type { Holiday } from "@/src/utils/holiday";
import type { CT, Round } from "@/src/utils/member";
import type { Session } from "next-auth";

const baseDate = new Date("2025-08-01T00:00:00+09:00");

export const createUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  slack_user_id: "U00000001",
  slack_email: "user@example.com",
  slack_display_name: "山田 太郎",
  slack_u_channel_id: "C00000001",
  employee_number: 1001,
  participate: true,
  created_at: baseDate,
  updated_at: baseDate,
  ...overrides,
});

const names = [
  "山田 太郎",
  "佐藤 花子",
  "鈴木 一郎",
  "高橋 美咲",
  "田中 健",
  "伊藤 さくら",
  "渡辺 翔",
  "中村 葵",
  "小林 大輔",
  "加藤 結衣",
];

/** id / 社員番号 / Slack ID が連番のメンバー一覧 */
export const createUsers = (count: number): User[] =>
  Array.from({ length: count }, (_, i) =>
    createUser({
      id: i + 1,
      slack_user_id: `U${String(i + 1).padStart(8, "0")}`,
      slack_display_name: names[i % names.length],
      slack_u_channel_id: `C${String(i + 1).padStart(8, "0")}`,
      employee_number: 1001 + i,
    }),
  );

/** 偶数人数（全員にペアがいる） */
export const users = createUsers(6);

/** 奇数人数（毎週1人がお休み） */
export const oddUsers = createUsers(5);

/** 3人に1人が不参加 */
export const usersWithAbsent = users.map((user, i) =>
  i % 3 === 2 ? { ...user, participate: false } : user,
);

export const longNameUser = createUser({
  id: 99,
  slack_user_id: "U00000099",
  slack_display_name: "寿限無寿限無五劫の擦り切れ海砂利水魚の水行末雲来末風来末",
});

/** ログイン中のユーザー（users[0] と同じ人） */
export const currentUser = users[0];

/** 初回ログイン直後（社員番号・u チャンネル未設定） */
export const newUser = createUser({
  id: 100,
  slack_user_id: "U00000100",
  slack_display_name: "新井 新",
  slack_u_channel_id: undefined,
  employee_number: undefined,
});

export const createSession = (user: User = currentUser): Session => ({
  user: {
    name: user.slack_display_name,
    email: user.slack_email,
    slack_user_id: user.slack_user_id,
  },
  expires: "2099-12-31T23:59:59.999Z",
});

export const channels: Pick<SlackChannelResponse, "id" | "name_normalized">[] =
  [
    { id: "C00000001", name_normalized: "u-yamada" },
    { id: "C00000002", name_normalized: "u-sato" },
    { id: "C00000003", name_normalized: "u-suzuki" },
  ];

/** 前半と後半を組み合わせた1週分のペア。奇数人数なら真ん中の1人がお休み */
export const createRound = (members: User[]): Round =>
  Array.from({ length: Math.ceil(members.length / 2) }, (_, i) => {
    const partner = members.length - 1 - i;
    return [members[i], partner === i ? null : members[partner]];
  });

export const ctSchedule: CT = {
  date: "2025/9/8(月)",
  isHoliday: false,
  round: createRound(users),
};

export const ctScheduleWithRest: CT = {
  date: "2025/9/22(月)",
  isHoliday: false,
  round: createRound(oddUsers),
};

export const holidayCtSchedule: CT = {
  date: "2025/9/15(月)",
  isHoliday: true,
  holidayName: "敬老の日",
  round: null,
};

/**
 * ページの Story 用の祝日。ページは「今日以降の月曜」を表示するため、
 * 固定日付ではなく渡された月曜リストから祝日を作る
 */
export const createHolidays = (
  mondayList: string[],
  index = 2,
): Holiday[] => {
  const monday = mondayList[index];
  if (!monday) return [];
  const [y, m, d] = monday.replace(/\([^)]*\)/, "").split("/");
  return [
    {
      date: `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`,
      name: "海の日",
    },
  ];
};
