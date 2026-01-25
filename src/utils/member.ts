import { User } from "@/app/actions";
import { filterFromToday, mondays, PROJECT_START_DATE } from "@/src/utils/date";
import { parse } from "date-fns";

type Pair = [User, User | null];
export type Round = Pair[];

// 二人一組のペアを作成
function createRoundPairs(members: (User | null)[]): Pair[] {
  const pairs: Pair[] = [];

  for (let i = 0; i < members.length / 2; i++) {
    const member1 = members[i]; // ペア1人目を配列の前半から取得
    const member2 = members[members.length - 1 - i]; // ペア2人目を配列の後半から取得

    if (member1 !== null) {
      pairs.push([member1, member2]);
    } else if (member2 !== null) {
      pairs.push([member2, null]);
    }
  }
  return pairs;
}

// 1人目は固定、2人目以降のメンバーを循環させて重複しない組み合わせを作る
function rotateMembers(members: (User | null)[]): void {
  const temp = members[1]; // 2人目を保存
  for (let i = 1; i < members.length - 1; i++) {
    members[i] = members[i + 1]; // メンバーを一つ前にシフト
  }
  members[members.length - 1] = temp; // 保存した2人目を配列の最後に移動
}

// ペアの生成
export function generateRoundRobinPairs(memberData: User[]) {
  // 不参加のメンバーを除外
  const participants = memberData.filter((member) => member.participate);
  if (participants.length < 2) {
    return [];
  }

  const rounds: Round[] = [];
  const isEven = participants.length % 2 === 0;
  const members = isEven ? [...participants] : [...participants, null]; // 参加者が奇数の場合はnull（お休み）を追加
  const totalMembers = members.length;

  // 1回分のペアを作成
  for (let round = 0; round < totalMembers - 1; round++) {
    const roundPairs = createRoundPairs(members);
    rounds.push(roundPairs);

    if (totalMembers > 2) {
      rotateMembers(members);
    }
  }
  return rounds;
}

export type CT = {
  date: string;
  round: Round;
};
export type Schedule = CT[];

/**
 * CTスケジュール全体の配列型
 * @example
 * ```typescript
 * const schedule: Schedule = [
 *   {
 *     date: "2024/1/1(月)",
 *     round: [
 *       [{ id: 1, name: "Alice", participate: true }, { id: 2, name: "Bob", participate: true }],
 *       [{ id: 3, name: "Charlie", participate: true }, null], // nullはお休み
 *     ]
 *   },
 *   {
 *     date: "2024/1/8(月)",
 *     round: [
 *       [{ id: 1, name: "Alice", participate: true }, { id: 3, name: "Charlie", participate: true }],
 *       [{ id: 2, name: "Bob", participate: true }, null],
 *     ]
 *   }
 * ];
 * ```
 */

const futureMondaysFromToday = filterFromToday(mondays);

export function generateCTSchedules(
  rounds: Round[],
  dateList: string[] = futureMondaysFromToday,
): Schedule {
  if (rounds.length === 0) return [];

  // 基準日からの週数を計算
  const startDate = PROJECT_START_DATE;
  const firstMondayString = dateList[0].replace(/\([^)]*\)/, "");
  const firstMonday = parse(firstMondayString, "yyyy/M/d", new Date());
  const weekOffset = Math.floor(
    (firstMonday.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000),
  );

  // オフセット分ラウンドをずらす
  return dateList.map((date, index) => {
    const roundIndex = (weekOffset + index) % rounds.length;
    return {
      date,
      round: rounds[roundIndex],
    };
  });
}
