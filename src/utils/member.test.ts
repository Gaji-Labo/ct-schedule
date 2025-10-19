import { describe, expect, test } from "vitest";
import { generateRoundRobinPairs } from "./member";

describe("generateRoundRobinPairs", () => {
  // 境界値テスト
  test("参加者0人：空配列を返す", () => {
    expect(generateRoundRobinPairs([])).toEqual([]);
  });
  test("参加者1人：空配列を返す（ペアが作れない）", () => {
    const members = [{ id: 1, name: "Alice", participate: true }];
    expect(generateRoundRobinPairs(members)).toEqual([]);
  });

  // 基本ケース：2人
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

  // 基本ケース：3人(奇数)
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
});
