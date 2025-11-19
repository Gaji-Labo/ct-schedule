import { describe, expect, test } from "vitest";
import { generateCTSchedules, generateRoundRobinPairs, Round } from "./member";
import { mondays } from "@/src/utils/date";

describe("generateRoundRobinPairs", () => {
  test("参加者0人：空配列を返す", () => {
    expect(generateRoundRobinPairs([])).toEqual([]);
  });
  test("参加者1人：空配列を返す（ペアが作れない）", () => {
    const members = [{ id: 1, name: "Alice", participate: true }];
    expect(generateRoundRobinPairs(members)).toEqual([]);
  });

  test("参加者2人：1ラウンドの1組ペア", () => {
    const members = [
      { id: 1, name: "Alice", participate: true },
      { id: 2, name: "Bob", participate: true },
    ];
    const result = generateRoundRobinPairs(members);

    expect(result).toHaveLength(1); // 1ラウンド
    expect(result[0]).toHaveLength(1); // 1組のペア
    // ペアの組み合わせ
    expect(result[0][0]).toEqual([
      { id: 1, name: "Alice", participate: true },
      { id: 2, name: "Bob", participate: true },
    ]);
  });

  test("参加者3人：3ラウンド、各ラウンドで1人お休み", () => {
    const members = [
      { id: 1, name: "Alice", participate: true },
      { id: 2, name: "Bob", participate: true },
      { id: 3, name: "Charlie", participate: true },
    ];
    const result = generateRoundRobinPairs(members);

    expect(result).toHaveLength(3); // 3ラウンド
    result.forEach((round) => {
      expect(round).toHaveLength(2); // 各ラウンドに2組のペア
      const restPairs = round.filter((pair) => pair[1] === null);
      expect(restPairs).toHaveLength(1); // 各ラウンドで1人お休み
    });
  });

  test("参加者4人：3ラウンド、各ラウンド2組のペア", () => {
    const members = [
      { id: 1, name: "Alice", participate: true },
      { id: 2, name: "Bob", participate: true },
      { id: 3, name: "Charlie", participate: true },
      { id: 4, name: "David", participate: true },
    ];
    const result = generateRoundRobinPairs(members);

    expect(result).toHaveLength(3); // 3ラウンド
    result.forEach((round) => {
      expect(round).toHaveLength(2); // 各ラウンドに2組のペア
      const hasRest = round.some((pair) => pair[1] === null);
      expect(hasRest).toBe(false); // お休みなし
    });
  });

  test("participateフラグでフィルタリング", () => {
    // 参加者3人（Alice, Charlie, Eve）不参加者2人（Bob, David）
    const members = [
      { id: 1, name: "Alice", participate: true },
      { id: 2, name: "Bob", participate: false },
      { id: 3, name: "Charlie", participate: true },
      { id: 4, name: "David", participate: false },
      { id: 5, name: "Eve", participate: true },
    ];
    const rounds: Round[] = [
      [
        [{ id: 1, name: "Alice", participate: true }, null],
        [
          { id: 3, name: "Charlie", participate: true },
          { id: 5, name: "Eve", participate: true },
        ],
      ],
      [
        [
          { id: 1, name: "Alice", participate: true },
          { id: 3, name: "Charlie", participate: true },
        ],
        [{ id: 5, name: "Eve", participate: true }, null],
      ],
      [
        [
          { id: 1, name: "Alice", participate: true },
          { id: 5, name: "Eve", participate: true },
        ],
        [{ id: 3, name: "Charlie", participate: true }, null],
      ],
    ];
    const result = generateRoundRobinPairs(members);

    expect(result).toHaveLength(3);
    expect(result).toEqual(rounds);
  });

  test("奇数は(n-1),偶数はnラウンド生成の検証", () => {
    [3, 4, 5, 6].forEach((participantCount) => {
      const participants = Array.from({ length: participantCount }, (_, i) => ({
        id: i + 1,
        name: `Member${i + 1}`,
        participate: true,
      }));
      const result = generateRoundRobinPairs(participants);
      expect(result).toHaveLength(
        participantCount % 2 ? participantCount : participantCount - 1
      );
    });
  });

  test("全員participateがfalse：空配列", () => {
    const members = [
      { id: 1, name: "Alice", participate: false },
      { id: 2, name: "Bob", participate: false },
    ];
    expect(generateRoundRobinPairs(members)).toEqual([]);
  });

  test("動的に生成されたペアが重複しない", () => {
    const members = [
      { id: 1, name: "Alice", participate: true },
      { id: 2, name: "Bob", participate: true },
      { id: 3, name: "Charlie", participate: true },
      { id: 4, name: "David", participate: true },
      { id: 5, name: "Eve", participate: true },
    ];
    const result = generateRoundRobinPairs(members);
    const seenPairs = new Set<string>();

    result.forEach((round) => {
      round.forEach((pair) => {
        const pairKey = [pair[0].id, pair[1]?.id ?? "null"].sort().join("-"); // [1-3, 2-null]形式でキーを作成
        expect(seenPairs.has(pairKey)).toBe(false); // pairKeyが既に存在しないことを確認
        seenPairs.add(pairKey); // pairKeyをセットに追加
      });
    });
  });
});

