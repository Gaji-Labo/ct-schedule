import { filterFromToday } from "@/src/utils/date";
import { describe, expect, test } from "vitest";

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
