import { getUsers } from "@/app/actions";
import { auth } from "@/auth";
import { AddMemberFormDialog } from "@/components/AddMemberFormDialog";
import { EditMemberForm } from "@/components/EditMemberForm";
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
            <EditMemberForm key={member.id} member={member} session={session} />
            <Separator />
          </Fragment>
        ))}
      </section>
    </main>
  );
}
