import {
  addYears,
  eachDayOfInterval,
  format,
  isBefore,
  isMonday,
  nextMonday,
  parse,
  startOfDay,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { ja } from "date-fns/locale";

// プロジェクト開始日（固定基準日）
// NOTE: ペア整合性維持のため、この日付は変更しないこと
export const PROJECT_START_DATE = new Date("2025-08-04");

function generateAllWorkingMondays(startDate: Date): string[] {
  const endDate = addYears(startDate, 5);
  return eachDayOfInterval({
    start: startDate,
    end: endDate,
  })
    .filter((day) => isMonday(day))
    .map((date) => format(date, "yyyy/M/d(E)", { locale: ja }));
}

// タイムゾーンをどの環境でもTokyoにする
const TIMEZONE = "Asia/Tokyo";

export function getJSTNow(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

export function filterFromToday(
  mondays: string[],
  baseDate: Date = getJSTNow()
): string[] {
  const today = startOfDay(baseDate);
  const startMonday = isMonday(today) ? today : nextMonday(today);

  return mondays.filter((monday) => {
    // 文字列("2025/10/10(月)")とDateを比較するとフィルタリングが動作しない可能性があるため(月)をパースする
    const dateString = monday.replace(/\([^)]*\)/, "");
    const date = parse(dateString, "yyyy/M/d", new Date());
    return !isBefore(date, startMonday);
  });
}

export const mondays = generateAllWorkingMondays(PROJECT_START_DATE);
