import { getUsers, getUserBySlackId, getHolidays } from "@/app/actions";
import { auth } from "@/auth";
import { CTScheduleCard } from "@/components/CTScheduleCard";
import { Header } from "@/components/Header";
import { SetupDataDialog } from "@/components/SetupDataDialog";
import {
  generateCTSchedules,
  generateRoundRobinPairs,
} from "@/src/utils/member";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  const memberData = await getUsers();
  const user = session?.user?.slack_user_id
    ? await getUserBySlackId(session.user.slack_user_id)
    : null;
  const holidays = await getHolidays();

  const rounds = generateRoundRobinPairs(memberData);
  const ctSchedules = generateCTSchedules(rounds, undefined, holidays);

  const participantsMember = memberData.filter((member) => member.participate);

  return (
    <main className="max-w-7xl mx-auto p-10">
      <div className="grid gap-5">
        <Header title="CT組み合わせ表" />
        {user && !user.employee_number && <SetupDataDialog user={user} />}
        <section>
          <p>
            現在の参加者：
            <Link href="/member" className="underline">
              {participantsMember.length}人
            </Link>
          </p>
        </section>
      </div>
      <div className="overflow-x-auto mt-10">
        <div className="flex gap-4 pb-4 max-w-max">
          {ctSchedules.map((schedule, index) => (
            <CTScheduleCard
              schedule={schedule}
              index={index}
              key={schedule.date}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
