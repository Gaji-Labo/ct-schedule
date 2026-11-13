import { getHolidays, getUserBySlackId, getUsers } from "@/app/actions";
import { auth } from "@/auth";
import { Header } from "@/components/Header";
import { MyPairList } from "@/components/MyPairList";
import { ProfileForm } from "@/components/ProfileForm";
import { getChannels } from "@/src/lib/slack";
import {
  findMyPairs,
  generateCTSchedules,
  generateRoundRobinPairs,
} from "@/src/utils/member";
import { redirect } from "next/navigation";

// 今週 + 今後4週
const DISPLAY_WEEKS = 5;

export default async function MyPage() {
  const session = await auth();
  const user = session?.user?.slack_user_id
    ? await getUserBySlackId(session.user.slack_user_id)
    : null;
  if (!user) redirect("/");

  const memberData = await getUsers();
  const holidays = await getHolidays();
  const channels = await getChannels();

  const rounds = generateRoundRobinPairs(memberData);
  const ctSchedules = generateCTSchedules(rounds, undefined, holidays);
  const myPairs = findMyPairs(ctSchedules, user.id, DISPLAY_WEEKS);

  return (
    <main className="grid gap-10 max-w-7xl mx-auto p-10">
      <Header title="マイページ" user={user} session={session} />
      <section className="grid gap-4">
        <h2 className="text-xl font-bold">あなたのペア</h2>
        <MyPairList pairs={myPairs} />
      </section>
      <section className="grid gap-4">
        <h2 className="text-xl font-bold">プロフィール</h2>
        <ProfileForm user={user} channels={channels} />
      </section>
    </main>
  );
}
