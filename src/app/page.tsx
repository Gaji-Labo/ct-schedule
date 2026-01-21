import { getUsers, getUserBySlackId } from "@/app/actions";
import { auth, signOut } from "@/auth";
import { CTScheduleCard } from "@/components/CTScheduleCard";
import { SetupDataDialog } from "@/components/SetupDataDialog";
import { SigninWithSlackButton } from "@/components/SigninWithSlackButton";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const rounds = generateRoundRobinPairs(memberData);
  const ctSchedules = generateCTSchedules(rounds);

  const participantsMember = memberData.filter((member) => member.participate);

  return (
    <main className="max-w-7xl mx-auto p-10">
      <div className="grid gap-5">
        <div className="flex justify-between items-center gap-10">
          <h1 className="text-2xl font-bold">CT組み合わせ表</h1>
          {session && session.user ? (
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar>
                    <AvatarImage
                      src={user?.slack_image || session.user.image || ""}
                      alt={`${user?.slack_display_name}のアイコン画像`}
                    />
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user?.slack_display_name}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <form
                      action={async () => {
                        "use server";
                        await signOut();
                      }}
                    >
                      <button type="submit">ログアウト</button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <SigninWithSlackButton />
          )}
        </div>
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
