/**
 * Storybook 用のモックデータ (CT組み合わせ表)
 *
 * DB や Slack に接続せずに画面を再現するためのダミー。
 * 組み合わせは本番と同じ generateRoundRobinPairs / generateCTSchedules で作る。
 */
import type { User } from "@/app/actions";
import { filterFromToday, mondays } from "@/src/utils/date";
import type { Holiday } from "@/src/utils/holiday";
import { generateCTSchedules, generateRoundRobinPairs, type Schedule } from "@/src/utils/member";

const HANDLES = [
  "yamada", "sato", "suzuki", "tanaka", "takahashi",
  "ito", "watanabe", "nakamura", "kobayashi", "kato",
  "yoshida", "yamaguchi", "matsumoto", "inoue", "kimura",
  "hayashi", "shimizu", "yamazaki", "mori", "ikeda",
  "hashimoto", "abe",
];

const NOW = new Date("2026-01-01T00:00:00+09:00");

export function createMember(index: number, overrides: Partial<User> = {}): User {
  const handle = HANDLES[index % HANDLES.length];
  return {
    id: index + 1,
    slack_user_id: `U${String(index + 1).padStart(4, "0")}`,
    slack_display_name: handle,
    slack_image: "",
    slack_u_channel_id: `C${String(index + 1).padStart(4, "0")}`,
    employee_number: 1000 + index,
    participate: true,
    created_at: NOW,
    updated_at: NOW,
    ...overrides,
  };
}

/** 参加者 count 人 (+ 不参加 1 人) */
export function createMembers(count: number): User[] {
  const members = Array.from({ length: count }, (_, i) => createMember(i));
  return [...members, createMember(count, { participate: false })];
}

/** 月曜の祝日 (2026〜2027) */
export const mockHolidays: Holiday[] = [
  { date: "2026-09-21", name: "敬老の日" },
  { date: "2026-10-12", name: "スポーツの日" },
  { date: "2026-11-23", name: "勤労感謝の日" },
  { date: "2027-01-11", name: "成人の日" },
  { date: "2027-03-22", name: "振替休日" },
  { date: "2027-07-19", name: "海の日" },
  { date: "2027-09-20", name: "敬老の日" },
  { date: "2027-10-11", name: "スポーツの日" },
];

/** 本番と同じロジックで、今日以降 weeks 週分のスケジュールを作る */
export function createSchedules(members: User[], weeks = 12): Schedule {
  const rounds = generateRoundRobinPairs(members);
  const dates = filterFromToday(mondays).slice(0, weeks);
  return generateCTSchedules(rounds, dates, mockHolidays);
}
