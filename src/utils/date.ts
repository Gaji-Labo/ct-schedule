import { eachDayOfInterval, format, isMonday } from "date-fns";
import { ja } from "date-fns/locale";

export const mondays = eachDayOfInterval({
  start: new Date("2025-08-01"),
  end: new Date("2026-12-31"),
})
  .filter((day) => isMonday(day))
  .map((date) => format(date, "yyyy/M/d(E)", { locale: ja }));
