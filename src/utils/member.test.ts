import { describe, expect, test } from "vitest";
import {
  generateCTSchedules,
  generateRoundRobinPairs,
  Round,
} from "@/src/utils/member";
import { mondays } from "@/src/utils/date";
import { User } from "@/app/actions";

// テスト用ヘルパー: 最小限のUser型データを生成
const createUser = (
  id: number,
  name: string,
  participate: boolean = true,
): User => ({
  id,
  slack_user_id: `U${id.toString().padStart(10, "0")}`,
  slack_display_name: name,
  participate,
  created_at: new Date("2025-01-01"),
  updated_at: new Date("2025-01-01"),
});

describe("generateRoundRobinPairs", () => {
  test("参加者0人：空配列を返す", () => {
    expect(generateRoundRobinPairs([])).toEqual([]);
  });
  test("参加者1人：空配列を返す（ペアが作れない）", () => {
    const members = [createUser(1, "Alice")];
    expect(generateRoundRobinPairs(members)).toEqual([]);
  });

  test("参加者2人：1ラウンドの1組ペア", () => {
    const alice = createUser(1, "Alice");
    const bob = createUser(2, "Bob");
    const members = [alice, bob];
    const result = generateRoundRobinPairs(members);

    expect(result).toHaveLength(1); // 1ラウンド
    expect(result[0]).toHaveLength(1); // 1組のペア
    // ペアの組み合わせ
    expect(result[0][0]).toEqual([alice, bob]);
  });

  test("参加者3人：3ラウンド、各ラウンドで1人お休み", () => {
    const members = [
      createUser(1, "Alice"),
      createUser(2, "Bob"),
      createUser(3, "Charlie"),
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
      createUser(1, "Alice"),
      createUser(2, "Bob"),
      createUser(3, "Charlie"),
      createUser(4, "David"),
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
    const alice = createUser(1, "Alice", true);
    const charlie = createUser(3, "Charlie", true);
    const eve = createUser(5, "Eve", true);
    const members = [
      alice,
      createUser(2, "Bob", false),
      charlie,
      createUser(4, "David", false),
      eve,
    ];
    const rounds: Round[] = [
      [
        [alice, null],
        [charlie, eve],
      ],
      [
        [alice, charlie],
        [eve, null],
      ],
      [
        [alice, eve],
        [charlie, null],
      ],
    ];
    const result = generateRoundRobinPairs(members);

    expect(result).toHaveLength(3);
    expect(result).toEqual(rounds);
  });

  test("奇数は(n-1),偶数はnラウンド生成の検証", () => {
    [3, 4, 5, 6].forEach((participantCount) => {
      const participants = Array.from({ length: participantCount }, (_, i) =>
        createUser(i + 1, `Member${i + 1}`),
      );
      const result = generateRoundRobinPairs(participants);
      expect(result).toHaveLength(
        participantCount % 2 ? participantCount : participantCount - 1,
      );
    });
  });

  test("動的に生成されたペアが重複しない", () => {
    const members = [
      createUser(1, "Alice"),
      createUser(2, "Bob"),
      createUser(3, "Charlie"),
      createUser(4, "David"),
      createUser(5, "Eve"),
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
  const testData = ["2025/8/4(月)", "2025/8/11(月)", "2025/8/18(月)"];
  const alice = createUser(1, "Alice");
  const bob = createUser(2, "Bob");
  const charlie = createUser(3, "Charlie");

  test("3ラウンドから3つのスケジュールを生成する", () => {
    const threePersonRounds: Round[] = [
      [
        [alice, bob],
        [charlie, null],
      ],
      [
        [alice, charlie],
        [bob, null],
      ],
      [
        [bob, charlie],
        [alice, null],
      ],
    ];
    const expectedThreeSchedules = [
      { date: "2025/8/4(月)", isHoliday: false, round: threePersonRounds[0] },
      { date: "2025/8/11(月)", isHoliday: false, round: threePersonRounds[1] },
      { date: "2025/8/18(月)", isHoliday: false, round: threePersonRounds[2] },
    ];
    const result = generateCTSchedules(threePersonRounds, testData);

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

  test("roundsがmondaysより多い場合：mondaysの範囲内でスケジュール生成", () => {
    const round = [[alice, bob]];
    const manyRounds: Round[] = Array(300).fill(round);
    const result = generateCTSchedules(manyRounds, testData);
    expect(result).toHaveLength(testData.length);
  });

  test("連続する月曜日が正しい順序で割り当てられる", () => {
    const rounds: Round[] = [
      [
        [alice, bob],
        [charlie, null],
      ],
      [
        [alice, charlie],
        [bob, null],
      ],
      [
        [bob, charlie],
        [alice, null],
      ],
    ];
    const result = generateCTSchedules(rounds, testData);
    expect(result[0].date).toBe(mondays[0]);
    expect(result[1].date).toBe(mondays[1]);
    expect(result[2].date).toBe(mondays[2]);
  });

  test("祝日スキップしてもラウンドがずれない", () => {
    const dateList = ["2025/8/4(月)", "2025/8/11(月)", "2025/8/18(月)"];
    const holidays = [{ date: "2025-08-11", name: "山の日" }];
    const rounds: Round[] = [
      [
        [alice, bob],
        [charlie, null],
      ],
      [
        [alice, charlie],
        [bob, null],
      ],
      [
        [bob, charlie],
        [alice, null],
      ],
    ];
    const result = generateCTSchedules(rounds, dateList, holidays);

    expect(result[1].round).toBe(null);
    expect(result[1].isHoliday).toBe(true);
    expect(result[0].round).toBe(rounds[0]);
    expect(result[2].round).toBe(rounds[1]);
  });
});
