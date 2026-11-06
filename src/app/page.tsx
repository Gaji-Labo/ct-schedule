import { getUsers, getUserBySlackId, getHolidays } from "@/app/actions";
import { auth } from "@/auth";
import { CTScheduleCarousel } from "@/components/CTScheduleCarousel";
import { Header } from "@/components/Header";
import { PageLayout, PageSection } from "@/components/PageLayout";
import { SetupDataDialog } from "@/components/SetupDataDialog";
import { getChannels } from "@/src/lib/slack";
import {
  generateCTSchedules,
  generateRoundRobinPairs,
} from "@/src/utils/member";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  const user = session?.user?.slack_user_id
    ? await getUserBySlackId(session.user.slack_user_id)
    : null;
  const memberData = await getUsers();
  const holidays = await getHolidays();
  const uchannels = session ? await getChannels() : [];

  const rounds = generateRoundRobinPairs(memberData);
  const ctSchedules = generateCTSchedules(rounds, undefined, holidays);
  const participantsMember = memberData.filter((member) => member.participate);

  return (
    <PageLayout>
      <Header title="CT組み合わせ表" user={user} session={session} />
      {user && (!user.employee_number || !user?.slack_u_channel_id) && (
        <SetupDataDialog user={user} channels={uchannels} />
      )}
      <PageSection>
        {/* 人数は「参加者」(participate=true) の数。リンク先は社員全員なので、数字とリンクを分ける */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm">
          <p>CTの参加者：{participantsMember.length}人</p>
          <Link href="/member" className="text-foreground underline underline-offset-4">
            メンバー一覧を見る
          </Link>
        </div>
        <CTScheduleCarousel schedules={ctSchedules} />
      </PageSection>
    </PageLayout>
  );
}
