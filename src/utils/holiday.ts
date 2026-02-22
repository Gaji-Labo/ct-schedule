import { format, isMonday, parse } from "date-fns";

type Holiday = {
  date: string;
  name: string;
};

export function isHolidayMonday(
  targetDate: string,
  holidays: Holiday[],
): boolean {
  const dateString = targetDate.replace(/\([^)]*\)/, "");
  const date = parse(dateString, "yyyy/M/d", new Date());

  const isMondayFlag = isMonday(date);
  const isHolidayFlag = holidays.some(
    (holiday) => holiday.date === format(date, "yyyy-MM-dd"),
  );

  return isMondayFlag && isHolidayFlag;
}

export function getHolidayName(
  targetDate: string,
  holidays: Holiday[],
): string | null {
  const dateString = targetDate.replace(/\([^)]*\)/, "");
  const date = parse(dateString, "yyyy/M/d", new Date());

  const result = holidays.find(
    (holiday) => holiday.date === format(date, "yyyy-MM-dd"),
  );
  return result ? result.name : null;
}
