import { getUsers } from "@/app/actions";
import { auth } from "@/auth";
import { AddMemberFormDialog } from "@/components/AddMemberFormDialog";
import { EditMemberDialog } from "@/components/EditMemberDialog";
import { Separator } from "@/components/ui/separator";
import { Fragment } from "react";

export default async function Home() {
  const session = await auth();
  const memberData = await getUsers();
  return (
    <main className="grid gap-10 max-w-7xl mx-auto p-10">
      <div className="flex justify-between items-center gap-10">
        <h1 className="text-2xl font-bold">メンバー一覧</h1>
        {session && <AddMemberFormDialog />}
      </div>
      <section className="grid gap-3">
        {memberData.map((member) => (
          <Fragment key={member.id}>
            <div className="flex gap-3 items-center justify-between">
              <div key={member.id} className="flex gap-2 items-center">
                <span className="font-semibold">
                  {member.slack_display_name}
                </span>
                <div className="flex gap-1 items-center text-sm">
                  <div
                    className={`${
                      member.participate ? "bg-green-500" : "bg-gray-200"
                    } h-2 w-2 rounded-full`}
                  />
                  {member.participate ? "参加" : "不参加"}
                </div>
              </div>
              {session && <EditMemberDialog member={member} />}
            </div>
            <Separator />
          </Fragment>
        ))}
      </section>
    </main>
  );
}
