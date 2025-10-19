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
});
