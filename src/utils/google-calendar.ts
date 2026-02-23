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

  return data.items.map((item) => ({
    date: item.start.date,
    name: item.summary,
  }));
}
