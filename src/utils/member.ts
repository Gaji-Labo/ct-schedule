import { Member } from "@/app/actions";
import { mondays } from "@/src/utils/date";

type Pair = [Member, Member | null];
export type Round = Pair[];

// ペアの生成
export function generateRoundRobinPairs(memberData: Member[]) {
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
    const roundPairs: Pair[] = [];

    // 二人一組のペアを作成
    for (let i = 0; i < totalMembers / 2; i++) {
      const member1 = members[i]; // ペア1人目を配列の前半から取得
      const member2 = members[totalMembers - 1 - i]; // ペア2人目を配列の後半から取得

      if (member1 !== null) {
        roundPairs.push([member1, member2]);
      } else if (member2 !== null) {
        roundPairs.push([member2, null]);
      }
    }
    rounds.push(roundPairs);

    if (totalMembers > 2) {
      // 1人目は固定、2人目以降のメンバーを循環させて重複しない組み合わせを作る
      const temp = members[1]; // 2人目を保存
      for (let i = 1; i < totalMembers - 1; i++) {
        members[i] = members[i + 1]; // メンバーを一つ前にシフト
      }
      members[totalMembers - 1] = temp; // 保存した2人目を配列の最後に移動
    }
  }
  return rounds;
}

type CT = {
  date: string;
  round: Round;
};
type SCHEDULE = CT[];

/**
 * CTスケジュール全体の配列型
 * @example
 * ```typescript
 * const schedule: SCHEDULE = [
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

export function generateCTSchedules(rounds: Round[]): SCHEDULE {
  const schedule: SCHEDULE = [];
  mondays.forEach((monday, mondayIndex) => {
    if (mondayIndex < rounds.length) {
      schedule.push({ date: monday, round: rounds[mondayIndex] });
    }
  });
  return schedule;
}
