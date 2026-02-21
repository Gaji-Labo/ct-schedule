import { expect, test, describe } from "vitest";

describe("isHolidayMonday", () => {
  const holidays = [
    { date: "2025-09-15", name: "敬老の日" },
    { date: "2025-09-23", name: "秋分の日" },
    { date: "2025-11-03", name: "文化の日" },
  ];

  test("祝日かつ月曜日の場合trueを返す", () => {
    expect(isHolidayMonday("2025/9/15(月)", [holidays])).toBe(true);
  });

  test("祝日だが月曜日ではない場合falseを返す", () => {
    expect(isHolidayMonday("2025/9/23(火)", [holidays])).toBe(false);
  });

  test("月曜日だが祝日ではない場合falseを返す", () => {
    expect(isHolidayMonday("2025/9/22(月)", [holidays])).toBe(false);
  });
});
