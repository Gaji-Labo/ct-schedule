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
import { generateRoundRobinPairs, Round } from "@/src/utils/member";

type CT = {
  date: string;
  round: Round;
};
type SCHEDULE = CT[];

// NOTE: type SCHEDULE
// [
//   {
//     date: "2024/1/1(月)",
//     round: [
//       [{ name: "A" }, { name: "B" }],
//       [{ name: "C" }, null],
//       ...
//     ],
//   },
//   {
//     date: "2024/1/8(月)",
//     round: [
//       [{ name: "A" }, { name: "C" }],
//       [{ name: "B" }, null],
//       ...
//     ],
//   },
//   ...
// ];

const MemberCell = ({ name, row }: { name: string; row?: boolean }) => {
  return (
    <th
      className={`border-r text-sm p-1 font-normal bg-gray-100 ${
        row && "sticky top-0 left-0"
      }`}
    >
      <div className="w-[100px]">
        <span className="block text-xs text-gray-700 leading-none font-bold break-words">
          {name}
        </span>
      </div>
    </th>
  );
};

export default async function Home() {
  const session = await auth();
  const memberData = await getMember();

  // 不参加のメンバーを除外
  const member = memberData.filter((member) => member.participate);

  const rounds = generateRoundRobinPairs(memberData);

  // 日付とその日のペアを1つの配列にする
  function generateCTSchedules(): SCHEDULE {
    const schedule: SCHEDULE = [];
    mondays.forEach((monday, mondayIndex) => {
      if (mondayIndex < rounds.length) {
        schedule.push({ date: monday, round: rounds[mondayIndex] });
      }
    });
    return schedule;
  }
  const ctSchedules = generateCTSchedules();

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
              {member.length}人
            </Link>
          </p>
          <p className="mt-4 text-sm">グレーアウトしたマスの扱いについて</p>
          <p className="text-gray-500 text-sm">
            ・参加人数が奇数： グレーアウトしたマスはお休み
          </p>
          <p className="text-gray-500 text-sm">
            ・参加人数が偶数：
            自分がグレーアウトしたマスの場合、同じくグレーかつ数字が同じメンバーとペアになる
          </p>
        </section>
      </div>
      <div className="overflow-x-auto mt-10">
        <div className="flex gap-4 pb-4 max-w-max">
          {ctSchedules.map((schedule) => (
            <div
              key={schedule.date}
              className="border rounded-lg p-4 bg-white shadow-sm flex-shrink-0 min-w-[250px]"
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
                    <span className="text-gray-400 text-xs">×</span>
                    <span
                      className={`font-medium text-sm ${
                        !pair[1] && "text-red-400"
                      }`}
                    >
                      {pair[1] ? pair[1].name : "お休み"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <article className="flex gap-5 mt-10">
        <aside>
          <ol>
            {mondays.map(
              (monday, index) =>
                index < member.length && (
                  <li
                    key={monday}
                    className={
                      // mondayが今日以前であればグレーアウト
                      isBefore(monday, startOfDay(new Date()))
                        ? "bg-gray-300"
                        : ""
                    }
                  >
                    <span>{index % member.length}:</span>
                    <time dateTime={monday}>{monday}</time>
                  </li>
                )
            )}
          </ol>
        </aside>
        <div className="border-t border-l overflow-scroll">
          <table className="h-full">
            <tbody>
              {/* "": 左上の空マス */}
              {[{ name: "" }, ...member].map((colMember, rowIndex) => (
                <tr key={`tr-${rowIndex}`} className="border-b">
                  <MemberCell name={colMember.name} row />
                  {member.map((rowMember, colIndex) =>
                    rowIndex === 0 ? (
                      <MemberCell
                        name={rowMember.name}
                        key={`cell-th-${colIndex}`}
                      />
                    ) : (
                      <td
                        key={`cell-${colIndex}`}
                        className={`border-r text-center text-gray-500 ${
                          rowIndex - 1 === colIndex && "bg-gray-100"
                        }`}
                      >
                        {/* rowIndexは空マス分要素数が1つ多いため-1をしている */}
                        {(colIndex + rowIndex - 1) % member.length}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </main>
  );
}