describe("generateCTSchedules", () => {
  test("3ラウンドから3つのスケジュールを生成する", () => {
    const threePersonRounds: Round[] = [
      [
        [
          { id: 1, name: "Alice", participate: true },
          { id: 2, name: "Bob", participate: true },
        ],
        [{ id: 3, name: "Charlie", participate: true }, null],
      ],
      [
        [
          { id: 1, name: "Alice", participate: true },
          { id: 3, name: "Charlie", participate: true },
        ],
        [{ id: 2, name: "Bob", participate: true }, null],
      ],
      [
        [
          { id: 2, name: "Bob", participate: true },
          { id: 3, name: "Charlie", participate: true },
        ],
        [{ id: 1, name: "Alice", participate: true }, null],
      ],
    ];
    const expectedThreeSchedules = [
      { date: "2025/8/4(月)", round: threePersonRounds[0] },
      { date: "2025/8/11(月)", round: threePersonRounds[1] },
      { date: "2025/8/18(月)", round: threePersonRounds[2] },
    ];
    const result = generateCTSchedules(threePersonRounds);

    // 生成されたスケジュールの数が正しいか
    expect(result).toHaveLength(3);

    // 持っているプロパティが正しいか
    result.forEach((schedule) => {
      expect(schedule).toHaveProperty("date");
      expect(schedule).toHaveProperty("round");
      expect(typeof schedule.date).toBe("string");
      expect(Array.isArray(schedule.round)).toBe(true);
    });

    // スケジュール内容が正しい形式か
    expect(result).toEqual(expectedThreeSchedules);
  });

  test("空のrounds配列：空のスケジュール配列を返す", () => {
    const result = generateCTSchedules([]);
    expect(result).toEqual([]);
  });

  test("1ラウンドのみ：1つのスケジュールを生成", () => {
    const rounds: Round[] = [
      [
        [
          { id: 1, name: "Alice", participate: true },
          { id: 2, name: "Bob", participate: true },
        ],
      ],
    ];
    const result = generateCTSchedules(rounds);

    expect(result).toHaveLength(1);
  });

  test("roundsがmondaysより多い場合：mondaysの範囲内でスケジュール生成", () => {
    const round = [
      [
        { id: 1, name: "Alice", participate: true },
        { id: 2, name: "Bob", participate: true },
      ],
    ];
    const manyRounds: Round[] = Array(300).fill(round);
    const result = generateCTSchedules(manyRounds);
    expect(result).toHaveLength(mondays.length);
  });

  test("連続する月曜日が正しい順序で割り当てられる", () => {
    const rounds: Round[] = [
      [
        [
          { id: 1, name: "Alice", participate: true },
          { id: 2, name: "Bob", participate: true },
        ],
        [{ id: 3, name: "Charlie", participate: true }, null],
      ],
      [
        [
          { id: 1, name: "Alice", participate: true },
          { id: 3, name: "Charlie", participate: true },
        ],
        [{ id: 2, name: "Bob", participate: true }, null],
      ],
      [
        [
          { id: 2, name: "Bob", participate: true },
          { id: 3, name: "Charlie", participate: true },
        ],
        [{ id: 1, name: "Alice", participate: true }, null],
      ],
    ];
    const result = generateCTSchedules(rounds);
    expect(result[0].date).toBe(mondays[0]);
    expect(result[1].date).toBe(mondays[1]);
    expect(result[2].date).toBe(mondays[2]);
  });
});
