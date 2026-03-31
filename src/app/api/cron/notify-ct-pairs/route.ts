import { NextResponse } from "next/server";
import { getHolidays, getUsers } from "@/app/actions";
import {
  generateCTSchedules,
  generateRoundRobinPairs,
} from "@/src/utils/member";
import { getCurrentWeekCT } from "@/src/utils/date";
import { postMessage } from "@/src/lib/slack";
import type { CT } from "@/src/utils/member";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await getUsers();
    const holidays = await getHolidays();

    const round = generateRoundRobinPairs(users);
    const schedules = generateCTSchedules(round, undefined, holidays);
    const currentCT = getCurrentWeekCT(schedules);

    if (!currentCT) {
      return NextResponse.json(
        { message: "次回のCTスケジュールが見つかりません" },
        { status: 404 },
      );
    }

    if (currentCT.isHoliday) {
      return NextResponse.json({
        success: true,
        message: "祝日のため通知をスキップしました",
        date: currentCT.date,
        holidayName: currentCT.holidayName,
      });
    }

    const channelId = process.env.SLACK_CHANNEL_ID;
    if (!channelId) {
      throw new Error("SLACK_CHANNEL_ID が設定されていません");
    }

    const message = buildMessage(currentCT);
    await postMessage(channelId, message);

    return NextResponse.json({
      success: true,
      date: currentCT.date,
      pairsCount: currentCT.round?.length,
    });
  } catch (error) {
    console.error("Slack通知エラー:", error);
    return NextResponse.json({ error: "通知に失敗しました" }, { status: 500 });
  }
}

function buildMessage(ct: CT): string {
  const lines = ["🗣️ 本日のCTペア", "https://ct-schedule.vercel.app/", ""];
  const pairLines =
    ct.round?.map(([user1, user2]) => {
      const pair1 = `<@${user1.slack_user_id}>(<#${user1.slack_u_channel_id}>)`;
      const pair2 = user2
        ? `<@${user2.slack_user_id}>(<#${user2.slack_u_channel_id}>)`
        : "お休み";
      return `• ${pair1} ${pair2}`;
    }) ?? [];
  return [...lines, ...pairLines].join("\n");
}
