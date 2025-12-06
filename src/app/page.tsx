import { auth, signOut } from "@/auth";
import { getMember } from "@/app/actions";
import { AddMemberFormDialog } from "@/components/AddMemberFormDialog";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SigninWithSlackButton } from "@/components/SigninWithSlackButton";
import { Badge } from "@/components/ui/badge";
import {
  generateCTSchedules,
  generateRoundRobinPairs,
} from "@/src/utils/member";

export default async function Home() {
  const session = await auth();
  const memberData = await getMember();

  const rounds = generateRoundRobinPairs(memberData);
  const ctSchedules = generateCTSchedules(rounds);

  return (
    <main className="max-w-7xl mx-auto p-10">
      <div className="grid gap-5">
        <div className="flex justify-between items-center gap-10">
          <h1 className="text-2xl font-bold">CT組み合わせ表</h1>
          {session && session.user ? (
            <div className="flex items-center gap-4">
              <AddMemberFormDialog />
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <img
                    src={session.user.image || ""}
                    alt={`${session.user.name}のアイコン画像`}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{session.user.name}</DropdownMenuLabel>
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
        <section>
          <p>
            現在の参加者：
            <Link href="/member" className="underline">
              {ctSchedules.length}人
            </Link>
          </p>
        </section>
      </div>
      <div className="overflow-x-auto mt-10">
        <div className="flex gap-4 pb-4 max-w-max">
          {ctSchedules.map((schedule, index) => (
            <div
              key={schedule.date}
              className={`border rounded-lg p-4 shadow-sm flex-shrink-0 min-w-[300px] ${
                index === 0 && "border-2 border-gray-400"
              }`}
            >
              <h2 className="text-lg font-semibold mb-4 text-center">
                <time dateTime={schedule.date}>{schedule.date}</time>
              </h2>
              <div className="flex flex-col gap-2">
                {schedule.round.map((pair, pairIndex) => (
                  <div
                    key={pairIndex}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-md"
                  >
                    <span className="text-gray-400 text-xs">
                      {pairIndex + 1}
                    </span>
                    <span className="font-medium text-sm">{pair[0].name}</span>
                    {pair[1] ? (
                      <>
                        <span className="text-gray-400 text-xs">×</span>
                        <span className="font-medium text-sm">
                          {pair[1].name}
                        </span>
                      </>
                    ) : (
                      <Badge className="bg-gray-400 rounded-full shadow-none hover:bg-gray-400">
                        お休み
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
