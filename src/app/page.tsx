import { getUsers, getUserBySlackId, getHolidays } from "@/app/actions";
import { auth } from "@/auth";
import { CTScheduleCarousel } from "@/components/CTScheduleCarousel";
import { Header } from "@/components/Header";
import { SiteHeader } from "@/components/SiteHeader";
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
    <>
      <SiteHeader />
      <main className="max-w-7xl mx-auto p-10">
        <div className="grid gap-5">
          <Header title="CT組み合わせ表" user={user} session={session} />
          {user && (!user.employee_number || !user?.slack_u_channel_id) && (
            <SetupDataDialog user={user} channels={uchannels} />
          )}
          <section>
            <p>
              現在のメンバー：
              <Link href="/member" className="underline">
                {participantsMember.length}人
              </Link>
            </p>
          </section>
        </div>
        <div className="mt-10">
          <CTScheduleCarousel schedules={ctSchedules} />
        </div>
      </main>
    </>
  );
}
