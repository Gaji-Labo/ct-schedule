import { saveHolidaysToDB } from "@/app/actions";
import { fetchHolidaysFromGoogle } from "@/src/utils/google-calendar";
import { addYears } from "date-fns";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized", status: 401 });
  }

  try {
    const fetchHolidays = await fetchHolidaysFromGoogle(
      new Date(),
      addYears(new Date(), 5),
    );
    await saveHolidaysToDB(fetchHolidays);

    return NextResponse.json({
      success: true,
      count: fetchHolidays.length,
    });
  } catch (error) {
    return NextResponse.json({ error: "失敗" }, { status: 500 });
  }
}
