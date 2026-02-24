export type Holiday = {
  date: string;
  name: string;
};

type GoogleCalendarEvent = {
  start: { date: string };
  summary: string;
};

type GoogleCalendarResponse = {
  items: GoogleCalendarEvent[];
};

const CALENDAR_ID = "japanese__ja@holiday.calendar.google.com";

const NATIONAL_HOLIDAYS = [
  "元日",
  "成人の日",
  "建国記念の日",
  "天皇誕生日",
  "春分の日",
  "昭和の日",
  "憲法記念日",
  "みどりの日",
  "こどもの日",
  "海の日",
  "山の日",
  "敬老の日",
  "秋分の日",
  "スポーツの日",
  "文化の日",
  "勤労感謝の日",
  "振替休日",
];

export async function fetchHolidaysFromGoogle(
  startDate: Date,
  endDate: Date,
): Promise<Holiday[]> {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`;

  const params = new URLSearchParams({
    key: process.env.GOOGLE_CALENDAR_API_KEY!,
    timeMin: startDate.toISOString(),
    timeMax: endDate.toISOString(),
    singleEvents: "true",
  });

  const response = await fetch(`${url}?${params}`);
  const data: GoogleCalendarResponse = await response.json();

  return data.items
    .filter((item) =>
      NATIONAL_HOLIDAYS.some((holiday) => item.summary.includes(holiday)),
    )
    .map((item) => ({
      date: item.start.date,
      name: item.summary,
    }));
}
