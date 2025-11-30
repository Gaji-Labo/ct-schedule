import { filterFromToday, mondays } from "@/src/utils/date";
import { isMonday, parse } from "date-fns";
import { describe, expect, test } from "vitest";

test("日付リストが十分な期間をカバーしている（残り3年以上）", () => {
  const lastDateString = mondays[mondays.length - 1];
  const parseDateString = lastDateString.replace(/\([^)]*\)/, "");
  const lastDate = parse(parseDateString, "yyyy/M/d", new Date());

  // 日付をミリ秒に変換して最終日と今日の差を計算
  // (1000 * 60 * 60 * 24 * 365.25): 1年をミリ秒で計算する（1秒 * 1分 * 1時間 * 1日 * 1年）
  const yearsLeft =
    (lastDate.getTime() - new Date().getTime()) /
    (1000 * 60 * 60 * 24 * 365.25);

  expect(yearsLeft).toBeGreaterThan(3);
});

describe("generateAllWorkingMondays", () => {
  test("配列の中身が全て月曜日である", () => {
    mondays.map((date) => expect(isMonday(date)).toBe(true));
  });
});

describe("filterFromToday", () => {
  test("実施日の出力：今日が月曜なら当日、月曜以外なら次の月曜", () => {
    const dateList = [
      "2025/11/16(日)",
      "2025/11/17(月)",
      "2025/11/18(火)",
      "2025/11/19(水)",
      "2025/11/20(木)",
      "2025/11/21(金)",
      "2025/11/22(土)",
      "2025/11/23(日)",
      "2025/11/24(月)",
      "2025/11/25(火)",
    ];
    const pastResult = filterFromToday(dateList, new Date("2025-11-16"));
    const todayResult = filterFromToday(dateList, new Date("2025-11-17"));
    const featureResult = filterFromToday(dateList, new Date("2025-11-20"));

    expect(Array.isArray(todayResult)).toBe(true);
    expect(pastResult[0]).toBe("2025/11/17(月)");
    expect(todayResult[0]).toBe("2025/11/17(月)");
    expect(featureResult[0]).toBe("2025/11/24(月)");
  });
});
