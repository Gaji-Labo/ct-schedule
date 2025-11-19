import { addYears, eachDayOfInterval, format, isMonday } from "date-fns";
import { ja } from "date-fns/locale";

// プロジェクト開始日（固定基準日）
const PROJECT_START_DATE = new Date("2025-08-04");

function generateAllWorkingMondays(startDate: Date): string[] {
  const endDate = addYears(startDate, 5);
  return eachDayOfInterval({
    start: startDate,
    end: endDate,
  })
    .filter((day) => isMonday(day))
    .map((date) => format(date, "yyyy/M/d(E)", { locale: ja }));
}

export const mondays = generateAllWorkingMondays(PROJECT_START_DATE);
