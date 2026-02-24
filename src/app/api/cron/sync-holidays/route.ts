import { saveHolidaysToDB } from "@/app/actions";
import { fetchHolidaysFromGoogle } from "@/src/utils/google-calendar";
import { addYears } from "date-fns";
import { NextResponse } from "next/server";

export async function GET() {
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
